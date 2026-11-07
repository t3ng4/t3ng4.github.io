/* Loads the particle settings from particles.json.
   Make new configs with configurator.html, then replace particles.json
   with the downloaded file. "page.background_color" sets the background. */
fetch('particles.json', { cache: 'no-cache' })
  .then(function (r) { return r.json(); })
  .then(function (cfg) {
    if (cfg.page && cfg.page.background_color) {
      document.getElementById('particles-js').style.backgroundColor = cfg.page.background_color;
    }
    particlesJS('particles-js', cfg);
  });
