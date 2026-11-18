var NETWORK_FORMS = ['lines', 'triangles', 'polygons', 'tubes', 'curves', 'dashed', 'constellation', 'gradient'];
var ELECTRIC_STYLES = ['pulses', 'lightning', 'both'];

function netRgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = '#ffffff';
  return { r: parseInt(hex.slice(1, 3), 16), g: parseInt(hex.slice(3, 5), 16), b: parseInt(hex.slice(5, 7), 16) };
}

function attachNetwork(pJS, net) {
  if (!pJS) return;
  net = net || {};
  var st = pJS._net || (pJS._net = {
    lineOn: pJS.particles.line_linked.enable,
    pulses: [],
    last: 0,
    dashOffset: 0,
    edges: 0
  });
  st.cfg = net;

  pJS.particles.line_linked.enable = st.lineOn && (net.form || 'lines') === 'lines';

  if (!pJS.fn._netWrapped) {
    var original = pJS.fn.particlesDraw;
    pJS.fn.particlesDraw = function () {
      original();
      netDraw(pJS);
    };
    pJS.fn._netWrapped = true;
  }
}

function netDraw(pJS) {
  var st = pJS._net, net = st.cfg || {};
  var form = net.form || 'lines';
  var el = net.electric || {};
  var drawForm = st.lineOn && form !== 'lines';
  if (!drawForm && !el.enable) { st.edges = 0; return; }

  var arr = pJS.particles.array, n = arr.length;
  var L = pJS.particles.line_linked;
  var maxD = L.distance;
  var ratio = pJS.canvas.pxratio || 1;

  var adj = new Array(n), edges = [], i, j;
  for (i = 0; i < n; i++) adj[i] = [];
  for (i = 0; i < n; i++) {
    var a = arr[i];
    for (j = i + 1; j < n; j++) {
      var dx = a.x - arr[j].x, dy = a.y - arr[j].y;
      var d2 = dx * dx + dy * dy;
      if (d2 <= maxD * maxD) {
        var d = Math.sqrt(d2);
        edges.push([i, j, d]);
        adj[i].push(j);
        adj[j].push(i);
      }
    }
  }
  st.edges = edges.length;

  var ctx = pJS.canvas.ctx;
  ctx.save();
  if (drawForm) netDrawForm(ctx, form, net, arr, adj, edges, L, maxD, ratio, st);
  if (el.enable) netDrawElectric(ctx, el, arr, adj, ratio, st);
  ctx.restore();
}

function netAlpha(L, d, maxD) {
  return Math.max(0, L.opacity * (1 - d / maxD));
}

function netDrawForm(ctx, form, net, arr, adj, edges, L, maxD, ratio, st) {
  var c = L.color_rgb_line || netRgb(L.color);
  var rgba = function (al) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + al + ')'; };
  var w = L.width;
  var k, e, p, q, al;

  var line = function (p, q, al, width) {
    ctx.strokeStyle = rgba(al);
    ctx.lineWidth = width;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  };

  if (form === 'triangles') {

    var fill = net.fill_opacity == null ? 0.08 : net.fill_opacity;
    var linked = {};
    edges.forEach(function (e) { linked[e[0] + ',' + e[1]] = true; });
    for (var i = 0; i < arr.length; i++) {
      var nb = adj[i].filter(function (x) { return x > i; }).sort(function (a, b) { return a - b; });
      for (var a1 = 0; a1 < nb.length; a1++) {
        for (var b1 = a1 + 1; b1 < nb.length; b1++) {
          if (!linked[nb[a1] + ',' + nb[b1]]) continue;
          p = arr[i]; q = arr[nb[a1]]; var r = arr[nb[b1]];
          ctx.fillStyle = rgba(fill);
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.lineTo(r.x, r.y); ctx.closePath(); ctx.fill();
        }
      }
    }
    edges.forEach(function (e) { line(arr[e[0]], arr[e[1]], netAlpha(L, e[2], maxD), w); });

  } else if (form === 'polygons') {

    var pf = net.fill_opacity == null ? 0.08 : net.fill_opacity;
    for (var i2 = 0; i2 < arr.length; i2++) {
      if (adj[i2].length < 3) continue;
      var cx = arr[i2].x, cy = arr[i2].y;
      var ring = adj[i2].slice().sort(function (a, b) {
        return Math.atan2(arr[a].y - cy, arr[a].x - cx) - Math.atan2(arr[b].y - cy, arr[b].x - cx);
      });
      ctx.beginPath();
      ring.forEach(function (x, idx) { if (idx === 0) ctx.moveTo(arr[x].x, arr[x].y); else ctx.lineTo(arr[x].x, arr[x].y); });
      ctx.closePath();
      if (pf > 0) { ctx.fillStyle = rgba(pf / 3); ctx.fill(); }
      ctx.strokeStyle = rgba(L.opacity * 0.5);
      ctx.lineWidth = w;
      ctx.stroke();
    }

  } else if (form === 'tubes') {

    ctx.lineCap = 'round';
    edges.forEach(function (e) {
      al = netAlpha(L, e[2], maxD);
      line(arr[e[0]], arr[e[1]], al * 0.25, w * 4 + 4 * ratio);
      line(arr[e[0]], arr[e[1]], al, Math.max(1, w * 0.6));
    });

  } else if (form === 'curves') {

    var bend = net.curve == null ? 0.3 : net.curve;
    ctx.lineWidth = w;
    edges.forEach(function (e) {
      p = arr[e[0]]; q = arr[e[1]];
      var mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2;
      var side = (e[0] + e[1]) % 2 ? 1 : -1;
      var nx = -(q.y - p.y) / e[2], ny = (q.x - p.x) / e[2];
      ctx.strokeStyle = rgba(netAlpha(L, e[2], maxD));
      ctx.beginPath(); ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(mx + nx * e[2] * bend * side, my + ny * e[2] * bend * side, q.x, q.y);
      ctx.stroke();
    });

  } else if (form === 'dashed') {

    var dash = (net.dash || 6) * ratio;
    st.dashOffset = (st.dashOffset - 0.5 * ratio) % (dash * 2);
    ctx.setLineDash([dash, dash]);
    ctx.lineDashOffset = st.dashOffset;
    edges.forEach(function (e) { line(arr[e[0]], arr[e[1]], netAlpha(L, e[2], maxD), w); });
    ctx.setLineDash([]);

  } else if (form === 'constellation') {

    var kmax = net.neighbors || 3, done = {};
    for (k = 0; k < arr.length; k++) {
      p = arr[k];
      var near = adj[k].map(function (x) {
        var dx = arr[x].x - p.x, dy = arr[x].y - p.y;
        return [x, Math.sqrt(dx * dx + dy * dy)];
      }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, kmax);
      near.forEach(function (m) {
        var key = Math.min(k, m[0]) + ',' + Math.max(k, m[0]);
        if (done[key]) return;
        done[key] = true;
        line(p, arr[m[0]], netAlpha(L, m[1], maxD), w);
      });
    }

  } else if (form === 'gradient') {

    ctx.lineWidth = w;
    edges.forEach(function (e) {
      p = arr[e[0]]; q = arr[e[1]];
      al = netAlpha(L, e[2], maxD);
      var g = ctx.createLinearGradient(p.x, p.y, q.x, q.y);
      var c1 = p.color.rgb || c, c2 = q.color.rgb || c;
      g.addColorStop(0, 'rgba(' + c1.r + ',' + c1.g + ',' + c1.b + ',' + al + ')');
      g.addColorStop(1, 'rgba(' + c2.r + ',' + c2.g + ',' + c2.b + ',' + al + ')');
      ctx.strokeStyle = g;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    });
  }
}

