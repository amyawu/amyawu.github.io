/**
 * Magnetic field background — undulator.
 *
 * Renders a dense grid of short line segments ("iron filings") that orient
 * along the field of an undulator: a horizontal row of alternating poles
 * (N-S-N-S-…) across the page, like the magnet array that wiggles a particle
 * beam in a synchrotron. The result is a repeating chain of field-line loops.
 * The cursor acts as an extra roaming pole, locally bending the lattice.
 * Filings grow brighter and longer where the field is strong (near the poles).
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
    segLen: 15, // base filing length (px)
    extraLen: 12, // additional length where the field is strong
    lineWidth: 1.6,
    baseAlpha: 0.1, // opacity far from any pole
    maxAlpha: 0.1, // opacity right next to a pole
    halfSat: 1.1, // field magnitude at which brightness is half-saturated
    ease: 0.18, // how quickly a filing turns toward the field direction
    // Undulator lattice: a horizontal row of alternating poles.
    period: 150, // spacing between consecutive poles (px) = half the wiggle wavelength
    axisYFrac: 0.5, // vertical position of the beam axis (fraction of viewport height)
    driftSpeed: 0.035, // px/ms the lattice travels along its axis (undulator "in action")
    // Pole strengths (in px^2; field magnitude ~ strength / distance^2).
    sitePole: 26000,
    cursorPole: 46000,
    // Gentle vertical "breathing" of the whole axis so the field feels alive at rest.
    bobAmp: 8,
    bobSpeed: 0.0003,
    glowAlpha: 0.06, // faint halo drawn at each pole
    glowRadius: 95,
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
    var m = String(hex || "")
      .trim()
      .replace("#", "");
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

  // The undulator poles at time `now`: a row of alternating N/S poles spaced
  // `period` apart that travels longitudinally along its axis (the classic
  // undulator field in motion), gently bobbing up and down as one. The lattice
  // is drifted and wrapped by a full N-S cycle (2*period) so the alternating
  // polarity stays continuous and the row is always seamless off both edges.
  function undulatorPoles(now) {
    var poles = [];
    var period = CONFIG.period;
    var cycle = period * 2; // one full N-S-N cycle
    var drift = (((now * CONFIG.driftSpeed) % cycle) + cycle) % cycle;
    var startX = -cycle + drift; // start a cycle off-screen left so it stays covered
    var axisY = h * CONFIG.axisYFrac + Math.sin(now * CONFIG.bobSpeed) * CONFIG.bobAmp;
    var i = 0;
    for (var x = startX; x < w + period; x += period) {
      poles.push({
        x: x,
        y: axisY,
        q: (i % 2 === 0 ? 1 : -1) * CONFIG.sitePole,
      });
      i++;
    }
    return poles;
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
    var poles = undulatorPoles(0);
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
    var poles = undulatorPoles(now);
    if (mouseActive) {
      poles.push({ x: mouseX, y: mouseY, q: CONFIG.cursorPole });
    }
    return poles;
  }

  function renderFrame(now, animate) {
    var poles = currentPoles(now);
    paintBackground();

    // Faint halos so each pole in the array reads as a pole.
    for (var g = 0; g < poles.length; g++) {
      drawGlow(poles[g].x, poles[g].y);
    }

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
    reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
