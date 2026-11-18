var pageFx = {
  cfg: {},
  glow: null,
  overlay: null,
  listening: false
};

function fxRgb(hex, fallback) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) hex = fallback;
  return [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); }).join(',');
}

function fxLayer(cls) {
  var el = document.querySelector('.' + cls);
  if (!el) {
    el = document.createElement('div');
    el.className = cls;
    el.setAttribute('aria-hidden', 'true');
    document.body.appendChild(el);
  }
  return el;
}

function applyPageEffects(p) {
  p = p || {};
  pageFx.cfg = p;
  var strength = p.effect_strength == null ? 0.5 : p.effect_strength;

  var bg = document.getElementById('particles-js');
  if (bg) {
    var layers = [], sizes = [];
    if (p.background_style === 'glow') {
      layers.push('radial-gradient(circle at 50% 50%, rgba(' + fxRgb(p.glow_color, '#ffffff') + ',' + (strength * 0.35) + ') 0%, transparent 60%)');
      sizes.push('100% 100%');
    }
    if (p.background_style === 'vignette') {
      layers.push('radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,' + strength + ') 100%)');
      sizes.push('100% 100%');
    }
    if (p.background_image) {
      layers.push('url("' + String(p.background_image).replace(/"/g, '%22') + '")');
      sizes.push('cover');
    }
    bg.style.backgroundColor = p.background_color || '#000000';
    bg.style.backgroundImage = layers.length ? layers.join(',') : 'none';
    bg.style.backgroundSize = sizes.join(',');
    bg.style.backgroundPosition = 'center';
    bg.style.backgroundRepeat = 'no-repeat';
  }

  pageFx.glow = fxLayer('fx-glow');
  pageFx.glow.hidden = !p.cursor_glow;
  pageFx.glow.style.setProperty('--glow-rgb', fxRgb(p.cursor_glow_color, '#ffffff'));
  pageFx.glow.style.setProperty('--glow-size', (p.cursor_glow_size || 300) + 'px');
  pageFx.glow.style.setProperty('--glow-opacity', p.cursor_glow_opacity == null ? 0.12 : p.cursor_glow_opacity);

  pageFx.overlay = fxLayer('fx-overlay');
  pageFx.overlay.hidden = !p.overlay || p.overlay === 'none';
  pageFx.overlay.classList.toggle('scanlines', p.overlay === 'scanlines');
  pageFx.overlay.classList.toggle('grain', p.overlay === 'grain');
  pageFx.overlay.style.opacity = p.overlay_opacity == null ? 0.5 : p.overlay_opacity;

  if (!pageFx.listening) {
    pageFx.listening = true;

    window.addEventListener('mousemove', function (e) {
      if (!pageFx.cfg.cursor_glow) return;
      pageFx.glow.style.setProperty('--x', e.clientX + 'px');
      pageFx.glow.style.setProperty('--y', e.clientY + 'px');
      pageFx.glow.classList.add('active');
    });
    document.addEventListener('mouseleave', function () { pageFx.glow.classList.remove('active'); });

    window.addEventListener('click', function (e) {
      if (!pageFx.cfg.click_ripple) return;
      if (e.target.closest && e.target.closest('a, button, input, select, textarea, label, summary, #panel')) return;
      var r = document.createElement('div');
      r.className = 'fx-ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      r.style.setProperty('--ripple-rgb', fxRgb(pageFx.cfg.ripple_color, '#ffffff'));
      document.body.appendChild(r);
      r.addEventListener('animationend', function () { r.remove(); });
      setTimeout(function () { r.remove(); }, 1500);
    });
  }
}