function netDrawElectric(ctx, el, arr, adj, ratio, st) {
  var now = performance.now();
  var dt = Math.min(0.05, (now - (st.last || now)) / 1000);
  st.last = now;

  var count = el.count == null ? 8 : el.count;
  var speed = (el.speed || 300) * ratio;
  var size = (el.size || 4) * ratio;
  var trailLen = el.trail == null ? 12 : el.trail;
  var style = el.style || 'both';
  var col = netRgb(el.color || '#9be7ff');
  var rgba = function (al) { return 'rgba(' + col.r + ',' + col.g + ',' + col.b + ',' + al + ')'; };

  var linked = [];
  for (var i = 0; i < arr.length; i++) if (adj[i].length) linked.push(i);

  var spawn = function (s) {
    if (!linked.length) { s.a = -1; return; }
    s.a = linked[Math.floor(Math.random() * linked.length)];
    s.b = adj[s.a][Math.floor(Math.random() * adj[s.a].length)];
    s.t = 0;
    s.trail = [];
  };

  while (st.pulses.length < count) { var s0 = {}; spawn(s0); st.pulses.push(s0); }
  st.pulses.length = Math.min(st.pulses.length, count);

  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';

  st.pulses.forEach(function (s) {

    if (s.a < 0 || s.a >= arr.length || s.b >= arr.length || adj[s.a].indexOf(s.b) < 0) spawn(s);
    if (s.a < 0) return;

    var A = arr[s.a], B = arr[s.b];
    var len = Math.max(1, Math.hypot(B.x - A.x, B.y - A.y));
    s.t += speed * dt / len;

    if (s.t >= 1) {
      var prev = s.a;
      s.a = s.b;
      var next = adj[s.a].filter(function (x) { return x !== prev; });
      if (!next.length) next = adj[s.a];
      if (!next.length) { spawn(s); return; }
      s.b = next[Math.floor(Math.random() * next.length)];
      s.t = 0;
      A = arr[s.a]; B = arr[s.b];
    }

    var x = A.x + (B.x - A.x) * s.t, y = A.y + (B.y - A.y) * s.t;

    if (trailLen > 0) {
      s.trail.push([x, y]);
      if (s.trail.length > trailLen) s.trail.shift();
      for (var t = 1; t < s.trail.length; t++) {
        ctx.strokeStyle = rgba(0.5 * t / s.trail.length);
        ctx.lineWidth = size * 0.6 * t / s.trail.length;
        ctx.beginPath();
        ctx.moveTo(s.trail[t - 1][0], s.trail[t - 1][1]);
        ctx.lineTo(s.trail[t][0], s.trail[t][1]);
        ctx.stroke();
      }
    }

    if (style === 'lightning' || style === 'both') {
      var segs = 6, ex = x - A.x, ey = y - A.y;
      var elen = Math.max(1, Math.hypot(ex, ey));
      var nx = -ey / elen, ny = ex / elen;
      ctx.strokeStyle = rgba(0.45 + Math.random() * 0.55);
      ctx.lineWidth = Math.max(1, size * 0.25);
      ctx.beginPath();
      ctx.moveTo(A.x, A.y);
      for (var sgi = 1; sgi < segs; sgi++) {
        var off = (Math.random() - 0.5) * size * 2.2;
        ctx.lineTo(A.x + ex * sgi / segs + nx * off, A.y + ey * sgi / segs + ny * off);
      }
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    if (style === 'pulses' || style === 'both') {
      var g = ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
      g.addColorStop(0, rgba(1));
      g.addColorStop(0.3, rgba(0.6));
      g.addColorStop(1, rgba(0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
