var FONT_SANS = {
  "System": 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  "Inter": '"Inter", system-ui, sans-serif',
  "Manrope": '"Manrope", system-ui, sans-serif',
  "Sora": '"Sora", system-ui, sans-serif',
  "Space Grotesk": '"Space Grotesk", system-ui, sans-serif',
  "IBM Plex Sans": '"IBM Plex Sans", system-ui, sans-serif'
};
var FONT_DISPLAY = {
  "System serif": '"Iowan Old Style", "Palatino Linotype", Palatino, "Book Antiqua", "URW Palladio L", Georgia, serif',
  "Same as text": 'var(--font-sans)',
  "Cormorant Garamond": '"Cormorant Garamond", Georgia, serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  "Fraunces": '"Fraunces", Georgia, serif',
  "Libre Baskerville": '"Libre Baskerville", Georgia, serif',
  "DM Serif Display": '"DM Serif Display", Georgia, serif',
  "Inter": '"Inter", system-ui, sans-serif',
  "Sora": '"Sora", system-ui, sans-serif'
};
var FONT_MONO = {
  "System mono": 'ui-monospace, "JetBrains Mono", "Cascadia Code", "Fira Code", Menlo, Consolas, monospace',
  "JetBrains Mono": '"JetBrains Mono", ui-monospace, monospace',
  "IBM Plex Mono": '"IBM Plex Mono", ui-monospace, monospace',
  "Fira Code": '"Fira Code", ui-monospace, monospace',
  "Space Mono": '"Space Mono", ui-monospace, monospace'
};

var GOOGLE_FONT_SPEC = {
  "Inter": "wght@400;500;600;700",
  "Manrope": "wght@400;500;600;700",
  "Sora": "wght@400;500;600;700",
  "Space Grotesk": "wght@400;500;600;700",
  "IBM Plex Sans": "wght@400;500;600;700",
  "Cormorant Garamond": "wght@500;600;700",
  "Playfair Display": "wght@500;600;700",
  "Fraunces": "wght@400;500;600",
  "Libre Baskerville": "wght@400;700",
  "DM Serif Display": "wght@400",
  "JetBrains Mono": "wght@400;500",
  "IBM Plex Mono": "wght@400;500",
  "Fira Code": "wght@400;500",
  "Space Mono": "wght@400;700"
};

var DENSITY = { compact: '72px', normal: '120px', airy: '168px' };

var COLOR_KEYS = ['background', 'surface', 'text', 'muted', 'accent', 'accent2', 'border'];

var REDUCED_MOTION = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var FX = { cfg: null, gen: 0, observer: null, listening: false, paused: false, tiltCard: null };

function hexRgb(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) hex = '#ffffff';
  return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }).join(',');
}

function clone(o) { return JSON.parse(JSON.stringify(o)); }

function activePalette(cfg) {
  var t = cfg.theme, out = {};
  var src = SITE.mode === 'light' && t.light ? t.light : t;
  COLOR_KEYS.forEach(function (k) { out[k] = src[k] || t[k]; });
  return out;
}

