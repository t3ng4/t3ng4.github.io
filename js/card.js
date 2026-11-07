/* Applies the "card" settings from particles.json to the card.
   Used by index.html (via app.js) and by configurator.html. */
function applyCardStyle(card, c) {
  if (!card || !c) return;
  var hex = /^#[0-9a-f]{6}$/i.test(c.background_color) ? c.background_color : '#222222';
  var alpha = c.background_opacity == null ? 1 : c.background_opacity;
  var rgb = [1, 3, 5].map(function (i) { return parseInt(hex.slice(i, i + 2), 16); });
  card.style.setProperty('--card-bg', 'rgba(' + rgb.join(',') + ',' + alpha + ')');
  if (c.link_background_color) card.style.setProperty('--link-bg', c.link_background_color);
  if (c.avatar_size) card.style.setProperty('--avatar-size', c.avatar_size + 'px');
  card.style.setProperty('--avatar-radius', c.avatar_round === false ? '6px' : '50%');
  var img = card.querySelector('.avatar');
  if (img) {
    img.hidden = c.show_avatar === false;
    if (c.avatar_url && img.getAttribute('src') !== c.avatar_url) img.src = c.avatar_url;
  }
}
