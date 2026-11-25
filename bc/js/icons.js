var ICONS = {
  "shield":       '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/>',
  "shield-check": '<path d="M12 3 4.5 6v5.5c0 4.6 3.1 8.4 7.5 9.5 4.4-1.1 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
  "person":       '<circle cx="12" cy="7.5" r="3.5"/><path d="M5 21a7 7 0 0 1 14 0"/>',
  "person-shield":'<circle cx="9" cy="7.5" r="3.2"/><path d="M3 20a6 6 0 0 1 10.2-4.3"/><path d="M17.5 12 14 13.4v2.4c0 2 1.4 3.6 3.5 4.2 2.1-.6 3.5-2.2 3.5-4.2v-2.4L17.5 12Z"/>',
  "building":     '<path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16"/><path d="M15 10h4a1 1 0 0 1 1 1v10"/><path d="M8 8h3M8 12h3M8 16h3"/><path d="M2.5 21h19"/>',
  "ticket":       '<path d="M3 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4v2a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2a2 2 0 0 1 0-4 2 2 0 0 0 0-4V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v2Z"/><path d="M14 5v14" stroke-dasharray="2 2"/>',
  "stage":        '<path d="M3 20h18"/><path d="M5 20V9l7-5 7 5v11"/><circle cx="12" cy="12.5" r="2.5"/><path d="M8.5 20a3.5 3.5 0 0 1 7 0"/>',
  "briefcase":    '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12.5h18"/>',
  "compass":      '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  "globe":        '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18Z"/>',
  "radar":        '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18.4 5.6"/><circle cx="12" cy="12" r="1"/>',
  "eye":          '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  "lock":         '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  "key":          '<circle cx="8" cy="15" r="4"/><path d="m10.8 12.2 8.2-8.2"/><path d="m17 6 2 2"/><path d="m14.5 8.5 2 2"/>',
  "camera":       '<path d="M3 7h3l2-3h8l2 3h3v12H3z"/><circle cx="12" cy="13" r="3.5"/>',
  "car":          '<path d="M5 17h14v-4.5L17 7H7l-2 5.5V17Z"/><circle cx="8" cy="17" r="1.8"/><circle cx="16" cy="17" r="1.8"/><path d="M5 12.5h14"/>',
  "plane":        '<path d="M21 15.5 13.5 11V5a1.5 1.5 0 0 0-3 0v6L3 15.5V17l7.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-4.5L21 17v-1.5Z"/>',
  "users":        '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  "alert":        '<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>',
  "activity":     '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  "clipboard":    '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/>',
  "graduation":   '<path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c3 2.5 9 2.5 12 0v-5"/><path d="M22 9v6"/>',
  "handshake":    '<path d="m11 17 2 2a1.5 1.5 0 0 0 2-2"/><path d="m14 14 2.5 2.5a1.5 1.5 0 0 0 2-2L15 11"/><path d="M2 12 6 8l4 1 3-2 4 1 5 4"/><path d="m9 15 1.5 1.5a1.5 1.5 0 0 0 2-2L10 12"/><path d="m2 12 5 5"/>',
  "phone":        '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  "mail":         '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  "pin":          '<path d="M12 21s7-6.1 7-11.5a7 7 0 0 0-14 0C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  "clock":        '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  "star":         '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"/>',
  "film":         '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
  "mic":          '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/>',
  "check":        '<path d="m5 12 5 5 9-10"/>',
  "arrow":        '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  "arrow-up-right":'<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  "copy":         '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  "sun":          '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  "moon":         '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>'
};

var ICON_NAMES = Object.keys(ICONS).sort();

function iconSvg(name, cls) {
  var inner = ICONS[name] || ICONS.shield;
  return '<svg class="' + (cls || 'icon') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor"' +
         ' stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
}

var LOGO_SVG = '<svg class="logo-svg" viewBox="0 0 220 126" aria-hidden="true"><g fill="currentColor">' +
  '<path d="M25 13c0-5-2-7-8-7h-5V0h39v49c10-9 21-14 35-14 25 0 43 18 43 43 0 28-20 48-48 48-15 0-25-5-34-14l-5 12H25V13zm26 47v43c7 9 16 14 27 14 18 0 29-15 29-39 0-22-10-35-27-35-12 0-22 6-29 17z"/>' +
  '<path d="M183 39c-12-5-24-7-37-4-23 5-37 24-37 47 0 26 18 42 43 42 18 0 31-8 41-22l-5-4c-8 10-17 15-28 15-17 0-27-13-27-34 0-23 10-37 26-37 8 0 13 3 17 10 4 7 7 10 13 10 7 0 12-5 12-12 0-6-6-11-18-15z"/>' +
  '</g></svg>';
