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
  nora: {
    active: "/assets/sprites/nora.gif",
    idle: "/assets/sprites/nora_idle.gif",
  },
  sunny: {
    active: "/assets/sprites/sunny.gif",
    idle: "/assets/sprites/sunny_idle.gif",
  },
  pyro: {
    active: "/assets/sprites/pyro.gif",
    idle: "/assets/sprites/pyro_idle.gif",
  },
  aqua: {
    active: "/assets/sprites/aqua.gif",
    idle: "/assets/sprites/aqua_idle.gif",
  },
};

const BUNNY_DIALOGUE_MAP = {
  nora: {
    expertise: "everything",
    cvFile: "Amy_Wu_CV_Everything.pdf",
  },
  pyro: {
    expertise: "data visualization",
    cvFile: "Amy_Wu_CV_DataVisualization.pdf",
  },
  sunny: {
    expertise: "AI for science",
    cvFile: "Amy_Wu_CV_AIforScience.pdf",
  },
  aqua: {
    expertise: "mixed methods",
    cvFile: "Amy_Wu_CV_MixedMethods.pdf",
  },
};

const SCROLL_IDLE_TIMEOUT_MS = 220;
const CUTSCENE_SELECTION_FLASH_MS = 220;

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
  const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const mobileDialogueQuery = window.matchMedia("(max-width: 860px)");
  const HUD_MAX_WIDTH_PX = 280;
  const HUD_MIN_WIDTH_PX = 210;
  const HUD_LEFT_PADDING_PX = 14;
  const HUD_RIGHT_GUTTER_PX = 10;
  let isUserScrolling = false;
  let scrollIdleTimeout = null;
  let selectedBunny = null;
  let isMobileDialogueOpen = false;

  const applyDesktopHudPosition = () => {
    if (mobileDialogueQuery.matches) {
      hud.style.left = "";
      hud.style.width = "";
      hud.style.maxWidth = "";
      return;
    }
    const contentContainer = document.querySelector("body > .container.mt-5");
    if (!contentContainer) {
      hud.style.left = "";
      hud.style.width = "";
      hud.style.maxWidth = "";
      return;
    }
    const containerRect = contentContainer.getBoundingClientRect();
    const availableMarginWidth = containerRect.left - HUD_LEFT_PADDING_PX - HUD_RIGHT_GUTTER_PX;
    const effectiveWidth = Math.max(
      HUD_MIN_WIDTH_PX,
      Math.min(HUD_MAX_WIDTH_PX, availableMarginWidth)
    );
    hud.style.left = HUD_LEFT_PADDING_PX + "px";
    hud.style.width = effectiveWidth + "px";
    hud.style.maxWidth = effectiveWidth + "px";
  };

  const rerenderHud = () => {
    if (!selectedBunny) {
      return;
    }
    renderCompanionHud(
      hud,
      selectedBunny,
      isUserScrolling,
      isMobileDialogueOpen,
      mobileDialogueQuery.matches
    );
    applyDesktopHudPosition();
  };

  const storedBunny = readSelectedBunny(selectedBunnyKey);
  if (storedBunny) {
    selectedBunny = storedBunny;
    rerenderHud();
    hud.classList.remove("bunny-cutscene-hidden");
  }

  const seenCutscene = localStorage.getItem(cutsceneSeenKey) === "true";
  if (!seenCutscene) {
    showCutscene(cutscene);
  } else {
    hideCutscene(cutscene);
  }

  const updateHudSpriteForScrollState = () => {
    if (!selectedBunny) {
      return;
    }
    rerenderHud();
  };

  const updateCutsceneCardSprite = (card, state) => {
    const sprite = card.querySelector(".bunny-cutscene-card-sprite");
    if (!sprite) {
      return;
    }
    const bunnyKey = getBunnyKey(card.dataset.bunnyName || "");
    const spriteUrl = getSpriteUrlForState(bunnyKey, state);
    if (spriteUrl) {
      sprite.classList.add("is-animated");
      sprite.style.setProperty("--bunny-sprite-url", "url('" + spriteUrl + "')");
    } else {
      sprite.classList.remove("is-animated");
      sprite.style.removeProperty("--bunny-sprite-url");
    }
  };

  const applyDefaultCardSprites = () => {
    bunnyCards.forEach((card) => {
      updateCutsceneCardSprite(card, "idle");
    });
  };

  const onScroll = () => {
    isUserScrolling = true;
    updateHudSpriteForScrollState();
    if (scrollIdleTimeout) {
      window.clearTimeout(scrollIdleTimeout);
    }
    scrollIdleTimeout = window.setTimeout(() => {
      isUserScrolling = false;
      updateHudSpriteForScrollState();
      scrollIdleTimeout = null;
    }, SCROLL_IDLE_TIMEOUT_MS);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("wheel", onScroll, { passive: true });
  window.addEventListener("touchmove", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    applyDesktopHudPosition();
  });
  window.addEventListener("load", () => {
    applyDesktopHudPosition();
  });
  mobileDialogueQuery.addEventListener("change", () => {
    if (!mobileDialogueQuery.matches) {
      isMobileDialogueOpen = false;
    }
    rerenderHud();
  });

  hud.addEventListener("click", (event) => {
    const trigger = event.target.closest(".bunny-companion-dialogue-toggle");
    if (!trigger || !selectedBunny) {
      return;
    }
    isMobileDialogueOpen = !isMobileDialogueOpen;
    rerenderHud();
  });

  applyDefaultCardSprites();
  applyDesktopHudPosition();

  bunnyCards.forEach((card) => {
    card.addEventListener("mouseenter", () => card.classList.add("sparkle-active"));
    card.addEventListener("mouseleave", () => card.classList.remove("sparkle-active"));
    card.addEventListener("focus", () => card.classList.add("sparkle-active"));
    card.addEventListener("blur", () => card.classList.remove("sparkle-active"));

    if (!isTouchDevice) {
      card.addEventListener("mouseenter", () => updateCutsceneCardSprite(card, "active"));
      card.addEventListener("focus", () => updateCutsceneCardSprite(card, "active"));
      card.addEventListener("mouseleave", () => updateCutsceneCardSprite(card, "idle"));
      card.addEventListener("blur", () => updateCutsceneCardSprite(card, "idle"));
    }

    card.addEventListener("click", () => {
      const bunnyName = card.dataset.bunnyName || "Unknown";
      const bunnyKey = getBunnyKey(bunnyName);
      const spriteUrls = getSpriteUrls(bunnyKey);
      const bunny = {
        name: bunnyName,
        type: card.dataset.bunnyType || "Unknown",
        emoji: card.dataset.bunnyEmoji || "🐰",
        spriteKey: bunnyKey,
        spriteUrl: spriteUrls.active || "",
        spriteUrlActive: spriteUrls.active || "",
        spriteUrlIdle: spriteUrls.idle || "",
        spriteType: "animated",
      };

      localStorage.setItem(selectedBunnyKey, JSON.stringify(bunny));
      selectedBunny = bunny;
      isMobileDialogueOpen = false;
      localStorage.setItem(cutsceneSeenKey, "true");
      rerenderHud();
      hud.classList.remove("bunny-cutscene-hidden");
      bunnyCards.forEach((bunnyCard) => bunnyCard.classList.remove("is-selected-confirm"));
      card.classList.add("is-selected-confirm");
      window.setTimeout(() => {
        card.classList.remove("is-selected-confirm");
        hideCutscene(cutscene);
      }, CUTSCENE_SELECTION_FLASH_MS);
      trackBunnySelection(bunny);
    });
  });

  skipButton.addEventListener("click", () => {
    if (!selectedBunny) {
      const noraCard = bunnyCards.find(
        (card) => getBunnyKey(card.dataset.bunnyName || "") === "nora"
      );
      const bunnyName = (noraCard && noraCard.dataset.bunnyName) || "Nora";
      const bunnyKey = getBunnyKey(bunnyName);
      const spriteUrls = getSpriteUrls(bunnyKey);
      const fallbackEmoji = (noraCard && noraCard.dataset.bunnyEmoji) || "🐇";
      const fallbackType = (noraCard && noraCard.dataset.bunnyType) || "Normal";
      selectedBunny = {
        name: bunnyName,
        type: fallbackType,
        emoji: fallbackEmoji,
        spriteKey: bunnyKey,
        spriteUrl: spriteUrls.active || "",
        spriteUrlActive: spriteUrls.active || "",
        spriteUrlIdle: spriteUrls.idle || "",
        spriteType: "animated",
      };
      localStorage.setItem(selectedBunnyKey, JSON.stringify(selectedBunny));
      isMobileDialogueOpen = false;
      rerenderHud();
      hud.classList.remove("bunny-cutscene-hidden");
    }
    localStorage.setItem(cutsceneSeenKey, "true");
    hideCutscene(cutscene);
  });

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
    const spriteUrls = getSpriteUrls(bunnyKey);
    return {
      ...bunny,
      spriteKey: bunnyKey,
      spriteUrl: bunny.spriteUrl || spriteUrls.active || "",
      spriteUrlActive: bunny.spriteUrlActive || spriteUrls.active || "",
      spriteUrlIdle: bunny.spriteUrlIdle || spriteUrls.idle || "",
      spriteType: bunny.spriteType || "animated",
    };
  } catch (error) {
    return null;
  }
}

