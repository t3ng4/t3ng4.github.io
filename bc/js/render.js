function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function safeHref(h) {
  h = String(h == null ? '' : h).trim();
  if (/^(https?:|mailto:|tel:|#|\/|\.\/)/i.test(h) || !/^[a-z]+:/i.test(h)) return esc(h || '#');
  return '#';
}

function linkAttrs(h) {
  return 'href="' + safeHref(h) + '"' + (/^https?:/i.test(h || '') ? ' target="_blank" rel="noopener"' : '');
}

function escLines(s) {
  return esc(s).replace(/\n/g, '<br>');
}

function sectionHead(c, layout) {
  return '<div class="section-head reveal' + (layout ? ' ' + layout : '') + '">' +
    '<div>' +
      (c.eyebrow ? '<p class="eyebrow">' + esc(c.eyebrow) + '</p>' : '') +
      (c.title ? '<h2 class="h2" data-title>' + esc(c.title) + '</h2>' : '') +
    '</div>' +
    (c.text ? '<p class="lead">' + esc(c.text) + '</p>' : '') +
  '</div>';
}

function button(link, kind, icon) {
  if (!link || !link.label) return '';
  return '<a class="btn btn-' + kind + '" ' + linkAttrs(link.href) + '><span>' + esc(link.label) + '</span>' +
    (icon ? iconSvg(icon, 'icon btn-icon') : '') + '</a>';
}

var RENDER = {

  hero: function (c) {
    return '<section class="hero" id="hero"><div class="hero-media" aria-hidden="true"></div><div class="wrap hero-inner">' +
      (c.status ? '<div class="status-pill reveal"><span class="pulse-dot"></span>' + esc(c.status) + '</div>' : '') +
      (c.eyebrow ? '<p class="eyebrow reveal">' + esc(c.eyebrow) + '</p>' : '') +
      '<h1 class="h1"><span class="h1-line" data-title data-hero>' + esc(c.title) + '</span>' +
        (c.title_accent ? ' <span class="h1-line accent-text" data-title data-hero>' + esc(c.title_accent) + '</span>' : '') +
      '</h1>' +
      (c.text ? '<p class="lead hero-lead reveal">' + esc(c.text) + '</p>' : '') +
      '<div class="actions reveal">' + button(c.cta_primary, 'primary', 'arrow') + button(c.cta_secondary, 'ghost') + '</div>' +
    '</div><a class="scroll-hint" href="#stats" aria-hidden="true" tabindex="-1"><span></span></a></section>';
  },

  stats: function (c) {
    var items = (c.items || []).map(function (s, i) {
      var v = String(s.value == null ? '' : s.value);
      var counts = s.animate !== 'no' && /^\d+$/.test(v);
      return '<div class="stat reveal" style="--d:' + i + '">' +
        '<div class="stat-value"><span' + (counts ? ' data-count="' + esc(v) + '"' : '') + '>' + esc(v) + '</span>' +
        '<span class="stat-suffix">' + esc(s.suffix) + '</span></div>' +
        '<div class="stat-label">' + esc(s.label) + '</div></div>';
    }).join('');
    return '<section class="stats" id="stats"><div class="wrap"><div class="stats-grid">' + items + '</div></div></section>';
  },

  services: function (c) {
    var items = (c.items || []).map(function (s, i) {
      return '<article class="card spot tilt reveal" style="--d:' + (i % 3) + '">' +
        '<div class="card-top"><span class="card-icon">' + iconSvg(s.icon) + '</span>' +
        (s.tag ? '<span class="tag">' + esc(s.tag) + '</span>' : '') + '</div>' +
        '<h3 class="h3">' + esc(s.title) + '</h3>' +
        '<p class="muted">' + esc(s.text) + '</p>' +
        (s.link ? '<a class="more" ' + linkAttrs(s.href) + '>' + esc(s.link) + iconSvg('arrow-up-right', 'icon') + '</a>' : '') +
      '</article>';
    }).join('');
    return '<section class="section" id="services"><div class="wrap">' + sectionHead(c, 'split') +
      '<div class="cards">' + items + '</div></div></section>';
  },

  approach: function (c) {
    var visual = c.image
      ? '<div class="feature-img" style="background-image:url(&quot;' + esc(String(c.image).replace(/["()\\]/g, '')) + '&quot;)"></div>'
      : '<div class="emblem" aria-hidden="true">' +
          '<span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>' +
          '<span class="emblem-sweep"></span>' +
          '<span class="emblem-logo">' + LOGO_SVG + '</span>' +
        '</div>';
    var badge = c.badge_value
      ? '<div class="badge"><span>' + esc(c.badge_label) + '</span><strong>' + esc(c.badge_value) + '</strong></div>' : '';
    var items = (c.items || []).map(function (p, i) {
      return '<div class="principle reveal" style="--d:' + i + '"><strong>' + esc(p.title) + '</strong><span>' + esc(p.text) + '</span></div>';
    }).join('');
    return '<section class="section" id="approach"><div class="wrap feature">' +
      '<div class="feature-visual reveal">' + visual + badge + '</div>' +
      '<div class="feature-copy">' + sectionHead(c) + '<div class="principles">' + items + '</div></div>' +
    '</div></section>';
  },

  process: function (c) {
    var items = (c.items || []).map(function (s, i) {
      return '<li class="step reveal" style="--d:' + i + '">' +
        '<span class="step-no">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<h3 class="h3">' + esc(s.title) + '</h3><p class="muted">' + esc(s.text) + '</p></li>';
    }).join('');
    return '<section class="section" id="process"><div class="wrap">' + sectionHead(c) +
      '<ol class="steps">' + items + '</ol></div></section>';
  },

  group: function (c) {
    var items = (c.items || []).map(function (g, i) {
      return '<article class="group-card spot tilt reveal" style="--d:' + i + '">' +
        '<span class="group-icon">' + iconSvg(g.icon) + '</span>' +
        (g.tag ? '<span class="tag">' + esc(g.tag) + '</span>' : '') +
        '<h3 class="h3 big">' + esc(g.title) + '</h3>' +
        '<p class="muted">' + esc(g.text) + '</p></article>';
    }).join('');
    return '<section class="section" id="group"><div class="wrap">' + sectionHead(c, 'split') +
      '<div class="group-grid">' + items + '</div></div></section>';
  },

  references: function (c) {
    var items = (c.items || []).map(function (r, i) {
      var chips = String(r.chips || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean)
        .map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      return '<article class="ref-card spot reveal" style="--d:' + (i % 2) + '">' +
        (r.tag ? '<span class="tag">' + esc(r.tag) + '</span>' : '') +
        '<h3 class="h3">' + esc(r.title) + '</h3>' +
        '<p class="muted">' + esc(r.text) + '</p>' +
        (chips ? '<ul class="chips">' + chips + '</ul>' : '') +
      '</article>';
    }).join('');
    return '<section class="section" id="references"><div class="wrap">' + sectionHead(c, 'split') +
      '<div class="ref-grid">' + items + '</div>' +
      (c.note ? '<p class="note reveal">' + esc(c.note) + '</p>' : '') +
    '</div></section>';
  },

  contact: function (c) {
    var row = function (icon, html) {
      return '<li><span class="ci-icon">' + iconSvg(icon) + '</span><span>' + html + '</span></li>';
    };
    return '<section class="section" id="contact"><div class="wrap"><div class="contact-panel spot reveal">' +
      '<div class="contact-copy">' + sectionHead(c) +
        '<div class="actions">' + button(c.cta, 'primary', 'mail') +
          (c.email ? '<button class="btn btn-ghost copy" type="button" data-copy="' + esc(c.email) + '"><span>' + esc(c.email) + '</span>' + iconSvg('copy', 'icon btn-icon') + '</button>' : '') +
        '</div>' +
      '</div>' +
      '<ul class="contact-data">' +
        (c.company || c.address ? row('pin', (c.company ? '<strong>' + esc(c.company) + '</strong><br>' : '') + escLines(c.address)) : '') +
        (c.phone ? row('phone', c.phone_href ? '<a ' + linkAttrs(c.phone_href) + '>' + esc(c.phone) + '</a>' : esc(c.phone)) : '') +
        (c.email ? row('mail', c.email_href ? '<a ' + linkAttrs(c.email_href) + '>' + esc(c.email) + '</a>' : esc(c.email)) : '') +
      '</ul>' +
    '</div></div></section>';
  }
};

function renderBrand(b) {
  var mark = '';
  if (b.logo === 'monogram') mark = '<span class="brand-logo">' + LOGO_SVG + '</span>';
  else if (b.logo === 'image' && b.logo_src) mark = '<img class="brand-img" src="' + esc(b.logo_src) + '" alt="">';
  return '<a class="brand" href="#hero" aria-label="' + esc(b.name) + '">' + mark +
    '<span class="brand-text"><span class="brand-name">' + esc(b.name) + '</span>' +
    (b.tagline ? '<small>' + esc(b.tagline) + '</small>' : '') + '</span></a>';
}

function renderControls(cfg, c) {
  var ui = c.ui || {}, out = '';
  var langs = cfg.i18n.languages || [];
  if (cfg.i18n.switcher && langs.length > 1) {
    out += '<div class="lang-switch" role="group" aria-label="' + esc(ui.language) + '">' +
      langs.map(function (l) {
        return '<button type="button" data-lang="' + esc(l) + '" aria-pressed="' + (l === SITE.lang) + '">' + esc(l.toUpperCase()) + '</button>';
      }).join('') + '</div>';
  }
  if (cfg.theme.mode_toggle) {
    out += '<button class="mode-toggle" type="button" title="' + esc(ui.mode) + '" aria-label="' + esc(ui.mode) + '">' +
      iconSvg('sun', 'icon i-sun') + iconSvg('moon', 'icon i-moon') + '</button>';
  }
  return out ? '<div class="controls">' + out + '</div>' : '';
}

function renderNav(cfg, c) {
  var links = (c.nav || []).map(function (n) {
    return '<a ' + linkAttrs(n.href) + '>' + esc(n.label) + '</a>';
  }).join('');
  return '<div class="wrap nav-inner">' + renderBrand(c.brand || {}) +
    '<nav class="nav-links" id="nav-links">' + links +
      (c.nav_cta && c.nav_cta.label ? '<a class="btn btn-sm" ' + linkAttrs(c.nav_cta.href) + '>' + esc(c.nav_cta.label) + '</a>' : '') +
    '</nav>' + renderControls(cfg, c) +
    '<button class="nav-toggle" type="button" aria-label="' + esc((c.ui || {}).menu) + '" aria-controls="nav-links" aria-expanded="false"><span></span><span></span></button>' +
  '</div>';
}

function renderFooter(cfg, c) {
  var f = c.footer || {};
  var links = (f.links || []).map(function (l) { return '<a ' + linkAttrs(l.href) + '>' + esc(l.label) + '</a>'; }).join('');
  return '<div class="wrap footer-inner">' +
    ((c.brand || {}).logo === 'monogram' ? '<span class="footer-logo">' + LOGO_SVG + '</span>' : '') +
    '<p>' + esc(f.text) + '</p><nav>' + links + '</nav></div>';
}

function renderSite(cfg) {
  var c = currentContent(cfg);
  document.documentElement.lang = SITE.lang;
  document.getElementById('nav').innerHTML = renderNav(cfg, c);
  document.getElementById('footer').innerHTML = renderFooter(cfg, c);
  document.getElementById('app').innerHTML = (cfg.sections || []).map(function (s) {
    if (!s.visible || !RENDER[s.id]) return '';
    return RENDER[s.id](c[s.id] || {});
  }).join('');
}
