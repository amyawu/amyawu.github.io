/**
 * Magnetic field background.
 *
 * Renders a dense grid of short line segments ("iron filings") that orient
 * along the field of a bar magnet: one fixed north pole and one fixed south
 * pole on the page. The cursor acts as a third, roaming pole, so moving it
 * bends the field lines around it like iron filings around a magnet. Filings
 * grow brighter and longer where the field is strong (near the poles).
 *
 * The canvas is injected as the first child of <body> and sits at z-index -1,
 * so it stays in the background while page content renders on top. Colors are
 * read from the active theme's CSS variables (green in light mode, magenta in
 * dark mode) and update live on theme change.
 */
(function () {
  "use strict";

  var PI = Math.PI;

  var CONFIG = {
    spacing: 26, // grid spacing between filings (px) — smaller = many more filings
    jitter: 0.22, // fraction of spacing used to randomize home positions
    segLen: 13, // base filing length (px)
    extraLen: 11, // additional length where the field is strong
    lineWidth: 1.1,
    baseAlpha: 0.22, // opacity far from any pole
    maxAlpha: 0.72, // opacity right next to a pole
    halfSat: 1.6, // field magnitude at which brightness is half-saturated
    ease: 0.18, // how quickly a filing turns toward the field direction
    // Pole strengths (in px^2; field magnitude ~ strength / distance^2).
    sitePole: 26000,
    cursorPole: 46000,
    // Gentle "breathing" of the fixed poles so the field feels alive at rest.
    bobAmp: 12,
    bobSpeed: 0.00035,
    glowAlpha: 0.05, // faint halo drawn at each pole
    glowRadius: 130,
    contentWidth: 930, // matches $max-content-width; poles sit outside this column
  };

  var canvas, ctx, dpr, w, h;
  var particles = [];
  var poleN = { x: 0, y: 0 }; // fixed north pole (base position)
  var poleS = { x: 0, y: 0 }; // fixed south pole (base position)
  var mouseX = -9999,
    mouseY = -9999,
    mouseActive = false;
  var strokeRgb = "0,167,98";
  var bgColor = "#ffffff";
  var reduceMotion = false;
  var running = false;

  function hexToRgb(hex) {
    var m = String(hex || "").trim().replace("#", "");
    if (m.length === 3) {
      var r3 = parseInt(m[0] + m[0], 16),
        g3 = parseInt(m[1] + m[1], 16),
        b3 = parseInt(m[2] + m[2], 16);
      if (!isNaN(r3) && !isNaN(g3) && !isNaN(b3)) return r3 + "," + g3 + "," + b3;
    }
    if (m.length >= 6) {
      var r = parseInt(m.slice(0, 2), 16),
        g = parseInt(m.slice(2, 4), 16),
        b = parseInt(m.slice(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return r + "," + g + "," + b;
    }
    return null;
  }

  function readColors() {
    var styles = getComputedStyle(document.documentElement);
    var bg = (styles.getPropertyValue("--global-bg-color") || "#ffffff").trim();
    if (bg) bgColor = bg;
    var theme = (styles.getPropertyValue("--global-theme-color") || "").trim();
    var rgb = hexToRgb(theme);
    if (rgb) strokeRgb = rgb;
  }

  function computePoleBases() {
    // Keep the poles out of the centered content column (max 930px wide) by
    // seating them in the side gutters, one per side. On narrow screens with no
    // gutter they fall back to just inside the screen edges.
    var contentW = Math.min(CONFIG.contentWidth, w);
    var leftEdge = (w - contentW) / 2; // == left gutter width
    var rightEdge = w - leftEdge;
    poleN.x = Math.max(24, leftEdge / 2); // middle of the left gutter
    poleN.y = h * 0.4;
    poleS.x = Math.min(w - 24, (rightEdge + w) / 2); // middle of the right gutter
    poleS.y = h * 0.6;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = CONFIG.lineWidth;
    ctx.lineCap = "round";
    computePoleBases();
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    var s = CONFIG.spacing;
    var j = s * CONFIG.jitter;
    var poles = [
      { x: poleN.x, y: poleN.y, q: CONFIG.sitePole },
      { x: poleS.x, y: poleS.y, q: -CONFIG.sitePole },
    ];
    for (var y = s / 2; y < h + s; y += s) {
      for (var x = s / 2; x < w + s; x += s) {
        // Deterministic pseudo-random jitter for an organic (non-gridded) look.
        var jx = Math.sin(x * 13.1 + y * 7.7) * j;
        var jy = Math.cos(x * 7.3 + y * 11.9) * j;
        var hx = x + jx,
          hy = y + jy;
        var f = fieldAt(hx, hy, poles);
        particles.push({ x: hx, y: hy, ori: orientationOf(f.bx, f.by) });
      }
    }
  }

  // Sum the field of every pole at (x, y). Each pole contributes q * r_hat / r^2.
  function fieldAt(x, y, poles) {
    var bx = 0,
      by = 0;
    for (var i = 0; i < poles.length; i++) {
      var p = poles[i];
      var dx = x - p.x,
        dy = y - p.y;
      var d2 = dx * dx + dy * dy + 1; // +1 softens the singularity at the pole
      var d = Math.sqrt(d2);
      var k = p.q / (d2 * d); // q / r^3, so k*(dx,dy) has magnitude q / r^2
      bx += dx * k;
      by += dy * k;
    }
    return { bx: bx, by: by, mag: Math.sqrt(bx * bx + by * by) };
  }

  // Orientation of a vector as an undirected line angle in [0, PI).
  function orientationOf(bx, by) {
    var a = Math.atan2(by, bx);
    if (a < 0) a += PI;
    if (a >= PI) a -= PI;
    return a;
  }

  // Ease an orientation toward a target along the shortest arc, mod PI, so the
  // filings never do a jarring 180° flip when the field direction reverses.
  function easeOri(cur, target, f) {
    var d = target - cur;
    if (d > PI / 2) d -= PI;
    else if (d < -PI / 2) d += PI;
    return cur + d * f;
  }

  function drawSegment(x, y, ori, len, alpha) {
    var cx = Math.cos(ori) * len * 0.5;
    var cy = Math.sin(ori) * len * 0.5;
    ctx.strokeStyle = "rgba(" + strokeRgb + "," + alpha + ")";
    ctx.beginPath();
    ctx.moveTo(x - cx, y - cy);
    ctx.lineTo(x + cx, y + cy);
    ctx.stroke();
  }

  function drawGlow(x, y) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, CONFIG.glowRadius);
    g.addColorStop(0, "rgba(" + strokeRgb + "," + CONFIG.glowAlpha + ")");
    g.addColorStop(1, "rgba(" + strokeRgb + ",0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, CONFIG.glowRadius, 0, PI * 2);
    ctx.fill();
  }

  function paintBackground() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  function currentPoles(now) {
    var bob = Math.sin(now * CONFIG.bobSpeed) * CONFIG.bobAmp;
    var poles = [
      { x: poleN.x, y: poleN.y + bob, q: CONFIG.sitePole },
      { x: poleS.x, y: poleS.y - bob, q: -CONFIG.sitePole },
    ];
    if (mouseActive) {
      poles.push({ x: mouseX, y: mouseY, q: CONFIG.cursorPole });
    }
    return poles;
  }

  function renderFrame(now, animate) {
    var poles = currentPoles(now);
    paintBackground();

    // Faint halos so the magnet's poles read as poles.
    drawGlow(poles[0].x, poles[0].y);
    drawGlow(poles[1].x, poles[1].y);
    if (poles.length > 2) drawGlow(poles[2].x, poles[2].y);

    var span = CONFIG.maxAlpha - CONFIG.baseAlpha;
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var f = fieldAt(p.x, p.y, poles);
      var target = orientationOf(f.bx, f.by);
      p.ori = animate ? easeOri(p.ori, target, CONFIG.ease) : target;

      var boost = f.mag / (f.mag + CONFIG.halfSat); // 0..1
      var alpha = CONFIG.baseAlpha + boost * span;
      var len = CONFIG.segLen + boost * CONFIG.extraLen;
      drawSegment(p.x, p.y, p.ori, len, alpha);
    }
  }

  function frame(now) {
    if (!running) return;
    renderFrame(now, true);
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    requestAnimationFrame(frame);
  }

  function debounce(fn, wait) {
    var timer = null;
    return function () {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, wait);
    };
  }

  function init() {
    if (document.getElementById("magnetic-field-canvas")) return;
    reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    canvas = document.createElement("canvas");
    canvas.id = "magnetic-field-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    ctx = canvas.getContext("2d");

    readColors();
    resize();

    var onResize = debounce(function () {
      resize();
      if (reduceMotion) renderFrame(0, false);
    }, 150);
    window.addEventListener("resize", onResize);

    // Keep colors in sync with light/dark theme toggles.
    var observer = new MutationObserver(function () {
      readColors();
      if (reduceMotion) renderFrame(0, false);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (reduceMotion) {
      renderFrame(0, false);
      return;
    }

    var onMove = function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onMove, { passive: true });
    document.addEventListener("mouseleave", function () {
      mouseActive = false;
    });
    window.addEventListener("blur", function () {
      mouseActive = false;
    });

    // Pause the loop while the tab is hidden.
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        running = false;
      } else {
        start();
      }
    });

    start();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
