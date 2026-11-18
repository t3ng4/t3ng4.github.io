function cardHexToRgb(hex, fallback) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = fallback;
  return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }).join(',');
}

function cardEsc(text) {
  return String(text == null ? '' : text)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function cardReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

var BUTTON_STYLES = ['glass', 'solid', 'outline', 'minimal', 'neon', 'gradient', 'pill', 'brutal', 'terminal'];

var SOCIAL_POSITIONS = ['card', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

var ENTRANCES = ['none', 'fade', 'slide', 'slide-down', 'slide-left', 'slide-right',
                 'zoom', 'pop', 'blur', 'flip', 'drop'];

var HOVER_STYLES = ['none', 'lift', 'fill', 'underline', 'grow', 'glow', 'shine',
                    'slide', 'bar', 'tilt', 'wiggle', 'icon-spin'];

var AVATAR_EFFECTS = ['none', 'pulse', 'glow', 'rotate', 'spin-ring', 'rainbow',
                      'orbit', 'breathe', 'float', 'heartbeat', 'wobble'];

var SOCIAL_HOVERS = ['none', 'lift', 'glow', 'brand', 'grow', 'spin', 'bounce', 'fill'];

function cardPickClass(card, prefix, list, value, fallback) {
  var v = list.indexOf(value) >= 0 ? value : fallback;
  list.forEach(function (x) { card.classList.toggle(prefix + x, x === v); });
}

function cardPickClasses(card, prefix, list, value, fallback) {
  var on = Array.isArray(value) ? value : [value == null ? fallback : value];
  list.forEach(function (x) { card.classList.toggle(prefix + x, x !== 'none' && on.indexOf(x) >= 0); });
}

function applyCardStyle(card, c) {
  if (!card || !c) return;

  var alpha = c.background_opacity == null ? 1 : c.background_opacity;
  card.style.setProperty('--card-bg', 'rgba(' + cardHexToRgb(c.background_color, '#222222') + ',' + alpha + ')');

  if (c.accent_color) {
    card.style.setProperty('--accent', c.accent_color);
    card.style.setProperty('--accent-rgb', cardHexToRgb(c.accent_color, '#ffffff'));
  }

  cardPickClasses(card, 'btn-', BUTTON_STYLES, c.button_style, 'glass');
  if (c.link_background_color) card.style.setProperty('--link-bg', c.link_background_color);
  cardPickClasses(card, 'hover-', HOVER_STYLES, c.hover_style, 'lift');

  cardPickClasses(card, 'soc-', SOCIAL_HOVERS, c.socials_hover, 'lift');

  card.classList.toggle('columns', c.section_layout === 'columns');
  card.classList.toggle('no-icons', c.show_icons === false);
  card.classList.toggle('no-desc', c.show_descriptions === false);
  card.classList.toggle('no-section-titles', c.show_section_titles === false);
  card.classList.toggle('no-ring', c.avatar_ring === false);

  if (c.avatar_size) card.style.setProperty('--avatar-size', c.avatar_size + 'px');
  card.style.setProperty('--avatar-radius', c.avatar_round === false ? '6px' : '50%');
  cardPickClass(card, 'avatar-', AVATAR_EFFECTS, c.avatar_effect, 'none');
  card.style.setProperty('--av-int', c.avatar_effect_intensity == null ? 0.5 : c.avatar_effect_intensity);
  card.style.setProperty('--av-speed', c.avatar_effect_speed || 1);

  card.style.setProperty('--enter-dur', (c.entrance_speed || 0.6) + 's');
  var wrap = card.querySelector('.avatar-wrap');
  var img = card.querySelector('.avatar');
  if (wrap) wrap.hidden = c.show_avatar === false;
  if (img && c.avatar_url && img.getAttribute('src') !== c.avatar_url) img.src = c.avatar_url;
}

function renderCard(card, c, opts) {
  if (!card || !c) return;
  opts = opts || {};
  var n = 0;

  var html =
    '<div class="card-head" style="--i:' + (n++) + '">' +
      '<span class="avatar-wrap"><img class="avatar" src="' + cardEsc(c.avatar_url || 'https://github.com/t3ng4.png') + '" alt=""></span>' +
      '<h1>' + cardEsc(c.title || '') + '</h1>' +
    '</div>' +
    '<p class="tagline" style="--i:' + (n++) + '">' + cardEsc(c.tagline || '') + '</p>';

  html += '<div class="sections">';
  (c.sections || []).forEach(function (sec) {
    var links = (sec.links || []).filter(function (l) { return !l.hidden; });
    if (!links.length) return;
    html += '<section class="section">';
    if (sec.title) html += '<h2 class="section-title" style="--i:' + (n++) + '">' + cardEsc(sec.title) + '</h2>';
    html += '<nav class="links">';
    links.forEach(function (l) {
      html +=
        '<a href="' + cardEsc(l.url || '#') + '" target="_blank" rel="noopener" style="--i:' + (n++) + '">' +
          iconSvg(l.icon || 'link') +
          '<span class="text">' +
            '<span class="name">' + cardEsc(l.name) +
              (l.badge ? ' <span class="badge">' + cardEsc(l.badge) + '</span>' : '') +
            '</span>' +
            (l.desc ? '<span class="desc">' + cardEsc(l.desc) + '</span>' : '') +
          '</span>' +
        '</a>';
    });
    html += '</nav></section>';
  });
  html += '</div>';

  var socials = (c.socials || []).filter(function (s) { return s.url; });
  if (socials.length) {
    var pos = SOCIAL_POSITIONS.indexOf(c.socials_position) >= 0 ? c.socials_position : 'card';
    html += '<div class="socials pos-' + pos + '" style="--i:' + (n++) + '">';
    socials.forEach(function (s) {

      var brand = (typeof ICON_COLORS !== 'undefined' && ICON_COLORS[s.icon]) || '';
      html += '<a class="social" href="' + cardEsc(s.url) + '" target="_blank" rel="noopener" title="' + cardEsc(s.name) +
              '" aria-label="' + cardEsc(s.name) + '"' + (brand ? ' style="--brand:' + brand + '"' : '') + '>' +
              iconSvg(s.icon || 'link') + '</a>';
    });
    html += '</div>';
  }

  card.innerHTML = html;
  applyCardStyle(card, c);

  ENTRANCES.forEach(function (e) { card.classList.remove('enter-' + e); });
  card.classList.remove('entering');
  if (opts.animate && !cardReducedMotion() && c.entrance && c.entrance !== 'none' && ENTRANCES.indexOf(c.entrance) >= 0) {
    void card.offsetWidth;
    card.classList.add('entering', 'enter-' + c.entrance);
  }

  card.querySelectorAll('.links a').forEach(function (a) {
    a.addEventListener('mousemove', function (e) {
      if (!card.classList.contains('hover-tilt')) return;
      var r = a.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      a.style.setProperty('--ry', (x * 14).toFixed(2) + 'deg');
      a.style.setProperty('--rx', (-y * 14).toFixed(2) + 'deg');
    });
    a.addEventListener('mouseleave', function () {
      a.style.setProperty('--rx', '0deg');
      a.style.setProperty('--ry', '0deg');
    });
  });

  clearInterval(card._typingTimer);
  var tag = card.querySelector('.tagline');
  if (opts.animate && c.typing && tag && !cardReducedMotion()) {
    var full = c.tagline || '', typed = 0;
    tag.textContent = '';
    tag.classList.add('typing');
    card._typingTimer = setInterval(function () {
      typed++;
      tag.textContent = full.slice(0, typed);
      if (typed >= full.length) { clearInterval(card._typingTimer); tag.classList.remove('typing'); }
    }, 55);
  }
}
