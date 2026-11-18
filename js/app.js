fetch('particles.json', { cache: 'no-cache' })
  .then(function (r) { return r.json(); })
  .then(function (cfg) {
    applyPageEffects(cfg.page);
    renderCard(document.getElementById('card'), cfg.card || {}, { animate: true });

    var particleCfg = {};
    Object.keys(cfg).forEach(function (k) { if (k !== 'page' && k !== 'card') particleCfg[k] = cfg[k]; });
    particlesJS('particles-js', particleCfg);
  });
