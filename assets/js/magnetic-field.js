/**
 * Magnetic field background.
 *
 * Draws a faint grid of short line segments ("iron filings") that orient along
 * a slowly evolving flow field. When the cursor moves, nearby filings align
 * tangentially and orbit around it, like iron particles circling a magnet, then
 * spring back to rest. Colors are read from the active theme's CSS variables
 * (green in light mode, magenta in dark mode) and update live on theme change.
 */
(function () {
  "use strict";

  var CONFIG = {
    spacing: 44, // grid spacing between filings (px)
    jitter: 0.32, // fraction of spacing used to randomize home positions
    segLen: 11, // base filing length (px)
    lineWidth: 1,
    baseAlpha: 0.15, // faint idle opacity
    cursorRadius: 240, // radius of cursor influence (px)
    swirl: 1.9, // tangential push strength near cursor
    pull: 0.28, // slight inward pull so filings hug the cursor ring
    spring: 0.02, // return-to-home strength
    damping: 0.85, // velocity damping
    fieldScale: 0.0016, // spatial frequency of the base field
    fieldSpeed: 0.00011, // how fast the base field evolves over time
  };

  var canvas, ctx, dpr, w, h;
  var particles = [];
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
    buildParticles();
  }

  function buildParticles() {
    particles = [];
    var s = CONFIG.spacing;
    var j = s * CONFIG.jitter;
    for (var y = s / 2; y < h + s; y += s) {
      for (var x = s / 2; x < w + s; x += s) {
        // Deterministic pseudo-random jitter for an organic (non-gridded) look.
        var jx = Math.sin(x * 13.1 + y * 7.7) * j;
        var jy = Math.cos(x * 7.3 + y * 11.9) * j;
        var hx = x + jx,
          hy = y + jy;
        particles.push({ hx: hx, hy: hy, x: hx, y: hy, vx: 0, vy: 0 });
      }
    }
  }

  function fieldAngle(x, y, t) {
    return (
      (Math.sin(x * CONFIG.fieldScale + t) + Math.cos(y * CONFIG.fieldScale - t * 0.85)) * Math.PI
    );
  }

  function lerpAngle(a, b, t) {
    var d = b - a;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return a + d * t;
  }

  function drawSegment(x, y, angle, len, alpha) {
    var cx = Math.cos(angle) * len * 0.5;
    var cy = Math.sin(angle) * len * 0.5;
    ctx.strokeStyle = "rgba(" + strokeRgb + "," + alpha + ")";
    ctx.beginPath();
    ctx.moveTo(x - cx, y - cy);
    ctx.lineTo(x + cx, y + cy);
    ctx.stroke();
  }

  function paintBackground() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  function frame(now) {
    if (!running) return;
    var t = now * CONFIG.fieldSpeed;
    var R = CONFIG.cursorRadius;
    paintBackground();

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var ang = fieldAngle(p.x, p.y, t);
      var alpha = CONFIG.baseAlpha;
      var len = CONFIG.segLen;

      if (mouseActive) {
        var dx = p.x - mouseX,
          dy = p.y - mouseY;
        var dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        if (dist < R) {
          var inf = 1 - dist / R; // 0..1
          var e = inf * inf; // eased influence
          var tangent = Math.atan2(dy, dx) + Math.PI / 2;
          ang = lerpAngle(ang, tangent, Math.min(1, e * 1.4));
          alpha = CONFIG.baseAlpha + e * 0.5;
          len = CONFIG.segLen + e * 7;
          // Orbital push (tangential) plus a small inward pull.
          var push = CONFIG.swirl * e;
          p.vx += Math.cos(tangent) * push - (dx / dist) * e * CONFIG.pull;
          p.vy += Math.sin(tangent) * push - (dy / dist) * e * CONFIG.pull;
        }
      }

      // Spring back to home position and damp.
      p.vx += (p.hx - p.x) * CONFIG.spring;
      p.vy += (p.hy - p.y) * CONFIG.spring;
      p.vx *= CONFIG.damping;
      p.vy *= CONFIG.damping;
      p.x += p.vx;
      p.y += p.vy;

      drawSegment(p.x, p.y, ang, len, alpha);
    }

    requestAnimationFrame(frame);
  }

  function renderStatic() {
    paintBackground();
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      drawSegment(p.x, p.y, fieldAngle(p.x, p.y, 0), CONFIG.segLen, CONFIG.baseAlpha);
    }
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
      if (reduceMotion) renderStatic();
    }, 150);
    window.addEventListener("resize", onResize);

    // Keep colors in sync with light/dark theme toggles.
    var observer = new MutationObserver(function () {
      readColors();
      if (reduceMotion) renderStatic();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    if (reduceMotion) {
      renderStatic();
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