function applyTheme(cfg) {
  FX.cfg = cfg;
  var t = cfg.theme, e = cfg.effects, root = document.documentElement.style;
  var pal = activePalette(cfg);

  COLOR_KEYS.forEach(function (k) {
    root.setProperty('--' + k, pal[k]);
    root.setProperty('--' + k + '-rgb', hexRgb(pal[k]));
  });
  document.documentElement.dataset.mode = SITE.mode;
  document.documentElement.style.colorScheme = SITE.mode;
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', pal.background);

  root.setProperty('--radius', (t.radius | 0) + 'px');
  root.setProperty('--maxw', (t.max_width | 0) + 'px');
  root.setProperty('--space', DENSITY[t.density] || DENSITY.normal);
  root.setProperty('--font-sans', FONT_SANS[t.font_sans] || FONT_SANS.System);
  root.setProperty('--font-display', FONT_DISPLAY[t.font_display] || FONT_DISPLAY['System serif']);
  root.setProperty('--font-mono', FONT_MONO[t.font_mono] || FONT_MONO['System mono']);
  loadWebFonts(t);

  root.setProperty('--grid-opacity', e.grid ? e.grid_opacity : 0);
  root.setProperty('--top-glow', e.top_glow ? e.top_glow_strength : 0);
  root.setProperty('--overlay-opacity', e.overlay_opacity);
  root.setProperty('--cursor-size', (e.cursor_glow_size | 0) + 'px');
  var img = String(e.hero_image || '').replace(/["'()\\\s]/g, '');
  root.setProperty('--hero-image', img ? 'url("' + img + '")' : 'none');
  root.setProperty('--hero-image-opacity', e.hero_image_opacity);
  root.setProperty('--hero-scrim', e.hero_scrim == null ? 0.8 : e.hero_scrim);

  var b = document.body.classList;
  b.toggle('fx-scanlines', e.overlay === 'scanlines');
  b.toggle('fx-noise', e.overlay === 'noise');
  b.toggle('fx-cursor', !!e.cursor_glow);
  b.toggle('fx-spot', !!e.card_spotlight);
  b.toggle('fx-tilt', !!e.card_tilt && !REDUCED_MOTION);
  b.toggle('fx-no-reveal', !e.reveal || REDUCED_MOTION);
  ['line', 'slashes', 'dot'].forEach(function (s) { b.toggle('eyebrow-' + s, e.eyebrow_style === s); });
  ['underline', 'brackets', 'glow', 'scramble'].forEach(function (s) { b.toggle('nav-fx-' + s, e.nav_hover === s); });
  b.toggle('nav-spy', !!e.nav_scrollspy);

  var meta = currentContent(cfg).meta || {};
  document.title = meta.title || '';
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', meta.description || '');

  var gear = document.getElementById('edit-gear');
  var hasEditor = typeof Editor !== 'undefined';
  if (gear) gear.hidden = !(hasEditor && cfg.meta.editor && cfg.meta.editor.enabled && cfg.meta.editor.button);

  updateParticleFade();
}

function loadWebFonts(t) {
  var fams = [];
  [t.font_sans, t.font_display, t.font_mono].forEach(function (name) {
    var spec = GOOGLE_FONT_SPEC[name];
    var entry = name.replace(/ /g, '+') + ':' + spec;
    if (spec && fams.indexOf(entry) < 0) fams.push(entry);
  });
  var link = document.getElementById('webfonts');
  if (!fams.length) { if (link) link.remove(); return; }
  var href = 'https://fonts.googleapis.com/css2?family=' + fams.join('&family=') + '&display=swap';
  if (!link) {
    link = document.createElement('link');
    link.id = 'webfonts';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
}

function currentPJS() {
  return window.pJSDom && window.pJSDom.length ? window.pJSDom[0].pJS : null;
}

function lightBoost(cfg) {
  if (SITE.mode !== 'light') return 1;
  var k = Number(cfg.effects.light_boost);
  return k > 0 ? k : 1;
}

function boosted(a, k) {
  return Math.min(1, (Number(a) || 0) * k);
}

function networkFor(cfg) {
  var net = clone(cfg.network || {});
  if (cfg.effects.particles_follow_accent && net.electric) net.electric.color = activePalette(cfg).accent2;
  if (REDUCED_MOTION && net.electric) net.electric.enable = false;
  if (net.fill_opacity != null) net.fill_opacity = boosted(net.fill_opacity, lightBoost(cfg));
  return net;
}

function startParticles(cfg, opts) {
  var old = currentPJS();
  if (old) old.fn.vendors.destroypJS();
  window.pJSDom = [];
  FX.paused = false;

  var intro = !!(opts && opts.intro);
  startSkylineBand(cfg, intro);

  var box = document.getElementById('particles-js');
  var bg = cfg.effects.background;
  if (bg !== 'skyline' && FX.skyBg) FX.skyBg.stop();
  if (bg === 'map' && typeof WorldMap !== 'undefined') {
    box.innerHTML = '';
    WorldMap.start(box, cfg, { intro: intro });
    updateParticleFade();
    return;
  }
  if (typeof WorldMap !== 'undefined') WorldMap.stop();

  if (bg === 'skyline' && typeof Skyline !== 'undefined') {
    box.innerHTML = '';
    FX.skyBg = FX.skyBg || Skyline.create();
    FX.skyBg.start(box, cfg, { intro: intro });
    updateParticleFade();
    return;
  }

  var p = { particles: clone(cfg.particles), interactivity: clone(cfg.interactivity), retina_detect: cfg.retina_detect };
  if (cfg.effects.particles_follow_accent) {
    var pal = activePalette(cfg), acc = SITE.mode === 'light' ? pal.accent2 : pal.accent;
    p.particles.color.value = acc;
    p.particles.line_linked.color = acc;
  }
  if (REDUCED_MOTION) p.particles.move.enable = false;

  var k = lightBoost(cfg), pp = p.particles;
  if (k !== 1) {
    pp.opacity.value = boosted(pp.opacity.value, k);
    if (pp.opacity.anim) pp.opacity.anim.opacity_min = boosted(pp.opacity.anim.opacity_min, k);
    pp.line_linked.opacity = boosted(pp.line_linked.opacity, k);
    var grab = p.interactivity.modes && p.interactivity.modes.grab;
    if (grab && grab.line_linked) grab.line_linked.opacity = boosted(grab.line_linked.opacity, k);
  }

  box.innerHTML = '';
  particlesJS('particles-js', p);
  attachNetwork(currentPJS(), networkFor(cfg));
  updateParticleFade();
}

function startSkylineBand(cfg, intro) {
  var band = document.getElementById('skyline-band');
  if (!band || typeof Skyline === 'undefined') return;
  var on = !!(cfg.skyline && cfg.skyline.band);
  band.hidden = !on;
  FX.skyBand = FX.skyBand || Skyline.create();
  if (!on) { FX.skyBand.stop(); return; }
  band.style.setProperty('--skyline-band-h', cfg.skyline.band_height + 'px');

  if (!FX.bandObserver && 'IntersectionObserver' in window) {
    FX.bandVisible = false;
    FX.bandObserver = new IntersectionObserver(function (entries) {
      FX.bandVisible = entries[0].isIntersecting;
      if (FX.skyBand.running()) FX.skyBand.setVisible(FX.bandVisible);
    }, { rootMargin: '0px 0px -60px 0px' });
    FX.bandObserver.observe(band);
  }
  FX.skyBand.start(band, cfg, { intro: intro, waitVisible: true, band: true });
  FX.skyBand.setVisible(FX.bandObserver ? FX.bandVisible : true);
}

function updateParticleFade() {
  var cfg = FX.cfg, box = document.getElementById('particles-js');
  if (!cfg || !box) return;
  var e = cfg.effects, o = e.particles_opacity;
  if (e.particles_scope === 'hero') {
    var hero = document.getElementById('hero');
    var h = hero ? hero.offsetHeight : window.innerHeight;
    o *= Math.max(0, Math.min(1, 1 - window.scrollY / (h * 0.85)));
  }
  box.style.opacity = o;

  if (typeof WorldMap !== 'undefined' && WorldMap.running()) { WorldMap.setVisible(o > 0.01); return; }
  if (FX.skyBg && FX.skyBg.running()) { FX.skyBg.setVisible(o > 0.01); return; }

  var pjs = currentPJS();
  if (!pjs || !pjs.particles.move.enable) return;
  if (o <= 0.01 && !FX.paused) {
    cancelAnimationFrame(pjs.fn.drawAnimFrame);
    FX.paused = true;
  } else if (o > 0.01 && FX.paused) {
    FX.paused = false;
    pjs.fn.vendors.draw();
  }
}

var GLYPHS = '!<>-_\\/[]{}=+*^?#01ABCDEF';

function scramble(el) {
  var text = el.dataset.text || (el.dataset.text = el.textContent);
  if (REDUCED_MOTION) { el.textContent = text; return; }
  var gen = FX.gen, start = performance.now(), dur = 500 + text.length * 22;
  var tick = function (now) {
    if (gen !== FX.gen) return;
    var p = (now - start) / dur, out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var at = (i / text.length) * 0.7;
      if (ch === ' ' || p >= at + 0.3) out += ch;
      else if (p >= at) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += ' ';
    }
    el.textContent = out;
    if (p < 1) requestAnimationFrame(tick); else el.textContent = text;
  };
  requestAnimationFrame(tick);
}

function splitWords(el, start) {
  var words = el.textContent.split(/\s+/).filter(Boolean);
  el.textContent = '';
  el.classList.add('words');
  words.forEach(function (w, i) {
    var outer = document.createElement('span'), inner = document.createElement('span');
    outer.className = 'w';
    inner.textContent = w;
    inner.style.setProperty('--i', start + i);
    outer.appendChild(inner);
    el.appendChild(outer);
    if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
  });
  return words.length;
}

function playTitle(el) {
  var mode = FX.cfg.effects.title_anim;
  if (mode === 'decode') scramble(el);
  else if (mode === 'words') el.classList.add('go');
}

function countUp(el) {
  var target = Number(el.dataset.count) || 0, loc = SITE.lang || 'en';
  if (!FX.cfg.effects.count_up || REDUCED_MOTION) { el.textContent = target.toLocaleString(loc); return; }
  var gen = FX.gen, start = performance.now(), dur = 1400;
  var tick = function (now) {
    if (gen !== FX.gen) return;
    var p = Math.min(1, (now - start) / dur);
    var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
    el.textContent = v.toLocaleString(loc);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setupDynamic(cfg, opts) {
  opts = opts || {};
  FX.cfg = cfg;
  FX.gen++;
  var e = cfg.effects, instant = !!opts.instant || REDUCED_MOTION;
  var mode = e.title_anim, scope = e.title_anim_scope;

  if (FX.observer) FX.observer.disconnect();

  var animated = function (el) {
    return !instant && mode !== 'off' && (scope === 'all' || el.hasAttribute('data-hero'));
  };

  if (!instant && mode === 'words') {
    var n = 0;
    document.querySelectorAll('[data-title][data-hero]').forEach(function (h) { if (animated(h)) n += splitWords(h, n); });
    document.querySelectorAll('[data-title]:not([data-hero])').forEach(function (h) { if (animated(h)) splitWords(h, 0); });
  }

  var onShow = function (el) {
    el.classList.add('in');
    el.querySelectorAll('[data-title]:not([data-hero])').forEach(function (s) { if (animated(s)) playTitle(s); });
    el.querySelectorAll('[data-count]').forEach(function (s) {
      if (instant) s.textContent = Number(s.dataset.count).toLocaleString(SITE.lang || 'en');
      else countUp(s);
    });
  };

  if (instant) {
    document.body.classList.add('fx-instant');
    requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.remove('fx-instant'); }); });
  }

  var targets = document.querySelectorAll('.reveal');
  if (instant || !('IntersectionObserver' in window)) {
    targets.forEach(onShow);
  } else {
    FX.observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        FX.observer.unobserve(en.target);
        onShow(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (t) { FX.observer.observe(t); });
  }

  requestAnimationFrame(function () {
    document.querySelectorAll('[data-title][data-hero]').forEach(function (h) { if (animated(h)) playTitle(h); });
  });

  var tog = document.querySelector('.nav-toggle'), links = document.getElementById('nav-links');
  if (tog) tog.onclick = function () {
    var open = document.body.classList.toggle('nav-open');
    tog.setAttribute('aria-expanded', open);
  };
  if (links) links.onclick = function (ev) {
    if (ev.target.closest('a')) { document.body.classList.remove('nav-open'); if (tog) tog.setAttribute('aria-expanded', 'false'); }
  };

  document.querySelectorAll('.nav-links a:not(.btn)').forEach(function (a) {
    a.onmouseenter = function () {
      if (FX.cfg.effects.nav_hover !== 'scramble' || a.dataset.busy) return;
      a.dataset.busy = '1';
      scramble(a);
      setTimeout(function () { delete a.dataset.busy; }, 600);
    };
  });
  updateScrollSpy();

  var copiedText = (currentContent(cfg).ui || {}).copied || 'copied';
  document.querySelectorAll('[data-copy]').forEach(function (b) {
    b.dataset.copied = copiedText;
    b.onclick = function () {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(b.dataset.copy).then(function () {
        b.classList.add('copied');
        setTimeout(function () { b.classList.remove('copied'); }, 1400);
      });
    };
  });

  installGlobalListeners();
  updateParticleFade();
}

