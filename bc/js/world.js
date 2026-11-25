var WorldMap = (function () {

  var S = {
    on: false, box: null, canvas: null, ctx: null, cfg: null, m: null,
    w: 0, h: 0, dpr: 1, raf: 0, visible: true,
    pts: [], links: [], byCountry: {},
    routes: [], hub: null,
    mouse: { x: -9999, y: -9999, on: false },
    start: 0, introDur: 0, hoverId: 0, spacing: 10
  };

  var GRID = null;

  function decodeGrid() {
    if (GRID || typeof WORLD_DATA === 'undefined') return;
    var D = WORLD_DATA;
    GRID = new Uint8Array(D.cols * D.rows);
    D.grid.forEach(function (row, r) {
      var c = 0;
      row.split(' ').forEach(function (run) {
        var p = run.split('.'), id = parseInt(p[0], 36), n = parseInt(p[1], 36);
        if (id) GRID.fill(id, r * D.cols + c, r * D.cols + c + n);
        c += n;
      });
    });
  }

  function idAt(r, c) {
    var D = WORLD_DATA;
    if (r < 0 || r >= D.rows) return 0;
    c = ((c % D.cols) + D.cols) % D.cols;
    return GRID[r * D.cols + c];
  }

  var BOOST = 1;

  function rgba(hex, a) {
    if (!/^#[0-9a-f]{6}$/i.test(hex || '')) hex = '#ffffff';
    return 'rgba(' + parseInt(hex.slice(1, 3), 16) + ',' + parseInt(hex.slice(3, 5), 16) + ',' + parseInt(hex.slice(5, 7), 16) + ',' + Math.max(0, Math.min(1, a * BOOST)) + ')';
  }

  function rng(seed) {
    return function () {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  }

  function layout() {
    var D = WORLD_DATA, m = S.m;
    var mapW = Math.max(S.w, S.h * 1.5) * m.scale;
    var degPx = mapW / 360;
    var mapH = (D.rows * D.res) * degPx;
    return {
      degPx: degPx,
      x0: S.w * (0.5 + m.offset_x) - mapW / 2,
      y0: S.h * (0.5 + m.offset_y) - mapH / 2
    };
  }

  function project(L, lon, lat) {
    var D = WORLD_DATA;
    return { x: L.x0 + (lon - D.lon0) * L.degPx, y: L.y0 + (D.lat0 - lat) * L.degPx };
  }

  function build(intro) {
    var D = WORLD_DATA, m = S.m, L = layout();
    var step = Math.max(1, Math.round(m.density / D.res));
    var rand = rng(7);
    S.spacing = step * D.res * L.degPx;
    S.pts = []; S.links = []; S.byCountry = {};

    var index = {};
    for (var r = Math.floor(step / 2), row = 0; r < D.rows; r += step, row++) {
      var shift = m.hex && row % 2 ? Math.floor(step / 2) : 0;
      for (var c = Math.floor(step / 2) + shift, col = 0; c < D.cols; c += step, col++) {
        var id = idAt(r, c);
        if (!id) continue;
        var lon = D.lon0 + (c + 0.5) * D.res, lat = D.lat0 - (r + 0.5) * D.res;
        var home = project(L, lon, lat);
        if (home.x < -40 || home.x > S.w + 40 || home.y < -40 || home.y > S.h + 40) continue;

        var kind = 0;
        [[0, step], [0, -step], [step, 0], [-step, 0]].forEach(function (d) {
          var n = idAt(r + d[0], c + d[1]);
          if (!n) kind = Math.max(kind, 1);
          else if (n !== id) kind = 2;
        });

        var p = {
          hx: home.x, hy: home.y, x: home.x, y: home.y,
          id: id, kind: kind,
          ph1: rand() * 6.283, ph2: rand() * 6.283, amp: 0.4 + rand() * 0.6,
          sx: rand() * S.w, sy: rand() * S.h,
          delay: (home.x / Math.max(1, S.w)) * 0.45 + rand() * 0.35
        };
        index[row + ',' + col] = S.pts.length;
        (S.byCountry[id] = S.byCountry[id] || []).push(S.pts.length);
        S.pts.push(p);
      }
    }

    var maxD = m.link_distance * S.spacing, cell = Math.max(4, maxD), hash = {};
    S.pts.forEach(function (p, i) {
      var k = Math.floor(p.hx / cell) + ',' + Math.floor(p.hy / cell);
      (hash[k] = hash[k] || []).push(i);
    });
    S.pts.forEach(function (p, i) {
      var gx = Math.floor(p.hx / cell), gy = Math.floor(p.hy / cell);
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        (hash[(gx + dx) + ',' + (gy + dy)] || []).forEach(function (j) {
          if (j <= i) return;
          var q = S.pts[j], d = Math.hypot(p.hx - q.hx, p.hy - q.hy);
          if (d <= maxD) S.links.push({ a: i, b: j, r: rand() });
        });
      }
    });

    buildRoutes(L);
    S.font = getComputedStyle(document.documentElement).getPropertyValue('--font-sans') || 'sans-serif';

    S.start = performance.now();
    S.introDur = intro && m.intro !== 'none' && !REDUCED_MOTION ? m.intro_duration * 1000 : 0;
  }

  function buildRoutes(L) {
    var R = S.m.routes || {};
    S.routes = []; S.hub = null;
    if (!R.enable || !R.hub) return;
    S.hub = project(L, Number(R.hub.lon) || 0, Number(R.hub.lat) || 0);
    S.hub.name = R.hub.name;
    (R.list || []).forEach(function (d, i) {
      var to = project(L, Number(d.lon) || 0, Number(d.lat) || 0);
      var dist = Math.hypot(to.x - S.hub.x, to.y - S.hub.y);
      S.routes.push({
        to: to, name: d.name,
        cx: (S.hub.x + to.x) / 2, cy: (S.hub.y + to.y) / 2 - dist * (R.arc_height || 0.3),
        off: i * 0.37
      });
    });
  }

  function onRoute(rt, u) {
    var a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    return { x: a * S.hub.x + b * rt.cx + c * rt.to.x, y: a * S.hub.y + b * rt.cy + c * rt.to.y };
  }

  var ease = function (t) { return 1 - Math.pow(1 - t, 3); };

  function frame(now) {
    S.raf = 0;
    if (!S.on || !S.visible) return;
    var m = S.m, ctx = S.ctx, t = (now - S.start) / 1000;
    var pal = activePalette(S.cfg);
    BOOST = lightBoost(S.cfg);
    var dotC = m.follow_accent ? pal.accent : m.dot_color;
    var borderC = m.follow_accent ? pal.accent2 : m.border_color;
    var routeC = m.follow_accent ? pal.accent2 : m.route_color;
    var still = REDUCED_MOTION;

    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    ctx.clearRect(0, 0, S.w, S.h);

    var mx = S.mouse.x, my = S.mouse.y, mOn = S.mouse.on && m.mouse !== 'none';
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
        else if (m.intro === 'rise') y += (1 - e) * 60;
        p.a = e;
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
    if (mOn && m.hover_country) {
      var best = S.spacing * 1.6;
      for (i = 0; i < S.pts.length; i++) {
        var hp = S.pts[i], hd = Math.hypot(hp.x - mx, hp.y - my);
        if (hd < best) { best = hd; S.hoverId = hp.id; }
      }
    }

    ctx.lineWidth = m.link_width;
    if (m.links !== 'none' && m.link_opacity > 0) {
      ctx.strokeStyle = rgba(dotC, m.link_opacity);
      ctx.beginPath();
      for (i = 0; i < S.links.length; i++) {
        var l = S.links[i];
        if (m.links === 'constellation' && l.r > m.link_share) continue;
        var A = S.pts[l.a], B = S.pts[l.b];
        if (A.a < 0.98 || B.a < 0.98) continue;
        ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y);
      }
      ctx.stroke();
    }
    if (mOn && m.mouse_links > 0) {
      for (i = 0; i < S.links.length; i++) {
        var L2 = S.links[i], P = S.pts[L2.a], Q = S.pts[L2.b], nn = Math.min(P.near, Q.near);
        if (nn <= 0) continue;
        ctx.strokeStyle = rgba(borderC, nn * m.mouse_links);
        ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(Q.x, Q.y); ctx.stroke();
      }
    }

    var size = m.dot_size;
    var batch = function (filter, color, alpha, s) {
      ctx.fillStyle = rgba(color, alpha);
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
    batch(function (d) { return d.kind === 0 && d.id !== S.hoverId; }, dotC, m.dot_opacity * 0.75, size);
    batch(function (d) { return d.kind === 1 && d.id !== S.hoverId; }, dotC, m.dot_opacity, size);
    if (m.borders) batch(function (d) { return d.kind === 2 && d.id !== S.hoverId; }, borderC, m.border_opacity, size * 1.15);
    else batch(function (d) { return d.kind === 2 && d.id !== S.hoverId; }, dotC, m.dot_opacity, size);
    if (S.hoverId) batch(function (d) { return d.id === S.hoverId; }, borderC, 1, size * 1.45);

    if (mOn && m.mouse === 'grab' && m.grab_lines > 0) {
      var near = [];
      for (i = 0; i < S.pts.length; i++) if (S.pts[i].near > 0.25) near.push(S.pts[i]);
      near.sort(function (a, b) { return b.near - a.near; });
      near.slice(0, m.grab_lines).forEach(function (g) {
        ctx.strokeStyle = rgba(borderC, g.near * 0.7);
        ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(g.x, g.y); ctx.stroke();
      });
    }

    if (S.hub && introDone) drawRoutes(ctx, t, routeC, still);

    if (S.hoverId && m.country_label && WORLD_DATA.names[S.hoverId]) {
      var label = WORLD_DATA.names[S.hoverId];
      ctx.font = '600 11px ' + S.font;
      var tw = ctx.measureText(label.toUpperCase()).width;
      var lx = Math.min(mx + 16, S.w - tw - 22), ly = my - 18;
      ctx.fillStyle = rgba(pal.surface, 0.85);
      ctx.strokeStyle = rgba(borderC, 0.45);
      ctx.beginPath(); ctx.rect(lx - 8, ly - 13, tw + 16, 22); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(borderC, 1);
      ctx.fillText(label.toUpperCase(), lx, ly + 2);
    }

    S.raf = requestAnimationFrame(frame);
  }

  function drawRoutes(ctx, t, color, still) {
    var R = S.m.routes, alpha = R.opacity;
    ctx.lineWidth = 1;
    S.labels = [];
    if (R.labels && S.hub.name) label(ctx, S.hub.name, S.hub.x, S.hub.y, color, 1);

    S.routes.forEach(function (rt) {
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = still ? 0 : -t * 12;
      ctx.strokeStyle = rgba(color, alpha * 0.55);
      ctx.beginPath();
      ctx.moveTo(S.hub.x, S.hub.y);
      ctx.quadraticCurveTo(rt.cx, rt.cy, rt.to.x, rt.to.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (R.sparks && !still) {
        var u = (t * R.speed + rt.off) % 1;
        for (var k = 0; k < 14; k++) {
          var uu = u - k * 0.012;
          if (uu < 0) break;
          var q = onRoute(rt, uu);
          ctx.fillStyle = rgba(color, alpha * (1 - k / 14));
          ctx.beginPath(); ctx.arc(q.x, q.y, 2.2 * (1 - k / 18), 0, 6.283); ctx.fill();
        }
      }

      ctx.fillStyle = rgba(color, alpha);
      ctx.beginPath(); ctx.arc(rt.to.x, rt.to.y, 2.4, 0, 6.283); ctx.fill();
      ctx.strokeStyle = rgba(color, alpha * 0.5);
      ctx.beginPath(); ctx.arc(rt.to.x, rt.to.y, 5.5, 0, 6.283); ctx.stroke();
      if (R.labels && rt.name) label(ctx, rt.name, rt.to.x, rt.to.y, color, alpha);
    });

    ctx.fillStyle = rgba(color, 1);
    ctx.beginPath(); ctx.arc(S.hub.x, S.hub.y, 3.4, 0, 6.283); ctx.fill();
    for (var n = 0; n < 2; n++) {
      var ph = still ? 0.5 : (t * 0.5 + n * 0.5) % 1;
      ctx.strokeStyle = rgba(color, (1 - ph) * 0.8);
      ctx.beginPath(); ctx.arc(S.hub.x, S.hub.y, 4 + ph * 22, 0, 6.283); ctx.stroke();
    }
  }

  function label(ctx, text, x, y, color, alpha) {
    ctx.font = '600 10px ' + S.font;
    text = String(text).toUpperCase();
    var w = ctx.measureText(text).width, h = 10;
    var spots = [[x + 9, y - 7], [x - 9 - w, y - 7], [x + 9, y + 14], [x - 9 - w, y + 14]];
    for (var i = 0; i < spots.length; i++) {
      var lx = spots[i][0], ly = spots[i][1];
      var hit = S.labels.some(function (b) { return lx < b.x + b.w + 4 && lx + w + 4 > b.x && ly - h < b.y && ly > b.y - b.h - 2; });
      if (hit || lx < 2 || lx + w > S.w - 2) continue;
      S.labels.push({ x: lx, y: ly, w: w, h: h });
      ctx.fillStyle = rgba(color, alpha * 0.9);
      ctx.fillText(text, lx, ly);
      return;
    }
  }

  function resize() {
    if (!S.on) return;
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.w = S.box.clientWidth || window.innerWidth;
    S.h = S.box.clientHeight || window.innerHeight;
    S.canvas.width = S.w * S.dpr;
    S.canvas.height = S.h * S.dpr;
    S.canvas.style.width = S.w + 'px';
    S.canvas.style.height = S.h + 'px';
    build(false);
    kick();
  }

  function kick() {
    if (S.on && S.visible && !S.raf) S.raf = requestAnimationFrame(frame);
  }

  function onMove(ev) {
    S.mouse.x = ev.clientX; S.mouse.y = ev.clientY; S.mouse.on = true;
  }
  function onLeave() { S.mouse.on = false; }
  var listening = false;

  function start(box, cfg, opts) {
    decodeGrid();
    if (!GRID) return;
    stop();
    S.on = true; S.box = box; S.cfg = cfg; S.m = cfg.map;
    S.canvas = document.createElement('canvas');
    S.canvas.className = 'world-canvas';
    box.appendChild(S.canvas);
    S.ctx = S.canvas.getContext('2d');
    if (!listening) {
      listening = true;
      window.addEventListener('resize', function () { clearTimeout(S.rt); S.rt = setTimeout(resize, 150); });
      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);
      window.addEventListener('blur', onLeave);
    }
    S.dpr = Math.min(2, window.devicePixelRatio || 1);
    S.w = box.clientWidth || window.innerWidth;
    S.h = box.clientHeight || window.innerHeight;
    S.canvas.width = S.w * S.dpr;
    S.canvas.height = S.h * S.dpr;
    S.canvas.style.width = S.w + 'px';
    S.canvas.style.height = S.h + 'px';
    build(!!(opts && opts.intro));
    kick();
  }

  function stop() {
    S.on = false;
    if (S.raf) cancelAnimationFrame(S.raf);
    S.raf = 0;
    if (S.canvas && S.canvas.parentNode) S.canvas.parentNode.removeChild(S.canvas);
    S.canvas = null;
  }

  function setVisible(v) {
    S.visible = !!v;
    if (S.visible) kick();
  }

  return { start: start, stop: stop, setVisible: setVisible, running: function () { return S.on; } };
})();
