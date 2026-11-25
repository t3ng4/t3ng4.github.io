function deepMerge(base, over) {
  var out = clone(base);
  (function walk(t, s) {
    for (var k in s) {
      if (!Object.prototype.hasOwnProperty.call(s, k)) continue;
      if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) {
        if (!t[k] || typeof t[k] !== 'object' || Array.isArray(t[k])) t[k] = {};
        walk(t[k], s[k]);
      } else {
        t[k] = clone(s[k] === undefined ? null : s[k]);
      }
    }
  })(out, over || {});
  return out;
}

var SITE = { cfg: null, published: null, lang: 'en', mode: 'dark' };

var PREF_LANG = 'bc-lang', PREF_MODE = 'bc-mode';

function prefGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function prefSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function currentContent(cfg) {
  var c = cfg.content || {};
  return c[SITE.lang] || c[cfg.i18n.default] || c[Object.keys(c)[0]] || {};
}

function pickLanguage(cfg) {
  var list = (cfg.i18n.languages || []).filter(function (l) { return cfg.content[l]; });
  var saved = prefGet(PREF_LANG);
  if (saved && list.indexOf(saved) >= 0) return saved;
  if (cfg.i18n.auto_detect) {
    var nav = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < nav.length; i++) {
      var code = String(nav[i]).slice(0, 2).toLowerCase();
      if (list.indexOf(code) >= 0) return code;
    }
  }
  return list.indexOf(cfg.i18n.default) >= 0 ? cfg.i18n.default : (list[0] || 'en');
}

function pickMode(cfg) {
  var saved = prefGet(PREF_MODE);
  if (cfg.theme.mode_toggle && (saved === 'dark' || saved === 'light')) return saved;
  return cfg.theme.default_mode === 'light' ? 'light' : 'dark';
}

function refreshSite(instant) {
  renderSite(SITE.cfg);
  applyTheme(SITE.cfg);
  setupDynamic(SITE.cfg, { instant: instant });
}

function setLanguage(lang, remember) {
  if (!SITE.cfg.content[lang] || lang === SITE.lang) return;
  SITE.lang = lang;
  if (remember) prefSet(PREF_LANG, lang);
  refreshSite(true);
  if (typeof Editor !== 'undefined') Editor.sync();
}

function setMode(mode, remember) {
  SITE.mode = mode === 'light' ? 'light' : 'dark';
  if (remember) prefSet(PREF_MODE, SITE.mode);
  applyTheme(SITE.cfg);
  startParticles(SITE.cfg);
  if (typeof Editor !== 'undefined') Editor.sync();
}

function openEditor() {
  var ed = SITE.cfg.meta.editor || {};
  if (!ed.enabled || typeof Editor === 'undefined') return;
  Editor.open();
}

(async function boot() {
  var cfg = clone(DEFAULT_CONFIG);

  try {
    var r = await fetch('site.json', { cache: 'no-cache' });
    if (r.ok) cfg = deepMerge(DEFAULT_CONFIG, await r.json());
  } catch (err) {
  }

  SITE.cfg = cfg;
  SITE.published = clone(cfg);
  document.body.classList.add('booting');
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.remove('booting'); }); });
  SITE.lang = pickLanguage(cfg);
  SITE.mode = pickMode(cfg);

  refreshSite(false);
  startParticles(cfg, { intro: true });

  document.addEventListener('click', function (ev) {
    var lb = ev.target.closest && ev.target.closest('[data-lang]');
    if (lb) { setLanguage(lb.dataset.lang, true); return; }
    if (ev.target.closest && ev.target.closest('.mode-toggle')) setMode(SITE.mode === 'dark' ? 'light' : 'dark', true);
  });

  if (location.hash === '#edit') openEditor();
  window.addEventListener('hashchange', function () { if (location.hash === '#edit') openEditor(); });
  window.addEventListener('keydown', function (e) {
    if (e.altKey && e.shiftKey && (e.key === 'C' || e.key === 'c')) { e.preventDefault(); openEditor(); }
  });
  var gear = document.getElementById('edit-gear');
  if (gear) gear.onclick = openEditor;
})();