function updateScrollSpy() {
  var links = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)');
  var line = window.innerHeight * 0.35, current = null;
  links.forEach(function (a) {
    var sec = document.getElementById(a.getAttribute('href').slice(1));
    if (!sec) return;
    var r = sec.getBoundingClientRect();
    if (r.top <= line && r.bottom > line) current = a;
  });
  links.forEach(function (a) { a.classList.toggle('current', a === current); });
}

function resetTilt(card) {
  if (!card) return;
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
}

function installGlobalListeners() {
  if (FX.listening) return;
  FX.listening = true;

  var nav = document.getElementById('nav');
  var onScroll = function () {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    updateParticleFade();
    updateScrollSpy();
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateParticleFade);
  onScroll();

  var glow = document.getElementById('cursor-glow');
  window.addEventListener('pointermove', function (ev) {
    var fx = FX.cfg ? FX.cfg.effects : {};
    if (fx.cursor_glow) glow.style.transform = 'translate(' + ev.clientX + 'px,' + ev.clientY + 'px)';

    var card = ev.target.closest && ev.target.closest('.spot');
    if (card) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    }

    var tilt = fx.card_tilt && !REDUCED_MOTION && ev.pointerType === 'mouse' && ev.target.closest ? ev.target.closest('.tilt') : null;
    if (FX.tiltCard && FX.tiltCard !== tilt) resetTilt(FX.tiltCard);
    FX.tiltCard = tilt;
    if (tilt) {
      var tr = tilt.getBoundingClientRect();
      var x = (ev.clientX - tr.left) / tr.width - 0.5, y = (ev.clientY - tr.top) / tr.height - 0.5;
      tilt.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg');
      tilt.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg');
    }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { resetTilt(FX.tiltCard); FX.tiltCard = null; });
}