function renderCompanionHud(hud, bunny, isUserScrolling, isMobileDialogueOpen, isMobileViewport) {
  const bunnyKey = bunny.spriteKey || getBunnyKey(bunny.name || "");
  const spriteUrls = getSpriteUrls(bunnyKey);
  const dialogue = getDialogueConfig(bunnyKey);
  const activeSprite = bunny.spriteUrlActive || bunny.spriteUrl || spriteUrls.active || "";
  const idleSprite = bunny.spriteUrlIdle || spriteUrls.idle || "";
  const bunnySpriteUrl = isUserScrolling ? activeSprite : idleSprite;
  const cvHref = "/all_CVs/" + dialogue.cvFile;
  const isDialogueVisible = !isMobileViewport || isMobileDialogueOpen;
  const dialogueClass = isDialogueVisible
    ? "bunny-companion-dialogue"
    : "bunny-companion-dialogue bunny-companion-dialogue-collapsed";
  const dialogueToggleMarkup = isMobileViewport
    ? '<button type="button" class="bunny-companion-dialogue-toggle" aria-expanded="' +
      (isMobileDialogueOpen ? "true" : "false") +
      '">click me for dialogue!</button>'
    : "";
  const spriteClasses = bunnySpriteUrl
    ? "bunny-companion-sprite is-animated"
    : "bunny-companion-sprite is-fallback";
  const spriteStyle = bunnySpriteUrl
    ? ' style="--bunny-sprite-url: url(\'' + bunnySpriteUrl + '\');"'
    : "";
  const spriteContent = bunnySpriteUrl ? "" : escapeHtml(bunny.emoji || "🐰");

  hud.innerHTML =
    '<div class="bunny-companion-main">' +
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
    "</span>" +
    "</div>" +
    dialogueToggleMarkup +
    '<div class="' +
    dialogueClass +
    '" role="list" aria-label="Companion dialogue options">' +
    '<span class="bunny-companion-dialogue-option" role="listitem" tabindex="0">' +
    '<span class="bunny-companion-dialogue-prefix" aria-hidden="true">&gt; </span>' +
    "Be careful! Ever since Amy is away from this site, it is dangerous out here." +
    "</span>" +
    '<span class="bunny-companion-dialogue-option bunny-companion-dialogue-option-link" role="listitem" tabindex="0">' +
    '<span class="bunny-companion-dialogue-prefix" aria-hidden="true">&gt; </span>' +
    "Want to know more about Amy's work in " +
    '<span class="bunny-companion-dialogue-expertise-emphasis">' +
    escapeHtml(dialogue.expertise) +
    "</span>" +
    "? The CV on the top right shows all of Amy's experiences; " +
    '<a class="bunny-companion-dialogue-link" href="' +
    escapeHtml(cvHref) +
    '" target="_blank" rel="noopener noreferrer">' +
    '<span class="bunny-companion-dialogue-click-here">click here</span>' +
    "</a>" +
    " for a shorter version!" +
    "</span>" +
    "</div>";

}

function getSpriteUrls(bunnyKey) {
  return (
    BUNNY_SPRITE_MAP[bunnyKey] || {
      active: "",
      idle: "",
    }
  );
}

function getSpriteUrlForState(bunnyKey, state) {
  const spriteUrls = getSpriteUrls(bunnyKey);
  if (state === "idle") {
    return spriteUrls.idle;
  }
  return spriteUrls.active;
}

function getBunnyKey(name) {
  return String(name || "").trim().toLowerCase();
}

function getDialogueConfig(bunnyKey) {
  return (
    BUNNY_DIALOGUE_MAP[bunnyKey] || {
      expertise: "everything",
      cvFile: "Amy_Wu_CV_Everything.pdf",
    }
  );
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
