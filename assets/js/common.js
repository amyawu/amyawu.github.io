$(document).ready(function () {
  // add toggle functionality to abstract, award and bibtex buttons
  $("a.abstract").click(function () {
    $(this).parent().parent().find(".abstract.hidden").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.award").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden.open").toggleClass("open");
  });
  $("a.bibtex").click(function () {
    $(this).parent().parent().find(".abstract.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".award.hidden.open").toggleClass("open");
    $(this).parent().parent().find(".bibtex.hidden").toggleClass("open");
  });
  $("a").removeClass("waves-effect waves-light");

  // bootstrap-toc
  if ($("#toc-sidebar").length) {
    // remove related publications years from the TOC
    $(".publications h2").each(function () {
      $(this).attr("data-toc-skip", "");
    });
    var navSelector = "#toc-sidebar";
    var $myNav = $(navSelector);
    Toc.init($myNav);
    $("body").scrollspy({
      target: navSelector,
    });
  }

  // add css to jupyter notebooks
  const cssLink = document.createElement("link");
  cssLink.href = "../css/jupyter.css";
  cssLink.rel = "stylesheet";
  cssLink.type = "text/css";

  let jupyterTheme = determineComputedTheme();

  $(".jupyter-notebook-iframe-container iframe").each(function () {
    $(this).contents().find("head").append(cssLink);

    if (jupyterTheme == "dark") {
      $(this).bind("load", function () {
        $(this).contents().find("body").attr({
          "data-jp-theme-light": "false",
          "data-jp-theme-name": "JupyterLab Dark",
        });
      });
    }
  });

  // trigger popovers
  $('[data-toggle="popover"]').popover({
    trigger: "hover",
  });

  initBunnyCutscene();
});

const BUNNY_SPRITE_MAP = {
  nora: "/assets/img/sprites/nora.png",
  sunny: "/assets/img/sprites/sunny.png",
  pyro: "/assets/img/sprites/pyro.png",
  aqua: "/assets/img/sprites/aqua.png",
};
const BUNNY_FRAME_COUNT = 6;
const BUNNY_FPS = 8;
const BUNNY_FRAME_INTERVAL_MS = Math.round(1000 / BUNNY_FPS);

const BunnySpriteAnimator = {
  timerId: null,
  sprites: new Set(),

  registerFromRoot(root) {
    if (!root) return;
    const elements = root.querySelectorAll(".bunny-cutscene-card-sprite.is-animated, .bunny-companion-sprite.is-animated");
    elements.forEach((element) => {
      element.dataset.bunnyFrame = element.dataset.bunnyFrame || "0";
      this.sprites.add(element);
    });
    this.start();
  },

  step() {
    this.sprites.forEach((element) => {
      if (!document.body.contains(element)) {
        this.sprites.delete(element);
        return;
      }

      const frameSize = getSpriteFrameSize(element);
      const currentFrame = Number.parseInt(element.dataset.bunnyFrame || "0", 10);
      const nextFrame = (currentFrame + 1) % BUNNY_FRAME_COUNT;
      element.dataset.bunnyFrame = String(nextFrame);
      element.style.backgroundPosition = `${-nextFrame * frameSize}px 0`;
    });

    if (this.sprites.size === 0) {
      this.stop();
    }
  },

  start() {
    if (this.timerId !== null) return;
    this.timerId = window.setInterval(() => this.step(), BUNNY_FRAME_INTERVAL_MS);
  },

  stop() {
    if (this.timerId === null) return;
    window.clearInterval(this.timerId);
    this.timerId = null;
  },
};

