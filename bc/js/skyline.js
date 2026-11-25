var Skyline = (function () {

  var POINTER = { x: -9999, y: -9999, on: false };
  var listening = false;

  function listen() {
    if (listening) return;
    listening = true;
    window.addEventListener('pointermove', function (ev) {
      POINTER.x = ev.clientX; POINTER.y = ev.clientY; POINTER.on = true;
    }, { passive: true });
    var off = function () { POINTER.on = false; };
    document.addEventListener('pointerleave', off);
    window.addEventListener('blur', off);
  }

  function rgba(hex, a, boost) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) hex = '#ffffff';
    return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' +
      parseInt(hex.slice(5, 7), 16) + ',' + Math.max(0, Math.min(1, a * (boost || 1))) + ')';
  }

  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  var SKY_W = 1000, SKY_H = 250;

  var NAMES = {
    1: 'Altstadt', 2: 'St. Lambertus', 3: 'Schlossturm', 4: 'Rathaus',
    5: 'Rheinkniebrücke', 6: 'Stadttor', 7: 'ARAG-Tower', 8: 'Landtag NRW',
    9: 'Rheinturm', 10: 'Neuer Zollhof', 11: 'Colorium', 12: 'Hyatt Regency',
    13: 'Medienhafen', 14: 'Sky Office', 15: 'Düsseldorf'
  };

  var WINDOWS = { 4: 1, 6: 1, 7: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1 };

  function drawBuildings(ctx, fill) {
    var poly = function (id, pts) {
      fill(id);
      ctx.beginPath();
      ctx.moveTo(pts[0], pts[1]);
      for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      ctx.closePath();
      ctx.fill();
    };
    var rect = function (id, x0, y0, x1, y1) { poly(id, [x0, y0, x1, y0, x1, y1, x0, y1]); };
    var ellipse = function (id, cx, cy, rx, ry) {
      fill(id);
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    };

    [[0, 30, 13], [13, 26, 12], [25, 33, 14], [39, 28, 12], [51, 31, 10]].forEach(function (h) {
      poly(1, [h[0], 0, h[0] + h[2], 0, h[0] + h[2], h[1], h[0] + h[2] / 2, h[1] + 10, h[0], h[1]]);
    });

    poly(2, [62, 0, 94, 0, 94, 34, 78, 46, 62, 34]);
    rect(2, 66, 0, 77, 80);
    poly(2, [65, 80, 78, 80, 73, 132, 70.5, 120]);

    rect(3, 99, 0, 113, 58);
    poly(3, [96, 58, 116, 58, 106, 82]);
    rect(3, 105, 82, 107, 92);

    [[116, 30, 15], [131, 27, 12], [154, 31, 12], [166, 26, 12]].forEach(function (h) {
      poly(1, [h[0], 0, h[0] + h[2], 0, h[0] + h[2], h[1], h[0] + h[2] / 2, h[1] + 8, h[0], h[1]]);
    });
    rect(4, 143, 0, 154, 60);
    poly(4, [142, 60, 155, 60, 148.5, 76]);

    rect(5, 182, 19, 438, 24);
    rect(5, 255, 0, 259, 19);
    rect(5, 341, 0, 345, 19);
    poly(5, [295, 0, 305, 0, 302.5, 122, 297.5, 122]);

    poly(6, [430, 0, 470, 0, 477, 84, 437, 84]);
    rect(6, 436, 84, 478, 90);

    rect(7, 486, 0, 506, 118);
    ellipse(7, 496, 118, 10, 9);

    rect(8, 512, 0, 572, 14);
    ellipse(8, 527, 14, 14, 8);
    ellipse(8, 553, 14, 17, 10);

    poly(9, [593, 0, 607, 0, 603.5, 160, 596.5, 160]);
    poly(9, [596.5, 160, 603.5, 160, 612, 165, 588, 165]);
    poly(9, [588, 165, 612, 165, 614, 175, 611, 184, 589, 184, 586, 175]);
    rect(9, 597, 184, 603, 200);
    rect(9, 598.5, 200, 601.5, 211);

    var wavy = function (id, x0, x1, h, amp, seed) {
      fill(id);
      ctx.beginPath();
      ctx.moveTo(x0, 0);
      for (var y = 0; y <= h; y += 2) ctx.lineTo(x0 + Math.sin(y / 9 + seed) * amp, y);
      for (var x = x0; x <= x1; x += 2) ctx.lineTo(x, h + Math.sin(x / 7 + seed) * amp);
      for (y = h; y >= 0; y -= 2) ctx.lineTo(x1 + Math.sin(y / 8 + seed * 2) * amp, y);
      ctx.closePath();
      ctx.fill();
    };
    wavy(10, 624, 649, 46, 2.2, 0.5);
    wavy(10, 655, 690, 60, 2.6, 2.1);
    wavy(10, 696, 722, 42, 2.0, 4.0);

    rect(11, 736, 0, 753, 64);
    rect(11, 731, 64, 758, 70);

    poly(12, [768, 0, 798, 0, 798, 66, 768, 74]);
    rect(12, 801, 0, 820, 56);

    [[826, 32, 22], [850, 40, 16], [868, 26, 18]].forEach(function (h) { rect(13, h[0], 0, h[0] + h[2], h[1]); });
    rect(14, 890, 0, 914, 88);
    rect(14, 893, 88, 911, 92);
    [[918, 30, 18], [938, 22, 22], [962, 34, 16], [980, 24, 20]].forEach(function (h) { rect(13, h[0], 0, h[0] + h[2], h[1]); });
  }

  var LINES = (function () {
    var l = [];
    for (var k = 0; k < 7; k++) {
      var yp = 62 + k * 9, d = 34 + k * 17;
      l.push([5, 300, yp, 300 - d, 24]);
      l.push([5, 300, yp, 300 + d, 24]);
    }
    l.push([9, 600, 211, 600, 245]);
    return l;
  })();

  var BEACONS = [[600, 245], [600, 212], [586.5, 176], [613.5, 176], [302, 122]];

  var CLOCK = [[9, 5], [5, 4], [9, 3], [5, 2], [9, 1], [2, 0]];

  function create() {

    var S = {
      on: false, box: null, canvas: null, ctx: null, cfg: null, m: null,
      w: 0, h: 0, dpr: 1, raf: 0, visible: true, waitIntro: false,
      pts: [], links: [], beacons: [], clock: [], ground: 0, unit: 1,
      start: 0, introDur: 0, hoverId: 0, boost: 1
    };

    function layout() {
      var m = S.m, water = m.reflection ? m.water : 0.04;
      var avail = S.h * (S.band ? 1 : m.height) * (1 - water);
      var unit = Math.min(Math.max(S.w, 760) * m.scale / SKY_W, avail / SKY_H);
      S.unit = unit;
      S.ground = S.h - S.h * (S.band ? 1 : m.height) * water;
      S.x0 = S.w * (0.5 + m.offset_x) - SKY_W * unit / 2;
    }

    function px(x, y) { return { x: S.x0 + x * S.unit, y: S.ground - y * S.unit }; }

    function build(intro) {
      var m = S.m, rand = rng(11);
      layout();
      var sp = Math.max(2, m.spacing);
      S.pts = []; S.links = [];

      var off = document.createElement('canvas');
      off.width = Math.ceil(S.w); off.height = Math.ceil(S.h);
      var c = off.getContext('2d');
      c.setTransform(S.unit, 0, 0, -S.unit, S.x0, S.ground);
      drawBuildings(c, function (id) { c.fillStyle = 'rgb(255,0,' + id + ')'; });

      var fillers = [];
      var addFiller = function (x, w, h) { fillers.push([x, w, h]); };
      for (var x = -10, r1 = rng(3); S.x0 + x * S.unit > -40; ) {
        var w = 10 + r1() * 18; addFiller(x - w, w, 14 + r1() * 26); x -= w + 2 + r1() * 4;
      }
      for (x = 1002, r1 = rng(5); S.x0 + x * S.unit < S.w + 40; ) {
        w = 10 + r1() * 18; addFiller(x, w, 14 + r1() * 26); x += w + 2 + r1() * 4;
      }
      c.fillStyle = 'rgb(255,0,15)';
      fillers.forEach(function (f) { c.fillRect(f[0], 0, f[1], f[2]); });

      var img = c.getImageData(0, 0, off.width, off.height).data;
      var idAtPx = function (x, y) {
        x = Math.round(x); y = Math.round(y);
        if (x < 0 || y < 0 || x >= off.width || y >= off.height) return 0;
        var i = (y * off.width + x) * 4;
        return img[i + 3] > 140 ? img[i + 2] : 0;
      };

      var addPoint = function (x, y, id, kind, row, col) {
        var hx = x, hy = y;
        S.pts.push({
          hx: hx, hy: hy, x: hx, y: hy, id: id, kind: kind,
          win: kind === 0 && WINDOWS[id] && row % 2 === 0 && col % 2 === 0 && rand() < m.window_share,
          ph1: rand() * 6.283, ph2: rand() * 6.283, amp: 0.4 + rand() * 0.6,
          tw: 0.4 + rand() * 1.2, twp: rand() * 6.283,
          sx: rand() * S.w, sy: rand() * S.h,
          delay: (hx / Math.max(1, S.w)) * 0.5 + rand() * 0.25
        });
      };

      var top = Math.max(0, S.ground - (SKY_H + 10) * S.unit);
      for (var y = S.ground - sp / 2, row = 0; y > top; y -= sp, row++) {
        for (var xx = sp / 2, col = 0; xx < S.w; xx += sp, col++) {
          var id = idAtPx(xx, y);
          if (!id) continue;
          var edge = !idAtPx(xx + sp, y) || !idAtPx(xx - sp, y) || !idAtPx(xx, y - sp) ||
            (y + sp < S.ground && !idAtPx(xx, y + sp));
          addPoint(xx, y, id, edge ? 1 : 0, row, col);
        }
      }

      LINES.forEach(function (l) {
        var a = px(l[1], l[2]), b = px(l[3], l[4]);
        var len = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.round(len / sp));
        for (var i = 0; i <= n; i++) addPoint(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n, l[0], 1, 1, 1);
      });

      for (xx = sp / 2; xx < S.w; xx += sp * 1.5) addPoint(xx, S.ground + 1, 0, 2, 1, 1);

      var maxD = m.link_distance * sp, cell = Math.max(4, maxD), hash = {};
      S.pts.forEach(function (p, i) {
        var k = Math.floor(p.hx / cell) + ',' + Math.floor(p.hy / cell);
        (hash[k] = hash[k] || []).push(i);
      });
      S.pts.forEach(function (p, i) {
        var gx = Math.floor(p.hx / cell), gy = Math.floor(p.hy / cell);
        for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
          (hash[(gx + dx) + ',' + (gy + dy)] || []).forEach(function (j) {
            if (j <= i) return;
            var q = S.pts[j];
            if (p.kind === 2 || q.kind === 2) return;
            if (Math.hypot(p.hx - q.hx, p.hy - q.hy) <= maxD) S.links.push({ a: i, b: j, r: rand() });
          });
        }
      });

      S.beacons = BEACONS.map(function (b, i) { var q = px(b[0], b[1]); q.ph = i * 0.7; return q; });
      S.clock = [];
      var slots = 0;
      CLOCK.forEach(function (g) { slots += g[0] + 1; });
      var y0 = 18, y1 = 152, step = (y1 - y0) / (slots - 1), yy = y0;
      CLOCK.forEach(function (g) {
        for (var i = 0; i < g[0]; i++) { S.clock.push({ p: px(600, yy), digit: g[1], n: i + 1 }); yy += step; }
        S.clock.push({ p: px(600, yy), sep: true }); yy += step;
      });

      S.font = getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif';
      S.start = performance.now();
      S.introDur = intro && m.intro !== 'none' && !REDUCED_MOTION ? m.intro_duration * 1000 : 0;
    }

    function timeDigits() {
      var d = new Date(), two = function (n) { return ('0' + n).slice(-2); };
      return (two(d.getHours()) + two(d.getMinutes()) + two(d.getSeconds())).split('').map(Number);
    }

    function frame(now) {
      S.raf = 0;
      if (!S.on || !S.visible) return;
      var m = S.m, ctx = S.ctx, t = (now - S.start) / 1000, B = S.boost = lightBoost(S.cfg);
      var pal = activePalette(S.cfg);
      var dotC = m.follow_accent ? pal.accent : m.dot_color;
      var lineC = m.follow_accent ? pal.accent2 : m.outline_color;
      var winC = m.follow_accent ? pal.accent2 : m.window_color;
      var still = REDUCED_MOTION;

      ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
      ctx.clearRect(0, 0, S.w, S.h);

      var rect = S.canvas.getBoundingClientRect();
      var mx = POINTER.x - rect.left, my = POINTER.y - rect.top;
      var mOn = POINTER.on && m.mouse !== 'none' && mx > -50 && my > -50 && mx < S.w + 50 && my < S.h + 50;
      var R = m.mouse_radius, introDone = !S.introDur || now - S.start > S.introDur * 1.8;

      for (var i = 0; i < S.pts.length; i++) {
        var p = S.pts[i], x = p.hx, y = p.hy;
        if (!still) {
          x += Math.sin(t * m.drift_speed + p.ph1) * m.drift * p.amp;
          y += Math.cos(t * m.drift_speed * 0.8 + p.ph2) * m.drift * p.amp;
        }
        p.a = 1;
        if (!introDone) {
          var k = Math.max(0, Math.min(1, ((now - S.start) / S.introDur - p.delay) / 0.8));
          var e = ease(k);
          if (m.intro === 'assemble') { x = p.sx + (x - p.sx) * e; y = p.sy + (y - p.sy) * e; }
          else if (m.intro === 'rise') y = S.ground + (y - S.ground) * e;
          p.a = m.intro === 'rise' ? Math.min(1, e * 1.6) : e;
        }
        if (mOn && (m.mouse === 'repulse' || m.mouse === 'attract')) {
          var dx = x - mx, dy = y - my, d = Math.hypot(dx, dy);
          if (d < R && d > 0.01) {
            var f = Math.pow(1 - d / R, 2) * m.mouse_strength * R * 0.35 * (m.mouse === 'attract' ? -1 : 1);
            x += dx / d * f; y += dy / d * f;
          }
        }
        p.x = x; p.y = y;
        p.near = mOn ? Math.max(0, 1 - Math.hypot(x - mx, y - my) / R) : 0;
      }

      S.hoverId = 0;
      if (mOn && m.hover_building && introDone) {
        var best = m.spacing * 2;
        for (i = 0; i < S.pts.length; i++) {
          var hp = S.pts[i];
          if (!hp.id) continue;
          var hd = Math.hypot(hp.hx - mx, hp.hy - my);
          if (hd < best) { best = hd; S.hoverId = hp.id; }
        }
      }

      if (m.reflection && m.reflection_opacity > 0) drawReflection(ctx, t, dotC, still);

      ctx.lineWidth = m.link_width;
      if (m.links !== 'none' && m.link_opacity > 0) {
        ctx.strokeStyle = rgba(dotC, m.link_opacity, B);
        ctx.beginPath();
        for (i = 0; i < S.links.length; i++) {
          var l = S.links[i];
          if (m.links === 'constellation' && l.r > m.link_share) continue;
          var A = S.pts[l.a], Bp = S.pts[l.b];
          if (A.a < 0.98 || Bp.a < 0.98) continue;
          ctx.moveTo(A.x, A.y); ctx.lineTo(Bp.x, Bp.y);
        }
        ctx.stroke();
      }
      if (mOn && m.mouse_links > 0) {
        for (i = 0; i < S.links.length; i++) {
          var L2 = S.links[i], P = S.pts[L2.a], Q = S.pts[L2.b], nn = Math.min(P.near, Q.near);
          if (nn <= 0) continue;
          ctx.strokeStyle = rgba(lineC, nn * m.mouse_links, B);
          ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(Q.x, Q.y); ctx.stroke();
        }
      }

      var size = m.dot_size;
      var lit = function (d) {
        return m.windows && d.win && (still ? d.twp > 3 : Math.sin(t * m.twinkle_speed * d.tw + d.twp) > -0.1);
      };
      var batch = function (filter, color, alpha, s) {
        ctx.fillStyle = rgba(color, alpha, B);
        ctx.beginPath();
        for (var j = 0; j < S.pts.length; j++) {
          var d = S.pts[j];
          if (!filter(d)) continue;
          var r = s * (0.4 + 0.6 * d.a) * (1 + d.near * (m.mouse === 'bubble' ? 1.8 : 0.6));
          ctx.moveTo(d.x + r, d.y);
          ctx.arc(d.x, d.y, r, 0, 6.283);
        }
        ctx.fill();
      };
      var hov = S.hoverId;
      batch(function (d) { return d.kind === 0 && d.id !== hov && !lit(d); }, dotC, m.dot_opacity * 0.75, size);
      batch(function (d) { return d.kind === 1 && d.id !== hov; }, lineC, m.outline_opacity, size * 1.1);
      batch(function (d) { return d.kind === 2; }, dotC, m.dot_opacity * 0.6, size * 0.9);
      if (m.windows) batch(function (d) { return d.kind === 0 && d.id !== hov && lit(d); }, winC, m.window_opacity, size * 1.2);
      if (hov) batch(function (d) { return d.id === hov; }, lineC, 1, size * 1.4);

      if (introDone) {
        if (m.clock) drawClock(ctx, dotC, winC);
        if (m.beacons) drawBeacons(ctx, t, still);
      }

      if (hov && m.building_label && NAMES[hov]) drawLabel(ctx, NAMES[hov], mx, my, pal, lineC);

      S.raf = requestAnimationFrame(frame);
    }

    function drawReflection(ctx, t, color, still) {
      var m = S.m, depthMax = S.h - S.ground, squeeze = 0.62;
      if (depthMax < 6) return;
      var bands = 4;
      for (var b = 0; b < bands; b++) {
        ctx.fillStyle = rgba(color, m.reflection_opacity * (1 - b / bands) * 0.9, S.boost);
        ctx.beginPath();
        for (var i = 0; i < S.pts.length; i++) {
          var p = S.pts[i];
          if (p.kind === 2) continue;
          var depth = (S.ground - p.y) * squeeze;
          if (depth <= 0 || depth >= depthMax) continue;
          if (Math.floor(depth / depthMax * bands) !== b) continue;
          var wave = still ? 0 : Math.sin(t * 1.6 + depth * 0.12 + p.hx * 0.01) * m.waves * (1 + depth / depthMax * 3);
          var x = p.x + wave, y = S.ground + 3 + depth, r = m.dot_size * 0.85 * p.a;
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, 6.283);
        }
        ctx.fill();
      }
    }

    function drawClock(ctx, offC, onC) {
      var dg = timeDigits(), r = Math.max(0.9, S.m.dot_size * 0.9);
      S.clock.forEach(function (c) {
        var on = c.sep || c.n <= dg[c.digit];
        ctx.fillStyle = c.sep ? rgba('#ff5a4f', 0.9, S.boost) : rgba(on ? onC : offC, on ? 1 : 0.25, S.boost);
        ctx.beginPath(); ctx.arc(c.p.x, c.p.y, on ? r * 1.25 : r, 0, 6.283); ctx.fill();
      });
    }

    function drawBeacons(ctx, t, still) {
      var col = S.m.beacon_color;
      var gr = 4 + 4 * Math.min(1.5, S.unit);
      S.beacons.forEach(function (b) {
        var on = still ? 1 : Math.max(0, Math.sin(t * 2.4 + b.ph));
        if (on <= 0.02) return;
        var g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, gr);
        g.addColorStop(0, rgba(col, 0.55 * on, S.boost));
        g.addColorStop(1, rgba(col, 0, 1));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(b.x, b.y, gr, 0, 6.283); ctx.fill();
        ctx.fillStyle = rgba(col, on, S.boost);
        ctx.beginPath(); ctx.arc(b.x, b.y, 1.6, 0, 6.283); ctx.fill();
      });
    }

    function drawLabel(ctx, text, mx, my, pal, color) {
      ctx.font = '600 11px ' + S.font;
      var tw = ctx.measureText(text.toUpperCase()).width;
      var lx = Math.max(8, Math.min(mx + 16, S.w - tw - 22)), ly = Math.max(20, my - 18);
      ctx.fillStyle = rgba(pal.surface, 0.85, S.boost);
      ctx.strokeStyle = rgba(color, 0.45, S.boost);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.rect(lx - 8, ly - 13, tw + 16, 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(color, 1, 1);
      ctx.fillText(text.toUpperCase(), lx, ly + 2);
    }

    function size() {
      S.dpr = Math.min(2, window.devicePixelRatio || 1);
      S.w = S.box.clientWidth || window.innerWidth;
      S.h = S.box.clientHeight || window.innerHeight;
      S.canvas.width = S.w * S.dpr;
      S.canvas.height = S.h * S.dpr;
      S.canvas.style.width = S.w + 'px';
      S.canvas.style.height = S.h + 'px';
    }

    function kick() {
      if (S.on && S.visible && !S.raf) S.raf = requestAnimationFrame(frame);
    }

    function onResize() {
      clearTimeout(S.rt);
      S.rt = setTimeout(function () { if (!S.on) return; size(); build(false); kick(); }, 150);
    }

    function start(box, cfg, opts) {
      opts = opts || {};
      stop();
      listen();
      S.on = true; S.box = box; S.cfg = cfg; S.m = cfg.skyline; S.band = !!opts.band;
      S.canvas = document.createElement('canvas');
      S.canvas.className = 'skyline-canvas';
      box.appendChild(S.canvas);
      S.ctx = S.canvas.getContext('2d');
      window.addEventListener('resize', onResize);
      size();
      build(!!opts.intro);
      S.waitIntro = !!(opts.intro && opts.waitVisible);
      S.visible = !S.waitIntro;
      kick();
    }

    function stop() {
      S.on = false;
      if (S.raf) cancelAnimationFrame(S.raf);
      S.raf = 0;
      window.removeEventListener('resize', onResize);
      if (S.canvas && S.canvas.parentNode) S.canvas.parentNode.removeChild(S.canvas);
      S.canvas = null;
    }

    function setVisible(v) {
      S.visible = !!v;
      if (S.visible && S.waitIntro) { S.waitIntro = false; S.start = performance.now(); }
      if (S.visible) kick();
    }

    return { start: start, stop: stop, setVisible: setVisible, running: function () { return S.on; } };
  }

  return { create: create, names: NAMES };
})();