function initBunnyCutscene() {
  const cutscene = document.getElementById("bunny-cutscene");
  const skipButton = document.getElementById("bunny-cutscene-skip");
  const hud = document.getElementById("bunny-companion-hud");
  const bunnyCards = Array.from(document.querySelectorAll(".bunny-cutscene-card"));

  if (!cutscene || !skipButton || !hud || bunnyCards.length === 0) {
    return;
  }

  const cutsceneSeenKey = "bunnyCutsceneSeen";
  const selectedBunnyKey = "selectedBunny";

  const storedBunny = readSelectedBunny(selectedBunnyKey);
  if (storedBunny) {
    renderCompanionHud(hud, storedBunny);
    hud.classList.remove("bunny-cutscene-hidden");
  }

  const seenCutscene = localStorage.getItem(cutsceneSeenKey) === "true";
  if (!seenCutscene) {
    showCutscene(cutscene);
  } else {
    hideCutscene(cutscene);
  }

  bunnyCards.forEach((card) => {
    card.addEventListener("mouseenter", () => card.classList.add("sparkle-active"));
    card.addEventListener("mouseleave", () => card.classList.remove("sparkle-active"));
    card.addEventListener("focus", () => card.classList.add("sparkle-active"));
    card.addEventListener("blur", () => card.classList.remove("sparkle-active"));

    card.addEventListener("click", () => {
      const bunnyName = card.dataset.bunnyName || "Unknown";
      const bunnyKey = getBunnyKey(bunnyName);
      const bunny = {
        name: bunnyName,
        type: card.dataset.bunnyType || "Unknown",
        emoji: card.dataset.bunnyEmoji || "🐰",
        spriteKey: bunnyKey,
        spriteUrl: BUNNY_SPRITE_MAP[bunnyKey] || "",
        spriteType: "animated",
      };

      localStorage.setItem(selectedBunnyKey, JSON.stringify(bunny));
      localStorage.setItem(cutsceneSeenKey, "true");
      renderCompanionHud(hud, bunny);
      hud.classList.remove("bunny-cutscene-hidden");
      hideCutscene(cutscene);
      trackBunnySelection(bunny);
    });
  });

  skipButton.addEventListener("click", () => {
    localStorage.setItem(cutsceneSeenKey, "true");
    hideCutscene(cutscene);
  });

  BunnySpriteAnimator.registerFromRoot(document);
}

function showCutscene(cutscene) {
  cutscene.classList.remove("bunny-cutscene-hidden");
  cutscene.setAttribute("aria-hidden", "false");
}

function hideCutscene(cutscene) {
  cutscene.classList.add("bunny-cutscene-hidden");
  cutscene.setAttribute("aria-hidden", "true");
}

function readSelectedBunny(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const bunny = JSON.parse(raw);
    const bunnyKey = bunny.spriteKey || getBunnyKey(bunny.name || "");
    return {
      ...bunny,
      spriteKey: bunnyKey,
      spriteUrl: bunny.spriteUrl || BUNNY_SPRITE_MAP[bunnyKey] || "",
      spriteType: bunny.spriteType || "animated",
    };
  } catch (error) {
    return null;
  }
}

function renderCompanionHud(hud, bunny) {
  const bunnyKey = bunny.spriteKey || getBunnyKey(bunny.name || "");
  const bunnySpriteUrl = bunny.spriteUrl || BUNNY_SPRITE_MAP[bunnyKey] || "";
  const spriteClasses = bunnySpriteUrl
    ? "bunny-companion-sprite is-animated"
    : "bunny-companion-sprite is-fallback";
  const spriteStyle = bunnySpriteUrl
    ? ' style="--bunny-sprite-url: url(\'' + bunnySpriteUrl + '\');"'
    : "";
  const spriteContent = bunnySpriteUrl ? "" : escapeHtml(bunny.emoji || "🐰");

  hud.innerHTML =
    '<span class="' +
    spriteClasses +
    '" aria-hidden="true"' +
    spriteStyle +
    ">" +
    spriteContent +
    "</span>" +
    '<span class="bunny-companion-text">' +
    '<span class="bunny-companion-name">' +
    escapeHtml(bunny.name) +
    "</span>" +
    "</span>";

  BunnySpriteAnimator.registerFromRoot(hud);
}

function getBunnyKey(name) {
  return String(name || "").trim().toLowerCase();
}

function getSpriteFrameSize(element) {
  const frameVar = getComputedStyle(document.documentElement).getPropertyValue("--bunny-frame-size").trim();
  const parsed = Number.parseFloat(frameVar);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  const elementWidth = element.getBoundingClientRect().width;
  return elementWidth > 0 ? elementWidth : 128;
}

function trackBunnySelection(bunny) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", "bunny_companion_selected", {
    bunny_name: bunny.name,
    bunny_type: bunny.type,
    source: "cutscene",
  });
}

function escapeHtml(value) {
  if (typeof value !== "string") return "";
  return value.replace(/[&<>"']/g, function (char) {
    const htmlMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return htmlMap[char];
  });
}
