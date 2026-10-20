'use strict';
// Umumiy ikonkalar (sayt va admin panel ishlatadi)
window.ICONS = {
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  phone: '<rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  design: '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><circle cx="11" cy="11" r="2"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  chart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  cart: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/>',
  cloud: '<path d="M18 10h-1.3A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  support: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  star: '<polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9"/><path d="M16 3.1a4 4 0 0 1 0 7.8"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
  tool: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  mail: '<path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  tel: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
  insta: '<rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.4a4 4 0 1 1-7.9 1.2 4 4 0 0 1 7.9-1.2z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
  menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  arrow: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  coffee: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  card: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  refresh: '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  external: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  down: '<polyline points="6 9 12 15 18 9"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  utensils: '<path d="M4 3v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3"/><line x1="6" y1="3" x2="6" y2="21"/><path d="M18 3c-2 1.5-3 4-3 7h3v11"/>',
  graduation: '<path d="M22 10L12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  dollar: '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  quote: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  filter: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',
  telegram: '<path d="M21.5 3.5L2.7 10.8l6.3 2.3 2.2 6.8 3.4-4.2 4.9 3.7z"/><path d="M9 13.1l9.5-7"/>',
  whatsapp: '<path d="M3 21l1.6-4.9A9 9 0 1 1 8 19.5z"/><path d="M9 8.5c-.6 2.3 2.7 6.5 6 6.5.8 0 1.5-.8 1.5-1.4l-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2c-.6 0-1.6.6-1.9 1.1z"/>',
  youtube: '<rect x="2" y="5" width="20" height="14" rx="4.5"/><polygon points="10 9 16 12 10 15 10 9"/>',
  tiktok: '<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.1 4.5 5 4.8"/>',
  facebook: '<path d="M14.5 21.5v-8.2h2.8l.5-3.4h-3.3V7.7c0-1 .5-1.8 2-1.8h1.4V3.1c-.3 0-1.3-.2-2.4-.2-2.5 0-4.2 1.5-4.2 4.3v2.7H8.5v3.4h2.8v8.2z"/>',
  linkedin: '<rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="8" y1="10.5" x2="8" y2="16.5"/><line x1="8" y1="7.6" x2="8.01" y2="7.6"/><path d="M12 16.5v-6m0 3c0-2 1.2-3 2.7-3s2.3 1 2.3 3v3"/>',
  twitter: '<path d="M4 4l16 16M20 4L4 20"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.2 7.8 14.1 14.1 7.8 16.2 9.9 9.9 16.2 7.8"/>',
  medal: '<circle cx="12" cy="15" r="6"/><path d="M8.2 10.5L5 3h5l2 4.2M15.8 10.5L19 3h-5l-2 4.2"/><path d="M12 12.5v5M10 15h4"/>',
  building: '<rect x="4" y="2" width="16" height="20" rx="1.5"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
  tooth: '<path d="M12 5.5C10 3.5 5 3.5 5 8.5c0 3 1.5 4.5 2 7 .5 3 1 6 2.5 6s1.5-4 2.5-4 1 4 2.5 4 2-3 2.5-6c.5-2.5 2-4 2-7 0-5-5-5-7-3z"/>',
  pulse: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  car: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M3 12h18"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  crown: '<path d="M3 18h18l1.5-11-5.5 4-4-7-4 7-5.5-4z"/>',
  flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 9.5a3.5 3.5 0 1 1 3.5-3.5M14.5 12a3.5 3.5 0 1 1 3.5 3.5M12 14.5a3.5 3.5 0 1 1-3.5 3.5M9.5 12a3.5 3.5 0 1 1-3.5-3.5"/>',
  sparkle: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17l.7 1.8 1.8.7-1.8.7L19 22l-.7-1.8-1.8-.7 1.8-.7z"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
  translate: '<path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14.5 18h6"/>',
  bag: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  wallet: '<path d="M20 12V8a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13"/><path d="M3 5v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  baby: '<circle cx="12" cy="12" r="9"/><path d="M9 13.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M9.5 10h.01M14.5 10h.01M12 3c1 1 1 2 0 3"/>',
  scale: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/>',
  palette: '<path d="M12 2a10 10 0 1 0 0 20c1.4 0 2-.9 2-2 0-.6-.3-1.1-.5-1.5-.3-.4-.5-.9-.5-1.5 0-1.1.9-2 2-2h2.4A3.6 3.6 0 0 0 21 11.4C21 6 17 2 12 2z"/><path d="M7.5 11h.01M10 7.5h.01M15 7.5h.01"/>',
  paw: '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="5.5" r="2"/><circle cx="15" cy="5.5" r="2"/><circle cx="19" cy="10" r="2"/><path d="M12 11c-3 0-5.5 3.5-5.5 6 0 1.8 1.5 2.5 3 2.5 1 0 1.7-.5 2.5-.5s1.5.5 2.5.5c1.5 0 3-.7 3-2.5 0-2.5-2.5-6-5.5-6z"/>',
  wave: '<path d="M2 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 18c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/><path d="M2 6c2-4 4-4 6 0s4 4 6 0 4-4 6 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};
window.svgIcon = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${window.ICONS[n] || window.ICONS.star}</svg>`;

window.ICON_LABEL_X = {"telegram": "Telegram", "whatsapp": "WhatsApp", "youtube": "YouTube", "tiktok": "TikTok", "facebook": "Facebook", "linkedin": "LinkedIn", "twitter": "X (Twitter)", "link": "Havola", "compass": "Kompas", "medal": "Medal", "building": "Bino", "tooth": "Tish", "pulse": "Yurak urishi", "dumbbell": "Gantel", "car": "Mashina", "music": "Musiqa", "crown": "Toj", "flower": "Gul", "sparkle": "Yaltirash", "pen": "Qalam", "target": "Nishon", "smile": "Tabassum", "translate": "Til", "bag": "Sumka", "wallet": "Hamyon", "baby": "Bola", "scale": "Tarozi", "palette": "Ranglar", "paw": "Hayvon izi", "wave": "To'lqin", "sun": "Quyosh"};

'use strict';
// Sayt dvigateli: yadro (mavzular, savat, oynalar, formalar, effektlar).
// Bo'limlar (hero, products, gallery...) sections.js da ro'yxatdan o'tadi.
(function () {
  const E = (window.E = { sections: {}, actions: {}, changes: {}, inputs: {}, hooks: {}, order: [] });
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const text = (v) => esc(v == null ? '' : v);
  const money = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/ /g, ' ');
  const imgUrl = (u) => (/^(https?:\/\/|\/(?!\/)|data:image\/(png|jpeg|webp|gif|svg\+xml)[;,])/i.test(String(u || '')) ? String(u) : '');
  const linkUrl = (u) => { u = String(u || '').trim(); return /^(#|\/(?!\/)|https?:\/\/|tel:|mailto:)/i.test(u) ? u : ''; };
  const icon = (n) => (window.svgIcon ? window.svgIcon(n) : '');
  const isPreview = new URLSearchParams(location.search).has('preview');
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } } };
  Object.assign(E, { $, $$, esc, text, money, imgUrl, linkUrl, icon, isPreview, store });

  /* ---------- Ro'yxatlar (editor ham foydalanadi) ---------- */
  E.themes = {
    dark: { label: "Qorong'i neon", dark: true, sw: ['#0a0f1e', '#22d3ee'] },
    light: { label: "Yorug' indigo", dark: false, sw: ['#eceefb', '#4f46e5'] },
    warm: { label: 'Issiq amber', dark: true, sw: ['#1d130d', '#ff8a3d'] },
    minimal: { label: 'Minimal oq-qora', dark: false, sw: ['#ffffff', '#111111'] },
    fresh: { label: 'Yangi yashil', dark: false, sw: ['#f4f8f1', '#16a34a'] },
    rose: { label: 'Nafis atirgul', dark: false, sw: ['#fdf4f5', '#d6457a'] },
    gold: { label: 'Premium oltin', dark: true, sw: ['#0d0c0a', '#d4a64a'] },
    ocean: { label: 'Dengiz ko\'k', dark: false, sw: ['#f0f7fc', '#0b78d1'] },
  };
  E.fonts = { modern: 'Zamonaviy', display: "Ko'rkam (sarlavha)", luxe: 'Hashamatli (nafis serif)', wide: 'Keng (zamonaviy)', editorial: 'Klassik (serif)', geometric: 'Geometrik', soft: 'Yumshoq', mono: 'Texnik' };
  E.looks = { classic: 'Klassik (sodda)', cinema: 'Kinematik (animatsiyali)', luxe: 'Hashamatli (nafis)' };
  E.radii = { sharp: 'Qirrali', soft: 'Yumshoq', round: 'Yumaloq' };
  E.navStyles = { pill: 'Suzuvchi', bar: 'Klassik panel', minimal: 'Minimal' };
  E.bgs = { full: "To'liq (animatsiyali)", aurora: 'Yumshoq nur', plain: 'Sodda' };

  /* ---------- Holat ---------- */
  let S = null, cart = {}, itemMap = {}, timers = [], observers = [];
  const mouse = { x: -999, y: -999 };
  E.state = () => S;

  E.normalize = function (d) {
    d = d && typeof d === 'object' ? d : {};
    d.company = Object.assign({ name: 'Sayt', logo: '' }, d.company);
    d.theme = Object.assign({ preset: 'dark', accent: '', accent2: '', font: 'modern', radius: 'soft', bg: 'full', heads: 'left', switcher: false, look: 'classic', motion: true, fab: false }, d.theme);
    d.nav = Object.assign({ style: 'pill', cta: '', ctaLink: '#', search: false }, d.nav);
    d.announce = Object.assign({ enabled: false, text: '', link: '' }, d.announce);
    d.orders = Object.assign({ enabled: true, currency: "so'm", freeShipFrom: 0, deliveryFee: 0 }, d.orders);
    d.account = Object.assign({ enabled: false, requireOrder: true, requireBooking: false }, d.account);
    d.contacts = d.contacts || {};
    d.analytics = Object.assign({ ga: '', ym: '', fb: '' }, d.analytics);
    d.chat = Object.assign({ enabled: false }, d.chat);
    d.footer = Object.assign({ text: '', links: [] }, d.footer);
    d.sections = (Array.isArray(d.sections) ? d.sections : []).filter((s) => s && typeof s === 'object' && s.type);
    return d;
  };
  const on = (sec) => sec.enabled !== false;
  const cur = () => (S.orders && S.orders.currency) || '';
  E.fmt = (n) => `${money(n)}${cur() ? ' ' + esc(cur()) : ''}`;
  E.cur = cur;

  /* ---------- Mavzu ---------- */
  const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  function applyTheme() {
    const root = document.documentElement, t = S.theme;
    const saved = isPreview ? null : store.get('theme');
    const preset = t.switcher && E.themes[saved] ? saved : t.preset;
    root.dataset.site = E.themes[preset] ? preset : 'dark';
    const hex = /^#[0-9a-f]{6}$/i;
    for (const [k, v] of [['--acc', t.accent], ['--acc2', t.accent2]]) { if (hex.test(v || '')) root.style.setProperty(k, v); else root.style.removeProperty(k); }
    if (hex.test(t.accent || '') && !hex.test(t.accent2 || '')) root.style.setProperty('--acc2', t.accent);
    if (hex.test(t.accent || '')) root.style.setProperty('--on', lum(t.accent) > 0.58 ? '#0b1220' : '#ffffff'); else root.style.removeProperty('--on');
    const look = E.looks[t.look] ? t.look : 'classic', mo = t.motion !== false;
    let seen = false; try { seen = sessionStorage.getItem('intro') === '1'; } catch { /* ignore */ }
    const intro = !isPreview && mo && look !== 'classic' && !seen && !matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.className = `font-${E.fonts[t.font] ? t.font : 'modern'} rad-${E.radii[t.radius] ? t.radius : 'soft'} bg-${E.bgs[t.bg] ? t.bg : 'full'} heads-${t.heads === 'center' ? 'center' : 'left'} look-${look}${mo ? ' mo-on' : ''}${intro ? ' intro-on' : ''}${isPreview ? ' preview' : ''}`;
    if (intro) setTimeout(() => root.classList.remove('intro-on'), 3200);
  }
  function setMeta() {
    document.title = S.company.name || 'Sayt';
    const m = $('meta[name=description]');
    const hero = S.sections.find((s) => s.type === 'hero' || s.type === 'vcard');
    if (m) m.content = (hero && hero.text) || S.company.tagline || '';
    const og = (k, v) => { if (!v) return; let t = document.querySelector(`meta[property="${k}"]`); if (!t) { t = document.createElement('meta'); t.setAttribute('property', k); document.head.appendChild(t); } t.content = v; };
    og('og:title', S.company.name || 'Sayt'); og('og:description', (hero && hero.text) || S.company.tagline || ''); og('og:type', 'website');
    const acc = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#4f46e5';
    const letter = esc((S.company.logo || (S.company.name || 'S')[0] || 'S').slice(0, 2));
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><rect width='64' height='64' rx='16' fill='${acc}'/><text x='32' y='44' font-size='34' font-weight='800' text-anchor='middle' fill='#fff' font-family='Arial'>${letter}</text></svg>`;
    let l = $('link[rel=icon]'); if (!l) { l = document.createElement('link'); l.rel = 'icon'; document.head.appendChild(l); }
    l.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  /* ---------- Savat ---------- */
  function collectItems() {
    itemMap = {};
    for (const sec of S.sections) {
      if (!on(sec) || !['products', 'menu'].includes(sec.type) || (sec.mode || 'cart') !== 'cart') continue;
      for (const p of sec.items || []) if (p && p.id && p.active !== false) itemMap[p.id] = { p, sec };
    }
  }
  E.cartable = () => S.orders.enabled && Object.keys(itemMap).length > 0;
  E.item = (id) => itemMap[id] && itemMap[id].p;
  function loadCart() {
    try { cart = JSON.parse(store.get('cart') || '{}') || {}; } catch { cart = {}; }
    for (const id of Object.keys(cart)) { const q = parseInt(cart[id], 10); if (!itemMap[id] || !(q > 0)) delete cart[id]; else cart[id] = Math.min(99, q); }
  }
  const saveCart = () => store.set('cart', JSON.stringify(cart));
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const cartLines = () => Object.keys(cart).filter((id) => itemMap[id]).map((id) => ({ p: itemMap[id].p, qty: cart[id] }));
  const subtotal = () => cartLines().reduce((a, i) => a + (Number(i.p.price) || 0) * i.qty, 0);
  function shipping() {
    const o = S.orders, sub = subtotal();
    if (!o.deliveryFee) return 0;
    return o.freeShipFrom && sub >= o.freeShipFrom ? 0 : Number(o.deliveryFee) || 0;
  }
  E.cartLines = cartLines; E.subtotal = subtotal;
  E.maxQty = (p) => (p.stock === '' || p.stock == null || Number(p.stock) < 0 ? 99 : Math.max(0, Math.min(99, Number(p.stock))));
  E.addToCart = function (id, qty = 1) {
    const it = E.item(id); if (!it) return false;
    const max = E.maxQty(it);
    if (max <= 0) { E.toast('Afsuski, mahsulot tugagan'); return false; }
    const q = Math.min(max, (cart[id] || 0) + qty);
    if (q === (cart[id] || 0)) { E.toast(`Omborda faqat ${max} dona bor`); return false; }
    cart[id] = q; saveCart(); renderCart(); return true;
  };
  function renderCart() {
    const n = $('#cartN'); if (n) { n.textContent = cartCount() || ''; n.dataset.v = cartCount(); }
    const list = $('#cartList'); if (list) {
      const lines = cartLines();
      list.innerHTML = lines.length ? lines.map(({ p, qty }) => `<div class="it"><div class="th">${imgUrl(p.image) ? `<img src="${esc(imgUrl(p.image))}" alt="">` : `<div class="ph">${text((p.name || '?')[0])}</div>`}</div>
        <div><b>${text(p.name)}</b><small>${p.price > 0 ? E.fmt(p.price) : 'Narxi kelishiladi'}</small><div class="qty"><button data-act="dec" data-id="${esc(p.id)}" aria-label="Kamaytirish">−</button><span>${qty}</span><button data-act="inc" data-id="${esc(p.id)}" aria-label="Ko'paytirish">+</button></div></div>
        <button class="rm" data-act="rm" data-id="${esc(p.id)}" aria-label="O'chirish">${icon('x')}</button></div>`).join('') : `<div class="cempty">${icon('cart')}<p>Savat bo'sh</p><span>Mahsulotlarni tanlab, savatga qo'shing.</span></div>`;
      const foot = $('#cartFoot'), sub = subtotal(), ship = shipping(), o = S.orders;
      let prog = '';
      if (lines.length && o.deliveryFee && o.freeShipFrom) {
        const left = Math.max(0, o.freeShipFrom - sub), pct = Math.min(100, Math.round((sub / o.freeShipFrom) * 100));
        prog = `<div class="ship"><span>${left > 0 ? `Bepul yetkazib berishgacha yana <b>${E.fmt(left)}</b>` : '<b>Bepul yetkazib berish!</b>'}</span><div class="bar"><i style="width:${pct}%"></i></div></div>`;
      }
      foot.innerHTML = lines.length ? `${prog}<div class="tl"><span>Mahsulotlar</span><span>${E.fmt(sub)}</span></div>${o.deliveryFee ? `<div class="tl"><span>Yetkazib berish</span><span>${ship ? E.fmt(ship) : 'Bepul'}</span></div>` : ''}<div class="tl big"><span>Jami</span><span>${E.fmt(sub + ship)}</span></div><button class="btn full" data-act="checkout">Buyurtmani rasmiylashtirish ${icon('arrow')}</button>` : '';
    }
    $$('[data-cartsum]').forEach((el) => {
      const lines = cartLines(), sub = subtotal(), ship = shipping();
      el.innerHTML = lines.length ? `<div class="sum"><b>Savatda:</b> ${lines.map((i) => `${text(i.p.name)} ×${i.qty}`).join(', ')}<div class="sumt">Jami: <b>${E.fmt(sub + ship)}</b>${ship ? ` <small>(yetkazib berish ${E.fmt(ship)})</small>` : ''} · <a data-act="cart-open">o'zgartirish</a></div></div>` : '<div class="sum">Savat bo\'sh. Mahsulotni tanlab, savatga qo\'shing yoki xabar qoldiring.</div>';
    });
  }
  E.renderCart = renderCart;

  /* ---------- Oyna va xabar ---------- */
  E.openModal = function (html, cls) {
    const m = $('#modal'); if (!m) return;
    m.className = 'modal open ' + (cls || '');
    m.innerHTML = `<div class="mback" data-act="close"></div><div class="mbox" role="dialog" aria-modal="true">${html}<button class="mclose" data-act="close" aria-label="Yopish">${icon('x')}</button></div>`;
    document.body.classList.add('noscroll');
    const f = $('.mbox [data-focus]', m) || $('.mclose', m); if (f) f.focus({ preventScroll: true });
  };
  E.closeModal = function () { const m = $('#modal'); if (!m) return; m.className = 'modal'; m.innerHTML = ''; document.body.classList.remove('noscroll'); E.modalKey = null; };
  E.toast = function (msg) {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(E.toast.t); E.toast.t = setTimeout(() => t.classList.remove('show'), 2200);
  };
  const openCart = (v) => { $('#drawer')?.classList.toggle('open', v); $('#shade')?.classList.toggle('open', v); document.body.classList.toggle('noscroll', v); };

  /* ---------- Yordamchi: bo'lim qobig'i va sarlavha ---------- */
  E.wrap = (sec, inner, cls) => `<section class="sec s-${esc(sec.type)} ${cls || ''}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${inner}</div></section>`;
  E.rich = (v) => text(v).replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  E.head = (sec, extra) => (sec.title || sec.eyebrow || sec.text) ? `<div class="sh rv">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}${sec.title ? `<h2>${E.rich(sec.title)}</h2>` : ''}${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}${extra || ''}</div>` : '';
  E.price = (p) => {
    const price = Number(p.price) || 0, old = Number(p.oldPrice) || 0;
    if (!price) return '<span class="amount na">Narxi kelishiladi</span>';
    const off = old > price ? Math.round((1 - price / old) * 100) : 0;
    return `<span class="amount">${E.fmt(price)}</span>${old > price ? `<span class="oldrow"><s class="old">${E.fmt(old)}</s><span class="off">−${off}%</span></span>` : ''}`;
  };
  E.img = (u, alt, cls) => (imgUrl(u) ? `<img class="${cls || ''}" src="${esc(imgUrl(u))}" alt="${esc(alt || '')}" loading="lazy">` : '');
  E.initial = (n) => text((String(n || '?').trim()[0] || '?').toUpperCase());

  /* ---------- Chrome: e'lon, menyu, pastki qism ---------- */
  function announceHtml() {
    const a = S.announce; if (!a.enabled || !a.text) return '';
    const l = linkUrl(a.link);
    return `<div class="announce">${l ? `<a href="${esc(l)}">${text(a.text)} ${icon('arrow')}</a>` : `<span>${text(a.text)}</span>`}</div>`;
  }
  const accOn = () => !!(S && S.account && S.account.enabled && window.Auth && window.Auth.enabled && !isPreview);
  function accountBtn() {
    if (!accOn()) return '';
    const u = window.Auth.user();
    return u ? `<a class="btn sm ghost acc" href="/kabinet.html" title="Mening kabinetim">${icon('user')}<span>${text(String(u.name).split(' ')[0])}</span></a>` : `<button class="btn sm ghost acc" data-act="login">${icon('user')}<span>Kirish</span></button>`;
  }
  const needAuth = (kind) => accOn() && !window.Auth.user() && (((kind === 'order' || kind === 'brief') && S.account.requireOrder !== false) || (kind === 'booking' && S.account.requireBooking));
  function fillUser() {
    const u = accOn() && window.Auth.user(); if (!u) return;
    $$('form[data-kind]').forEach((f) => { if (f.elements.name && !f.elements.name.value) f.elements.name.value = u.name || ''; if (f.elements.phone && !f.elements.phone.value) f.elements.phone.value = u.phone || ''; });
  }
  E.account = { on: accOn, needAuth, fill: fillUser };
  function refreshNav() { const n = $('#nav'); if (!n || !S) return; const was = n.classList.contains('scrolled'); n.outerHTML = navHtml(); if (was) $('#nav').classList.add('scrolled'); renderCart(); fillUser(); }
  function navHtml() {
    const links = S.sections.filter((s) => on(s) && s.navLabel).slice(0, 7).map((s) => `<a href="#${esc(s.id)}">${text(s.navLabel)}</a>`);
    const hasShop = S.sections.some((s) => on(s) && s.type === 'products');
    const search = S.nav.search && hasShop ? `<label class="nsearch">${icon('search')}<input id="navSearch" data-inp="navsearch" type="search" placeholder="Mahsulot qidirish…" autocomplete="off"></label>` : '';
    const cartBtn = E.cartable() ? `<button class="icon-btn" data-act="cart-open" aria-label="Savat">${icon('cart')}<span class="n" id="cartN" data-v="${cartCount()}">${cartCount() || ''}</span></button>` : '';
    const acc = accountBtn();
    const LG = window.__LANGS__, lang = LG ? `<div class="langsw">${LG.list.map((l) => `<a href="${l.u}"${l.c === LG.cur ? ' class="on" aria-current="true"' : ''} hreflang="${l.c}">${l.c.toUpperCase()}</a>`).join('')}</div>` : '';
    const cta = S.nav.cta ? `<a class="btn sm" href="${esc(linkUrl(S.nav.ctaLink) || '#')}">${text(S.nav.cta)}</a>` : '';
    const logo = S.company.logoImage && imgUrl(S.company.logoImage) ? `<img class="mimg" src="${esc(imgUrl(S.company.logoImage))}" alt="">` : `<span class="mark">${text((S.company.logo || (S.company.name || 'S')[0]).slice(0, 2))}</span>`;
    return `<header class="nav nav-${esc(S.nav.style)}" id="nav"><a class="logo" href="#top">${logo}<span class="lname">${text(S.company.name)}</span></a>
      <nav class="links" id="links">${links.join('')}</nav>
      <div class="nav-r">${search}${lang}${cartBtn}${acc}${cta}<button class="icon-btn burger" data-act="burger" aria-label="Menyu">${icon('menu')}</button></div></header>`;
  }
  function footerHtml() {
    const c = S.contacts, f = S.footer;
    const links = (f.links || []).filter((l) => l && l.label && linkUrl(l.url));
    const soc = [];
    if (c.telegram) { const u = String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); soc.push(`<a href="https://t.me/${esc(u)}" target="_blank" rel="noopener" aria-label="Telegram">${icon('send')}</a>`); }
    if (c.instagram) { const u = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''); soc.push(`<a href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener" aria-label="Instagram">${icon('insta')}</a>`); }
    if (c.email) soc.push(`<a href="mailto:${esc(c.email)}" aria-label="Email">${icon('mail')}</a>`);
    if (c.phone) soc.push(`<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}" aria-label="Telefon">${icon('tel')}</a>`);
    return `<footer><div class="wrap fgrid"><div class="fbrand"><a class="logo" href="#top"><span class="mark">${text((S.company.logo || (S.company.name || 'S')[0]).slice(0, 2))}</span><span class="lname">${text(S.company.name)}</span></a>${S.company.tagline ? `<p>${text(S.company.tagline)}</p>` : ''}</div>
      ${links.length ? `<div class="flinks">${links.map((l) => `<a href="${esc(linkUrl(l.url))}">${text(l.label)}</a>`).join('')}</div>` : ''}
      ${soc.length ? `<div class="fsoc">${soc.join('')}</div>` : ''}</div>
      <div class="fmark" aria-hidden="true">${text(S.company.name)}</div><div class="wrap fcopy"><span>© ${new Date().getFullYear()} ${text(S.company.name)}. ${text(f.text)}</span></div></footer>`;
  }
  function chromeEnd() {
    const drawer = E.cartable() ? `<div class="shade" id="shade" data-act="cart-close"></div><aside class="drawer" id="drawer" aria-label="Savat"><div class="dh"><h3>Savat</h3><button class="icon-btn" data-act="cart-close" aria-label="Yopish">${icon('x')}</button></div><div class="items" id="cartList"></div><div id="cartFoot"></div></aside>` : '';
    const sw = S.theme.switcher ? `<div class="sw">${Object.keys(E.themes).slice(0, 3).map((k) => `<button data-act="theme" data-t="${k}" class="${k === document.documentElement.dataset.site ? 'on' : ''}">${text(E.themes[k].label.split(' ')[0])}</button>`).join('')}</div>` : '';
    return `${drawer}<div class="modal" id="modal"></div><div class="toast" id="toast" role="status"></div>${sw}`;
  }

  /* ---------- Asosiy render ---------- */
  E.render = function (data) {
    S = E.normalize(JSON.parse(JSON.stringify(data)));
    S.sections.forEach((s, i) => { if (!s.id) s.id = `${s.type}-${i}`; });
    collectItems(); loadCart(); applyTheme(); setMeta();
    const vcs = S.sections.find((x) => on(x) && x.type === 'vcard'), vroot = document.documentElement;
    if (vcs) { vroot.classList.add('card-mode', 'vcd-' + (E.vcDesigns && E.vcDesigns[vcs.design] ? vcs.design : 'emerald')); const ua = /^#[0-9a-f]{6}$/i.test(S.theme.accent || '') ? S.theme.accent : ''; if (ua) { vroot.style.setProperty('--vc-ua', ua); vroot.style.setProperty('--vc-ub', /^#[0-9a-f]{6}$/i.test(S.theme.accent2 || '') ? S.theme.accent2 : ua); vroot.style.setProperty('--vc-uon', lum(ua) > 0.58 ? '#0b1220' : '#ffffff'); } else ['--vc-ua', '--vc-ub', '--vc-uon'].forEach((k) => vroot.style.removeProperty(k)); }
    const body = S.sections.filter(on).map((sec) => { const def = E.sections[sec.type]; if (!def) return ''; try { return def.render(sec, S); } catch (e) { console.error('section', sec.type, e); return ''; } }).join('');
    $('#app').innerHTML = vcs ? `<main id="top">${body}</main><footer class="vcfoot">© ${new Date().getFullYear()} ${text(S.company.name)}${S.footer.text ? '. ' + text(S.footer.text) : ''}</footer>${chromeEnd()}` : `${announceHtml()}${navHtml()}<main id="top">${body}</main>${footerHtml()}${chromeEnd()}`;
    $('#app').dataset.nav = S.nav.style;
    document.body.classList.toggle('has-announce', !!$('.announce'));
    renderCart(); initEffects(); fillUser(); initAnalytics(); renderFab(); if (E.hooks.afterRender) E.hooks.afterRender();
  };

  /* ---------- Statistika (Google Analytics, Yandex Metrika, Meta Pixel): faqat haqiqiy sahifada ---------- */
  let analyticsDone = false;
  function initAnalytics() {
    if (analyticsDone || isPreview) return; const a = S.analytics || {};
    const add = (code) => { const s = document.createElement('script'); s.textContent = code; document.head.appendChild(s); };
    const ga = String(a.ga || '').trim(), ym = String(a.ym || '').trim(), fb = String(a.fb || '').trim();
    if (/^G-[A-Z0-9]{4,14}$/.test(ga)) { const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`; document.head.appendChild(s); add(`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`); }
    if (/^\d{5,12}$/.test(ym)) add(`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${ym},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:false});`);
    if (/^\d{8,20}$/.test(fb)) add(`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src='https://connect.facebook.net/en_US/fbevents.js';s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script');fbq('init','${fb}');fbq('track','PageView');`);
    analyticsDone = true;
  }
  /* ---------- Suzuvchi aloqa tugmalari ---------- */
  function renderFab() {
    const old = $('#fab'); if (old) old.remove(); if (!S.theme.fab || isPreview && false) return;
    const c = S.contacts || {}, L = [];
    const brief = !!E.actions['brief-open'] && S.sections.some((s) => on(s) && s.type === 'brief');
    if (brief) L.push(`<a class="fb-b main" href="#brief-open" aria-label="Bepul maslahat">${icon('edit')}<span>Bepul maslahat</span></a>`);
    const chatOn = !!(S.chat && S.chat.enabled && String(window.__RELAY__ || '').trim() && !isPreview && !window.__DEMO__);
    if (chatOn) L.push(`<button type="button" class="fb-b chatb" aria-label="Yordam chati">${icon('support')}</button>`);
    if (c.telegram) { const u = String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); L.push(`<a class="fb-b tg" href="https://t.me/${esc(u)}" target="_blank" rel="noopener" aria-label="Telegram">${icon('send')}</a>`); }
    if (c.whatsapp && /\d{9}/.test(String(c.whatsapp))) L.push(`<a class="fb-b wa" href="https://wa.me/${String(c.whatsapp).replace(/\D/g, '')}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('support')}</a>`);
    if (c.phone) L.push(`<a class="fb-b ph" href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}" aria-label="Qo'ng'iroq">${icon('tel')}</a>`);
    if (!L.length) return;
    const d = document.createElement('div'); d.id = 'fab'; d.className = 'fab'; d.innerHTML = L.join(''); document.body.appendChild(d);
    const cb = d.querySelector('.chatb'); if (cb) cb.addEventListener('click', () => chatToggle());
  }
  /* ---------- Sayt chati (Cloudflare Worker orqali bot bilan) ---------- */
  let chatBox = null, chatPoll = 0;
  function chatToggle() {
    const RELAY = String(window.__RELAY__ || '').replace(/\/$/, ''); if (!RELAY) return;
    if (!chatBox) {
      let sid = ''; try { sid = localStorage.getItem('impro_chat') || ''; } catch { /* ignore */ }
      if (!/^[A-Za-z0-9]{16,40}$/.test(sid)) { const a = 'abcdefghijklmnopqrstuvwxyz0123456789', r = new Uint8Array(24); (window.crypto || { getRandomValues: (x) => x.map(() => Math.random() * 256) }).getRandomValues(r); sid = Array.from(r, (b) => a[b % 36]).join(''); try { localStorage.setItem('impro_chat', sid); } catch { /* ignore */ } }
      const box = document.createElement('div'); box.id = 'chatw'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Yordam chati');
      box.innerHTML = `<div class="cw-h"><b>Impro IT yordam</b><button type="button" class="cw-x" aria-label="Yopish">×</button></div><div class="cw-m" aria-live="polite"></div><form class="cw-f"><input maxlength="500" placeholder="Savolingizni yozing…" autocomplete="off" aria-label="Xabar"><button type="submit" aria-label="Yuborish">${icon('send')}</button></form>`;
      document.body.appendChild(box); chatBox = box;
      const msgs = box.querySelector('.cw-m'), form = box.querySelector('form'), input = box.querySelector('input');
      const add = (t, me) => { const b = document.createElement('div'); b.className = 'cw-b ' + (me ? 'me' : 'bot'); b.textContent = t; msgs.appendChild(b); msgs.scrollTop = msgs.scrollHeight; return b; };
      add("Salom! Men Impro IT yordamchisiman. Savolingizni yozing, darrov javob beraman. Telefon raqamingizni qoldirsangiz, mutaxassis bog'lanadi.", false);
      box.querySelector('.cw-x').addEventListener('click', () => chatToggle());
      let busy = false;
      form.addEventListener('submit', async (e) => {
        e.preventDefault(); const text = input.value.trim(); if (!text || busy) return; busy = true; input.value = ''; add(text, true);
        const typing = add('…', false); typing.classList.add('typing');
        try {
          const r = await fetch(RELAY + '/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sid, text }) });
          const j = await r.json().catch(() => ({})); typing.remove();
          if (!r.ok) add(j.error || "Xatolik yuz berdi. Qayta urinib ko'ring.", false); else if (j.reply) add(j.reply, false);
        } catch { typing.remove(); add("Xatolik yuz berdi. Qayta urinib ko'ring.", false); }
        busy = false; input.focus();
      });
      box._poll = async () => { try { const r = await fetch(RELAY + '/chat?sid=' + sid); if (r.ok) (await r.json()).msgs.forEach((t) => add(t, false)); } catch { /* keyingi safar */ } };
    }
    const open = chatBox.hidden; chatBox.hidden = !open;
    clearInterval(chatPoll); if (open) { chatBox.querySelector('input').focus(); chatBox._poll(); chatPoll = setInterval(() => chatBox._poll(), window.__CHAT_POLL__ || 6000); }
  }
  E.chatToggle = chatToggle;

  /* ---------- Formalar ---------- */
  E.prefill = function (msg) {
    const f = $('#contactForm'); if (!f) return false;
    const ta = f.querySelector('[name=message]'); if (ta && msg) { ta.value = msg; ta.dispatchEvent(new Event('input')); }
    f.closest('section').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => (f.querySelector('[name=name]') || f).focus({ preventScroll: true }), 500);
    return true;
  };
  const KIND_TITLE = { booking: 'Yangi ariza: ', order: 'Yangi buyurtma: ', brief: "Yangi loyiha so'rovi: ", message: 'Yangi xabar: ' };
  // Pochta orqali yuborish (server bo'lmaganda zaxira yo'l)
  E.mailto = function (payload) {
    const email = (S.contacts && S.contacts.email) || '';
    if (!email) throw new Error("Xabar yuborilmadi. Iltimos, telefon orqali bog'laning.");
    const L = [`Ism: ${payload.name}`, `Telefon: ${payload.phone}`, ...Object.entries(payload.extra || {}).map(([k, v]) => `${k}: ${v}`)];
    if ((payload.items || []).length) L.push('Buyurtma: ' + payload.items.map((i) => `${i.name} x${i.qty}`).join(', '), `Jami: ${money(payload.items.reduce((a, i) => a + i.price * i.qty, 0) + (payload.shipping || 0))} ${cur()}`);
    if (payload.message) L.push('', payload.message);
    location.href = `mailto:${email}?subject=${encodeURIComponent((KIND_TITLE[payload.type] || KIND_TITLE.message) + payload.name)}&body=${encodeURIComponent(L.join('\n'))}`;
  };
  // Serverga yuborish; server bo'lmasa pochtaga o'tadi. Natija: {ok, id} yoki {mail:true}
  E.send = async function (payload) {
    if (window.__DEMO__) throw new Error("Bu namunaviy sayt: so'rov yuborilmaydi. Shablonni tanlab, o'z ma'lumotlaringizni kiriting.");
    const embedded = !!window.__SITE__;
    const API = String(window.__API__ || '').replace(/\/$/, '');
    const viaServer = !!(window.Auth && window.Auth.enabled);
    const RELAY = String(window.__RELAY__ || '').trim();
    if (embedded && !API && !viaServer && RELAY) { // statik sayt: Telegram'ga xavfsiz oraliq (Cloudflare Worker) orqali
      try { const r = await fetch(RELAY, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, site: (S.company && S.company.name) || '', lang: document.documentElement.lang || '', page: location.href }) }); if (r.ok) return { ok: true, id: 'tg' }; } catch { /* pochtaga o'tamiz */ }
    }
    if (embedded && !API && !viaServer) { E.mailto(payload); return { mail: true }; }
    try {
      let j;
      if (viaServer) j = await window.Auth.request('/api/order', { method: 'POST', body: payload });
      else {
        const r = await fetch(API + '/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        j = await r.json().catch(() => ({}));
        if (!r.ok) { const er = new Error(j.error || "Xatolik yuz berdi. Qayta urinib ko'ring."); er.status = r.status; throw er; }
      }
      return { ok: true, id: j.id };
    } catch (e) {
      if (e.status) throw e;
      if (embedded) { E.mailto(payload); return { mail: true }; }
      throw e;
    }
  };

  async function submitForm(form) {
    const msg = $('.fmsg', form), btn = form.querySelector('button[type=submit]');
    // Savat bo'sh bo'lsa, buyurtma formasi oddiy xabar sifatida yuboriladi
    const kind = form.dataset.kind === 'order' && !cartLines().length ? 'message' : form.dataset.kind;
    const val = (n) => ((form.elements[n] && form.elements[n].value) || '').trim();
    msg.className = 'fmsg';
    const name = val('name'), phone = val('phone');
    if (name.length < 2) { msg.className = 'fmsg bad'; msg.textContent = 'Ismingizni kiriting'; form.elements.name.focus(); return; }
    if (!/^[+\d][\d\s()\-]{6,}$/.test(phone)) { msg.className = 'fmsg bad'; msg.textContent = "Telefon raqamini to'g'ri kiriting (masalan, +998 90 123 45 67)"; form.elements.phone.focus(); return; }
    const extra = {};
    $$('[data-label]', form).forEach((el) => { const v = (el.value || '').trim(); if (v && el.name && !el.closest('[hidden]')) extra[el.dataset.label] = v; });
    const addr = form.querySelector('[data-addr]');
    if (kind === 'order' && addr && !addr.hidden && !val('address')) { msg.className = 'fmsg bad'; msg.textContent = 'Yetkazib berish manzilini kiriting'; form.elements.address.focus(); return; }
    const items = kind === 'order' ? cartLines().map((i) => ({ id: i.p.id, name: i.p.name, price: Number(i.p.price) || 0, qty: i.qty })) : [];
    const payload = { type: kind, name, phone, message: val('message'), items, extra, shipping: kind === 'order' ? shipping() : 0 };
    if (isPreview) { msg.textContent = "Ko'rinish rejimi: xabar yuborilmaydi."; return; }
    if (needAuth(kind)) {
      window.Auth.modal({ title: kind === 'order' ? 'Buyurtma berish uchun kiring' : 'Yozilish uchun kiring', text: "Hisobingiz bo'lmasa, ro'yxatdan o'ting. Buyurtmalaringiz hisobingizda saqlanadi." }).then((u) => { if (u) { fillUser(); submitForm(form); } });
      return;
    }
    btn.disabled = true;
    const done = () => {
      if (kind === 'order') { cart = {}; saveCart(); renderCart(); }
      const box = form.parentElement; box.innerHTML = `<div class="ok"><div class="tick">${icon('check')}</div><h3>${kind === 'booking' ? "Arizangiz qabul qilindi" : kind === 'order' ? 'Buyurtmangiz qabul qilindi' : 'Xabaringiz yuborildi'}</h3><p class="sub">Tez orada siz bilan bog'lanamiz.</p></div>`;
    };
    try {
      const r = await E.send(payload);
      if (r.mail) { msg.textContent = "Pochta ilovangiz ochiladi. Xabarni yuborishni unutmang yoki qo'ng'iroq qiling."; btn.disabled = false; } else done();
    } catch (e) {
      if (e.status === 401 && accOn()) { btn.disabled = false; window.Auth.modal({ title: 'Hisobingizga kiring', text: "Buyurtma uchun hisob kerak. Kiring yoki ro'yxatdan o'ting." }).then((u) => { if (u) { fillUser(); submitForm(form); } }); return; }
      msg.className = 'fmsg bad'; msg.textContent = e.message; btn.disabled = false;
    }
  }

  /* ---------- Effektlar ---------- */
  function initEffects() {
    timers.forEach(clearTimeout); timers.forEach(clearInterval); timers = [];
    observers.forEach((o) => o.disconnect()); observers = [];
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
    $$('.rv').forEach((e) => (isPreview ? e.classList.add('in') : io.observe(e))); observers.push(io);
    const co = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return; co.unobserve(e.target);
      const t = +e.target.dataset.count || 0, suf = e.target.dataset.suf || '', s = performance.now();
      (function f(n) { const p = Math.min(1, (n - s) / 1600); const v = Math.round(t * (1 - Math.pow(1 - p, 4))); e.target.textContent = (e.target.dataset.plain && t >= 1900 && t <= 2100 ? String(v) : v.toLocaleString('ru-RU').replace(/ /g, ' ') ) + suf; if (p < 1) requestAnimationFrame(f); })(s);
    }), { threshold: 0.6 });
    $$('[data-count]').forEach((e) => co.observe(e)); observers.push(co);
    const tw = $('#tw'); const words = tw ? (tw.dataset.words || '').split('|').filter(Boolean) : [];
    if (tw && words.length) {
      if (isPreview) tw.textContent = words[0]; else {
        let wi = 0, ci = 0, del = false;
        (function tick() { const w = words[wi % words.length]; tw.textContent = w.slice(0, ci);
          if (!del && ci === w.length) { del = true; timers.push(setTimeout(tick, 1600)); return; }
          if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; }
          ci += del ? -1 : 1; timers.push(setTimeout(tick, del ? 45 : 95)); })();
      }
    }
    $$('[data-until]').forEach((el) => {
      const end = Date.parse(el.dataset.until); if (!(end > 0)) { el.hidden = true; return; }
      const pad = (n) => String(n).padStart(2, '0');
      const tick = () => { let d = Math.max(0, end - Date.now()); const days = Math.floor(d / 864e5); d -= days * 864e5; const h = Math.floor(d / 36e5); d -= h * 36e5; const m = Math.floor(d / 6e4); const s = Math.floor((d - m * 6e4) / 1e3);
        el.innerHTML = `<div><b>${days}</b><span>kun</span></div><div><b>${pad(h)}</b><span>soat</span></div><div><b>${pad(m)}</b><span>daqiqa</span></div><div><b>${pad(s)}</b><span>soniya</span></div>`; };
      tick(); timers.push(setInterval(tick, 1000));
    });
    $$('.tilt').forEach((v) => { const w = v.firstElementChild; if (!w) return; v.addEventListener('pointermove', (e) => { const r = v.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; w.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 10}deg)`; }); v.addEventListener('pointerleave', () => (w.style.transform = '')); });
    onScroll();
  }
  function onScroll() {
    const h = document.body.scrollHeight - innerHeight; const p = $('#prog'); if (p) p.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
    const n = $('#nav'); if (n) n.classList.toggle('scrolled', scrollY > 24);
  }

  /* ---------- Hodisalar (bir marta ulanadi) ---------- */
  E.actions['close'] = () => E.closeModal();
  E.actions['cart-open'] = () => openCart(true);
  E.actions['cart-close'] = () => openCart(false);
  E.actions['add'] = (el) => { if (E.addToCart(el.dataset.id)) { const old = el.innerHTML; el.innerHTML = icon('check') + ' Qo\'shildi'; el.classList.add('added'); setTimeout(() => { el.innerHTML = old; el.classList.remove('added'); }, 1200); E.toast('Savatga qo\'shildi'); } };
  E.actions['inc'] = (el) => { E.addToCart(el.dataset.id); };
  E.actions['dec'] = (el) => { const id = el.dataset.id; if ((cart[id] || 0) <= 1) delete cart[id]; else cart[id]--; saveCart(); renderCart(); };
  E.actions['rm'] = (el) => { delete cart[el.dataset.id]; saveCart(); renderCart(); };
  E.actions['checkout'] = () => {
    openCart(false); const f = $('#contactForm'); if (!f) { E.toast('Buyurtma formasi yoqilmagan'); return; }
    if (f.dataset.kind !== 'order') { const L = cartLines(); E.prefill('Buyurtma: ' + L.map((i) => `${i.p.name} x${i.qty}`).join(', ') + ` (jami ${E.fmt(subtotal() + shipping())})`.replace(/<[^>]*>/g, '')); return; }
    f.closest('section').scrollIntoView({ behavior: 'smooth' });
  };
  E.actions['burger'] = () => $('#links').classList.toggle('open');
  E.actions['theme'] = (el) => { store.set('theme', el.dataset.t); document.documentElement.dataset.site = el.dataset.t; $$('.sw button').forEach((b) => b.classList.toggle('on', b === el)); };
  E.actions['login'] = () => { window.Auth.modal({}); };
  E.actions['prefill'] = (el) => { E.closeModal(); E.prefill(el.dataset.msg || ''); };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (el && E.actions[el.dataset.act]) { if (el.tagName === 'A' && !el.getAttribute('href')) e.preventDefault(); E.actions[el.dataset.act](el, e); return; }
    const bo = e.target.closest('a[href="#brief-open"]'); if (bo && E.actions['brief-open']) { e.preventDefault(); $('#links') && $('#links').classList.remove('open'); E.actions['brief-open'](bo, e); return; }
    const a = e.target.closest('#links a'); if (a) $('#links').classList.remove('open');
  });
  document.addEventListener('change', (e) => { const el = e.target.closest('[data-chg]'); if (el && E.changes[el.dataset.chg]) E.changes[el.dataset.chg](el, e); });
  document.addEventListener('input', (e) => { const el = e.target.closest('[data-inp]'); if (el && E.inputs[el.dataset.inp]) E.inputs[el.dataset.inp](el, e); });
  document.addEventListener('submit', (e) => { if (e.target.matches('form[data-kind]')) { e.preventDefault(); submitForm(e.target); } });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if ($('#modal.open')) E.closeModal(); else openCart(false); }
    if (E.modalKey && $('#modal.open')) E.modalKey(e);
  });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointermove', (e) => { const g = $('#glow'); if (g) { g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px'; } mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest && e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); }
    const b = e.target.closest && e.target.closest('.mag'); if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.16}px,${(e.clientY - r.top - r.height / 2) * 0.24}px)`; }
  });
  document.addEventListener('pointerout', (e) => { const b = e.target.closest && e.target.closest('.mag'); if (b) b.style.transform = ''; });

  /* ---------- Fon: harakatlanuvchi tarmoq ---------- */
  function startNetwork() {
    const cv = $('#bg'); if (!cv) return; const cx = cv.getContext('2d'); let P = [];
    const size = () => { const d = window.devicePixelRatio || 1; cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); P = Array.from({ length: Math.min(80, Math.floor(innerWidth / 16)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35 })); };
    addEventListener('resize', size); size();
    (function draw() {
      if (document.documentElement.classList.contains('bg-full')) {
        cx.clearRect(0, 0, innerWidth, innerHeight);
        const col = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim() || '#22d3ee'; cx.fillStyle = col; cx.strokeStyle = col;
        for (const p of P) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > innerWidth) p.vx *= -1; if (p.y < 0 || p.y > innerHeight) p.vy *= -1; const dx = mouse.x - p.x, dy = mouse.y - p.y; if (Math.hypot(dx, dy) < 160) { p.x -= dx * 0.004; p.y -= dy * 0.004; } cx.globalAlpha = 0.7; cx.beginPath(); cx.arc(p.x, p.y, 1.6, 0, 7); cx.fill(); }
        for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const d = Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y); if (d < 130) { cx.globalAlpha = (1 - d / 130) * 0.22; cx.beginPath(); cx.moveTo(P[i].x, P[i].y); cx.lineTo(P[j].x, P[j].y); cx.stroke(); } }
      } else cx.clearRect(0, 0, innerWidth, innerHeight);
      requestAnimationFrame(draw);
    })();
  }

  /* ---------- Yuklash (faqat sayt sahifasida) ---------- */
  E.boot = function () {
    startNetwork();
    if (window.Auth && window.Auth.enabled) { window.Auth.onChange(refreshNav); window.Auth.init(); }
    if (window.__SITE__) return E.render(window.__SITE__);
    if (isPreview) {
      addEventListener('message', (e) => {
        if (e.source !== parent || !e.data) return;
        if (e.data.type === 'site') E.render(e.data.data);
        if (e.data.type === 'focus') { const el = document.getElementById(e.data.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
      parent.postMessage({ type: 'ready' }, '*'); return;
    }
    const API = String(window.__API__ || '').replace(/\/$/, '');
    fetch(API + '/api/site').then((r) => { if (!r.ok) throw 0; return r.json(); }).then(E.render)
      .catch(() => { $('#app').innerHTML = '<div class="err"><h2>Sayt vaqtincha ishlamayapti</h2><p>Iltimos, birozdan so\'ng qayta urinib ko\'ring.</p></div>'; });
  };
})();

/* Xato hisoboti: sayt xatolari (aniq joyi va ekran rasmi bilan) yordam botiga boradi */
(function () {
  const seen = {}; let n = 0;
  const where = () => { try { const el = document.elementFromPoint(innerWidth / 2, innerHeight / 2); const sec = el && el.closest('section,[id],header,footer,nav'); return (sec ? (sec.tagName.toLowerCase() + (sec.id ? '#' + sec.id : '') + (sec.className && typeof sec.className === 'string' ? '.' + sec.className.trim().split(/\s+/)[0] : '')) : '') + ' @scroll ' + Math.round(scrollY) + 'px'; } catch (e) { return ''; } };
  const shot = () => new Promise((res) => {
    const done = (v) => res(v), t = setTimeout(() => done(''), 9000);
    try {
      const go = () => { const top = Math.min(Math.round(scrollY), 5000), pr = 0.5; return window.htmlToImage.toCanvas(document.body, { pixelRatio: pr, width: innerWidth, height: top + innerHeight, canvasWidth: innerWidth, canvasHeight: top + innerHeight, skipFonts: true, filter: (e) => !/^(INPUT|TEXTAREA|IFRAME|VIDEO|CANVAS|SCRIPT)$/.test(e.tagName || '') }).then((c) => { const o = document.createElement('canvas'); o.width = Math.round(innerWidth * pr); o.height = Math.round(innerHeight * pr); o.getContext('2d').drawImage(c, 0, Math.round(top * pr), o.width, o.height, 0, 0, o.width, o.height); clearTimeout(t); done(o.toDataURL('image/jpeg', 0.55)); }).catch(() => { clearTimeout(t); done(''); }); };
      if (window.htmlToImage) return go();
      const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js'; sc.setAttribute('data-noerr', '1'); sc.onload = go; sc.onerror = () => { clearTimeout(t); done(''); }; document.head.appendChild(sc);
    } catch (e) { clearTimeout(t); done(''); }
  });
  const send = async (m, src, line, stack, col, el) => {
    try {
      if (/Googlebot|AdsBot|bingbot|YandexBot|Lighthouse|HeadlessChrome|Nexus 5X Build\/MMB29P|PTST|crawler|spider|Chrome-Lighthouse/i.test(navigator.userAgent)) return; const RELAY = String(window.__RELAY__ || '').replace(/\/$/, ''); if (!RELAY || n >= 3) return;
      m = String(m || '').slice(0, 300); src = String(src || ''); if (!m || /^Script error\.?$/i.test(m) || /ResizeObserver|extension:\/\/|moz-extension|Non-Error promise rejection/i.test(m + src)) return;
      const k = m + '|' + src + '|' + line; if (seen[k]) return; seen[k] = 1; n++;
      const body = { m, s: src.slice(0, 200), l: line || 0, c: col || 0, st: String(stack || '').slice(0, 600), u: location.href.slice(0, 200), ua: navigator.userAgent.slice(0, 120), w: innerWidth, h: innerHeight, sec: where(), el: el || '', lang: document.documentElement.lang || '' };
      if (n === 1) body.img = await shot();
      fetch(RELAY + '/err', { method: 'POST', keepalive: !body.img, headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body) }).catch(() => {});
    } catch (e) { /* hisobot o'zi xato bermasin */ }
  };
  addEventListener('error', (e) => { const t = e.target; if (t && t !== window && (t.src || t.href)) return t.getAttribute && t.getAttribute('data-noerr') ? 0 : send('Resurs yuklanmadi: ' + (t.src || t.href), '', 0, '', 0, String(t.outerHTML || '').slice(0, 160)); send(e.message, e.filename, e.lineno, e.error && e.error.stack, e.colno); }, true);
  addEventListener('unhandledrejection', (e) => { const r = e.reason; send('Promise: ' + (r && r.message || r), '', 0, r && r.stack); });
})();

'use strict';
// Bo'limlar kutubxonasi: har bir bo'lim ko'rinishi (render) va tahrirlash maydonlari (fields) shu yerda.
(function () {
  const E = window.E;
  const { $, $$, esc, text, imgUrl, linkUrl, icon } = E;

  /* ---------- Maydon sxemasi yordamchilari (editor shundan forma yasaydi) ---------- */
  const F = {
    text: (k, label, o) => ({ k, t: 'text', label, ...o }),
    area: (k, label, o) => ({ k, t: 'area', label, ...o }),
    num: (k, label, o) => ({ k, t: 'num', label, ...o }),
    sel: (k, label, options, o) => ({ k, t: 'sel', label, options, ...o }),
    tog: (k, label, o) => ({ k, t: 'tog', label, ...o }),
    img: (k, label, o) => ({ k, t: 'img', label, ...o }),
    lines: (k, label, o) => ({ k, t: 'lines', label, ...o }),
    icon: (k, label, o) => ({ k, t: 'icon', label, ...o }),
    link: (k, label, o) => ({ k, t: 'link', label, ...o }),
    list: (k, label, item, o) => ({ k, t: 'list', label, item, ...o }),
  };
  E.F = F;
  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 100 }), F.area('text', 'Tavsif', { max: 300, rows: 2 })];
  const uid = () => 'i' + Math.random().toString(36).slice(2, 8);
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const arr = (a) => (Array.isArray(a) ? a : []);
  const split = (s, d, ins) => {
    let i = 0; const imgs = arr(ins).filter((x) => x && imgUrl(x.image));
    const total = String(s || '').replace(/\*/g, '').split(/\s+/).filter(Boolean).length;
    const at = imgs.map((_, j) => Math.max(1, Math.round((total * (j + 1)) / (imgs.length + 1))));
    const word = (w) => { const k = i++; let h = `<span class="w"><span style="animation-delay:${(d + k * 0.08).toFixed(2)}s">${text(w)}</span></span>`; const j = at.indexOf(k + 1); if (j >= 0) h += `<span class="ipill" style="--pd:${(d + k * 0.08 + 0.5).toFixed(2)}s"><img src="${esc(imgUrl(imgs[j].image))}" alt=""></span>`; return h; };
    return String(s || '').split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => { const em = /^\*[^*]+\*$/.test(seg); const t = em ? seg.slice(1, -1) : seg; const h = t.split(/\s+/).filter(Boolean).map(word).join(' '); const out = em ? `<em>${h}</em>` : h; return (!em && /^\s/.test(t) ? ' ' : '') + out + (!em && /\s$/.test(t) ? ' ' : ''); }).join('').replace(/\s+/g, ' ');
  };
  const btn = (t, l, cls) => (t ? `<a class="btn ${cls || ''}" href="${esc(linkUrl(l) || '#')}">${text(t)}<span class="bi">${icon('arrow')}</span></a>` : '');

  /* =============== HERO =============== */
  define('hero', {
    label: 'Bosh ekran', icon: 'star', desc: 'Sahifa boshidagi katta sarlavha va tugmalar',
    fields: [
      F.sel('layout', 'Ko\'rinish', [['aurora', 'Aurora: animatsion fon, markazda (tavsiya)'], ['cinema', 'Kinematik: to\'liq rasm yoki video'], ['photo', 'Katta foto + matn'], ['editorial', 'Muharrir: so\'zlar orasida rasmlar'], ['split', 'Matn + tasvir'], ['center', 'Markazda'], ['image', 'To\'liq rasm foni (sodda)'], ['shop', 'Do\'kon (mahsulotlar kollaji)']]),
      F.text('badge', 'Yuqoridagi yozuv', { max: 80 }), F.text('titleStart', 'Sarlavha boshi', { max: 80 }),
      F.lines('words', 'Almashib turadigan so\'zlar', { hint: 'Har bir qatorga bitta so\'z. Bo\'sh qoldirsangiz o\'chadi.' }),
      F.text('titleEnd', 'Sarlavha oxiri', { max: 80 }), F.area('text', 'Tavsif', { max: 320, rows: 3 }),
      F.text('cta1Text', '1-tugma matni', { max: 40 }), F.link('cta1Link', '1-tugma havolasi'),
      F.text('cta2Text', '2-tugma matni', { max: 40 }), F.link('cta2Link', '2-tugma havolasi'),
      F.sel('visual', 'O\'ng tomondagi tasvir', [['none', 'Yo\'q'], ['image', 'Rasm'], ['window', 'Kod oynasi'], ['collage', 'Mahsulotlar kollaji']], { show: (s) => ['split', 'center'].includes(s.layout) }),
      F.sel('fx', 'Fon animatsiyasi', [['aurora', 'Nur oqimi'], ['waves', "To'lqinlar"]], { show: (s) => s.layout === 'aurora' }),
      F.img('image', 'Rasm', { hint: 'Aurora: pastdagi katta rasm (ixtiyoriy). Kinematik: fon rasmi. Foto: asosiy foto.', show: (s) => ['image', 'cinema', 'photo', 'aurora'].includes(s.layout) || ((s.layout === 'split' || s.layout === 'center') && s.visual === 'image') }),
      F.text('video', 'Fon videosi (mp4 havolasi)', { max: 300, hint: 'Ixtiyoriy. Yuklangan mp4 faylning manzili.', show: (s) => s.layout === 'cinema' }),
      F.img('image2', 'Ikkinchi kichik rasm', { show: (s) => s.layout === 'photo' }),
      F.text('spinText', 'Aylanuvchi yozuv', { max: 40, show: (s) => s.layout === 'photo' }),
      F.list('inlineImgs', "So'zlar orasidagi rasmlar (3 tagacha)", { title: 'image', fields: [F.img('image', 'Rasm')], add: () => ({ image: '' }), max: 3 }, { show: (s) => s.layout === 'editorial' }),
      F.lines('windowLines', 'Oynadagi qatorlar', { show: (s) => s.layout === 'split' && s.visual === 'window' }),
      F.lines('chips', 'Suzuvchi yozuvlar (3 tagacha)', { show: (s) => s.layout === 'photo' || (['split', 'shop'].includes(s.layout) && s.visual !== 'none') }),
      F.list('collage', 'Kollaj kartochkalari', { title: 'title', fields: [F.img('image', 'Rasm'), F.text('title', 'Nomi', { max: 60 }), F.text('price', 'Narx matni', { max: 30 })], add: () => ({ image: '', title: 'Mahsulot', price: '' }), max: 3 }, { show: (s) => s.layout === 'shop' || s.visual === 'collage' }),
      F.list('trust', 'Ishonch ko\'rsatkichlari', { title: 'value', fields: [F.text('value', 'Qiymat', { max: 20 }), F.text('label', 'Yozuv', { max: 30 })], add: () => ({ value: '', label: '' }), max: 4 }),
    ],
    defaults: () => ({ layout: 'aurora', fx: 'aurora', video: '', image2: '', spinText: '', inlineImgs: [], badge: 'Yangi', titleStart: 'Sarlavhangizni', words: ['shu yerga'], titleEnd: 'yozing', text: 'Kompaniyangiz haqida qisqa va aniq tavsif.', cta1Text: 'Boshlash', cta1Link: '#', cta2Text: '', cta2Link: '#', visual: 'none', image: '', windowLines: [], chips: [], collage: [], trust: [] }),
    render(sec) {
      const words = arr(sec.words).filter(Boolean), layout = sec.layout || 'split';
      const h1 = `<h1>${split(sec.titleStart, 0.1)}${words.length ? `<br><span class="grad type"><span id="tw" data-words="${esc(words.join('|'))}"></span><i class="caret"></i></span> ` : ' '}${split(sec.titleEnd, 0.45)}</h1>`;
      const trust = arr(sec.trust).filter((t) => t.value || t.label);
      const copy = `${sec.badge ? `<div class="pill"><b></b>${text(sec.badge)}</div>` : ''}${h1}${sec.text ? `<p class="lead">${text(sec.text)}</p>` : ''}
        <div class="cta">${btn(sec.cta1Text, sec.cta1Link, 'mag')}${btn(sec.cta2Text, sec.cta2Link, 'ghost mag')}</div>
        ${trust.length ? `<div class="trust">${trust.map((t) => `<div><b>${text(t.value)}</b>${text(t.label)}</div>`).join('')}</div>` : ''}`;
      const chips = arr(sec.chips).filter(Boolean).slice(0, 3);
      const chipH = chips.map((c, i) => `<div class="chip ${'abc'[i]}"><em>${icon(['chart', 'zap', 'check'][i])}</em>${text(c)}</div>`).join('');
      const collage = arr(sec.collage).slice(0, 3);
      const collageH = `<div class="collage">${collage.map((c, i) => `<figure class="cc c${i}">${E.img(c.image, c.title)}<figcaption><b>${text(c.title)}</b>${c.price ? `<span>${text(c.price)}</span>` : ''}</figcaption></figure>`).join('')}</div>`;
      let vis = '';
      const v = layout === 'shop' ? 'collage' : sec.visual;
      if (layout === 'split' || layout === 'shop' || layout === 'center') {
        if (v === 'window' && layout === 'split') vis = `<div class="vis tilt"><div class="win"><div class="bar"><i></i><i></i><i></i></div><pre>${arr(sec.windowLines).slice(0, 12).map((l, i) => `<span class="l" style="animation-delay:${(1 + i * 0.3).toFixed(1)}s">${codeLine(l)}</span>`).join('')}</pre><div class="chart">${[35, 55, 42, 70, 60, 88, 100].map((x, i) => `<i style="height:${x}%;animation-delay:${(1.2 + i * 0.1).toFixed(1)}s"></i>`).join('')}</div></div>${chipH}</div>`;
        else if (v === 'image' && imgUrl(sec.image)) vis = `<div class="vis"><div class="imgwin">${E.img(sec.image, '')}</div>${layout === 'center' ? '' : chipH}</div>`;
        else if (v === 'collage' && collage.length) vis = `<div class="vis">${collageH}${chipH}</div>`;
      }
      const head = (cls) => `<section class="sec s-hero hero hero-${cls}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"`;
      const h1x = (ins) => `<h1>${split(sec.titleStart, 0.1, ins)}${words.length ? `<br><span class="grad type"><span id="tw" data-words="${esc(words.join('|'))}"></span><i class="caret"></i></span> ` : ' '}${split(sec.titleEnd, 0.45)}</h1>`;
      const bare = (ins) => `${sec.badge ? `<div class="pill"><b></b>${text(sec.badge)}</div>` : ''}${h1x(ins)}${sec.text ? `<p class="lead">${text(sec.text)}</p>` : ''}<div class="cta">${btn(sec.cta1Text, sec.cta1Link, 'mag')}${btn(sec.cta2Text, sec.cta2Link, 'ghost mag')}</div>`;
      const trustH = trust.length ? `<div class="trust">${trust.map((t) => `<div><b>${text(t.value)}</b>${text(t.label)}</div>`).join('')}</div>` : '';
      if (layout === 'aurora' || layout === 'editorial') {
        const shot = layout === 'aurora' && imgUrl(sec.image) ? `<div class="hshot imr"><img data-par="0.05" src="${esc(imgUrl(sec.image))}" alt=""></div>` : '';
        return `${head(layout)}><div class="hfx" data-fx="${sec.fx === 'waves' ? 'waves' : 'aurora'}"><div class="hveil"></div></div><div class="wrap hero-in"><div class="hcopy">${bare(layout === 'editorial' ? sec.inlineImgs : null)}${trustH}</div>${shot}</div>${shot ? '' : '<i class="hscroll"></i>'}</section>`;
      }
      if (layout === 'cinema') {
        const vid = /^(https?:\/\/|\/)[^\s"'<>]+\.(mp4|webm)(\?.*)?$/i.test(sec.video || '') ? `<video src="${esc(sec.video)}" ${imgUrl(sec.image) ? `poster="${esc(imgUrl(sec.image))}"` : ''} muted loop playsinline autoplay></video>` : '';
        return `${head('cinema')}><div class="hbg2">${vid || E.img(sec.image, '')}</div><div class="wrap hero-in"><div class="hcopy">${bare()}</div>${trustH}</div><i class="hscroll"></i></section>`;
      }
      if (layout === 'photo') {
        const ch = arr(sec.chips).filter(Boolean).slice(0, 3).map((c, i) => `<div class="chip ${'abc'[i]}"><em>${icon(['star', 'zap', 'check'][i])}</em>${text(c)}</div>`).join('');
        const spin = sec.spinText ? `<div class="spin"><svg viewBox="0 0 120 120"><defs><path id="sp${esc(sec.id)}" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"/></defs><text><textPath href="#sp${esc(sec.id)}">${text((sec.spinText + ' • ').repeat(3))}</textPath></text></svg><b>${icon('arrow')}</b></div>` : '';
        const photo = `<div class="hphoto"><div class="frame">${imgUrl(sec.image) ? `<img data-par="0.06" src="${esc(imgUrl(sec.image))}" alt="">` : ''}</div>${spin}${ch}${imgUrl(sec.image2) ? `<div class="imgb"><img src="${esc(imgUrl(sec.image2))}" alt=""></div>` : ''}</div>`;
        return `${head('photo')}><div class="wrap hero-in"><div class="hcopy">${bare()}${trustH}</div>${photo}</div></section>`;
      }
      if (layout === 'image') {
        return `<section class="sec s-hero hero hero-image" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="hbg">${E.img(sec.image, '')}</div><div class="wrap hero-in"><div class="hcopy">${copy}</div></div></section>`;
      }
      if (layout === 'center') {
        return `<section class="sec s-hero hero hero-center" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap"><div class="hcopy">${copy}</div>${vis}</div></section>`;
      }
      return `<section class="sec s-hero hero hero-${layout} ${vis ? '' : 'solo'}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap hero-in"><div class="hcopy">${copy}</div>${vis}</div></section>`;
    },
  });
  function codeLine(s) {
    let h = esc(s);
    h = h.replace(/(\/\/.*)$/, '<span class="c">$1</span>').replace(/(&quot;.*?&quot;)/g, '<span class="s">$1</span>').replace(/\b(const|let|var|function|return|import|from)\b/g, '<span class="k">$1</span>');
    return h;
  }

  /* =============== MARQUEE =============== */
  define('marquee', {
    label: 'Yuguruvchi lenta', icon: 'zap', desc: 'Xizmat yoki brend nomlari lentasi',
    fields: [F.lines('items', 'Lentadagi so\'zlar')],
    defaults: () => ({ items: ['Birinchi', 'Ikkinchi', 'Uchinchi'] }),
    render(sec) {
      const it = arr(sec.items).filter(Boolean); if (!it.length) return '';
      const row = `<span>${it.map(text).join('</span><span>')}</span>`;
      return `<section class="sec s-marquee" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="mq"><div class="track">${row}${row}${row}${row}</div></div></section>`;
    },
  });

  /* =============== STATS =============== */
  define('stats', {
    label: 'Raqamlar', icon: 'chart', desc: 'Animatsiyali ko\'rsatkichlar',
    fields: [F.list('items', 'Ko\'rsatkichlar', { title: 'label', fields: [F.num('value', 'Son'), F.text('suffix', 'Qo\'shimcha (+, %)', { max: 10 }), F.text('label', 'Yozuv', { max: 40 })], add: () => ({ value: 10, suffix: '+', label: 'Yangi ko\'rsatkich' }), max: 6 })],
    defaults: () => ({ items: [{ value: 100, suffix: '+', label: 'Mijoz' }, { value: 5, suffix: ' yil', label: 'Tajriba' }, { value: 24, suffix: '/7', label: 'Aloqa' }] }),
    render(sec) {
      const it = arr(sec.items).filter((s) => s.label); if (!it.length) return '';
      return E.wrap(sec, `<div class="stats rv">${it.map((s) => `<div class="stat"><b data-count="${Number(s.value) || 0}" data-suf="${esc(s.suffix || '')}">0${text(s.suffix)}</b><span>${text(s.label)}</span></div>`).join('')}</div>`, 'tight');
    },
  });

  /* =============== FEATURES =============== */
  define('features', {
    label: 'Xizmatlar / afzalliklar', icon: 'grid', desc: 'Ikonkali kartochkalar: xizmat, afzallik yoki shartlar',
    fields: [...HEAD, F.sel('layout', 'Joylashuv', [['bento', 'Katta + kichik kartochkalar'], ['grid', 'Teng kartochkalar'], ['strip', 'Ixcham qator (afzalliklar uchun)']]),
      F.list('items', 'Kartochkalar', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 80 }), F.area('text', 'Tavsif', { max: 300, rows: 2 })], add: () => ({ icon: 'star', title: 'Yangi xizmat', text: '' }) })],
    defaults: () => ({ eyebrow: 'Xizmatlar', title: 'Biz nima qilamiz', text: '', layout: 'grid', items: [{ icon: 'star', title: 'Birinchi xizmat', text: 'Qisqa tavsif.' }, { icon: 'zap', title: 'Ikkinchi xizmat', text: 'Qisqa tavsif.' }, { icon: 'shield', title: 'Uchinchi xizmat', text: 'Qisqa tavsif.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const lay = sec.layout || 'grid';
      const cls = (i) => (lay === 'bento' ? (it.length >= 4 && i === 0 ? 'c4' : it.length === 1 ? 'c6' : it.length === 2 ? 'c3' : 'c2') : '');
      return E.wrap(sec, `${E.head(sec)}<div class="fgrid2 f-${esc(lay)}">${it.map((x, i) => `<div class="card ${cls(i)} rv" style="--d:${(i % 4) * 0.08}s"><div class="ic">${icon(x.icon)}</div><div class="ft"><h3>${text(x.title)}</h3><p>${text(x.text)}</p></div></div>`).join('')}</div>`, lay === 'strip' ? 'tight' : '');
    },
  });

  /* =============== PROCESS =============== */
  define('process', {
    label: 'Jarayon', icon: 'refresh', desc: 'Qanday ishlashingiz: qadamlar',
    fields: [...HEAD, F.sel('layout', "Ko'rinish", [['grid', 'Yonma-yon kartochkalar'], ['stack', 'Ustma-ust yig\'iladigan (katta)']]), F.list('items', 'Qadamlar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.area('text', 'Tavsif', { max: 250, rows: 2 })], add: () => ({ title: 'Yangi qadam', text: '' }), max: 8 })],
    defaults: () => ({ eyebrow: 'Jarayon', title: 'Qanday ishlaymiz', text: '', items: [{ title: 'Bog\'lanish', text: 'Arizangizni qabul qilamiz.' }, { title: 'Kelishuv', text: 'Shartlarni kelishamiz.' }, { title: 'Bajarish', text: 'Ishni o\'z vaqtida topshiramiz.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      if (sec.layout === 'stack') return E.wrap(sec, `${E.head(sec)}<div class="steps stack">${it.map((s, i) => `<div class="step" style="--i:${i}"><div class="num">${String(i + 1).padStart(2, '0')}</div><h3>${text(s.title)}</h3><p>${text(s.text)}</p></div>`).join('')}</div>`);
      return E.wrap(sec, `${E.head(sec)}<div class="steps">${it.map((s, i) => `<div class="step rv" style="--d:${i * 0.1}s"><div class="num">${i + 1}</div><h3>${text(s.title)}</h3><p>${text(s.text)}</p></div>`).join('')}</div>`);
    },
  });

  /* =============== ABOUT =============== */
  define('about', {
    label: 'Biz haqimizda', icon: 'users', desc: 'Rasm, matn va afzalliklar ro\'yxati',
    fields: [...HEAD, F.img('image', 'Rasm'), F.sel('imageSide', 'Rasm joylashuvi', [['left', 'Chapda'], ['right', 'O\'ngda']]), F.lines('points', 'Ro\'yxat (har qatorga bittadan)'), F.text('ctaText', 'Tugma matni', { max: 40 }), F.link('ctaLink', 'Tugma havolasi')],
    defaults: () => ({ eyebrow: 'Biz haqimizda', title: 'Biz kimmiz', text: 'Kompaniyangiz haqida batafsil yozing: tarixi, qadriyatlari va mijozlarga nima beradi.', image: '', imageSide: 'left', points: ['Birinchi afzallik', 'Ikkinchi afzallik', 'Uchinchi afzallik'], ctaText: '', ctaLink: '#' }),
    render(sec) {
      const img = imgUrl(sec.image) ? `<div class="aimg rv">${E.img(sec.image, sec.title)}</div>` : '';
      return E.wrap(sec, `<div class="about ${sec.imageSide === 'right' ? 'rev' : ''} ${img ? '' : 'noimg'}">${img}<div class="atx rv">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}
        ${arr(sec.points).filter(Boolean).length ? `<ul class="pts">${arr(sec.points).filter(Boolean).map((p) => `<li>${icon('check')}<span>${text(p)}</span></li>`).join('')}</ul>` : ''}${sec.ctaText ? `<div class="ctaw">${btn(sec.ctaText, sec.ctaLink)}</div>` : ''}</div></div>`);
    },
  });

  /* =============== PRODUCTS (do'kon / kurslar / paketlar) =============== */
  const shop = {};
  const productFields = [
    F.text('name', 'Nomi', { max: 120 }), F.num('price', 'Narxi', { hint: '0 = «Narxi kelishiladi»' }), F.num('oldPrice', 'Eski narx (chegirma uchun)', { hint: 'Narxdan katta bo\'lsa chegirma foizi ko\'rinadi' }),
    F.text('category', 'Kategoriya', { max: 60 }), F.text('badge', 'Belgi (ixtiyoriy)', { max: 30, ph: 'YANGI, CHEGIRMA, TOP' }), F.area('description', 'Tavsif', { max: 600, rows: 3 }),
    F.img('image', 'Rasm'), F.num('stock', 'Ombordagi soni', { hint: 'Bo\'sh qoldirsangiz cheksiz. 0 = «Tugagan»', blank: true }), F.tog('active', 'Saytda ko\'rsatish'),
  ];
  define('products', {
    label: 'Mahsulotlar / katalog', icon: 'cart', desc: 'Do\'kon: qidiruv, kategoriya, savat. Kurs va paketlar uchun ham',
    fields: [...HEAD, F.sel('mode', 'Tugma vazifasi', [['cart', 'Savatga qo\'shish (buyurtma)'], ['inquiry', 'So\'rov qoldirish (kurs, xizmat)'], ['brief', 'Buyurtma anketasini ochish (loyiha so\'rovi)']]), F.text('buttonText', 'Tugma matni', { max: 30, ph: 'Savatga' }),
      F.sel('columns', 'Ustunlar', [['3', '3 ta'], ['4', '4 ta'], ['2', '2 ta']]), F.tog('search', 'Qidiruv'), F.tog('filters', 'Kategoriya tugmalari'), F.tog('sort', 'Saralash'),
      F.list('items', 'Mahsulotlar', { title: 'name', fields: productFields, add: () => ({ id: uid(), name: 'Yangi mahsulot', price: 0, oldPrice: 0, category: '', badge: '', description: '', image: '', stock: '', active: true }), idKey: 'id' })],
    defaults: () => ({ eyebrow: 'Katalog', title: 'Mahsulotlar', text: 'Tanlang va buyurtma bering.', mode: 'cart', buttonText: '', columns: '3', search: true, filters: true, sort: true, items: [{ id: uid(), name: 'Birinchi mahsulot', price: 100000, oldPrice: 0, category: 'Asosiy', badge: 'YANGI', description: 'Mahsulot haqida qisqa tavsif.', image: '', stock: '', active: true }, { id: uid(), name: 'Ikkinchi mahsulot', price: 250000, oldPrice: 300000, category: 'Asosiy', badge: '', description: 'Mahsulot haqida qisqa tavsif.', image: '', stock: '', active: true }, { id: uid(), name: 'Uchinchi mahsulot', price: 0, oldPrice: 0, category: 'Qo\'shimcha', badge: '', description: 'Narxi kelishiladi.', image: '', stock: '', active: true }] }),
    render(sec) {
      const items = arr(sec.items).filter((p) => p.active !== false); if (!items.length) return '';
      const cats = [...new Set(items.map((p) => p.category).filter(Boolean))];
      const st = (shop[sec.id] = shop[sec.id] || { q: '', cat: '', sort: '' });
      const tools = (sec.search || (sec.filters && cats.length > 1) || sec.sort) ? `<div class="shop-tools rv">
        ${sec.search ? `<label class="tsearch">${icon('search')}<input data-inp="shopq" data-sec="${esc(sec.id)}" type="search" placeholder="Qidirish…" value="${esc(st.q)}" autocomplete="off"></label>` : ''}
        ${sec.filters && cats.length > 1 ? `<div class="chips" data-chips="${esc(sec.id)}"><button data-act="shop-cat" data-sec="${esc(sec.id)}" data-cat="" class="${st.cat ? '' : 'on'}">Hammasi</button>${cats.map((c) => `<button data-act="shop-cat" data-sec="${esc(sec.id)}" data-cat="${esc(c)}" class="${st.cat === c ? 'on' : ''}">${text(c)}</button>`).join('')}</div>` : ''}
        ${sec.sort ? `<select class="tsort" data-chg="shopsort" data-sec="${esc(sec.id)}" aria-label="Saralash"><option value="">Saralash</option><option value="asc">Arzonroq</option><option value="desc">Qimmatroq</option><option value="sale">Chegirmalar</option><option value="name">Nomi bo'yicha</option></select>` : ''}</div>` : '';
      return E.wrap(sec, `${E.head(sec)}${tools}<div class="pgrid cols-${esc(sec.columns || '3')}" id="grid-${esc(sec.id)}">${cards(sec)}</div><div class="pempty" id="empty-${esc(sec.id)}" hidden>${icon('search')}<p>Hech narsa topilmadi</p><span>Boshqa so'z yoki kategoriyani sinab ko'ring.</span></div>`);
    },
  });
  function filtered(sec) {
    const st = shop[sec.id] || {}; let it = arr(sec.items).filter((p) => p.active !== false);
    if (st.q) { const q = st.q.toLowerCase(); it = it.filter((p) => `${p.name} ${p.category || ''} ${p.description || ''}`.toLowerCase().includes(q)); }
    if (st.cat) it = it.filter((p) => p.category === st.cat);
    if (st.sort === 'asc') it = it.slice().sort((a, b) => (a.price || 1e15) - (b.price || 1e15));
    if (st.sort === 'desc') it = it.slice().sort((a, b) => (b.price || 0) - (a.price || 0));
    if (st.sort === 'sale') it = it.filter((p) => p.oldPrice > p.price && p.price > 0);
    if (st.sort === 'name') it = it.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    return it;
  }
  function stockNote(p) { const s = p.stock; if (s === '' || s == null || Number(s) < 0) return ''; const n = Number(s); return n <= 0 ? '<span class="stk out">Tugagan</span>' : n <= 5 ? `<span class="stk low">Oxirgi ${n} dona</span>` : ''; }
  function actionBtn(sec, p, big) {
    const out = E.maxQty(p) <= 0 && (sec.mode || 'cart') === 'cart';
    if (out) return `<button class="btn ${big ? '' : 'sm'} dis" disabled>Tugagan</button>`;
    if ((sec.mode || 'cart') === 'brief') return `<button class="btn ${big ? '' : 'sm'}" data-act="brief-open" data-svc="${esc(p.id)}" data-name="${esc(p.name)}">${text(sec.buttonText || 'Buyurtma')} ${icon('arrow')}</button>`;
    if ((sec.mode || 'cart') === 'inquiry') return `<button class="btn ${big ? '' : 'sm'}" data-act="inq" data-name="${esc(p.name)}">${text(sec.buttonText || 'So\'rov qoldirish')}</button>`;
    return `<button class="btn ${big ? '' : 'sm'}" data-act="add" data-id="${esc(p.id)}">${icon('cart')} ${text(sec.buttonText || 'Savatga')}</button>`;
  }
  function cards(sec) {
    return filtered(sec).map((p, i) => {
      const off = p.oldPrice > p.price && p.price > 0 ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
      return `<article class="pcard in ${p.badge ? 'pop' : ''}" style="--d:${(i % 6) * 0.05}s"><div class="pimg" data-act="qv" data-sec="${esc(sec.id)}" data-id="${esc(p.id)}">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}
        <div class="bdg">${p.badge ? `<span class="badge">${text(p.badge)}</span>` : ''}${off ? `<span class="badge sale">−${off}%</span>` : ''}</div><span class="qvb">${icon('eye')} Tezkor ko'rish</span></div>
        <div class="pb">${p.category ? `<span class="tag">${text(p.category)}</span>` : ''}<h3>${text(p.name)}</h3>${p.description ? `<p>${text(p.description)}</p>` : '<p></p>'}${stockNote(p)}
        <div class="prow"><div class="pr">${E.price(p)}</div>${actionBtn(sec, p)}</div></div></article>`;
    }).join('');
  }
  function refreshGrid(secId) {
    const sec = E.state().sections.find((s) => s.id === secId); if (!sec) return;
    const g = $('#grid-' + secId); if (!g) return;
    g.innerHTML = cards(sec); const none = !g.children.length; g.hidden = none; const em = $('#empty-' + secId); if (em) em.hidden = !none;
  }
  E.actions['shop-cat'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).cat = el.dataset.cat; $$(`[data-chips="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); refreshGrid(id); };
  E.changes['shopsort'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).sort = el.value; refreshGrid(id); };
  E.inputs['shopq'] = (el) => { const id = el.dataset.sec; (shop[id] = shop[id] || {}).q = el.value.trim(); refreshGrid(id); };
  E.inputs['navsearch'] = (el) => {
    const sec = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false); if (!sec) return;
    (shop[sec.id] = shop[sec.id] || {}).q = el.value.trim(); (shop[sec.id]).cat = ''; refreshGrid(sec.id);
    const si = $(`[data-inp="shopq"][data-sec="${sec.id}"]`); if (si) si.value = el.value; $$(`[data-chips="${sec.id}"] button`).forEach((b, i) => b.classList.toggle('on', i === 0));
    const s = document.getElementById(sec.id); if (s && el.value && s.getBoundingClientRect().top > innerHeight * 0.6) s.scrollIntoView({ behavior: 'smooth' });
  };
  E.actions['inq'] = (el) => { E.closeModal(); E.prefill(`Qiziqish: ${el.dataset.name}`); };
  E.actions['qv'] = (el) => {
    const sec = E.state().sections.find((s) => s.id === el.dataset.sec); const p = sec && arr(sec.items).find((x) => x.id === el.dataset.id); if (!p) return;
    const cart = (sec.mode || 'cart') === 'cart' && E.maxQty(p) > 0;
    E.openModal(`<div class="qv"><div class="qimg">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}${p.badge ? `<span class="badge">${text(p.badge)}</span>` : ''}</div>
      <div class="qinfo">${p.category ? `<span class="tag">${text(p.category)}</span>` : ''}<h3>${text(p.name)}</h3><div class="qprice">${E.price(p)}</div>${p.description ? `<p>${text(p.description)}</p>` : ''}${stockNote(p)}
      <div class="qrow">${cart ? `<div class="qty big"><button data-act="qv-dec" aria-label="Kamaytirish">−</button><span id="qvq">1</span><button data-act="qv-inc" aria-label="Ko'paytirish">+</button></div>` : ''}${cart ? `<button class="btn" data-focus data-act="qv-add" data-id="${esc(p.id)}">${icon('cart')} ${text(sec.buttonText || 'Savatga')}</button>` : actionBtn(sec, p, true)}</div></div></div>`, 'wide');
  };
  const qvn = () => $('#qvq');
  E.actions['qv-inc'] = () => { const n = qvn(); n.textContent = Math.min(99, +n.textContent + 1); };
  E.actions['qv-dec'] = () => { const n = qvn(); n.textContent = Math.max(1, +n.textContent - 1); };
  E.actions['qv-add'] = (el) => { if (E.addToCart(el.dataset.id, +qvn().textContent)) { E.closeModal(); E.toast('Savatga qo\'shildi'); } };

  /* =============== CATEGORIES =============== */
  define('categories', {
    label: 'Kategoriya kartochkalari', icon: 'layers', desc: 'Rasmli kategoriyalar: bosilsa katalog filtrlanadi',
    fields: [...HEAD, F.list('items', 'Kategoriyalar', { title: 'name', fields: [F.text('name', 'Kategoriya nomi (katalogdagi bilan bir xil)', { max: 60 }), F.img('image', 'Rasm')], add: () => ({ name: 'Yangi kategoriya', image: '' }), max: 8 })],
    defaults: () => ({ eyebrow: '', title: 'Kategoriyalar', text: '', items: [{ name: 'Asosiy', image: '' }, { name: 'Qo\'shimcha', image: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const target = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false);
      return E.wrap(sec, `${E.head(sec)}<div class="cats">${it.map((c, i) => `<a class="cat rv" style="--d:${(i % 5) * 0.06}s" href="${target ? '#' + esc(target.id) : '#'}" data-act="catgo" data-cat="${esc(c.name)}">${imgUrl(c.image) ? E.img(c.image, c.name) : `<div class="ph">${E.initial(c.name)}</div>`}<span>${text(c.name)}</span></a>`).join('')}</div>`);
    },
  });
  E.actions['catgo'] = (el, e) => {
    const sec = E.state().sections.find((s) => s.type === 'products' && s.enabled !== false); if (!sec) return;
    e.preventDefault(); (shop[sec.id] = shop[sec.id] || {}).cat = el.dataset.cat; (shop[sec.id]).q = '';
    $$(`[data-chips="${sec.id}"] button`).forEach((b) => b.classList.toggle('on', b.dataset.cat === el.dataset.cat));
    const si = $(`[data-inp="shopq"][data-sec="${sec.id}"]`); if (si) si.value = '';
    refreshGrid(sec.id); document.getElementById(sec.id).scrollIntoView({ behavior: 'smooth' });
  };

  /* =============== MENU (restoran, salon narxlari) =============== */
  const menuCat = {};
  define('menu', {
    label: 'Menyu / narxlar ro\'yxati', icon: 'utensils', desc: 'Restoran menyusi yoki salon xizmatlari narxi, kategoriya bo\'yicha',
    fields: [...HEAD, F.sel('mode', 'Tugma vazifasi', [['cart', 'Savatga qo\'shish (buyurtma)'], ['none', 'Faqat ko\'rsatish']]),
      F.list('items', 'Pozitsiyalar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 100 }), F.num('price', 'Narxi'), F.text('category', 'Kategoriya', { max: 60 }), F.area('description', 'Tavsif (tarkibi, davomiyligi)', { max: 300, rows: 2 }), F.text('tag', 'Belgi (ixtiyoriy)', { max: 24, ph: 'Achchiq, Yangi, 60 daqiqa' }), F.img('image', 'Rasm'), F.tog('active', 'Ko\'rsatish')], add: () => ({ id: uid(), name: 'Yangi pozitsiya', price: 0, category: 'Asosiy', description: '', tag: '', image: '', active: true }), idKey: 'id' })],
    defaults: () => ({ eyebrow: 'Menyu', title: 'Bizning menyu', text: '', mode: 'none', items: [{ id: uid(), name: 'Birinchi taom', price: 40000, category: 'Asosiy', description: 'Tarkibi: ...', tag: '', image: '', active: true }, { id: uid(), name: 'Ikkinchi taom', price: 55000, category: 'Asosiy', description: 'Tarkibi: ...', tag: 'Yangi', image: '', active: true }] }),
    render(sec) {
      const items = arr(sec.items).filter((p) => p.active !== false); if (!items.length) return '';
      const cats = [...new Set(items.map((p) => p.category || 'Boshqa'))];
      const cur = menuCat[sec.id] && cats.includes(menuCat[sec.id]) ? menuCat[sec.id] : cats[0];
      return E.wrap(sec, `${E.head(sec)}${cats.length > 1 ? `<div class="chips rv" data-menutabs="${esc(sec.id)}">${cats.map((c) => `<button data-act="menu-cat" data-sec="${esc(sec.id)}" data-cat="${esc(c)}" class="${c === cur ? 'on' : ''}">${text(c)}</button>`).join('')}</div>` : ''}<div class="menu" id="menu-${esc(sec.id)}">${menuRows(sec, cur)}</div>`);
    },
  });
  function menuRows(sec, cat) {
    return arr(sec.items).filter((p) => p.active !== false && (p.category || 'Boshqa') === cat).map((p) => `<div class="mrow in">${imgUrl(p.image) ? `<div class="mimg2">${E.img(p.image, p.name)}</div>` : ''}<div class="mtx"><div class="mt"><b>${text(p.name)}</b><i></i><span class="mp">${p.price > 0 ? E.fmt(p.price) : ''}</span></div>${p.description ? `<p>${text(p.description)}</p>` : ''}${p.tag ? `<span class="mtag">${text(p.tag)}</span>` : ''}</div>${(sec.mode || 'cart') === 'cart' && p.price > 0 ? `<button class="addc" data-act="add" data-id="${esc(p.id)}" aria-label="Savatga qo'shish">${icon('plus')}</button>` : ''}</div>`).join('');
  }
  E.actions['menu-cat'] = (el) => { const id = el.dataset.sec; menuCat[id] = el.dataset.cat; $$(`[data-menutabs="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); const sec = E.state().sections.find((s) => s.id === id); $('#menu-' + id).innerHTML = menuRows(sec, el.dataset.cat); };

  /* =============== GALLERY + LIGHTBOX =============== */
  define('gallery', {
    label: 'Galereya', icon: 'image', desc: 'Rasmlar: bosilsa kattalashadi',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['masonry', 'Turli o\'lchamli'], ['grid', 'Teng kvadratlar']]), F.list('items', 'Rasmlar', { title: 'caption', fields: [F.img('image', 'Rasm'), F.text('caption', 'Izoh', { max: 100 })], add: () => ({ image: '', caption: '' }) })],
    defaults: () => ({ eyebrow: 'Galereya', title: 'Ishlarimizdan namunalar', text: '', layout: 'masonry', items: [{ image: '', caption: 'Birinchi rasm' }, { image: '', caption: 'Ikkinchi rasm' }, { image: '', caption: 'Uchinchi rasm' }] }),
    render(sec) {
      const all = arr(sec.items); if (!all.length) return '';
      let n = -1;
      return E.wrap(sec, `${E.head(sec)}<div class="gal g-${esc(sec.layout || 'masonry')}">${all.map((x, i) => imgUrl(x.image) ? `<button class="gi rv" style="--d:${(i % 6) * 0.05}s" data-act="lb" data-sec="${esc(sec.id)}" data-i="${++n}" aria-label="${esc(x.caption || 'Rasm')}">${E.img(x.image, x.caption)}${x.caption ? `<span>${text(x.caption)}</span>` : ''}</button>` : `<div class="gi rv" style="--d:${(i % 6) * 0.05}s"><div class="ph">${E.initial(x.caption)}</div></div>`).join('')}</div>`);
    },
  });
  function showLb(secId, i) {
    const sec = E.state().sections.find((s) => s.id === secId); const it = arr(sec && sec.items).filter((x) => imgUrl(x.image)); if (!it.length) return;
    i = (i + it.length) % it.length; const x = it[i];
    E.openModal(`<div class="lb"><img src="${esc(imgUrl(x.image))}" alt="${esc(x.caption || '')}">${x.caption ? `<p>${text(x.caption)}</p>` : ''}${it.length > 1 ? `<button class="lbn prev" data-act="lb" data-sec="${esc(secId)}" data-i="${i - 1}" aria-label="Oldingi">${icon('left')}</button><button class="lbn next" data-act="lb" data-sec="${esc(secId)}" data-i="${i + 1}" aria-label="Keyingi">${icon('right')}</button>` : ''}</div>`, 'lbox');
    E.modalKey = (e) => { if (e.key === 'ArrowLeft') showLb(secId, i - 1); if (e.key === 'ArrowRight') showLb(secId, i + 1); };
  }
  E.actions['lb'] = (el) => showLb(el.dataset.sec, +el.dataset.i);

  /* =============== PROJECTS (portfolio) =============== */
  const projTag = {};
  define('projects', {
    label: 'Loyihalar (portfolio)', icon: 'briefcase', desc: 'Ishlaringiz: rasm, teglar, batafsil oyna',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['grid', 'Teng kartochkalar'], ['masonry', 'Turli o\'lchamli (rasmga qarab)']]), F.tog('filters', 'Teg bo\'yicha filtr'),
      F.list('items', 'Loyihalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 100 }), F.text('tags', 'Teglar (vergul bilan)', { max: 120, ph: 'Brending, Veb, Logo' }), F.text('year', 'Yil', { max: 10 }), F.img('image', 'Rasm'), F.area('description', 'Tavsif', { max: 800, rows: 4 }), F.text('link', 'Havola', { max: 200, ph: 'https://…' }), F.text('linkText', 'Havola matni', { max: 30, ph: 'Saytni ochish' })], add: () => ({ title: 'Yangi loyiha', tags: '', year: String(new Date().getFullYear()), image: '', description: '', link: '', linkText: '' }) })],
    defaults: () => ({ eyebrow: 'Portfolio', title: 'Tanlangan loyihalar', text: '', layout: 'grid', filters: true, items: [{ title: 'Birinchi loyiha', tags: 'Veb', year: '2025', image: '', description: 'Loyiha haqida: vazifa, yechim va natija.', link: '', linkText: '' }, { title: 'Ikkinchi loyiha', tags: 'Dizayn', year: '2025', image: '', description: 'Loyiha haqida: vazifa, yechim va natija.', link: '', linkText: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const tags = [...new Set(it.flatMap((p) => String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean)))];
      const cur = projTag[sec.id] && tags.includes(projTag[sec.id]) ? projTag[sec.id] : '';
      return E.wrap(sec, `${E.head(sec)}${sec.filters && tags.length > 1 ? `<div class="chips rv" data-ptags="${esc(sec.id)}"><button data-act="proj-tag" data-sec="${esc(sec.id)}" data-tag="" class="${cur ? '' : 'on'}">Hammasi</button>${tags.map((t) => `<button data-act="proj-tag" data-sec="${esc(sec.id)}" data-tag="${esc(t)}" class="${t === cur ? 'on' : ''}">${text(t)}</button>`).join('')}</div>` : ''}<div class="proj p-${esc(sec.layout || 'grid')}" id="proj-${esc(sec.id)}">${projCards(sec, cur)}</div>`);
    },
  });
  function projCards(sec, tag) {
    return arr(sec.items).map((p, i) => ({ p, i })).filter(({ p }) => !tag || String(p.tags || '').split(',').map((t) => t.trim()).includes(tag)).map(({ p, i }) => `<article class="pj in" data-act="proj" data-sec="${esc(sec.id)}" data-i="${i}" tabindex="0">${imgUrl(p.image) ? E.img(p.image, p.title) : `<div class="ph">${E.initial(p.title)}</div>`}<div class="pjo"><div><h3>${text(p.title)}</h3><span>${text(String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean).join(' · '))}${p.year ? ` · ${text(p.year)}` : ''}</span></div><i class="pja">${icon('external')}</i></div></article>`).join('');
  }
  E.actions['proj-tag'] = (el) => { const id = el.dataset.sec; projTag[id] = el.dataset.tag; $$(`[data-ptags="${id}"] button`).forEach((b) => b.classList.toggle('on', b === el)); const sec = E.state().sections.find((s) => s.id === id); $('#proj-' + id).innerHTML = projCards(sec, el.dataset.tag); };
  E.actions['proj'] = (el) => {
    const sec = E.state().sections.find((s) => s.id === el.dataset.sec); const p = sec && arr(sec.items)[+el.dataset.i]; if (!p) return;
    const l = linkUrl(p.link);
    E.openModal(`<div class="pd">${imgUrl(p.image) ? `<div class="pdi">${E.img(p.image, p.title)}</div>` : ''}<div class="pdt"><span class="tag">${text(String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean).join(' · '))}${p.year ? ` · ${text(p.year)}` : ''}</span><h3>${text(p.title)}</h3><p>${text(p.description).replace(/\n/g, '<br>')}</p>${l ? `<a class="btn" data-focus href="${esc(l)}" target="_blank" rel="noopener">${text(p.linkText || 'Ochish')} ${icon('external')}</a>` : ''}</div></div>`, 'wide');
  };

  /* =============== SKILLS =============== */
  define('skills', {
    label: 'Ko\'nikmalar', icon: 'zap', desc: 'Ko\'nikma darajalari: chiziqlar yoki teglar',
    fields: [...HEAD, F.sel('layout', 'Ko\'rinish', [['bars', 'Chiziqlar'], ['tags', 'Teglar']]), F.list('items', 'Ko\'nikmalar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.num('level', 'Daraja (0–100)', { min: 0, max: 100 })], add: () => ({ name: 'Yangi ko\'nikma', level: 80 }) })],
    defaults: () => ({ eyebrow: 'Ko\'nikmalar', title: 'Nimalarni bilaman', text: '', layout: 'bars', items: [{ name: 'Birinchi', level: 90 }, { name: 'Ikkinchi', level: 80 }, { name: 'Uchinchi', level: 70 }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const body = sec.layout === 'tags' ? `<div class="tagsw">${it.map((s, i) => `<span class="stag rv" style="--d:${(i % 8) * 0.04}s">${text(s.name)}</span>`).join('')}</div>` : `<div class="bars">${it.map((s, i) => `<div class="bar2 rv" style="--d:${(i % 6) * 0.06}s"><div class="bl"><b>${text(s.name)}</b><span>${Math.max(0, Math.min(100, Number(s.level) || 0))}%</span></div><div class="bt"><i style="--lv:${Math.max(0, Math.min(100, Number(s.level) || 0))}%"></i></div></div>`).join('')}</div>`;
      return E.wrap(sec, `${E.head(sec)}${body}`);
    },
  });

  /* =============== TIMELINE =============== */
  define('timeline', {
    label: 'Tajriba / vaqt chizig\'i', icon: 'clock', desc: 'Ish tajribasi, ta\'lim yoki kompaniya tarixi',
    fields: [...HEAD, F.list('items', 'Bosqichlar', { title: 'title', fields: [F.text('period', 'Davr', { max: 30, ph: '2022 – hozir' }), F.text('title', 'Lavozim / nomi', { max: 100 }), F.text('place', 'Joy', { max: 100 }), F.area('text', 'Tavsif', { max: 400, rows: 3 })], add: () => ({ period: '', title: 'Yangi bosqich', place: '', text: '' }) })],
    defaults: () => ({ eyebrow: 'Tajriba', title: 'Yo\'lim', text: '', items: [{ period: '2023 – hozir', title: 'Lavozim', place: 'Kompaniya', text: 'Nima bilan shug\'ullandim.' }, { period: '2020 – 2023', title: 'Oldingi lavozim', place: 'Kompaniya', text: 'Nima bilan shug\'ullandim.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="tl2">${it.map((t, i) => `<div class="ti rv" style="--d:${(i % 4) * 0.07}s"><div class="tp">${text(t.period)}</div><div class="td"></div><div class="tc"><h3>${text(t.title)}</h3>${t.place ? `<span class="tplace">${text(t.place)}</span>` : ''}${t.text ? `<p>${text(t.text)}</p>` : ''}</div></div>`).join('')}</div>`);
    },
  });

  /* =============== TEAM =============== */
  define('team', {
    label: 'Jamoa / ustalar', icon: 'users', desc: 'Odamlar: rasm, lavozim, qisqa tavsif',
    fields: [...HEAD, F.list('items', 'Odamlar', { title: 'name', fields: [F.text('name', 'Ism', { max: 60 }), F.text('role', 'Lavozim', { max: 80 }), F.img('image', 'Rasm'), F.area('text', 'Qisqa tavsif', { max: 200, rows: 2 })], add: () => ({ name: 'Yangi xodim', role: '', image: '', text: '' }) })],
    defaults: () => ({ eyebrow: 'Jamoa', title: 'Bizning jamoa', text: '', items: [{ name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }, { name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }, { name: 'Ism Familiya', role: 'Lavozim', image: '', text: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="team">${it.map((p, i) => `<div class="tm rv" style="--d:${(i % 4) * 0.07}s"><div class="tph">${imgUrl(p.image) ? E.img(p.image, p.name) : `<div class="ph">${E.initial(p.name)}</div>`}</div><h3>${text(p.name)}</h3>${p.role ? `<span class="role">${text(p.role)}</span>` : ''}${p.text ? `<p>${text(p.text)}</p>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== PRICING (tariflar) =============== */
  define('pricing', {
    label: 'Tariflar', icon: 'dollar', desc: 'Narx rejalari: xizmat paketlari, tanlansa so\'rov formasi ochiladi',
    fields: [...HEAD, F.list('items', 'Tariflar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.text('price', 'Narx', { max: 40, ph: '500 000 so\'m' }), F.text('period', 'Davr', { max: 30, ph: 'oyiga, bir martalik' }), F.lines('features', 'Nimalar kiradi (har qatorga bittadan)'), F.tog('popular', 'Tavsiya etiladi'), F.text('cta', 'Tugma matni', { max: 30, ph: 'Tanlash' })], add: () => ({ name: 'Yangi tarif', price: '', period: '', features: [], popular: false, cta: 'Tanlash' }) })],
    defaults: () => ({ eyebrow: 'Narxlar', title: 'Tariflar', text: '', items: [{ name: 'Start', price: '500 000 so\'m', period: '', features: ['Birinchi imkoniyat', 'Ikkinchi imkoniyat'], popular: false, cta: 'Tanlash' }, { name: 'Standart', price: '1 000 000 so\'m', period: '', features: ['Hammasi Start dagidek', 'Qo\'shimcha imkoniyat'], popular: true, cta: 'Tanlash' }, { name: 'Premium', price: '2 000 000 so\'m', period: '', features: ['Hammasi Standart dagidek', 'Shaxsiy menejer'], popular: false, cta: 'Tanlash' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="plans">${it.map((p, i) => `<div class="plan rv ${p.popular ? 'pop' : ''}" style="--d:${i * 0.08}s">${p.popular ? '<span class="badge">TAVSIYA</span>' : ''}<h3>${text(p.name)}</h3><div class="pamount">${text(p.price)}${p.period ? `<small>${text(p.period)}</small>` : ''}</div><ul>${arr(p.features).filter(Boolean).map((f) => `<li>${icon('check')}<span>${text(f)}</span></li>`).join('')}</ul><button class="btn ${p.popular ? '' : 'ghost'}" data-act="inq" data-name="Tarif: ${esc(p.name)}">${text(p.cta || 'Tanlash')}</button></div>`).join('')}</div>`);
    },
  });

  /* =============== TESTIMONIALS =============== */
  define('testimonials', {
    label: 'Mijozlar fikri', icon: 'quote', desc: 'Sharhlar: matn, ism, rasm, reyting',
    fields: [...HEAD, F.sel('layout', "Ko'rinish", [['grid', 'Kartochkalar'], ['wall', 'Harakatlanuvchi devor']]), F.list('items', 'Sharhlar', { title: 'name', fields: [F.area('text', 'Sharh', { max: 400, rows: 3 }), F.text('name', 'Ism', { max: 60 }), F.text('role', 'Kim ekani', { max: 80 }), F.img('image', 'Rasm'), F.num('stars', 'Reyting (1–5)', { min: 0, max: 5 })], add: () => ({ text: '', name: 'Mijoz ismi', role: '', image: '', stars: 5 }) })],
    defaults: () => ({ eyebrow: 'Sharhlar', title: 'Mijozlar nima deydi', text: '', items: [{ text: 'Juda yoqdi! Hammasi tez va sifatli bajarildi.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }, { text: 'Tavsiya qilaman, ishonchli jamoa.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }, { text: 'Narx va sifat mos keldi.', name: 'Mijoz ismi', role: 'Mijoz', image: '', stars: 5 }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      if (sec.layout === 'wall') {
        const one = (t) => `<figure class="tt">${Number(t.stars) > 0 ? `<div class="stars">${Array.from({ length: Math.min(5, Number(t.stars)) }, () => icon('star')).join('')}</div>` : ''}<blockquote>${text(t.text)}</blockquote><figcaption><div class="av">${imgUrl(t.image) ? E.img(t.image, t.name) : E.initial(t.name)}</div><div><b>${text(t.name)}</b>${t.role ? `<span>${text(t.role)}</span>` : ''}</div></figcaption></figure>`;
        const half = Math.ceil(it.length / 2), a = it.slice(0, half), b = it.slice(half).length ? it.slice(half) : it;
        const row = (list) => `<div class="row">${list.concat(list, list, list).map(one).join('')}</div>`;
        return `<section class="sec s-testimonials" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${E.head(sec)}</div><div class="wall">${row(a)}${row(b)}</div></section>`;
      }
      return E.wrap(sec, `${E.head(sec)}<div class="tst">${it.map((t, i) => `<figure class="tt rv" style="--d:${(i % 3) * 0.08}s">${Number(t.stars) > 0 ? `<div class="stars" aria-label="${Number(t.stars)} yulduz">${Array.from({ length: Math.min(5, Number(t.stars)) }, () => icon('star')).join('')}</div>` : ''}<blockquote>${text(t.text)}</blockquote><figcaption><div class="av">${imgUrl(t.image) ? E.img(t.image, t.name) : E.initial(t.name)}</div><div><b>${text(t.name)}</b>${t.role ? `<span>${text(t.role)}</span>` : ''}</div></figcaption></figure>`).join('')}</div>`);
    },
  });

  /* =============== FAQ =============== */
  define('faq', {
    label: 'Savol-javoblar', icon: 'help', desc: 'Ko\'p so\'raladigan savollar',
    fields: [...HEAD, F.list('items', 'Savollar', { title: 'q', fields: [F.text('q', 'Savol', { max: 160 }), F.area('a', 'Javob', { max: 600, rows: 3 })], add: () => ({ q: 'Yangi savol?', a: '' }) })],
    defaults: () => ({ eyebrow: 'Savollar', title: 'Ko\'p so\'raladigan savollar', text: '', items: [{ q: 'Birinchi savol?', a: 'Javob shu yerda.' }, { q: 'Ikkinchi savol?', a: 'Javob shu yerda.' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `<div class="faqw">${E.head(sec)}<div class="faq">${it.map((f, i) => `<details class="fi rv" style="--d:${(i % 5) * 0.05}s"><summary>${text(f.q)}<i>${icon('plus')}</i></summary><p>${text(f.a).replace(/\n/g, '<br>')}</p></details>`).join('')}</div></div>`);
    },
  });

  /* =============== CTA =============== */
  define('cta', {
    label: 'Taklif banneri', icon: 'gift', desc: 'Chiroyli banner: aksiya, taymer va tugma',
    fields: [F.text('eyebrow', 'Kichik yozuv', { max: 40 }), F.text('title', 'Sarlavha', { max: 120 }), F.area('text', 'Tavsif', { max: 300, rows: 2 }), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi'), F.text('countdownTo', 'Taymer tugash sanasi', { max: 30, ph: '2026-12-31', hint: 'Bo\'sh qoldirsangiz taymer ko\'rinmaydi. Format: YYYY-MM-DD' }), F.img('image', 'Rasm (ixtiyoriy)'), F.tog('fx', 'Animatsion nurli fon')],
    defaults: () => ({ fx: false, eyebrow: 'Maxsus taklif', title: 'Aksiya davom etmoqda', text: 'Taklifdan foydalanib qoling.', buttonText: 'Ko\'rish', buttonLink: '#', countdownTo: '', image: '' }),
    render(sec) {
      const until = sec.countdownTo ? (/^\d{4}-\d{2}-\d{2}$/.test(sec.countdownTo) ? sec.countdownTo + 'T23:59:59' : sec.countdownTo) : '';
      if (sec.fx) return E.wrap(sec, `<div class="ctab fxb rv"><div class="hfx" data-fx="aurora"></div><div class="ctx">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub" style="margin-inline:auto">${text(sec.text)}</p>` : ''}${until ? `<div class="count" data-until="${esc(until)}"></div>` : ''}<div style="margin-top:24px">${btn(sec.buttonText, sec.buttonLink, 'mag')}</div></div></div>`, 'tight');
      return E.wrap(sec, `<div class="ctab rv ${imgUrl(sec.image) ? 'hasimg' : ''}"><div class="ctx">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}${until ? `<div class="count" data-until="${esc(until)}"></div>` : ''}${btn(sec.buttonText, sec.buttonLink, 'mag')}</div>${imgUrl(sec.image) ? `<div class="cimg">${E.img(sec.image, '')}</div>` : ''}</div>`, 'tight');
    },
  });

  /* =============== CARDS (havolali kartochkalar / shablonlar vitrinasi) =============== */
  define('cards', {
    label: 'Havolali kartochkalar', icon: 'layers', desc: 'Rasmli kartochkalar: bosilsa havolaga o\'tadi',
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 80 }), F.text('badge', 'Belgi', { max: 24 }), F.area('text', 'Tavsif', { max: 200, rows: 2 }), F.img('image', 'Rasm'), F.link('link', 'Havola')], add: () => ({ title: 'Yangi', badge: '', text: '', image: '', link: '#' }) })],
    defaults: () => ({ eyebrow: '', title: 'Tanlang', text: '', items: [{ title: 'Birinchi', badge: '', text: '', image: '', link: '#' }, { title: 'Ikkinchi', badge: '', text: '', image: '', link: '#' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="lcards">${it.map((c, i) => `<a class="lc rv" style="--d:${(i % 4) * 0.07}s" href="${esc(linkUrl(c.link) || '#')}"><div class="lci">${imgUrl(c.image) ? E.img(c.image, c.title) : `<div class="ph">${E.initial(c.title)}</div>`}${c.badge ? `<span class="badge">${text(c.badge)}</span>` : ''}</div><div class="lct"><h3>${text(c.title)}</h3>${c.text ? `<p>${text(c.text)}</p>` : ''}<span class="more">Ko'rish ${icon('arrow')}</span></div></a>`).join('')}</div>`);
    },
  });


  /* =============== BRIEF (buyurtma anketasi) =============== */
  const SVC_ICONS = ['globe', 'cart', 'send', 'phone', 'design', 'tool', 'code', 'zap', 'shield', 'chart', 'users', 'star'];
  define('brief', {
    label: 'Buyurtma anketasi', icon: 'edit', desc: "Mijozning xohishlarini bosqichma-bosqich so'raydigan anketa: xizmat, imkoniyatlar, dizayn, byudjet va aloqa",
    fields: [...HEAD, F.text('buttonText', 'Tugma matni', { max: 40, ph: "Anketani to'ldirish" }), F.text('promise', "Va'da (tugma ostida)", { max: 120, ph: "15 daqiqada aloqaga chiqamiz" }),
      F.lines('usp', 'Afzalliklar (har qatorga bittadan)'), F.tog('showEstimate', "Taxminiy narxni ko'rsatish"),
      F.list('services', 'Xizmat turlari', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.text('desc', 'Qisqa tavsif', { max: 120 }), F.icon('icon', 'Ikonka'), F.num('price', "Boshlang'ich narx", { min: 0, hint: "Taxminiy narx hisobi uchun" }), F.text('days', 'Muddat', { max: 30, ph: '5–10 kun' })], add: () => ({ id: uid(), name: 'Yangi xizmat', desc: '', icon: 'star', price: 0, days: '' }), idKey: 'id' }),
      F.list('features', 'Qo\'shimcha imkoniyatlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 60 }), F.num('price', "Qo'shimcha narx", { min: 0 }), F.text('types', 'Qaysi xizmatlar uchun (id lar, vergul bilan)', { max: 120, hint: "Bo'sh qoldirsangiz hammasi uchun ko'rinadi" })], add: () => ({ name: 'Yangi imkoniyat', price: 0, types: '' }) }),
      F.list('styles', 'Dizayn uslublari', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.text('desc', 'Tavsif', { max: 80 }), F.text('c1', '1-rang', { max: 9, ph: '#4f46e5' }), F.text('c2', '2-rang', { max: 9, ph: '#06b6d4' })], add: () => ({ name: 'Yangi uslub', desc: '', c1: '#4f46e5', c2: '#06b6d4' }) }),
      F.list('references', 'Namuna saytlar (rasm bilan)', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.img('image', 'Rasm')], add: () => ({ name: 'Namuna', image: '' }) }),
      F.lines('goals', 'Maqsadlar'), F.lines('budgets', 'Byudjet variantlari'), F.lines('deadlines', 'Muddat variantlari'), F.lines('languages', 'Sayt tillari'), F.lines('methods', "Aloqa usullari"), F.lines('times', 'Qulay vaqtlar'), F.lines('fieldsList', 'Faoliyat sohalari (tavsiyalar)'),
      F.text('successTitle', 'Muvaffaqiyat sarlavhasi', { max: 80 }), F.area('successText', 'Muvaffaqiyat matni', { max: 300, rows: 3 })],
    defaults: () => ({ eyebrow: 'Loyihani boshlang', title: 'Xohishlaringizni ayting, biz amalga oshiramiz', text: "3 daqiqalik anketa: nima kerakligini, qanday ko'rinishni va qancha byudjetni tanlaysiz. Qolganini biz hal qilamiz.", buttonText: "Anketani to'ldirish", promise: '15 daqiqada aloqaga chiqamiz', showEstimate: true,
      usp: ["Aniq narx va muddat: suhbatdan keyin shartnoma", "Bepul maslahat va g'oyalar", "Natijaga kafolat"],
      services: [{ id: 'sayt', name: 'Veb-sayt', desc: 'Vizitka, korporativ yoki landing sahifa', icon: 'globe', price: 2500000, days: '5–10 kun' }, { id: 'dokon', name: "Onlayn do'kon", desc: "Katalog, savat va to'lov bilan", icon: 'cart', price: 6900000, days: '2–3 hafta' }, { id: 'bot', name: 'Telegram bot', desc: 'Buyurtma va aloqani avtomatlashtirish', icon: 'send', price: 3200000, days: '1–2 hafta' }],
      features: [{ name: 'Admin panel', price: 800000, types: '' }, { name: "Ko'p tillilik", price: 500000, types: '' }, { name: 'SEO sozlash', price: 400000, types: 'sayt,dokon' }],
      styles: [{ name: 'Zamonaviy', desc: 'Toza va yorqin', c1: '#4f46e5', c2: '#06b6d4' }, { name: 'Minimal', desc: 'Oq-qora, aniq', c1: '#111111', c2: '#e8452c' }, { name: 'Premium', desc: 'Qora va oltin', c1: '#d4a64a', c2: '#17110a' }],
      references: [], goals: ["Ko'proq mijoz jalb qilish", 'Onlayn sotuvni yo\'lga qo\'yish', 'Brend va ishonchni oshirish', 'Jarayonlarni avtomatlashtirish'],
      budgets: ["1–3 mln so'm", "3–7 mln so'm", "7–15 mln so'm", "15 mln so'mdan ko'p", "Maslahat kerak"], deadlines: ['Shoshilinch (1 hafta)', '2–3 hafta', '1 oy', 'Shoshilmayman'], languages: ["O'zbekcha", 'Ruscha', 'Inglizcha'],
      methods: ['Telefon', 'Telegram', 'WhatsApp', 'Email'], times: ['9:00–12:00', '12:00–17:00', '17:00–20:00', 'Istalgan vaqt'], fieldsList: ['Savdo', 'Restoran / kafe', "Ta'lim", 'Tibbiyot', "Go'zallik", 'Qurilish', 'Transport', 'Xizmat ko\'rsatish', 'IT'],
      successTitle: "So'rovingiz qabul qilindi!", successText: "Mutaxassisimiz ish vaqtida 15–30 daqiqa ichida, boshqa vaqtda keyingi ish kuni ertalab siz bilan bog'lanadi." }),
    render(sec) {
      const usp = arr(sec.usp).filter(Boolean);
      const steps = [['edit', "Anketa to'ldirasiz", '3 daqiqa'], ['tel', "Biz aloqaga chiqamiz", sec.promise || '15–30 daqiqa'], ['check', 'Narx va muddat kelishiladi', 'Bepul maslahat'], ['zap', 'Ish boshlanadi', "Har kuni hisobot"]];
      return E.wrap(sec, `<div class="briefb rv"><div class="bfl">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}
        ${usp.length ? `<ul class="pts">${usp.map((u) => `<li>${icon('check')}<span>${text(u)}</span></li>`).join('')}</ul>` : ''}
        <div class="bcta"><button class="btn mag" data-act="brief-open">${text(sec.buttonText || "Anketani to'ldirish")} ${icon('arrow')}</button>${sec.promise ? `<span class="prom">${icon('clock')} ${text(sec.promise)}</span>` : ''}</div></div>
        <div class="bsteps2">${steps.map(([i, t, d], k) => `<div class="bs2"><span class="n">${k + 1}</span><div><b>${text(t)}</b><small>${text(d)}</small></div><em>${icon(i)}</em></div>`).join('')}</div></div>`, 'tight');
    },
  });

  /* =============== CONTACT =============== */
  define('contact', {
    label: 'Aloqa va forma', icon: 'mail', desc: 'Aloqa ma\'lumotlari va xabar / bron / buyurtma formasi',
    fields: [...HEAD, F.sel('form', 'Forma turi', [['message', 'Oddiy xabar'], ['booking', 'Bron / yozilish (sana va vaqt bilan)'], ['order', 'Buyurtma (savat bilan)'], ['none', 'Forma yo\'q (faqat aloqa)']]),
      F.lines('serviceOptions', 'Xizmat ro\'yxati (bron uchun)', { show: (s) => s.form === 'booking', hint: 'Har bir qatorga bitta xizmat' }), F.tog('askGuests', 'Mehmonlar sonini so\'rash', { show: (s) => s.form === 'booking' }),
      F.tog('askAddress', 'Yetkazib berish manzilini so\'rash', { show: (s) => s.form === 'order' }), F.lines('payOptions', 'To\'lov usullari', { show: (s) => s.form === 'order', hint: 'Har bir qatorga bittadan' }),
      F.text('submitText', 'Tugma matni', { max: 40 }), F.text('mapUrl', 'Xarita havolasi', { max: 300, ph: 'https://maps.google.com/…' })],
    defaults: () => ({ eyebrow: 'Aloqa', title: 'Biz bilan bog\'laning', text: 'Raqamingizni qoldiring, tez orada aloqaga chiqamiz.', form: 'message', serviceOptions: [], askGuests: false, askAddress: true, payOptions: ['Naqd pul', 'Karta orqali'], submitText: '', mapUrl: '' }),
    render(sec, S) {
      const c = S.contacts || {}, rows = [];
      if (c.phone) rows.push(['tel', `<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${text(c.phone)}</a>`, 'Telefon']);
      if (c.email) rows.push(['mail', `<a href="mailto:${esc(c.email)}">${text(c.email)}</a>`, 'Email']);
      if (c.address) rows.push(['pin', text(c.address), 'Manzil']);
      if (c.hours) rows.push(['clock', text(c.hours), 'Ish vaqti']);
      if (c.telegram) { const u = String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, ''); rows.push(['send', `<a href="https://t.me/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`, 'Telegram']); }
      if (c.instagram) { const u = String(c.instagram).replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, ''); rows.push(['insta', `<a href="https://instagram.com/${esc(u)}" target="_blank" rel="noopener">@${text(u)}</a>`, 'Instagram']); }
      const form = sec.form || 'message';
      const info = `<div><span class="eyebrow">${text(sec.eyebrow)}</span><h2>${E.rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}<ul class="info">${rows.map(([i, h, l]) => `<li><em>${icon(i)}</em><span><small>${l}</small>${h}</span></li>`).join('')}</ul>${linkUrl(sec.mapUrl) ? `<a class="btn ghost sm" href="${esc(linkUrl(sec.mapUrl))}" target="_blank" rel="noopener">${icon('pin')} Xaritada ko'rish</a>` : ''}</div>`;
      const sel = (n, l, opts, label) => `<div class="fld sel"><select name="${n}" data-label="${esc(label || l)}">${opts.map((o) => `<option>${text(o)}</option>`).join('')}</select><label>${l}</label></div>`;
      const today = new Date().toISOString().slice(0, 10);
      let fields = `<div class="fld"><input name="name" placeholder=" " maxlength="100" autocomplete="name"><label>Ismingiz</label></div><div class="fld"><input name="phone" placeholder=" " maxlength="40" inputmode="tel" autocomplete="tel"><label>Telefon raqamingiz</label></div>`;
      if (form === 'booking') {
        const so = arr(sec.serviceOptions).filter(Boolean);
        fields += `${so.length ? sel('service', 'Xizmat', so, 'Xizmat') : ''}<div class="row2"><div class="fld dt"><input type="date" name="date" min="${today}" data-label="Sana"><label>Sana</label></div><div class="fld dt"><input type="time" name="time" data-label="Vaqt"><label>Vaqt</label></div></div>${sec.askGuests ? sel('guests', 'Mehmonlar soni', ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10+'], 'Mehmonlar soni') : ''}`;
      }
      if (form === 'order') {
        const pay = arr(sec.payOptions).filter(Boolean);
        fields += `${sec.askAddress ? `${sel('delivery', 'Qabul qilish usuli', ['Yetkazib berish', 'Olib ketish'], 'Qabul qilish usuli')}<div class="fld" data-addr><textarea name="address" rows="2" placeholder=" " data-label="Manzil"></textarea><label>Yetkazib berish manzili</label></div>` : ''}${pay.length ? sel('pay', 'To\'lov usuli', pay, 'To\'lov usuli') : ''}`;
      }
      fields += `<div class="fld"><textarea name="message" rows="3" placeholder=" "></textarea><label>${form === 'order' ? 'Izoh (ixtiyoriy)' : form === 'booking' ? 'Qo\'shimcha izoh' : 'Xabaringiz'}</label></div>`;
      const submit = sec.submitText || (form === 'booking' ? 'Yozilish' : form === 'order' ? 'Buyurtma berish' : 'Yuborish');
      const formH = form === 'none' ? '' : `<div class="fbox"><form id="contactForm" data-kind="${esc(form)}" novalidate>${form === 'order' ? '<div data-cartsum></div>' : ''}${fields}<div class="fmsg" role="alert"></div><button class="btn full" type="submit">${text(submit)} ${icon('arrow')}</button></form></div>`;
      return E.wrap(sec, `<div class="cbox rv ${form === 'none' ? 'one' : ''}">${info}${formH}</div>`);
    },
  });
  // Buyurtma formasida: "Olib ketish" tanlansa manzil maydoni yashirinadi
  document.addEventListener('change', (e) => {
    const s = e.target; if (!s || s.name !== 'delivery') return;
    const a = s.form.querySelector('[data-addr]'); if (a) a.hidden = s.value === 'Olib ketish';
  });
})();

'use strict';
// Yangi avlod bo'limlari: bayonot, bento, xizmatlar ro'yxati, gorizontal vitrina, logolar,
// rasm+matn qatorlari, video, xarita, oldin/keyin. sections.js dan keyin yuklanadi.
(function () {
  const E = window.E;
  const { esc, text, imgUrl, linkUrl, icon } = E;
  const F = E.F;
  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 100, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." }), F.area('text', 'Tavsif', { max: 300, rows: 2 })];
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const arr = (a) => (Array.isArray(a) ? a : []);
  const btn = (t, l, cls) => (t ? `<a class="btn ${cls || ''}" href="${esc(linkUrl(l) || '#')}">${text(t)}<span class="bi">${icon('arrow')}</span></a>` : '');
  const rich = (v) => E.rich(v);
  const num2 = (i) => String(i + 1).padStart(2, '0');
  const mkLink = (u) => esc(linkUrl(u) || '#');

  /* =============== BAYONOT (scroll bilan yonadigan katta matn) =============== */
  define('statement', {
    label: 'Katta bayonot', icon: 'quote', desc: "Katta matn: sahifa aylantirilganda so'zlar birma-bir yonadi",
    fields: [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.area('text', 'Matn', { max: 420, rows: 4, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." }),
      F.text('author', 'Muallif (ixtiyoriy)', { max: 60 }), F.text('role', 'Lavozimi', { max: 80 }), F.img('image', 'Muallif rasmi'), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi')],
    defaults: () => ({ eyebrow: 'Biz haqimizda', text: "Biz oddiy *saytlar* emas, mijozlaringizni egaga aylantiradigan *raqamli tajriba* yaratamiz.", author: '', role: '', image: '', buttonText: '', buttonLink: '#' }),
    render(sec) {
      if (!sec.text) return '';
      const parts = String(sec.text).split(/(\*[^*]+\*)/).filter(Boolean).map((seg) => {
        const em = /^\*[^*]+\*$/.test(seg); const raw = em ? seg.slice(1, -1) : seg; const w = raw.split(/\s+/).filter(Boolean).map((x) => `<span class="stw">${text(x)}</span>`).join(' ');
        return em ? `<em>${w}</em>` : (/^\s/.test(raw) ? ' ' : '') + w + (/\s$/.test(raw) ? ' ' : '');
      }).join('');
      const foot = (sec.author || sec.buttonText) ? `<div class="st-foot">${sec.author ? `<div class="who">${imgUrl(sec.image) ? E.img(sec.image, sec.author) : ''}<span><b>${text(sec.author)}</b>${text(sec.role)}</span></div>` : ''}${btn(sec.buttonText, sec.buttonLink, 'ghost')}</div>` : '';
      return E.wrap(sec, `${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span><br><br>` : ''}<p class="statement">${parts}</p>${foot}`);
    },
  });

  /* =============== BENTO =============== */
  define('bento', {
    label: 'Bento to\'r', icon: 'grid', desc: "Turli o'lchamli zamonaviy kartochkalar: matn, rasm, katta raqam",
    fields: [...HEAD, F.list('items', 'Kartochkalar', {
      title: 'title', fields: [
        F.sel('kind', "Turi", [['text', 'Ikonka + matn'], ['image', 'Rasm fonida'], ['stat', 'Katta raqam'], ['hl', "Rangli ajratilgan"]]),
        F.sel('size', "O'lcham", [['s', 'Kichik'], ['m', "O'rta"], ['l', 'Katta'], ['w', 'Keng'], ['f', "To'liq qator"]]), F.tog('tall', "Balandroq (2 qator)"),
        F.text('title', 'Sarlavha', { max: 70 }), F.area('text', 'Matn', { max: 220, rows: 2 }), F.text('value', 'Katta raqam / so\'z', { max: 14, show: (it) => ['stat', 'hl'].includes(it.kind) }),
        F.icon('icon', 'Ikonka', { show: (it) => ['text', 'hl'].includes(it.kind) }), F.img('image', 'Rasm', { show: (it) => it.kind === 'image' }), F.link('link', 'Havola (ixtiyoriy)')],
      add: () => ({ kind: 'text', size: 'm', tall: false, title: 'Yangi kartochka', text: '', value: '', icon: 'star', image: '', link: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Imkoniyatlar', title: 'Hammasi *bir joyda*', text: '', items: [
      { kind: 'image', size: 'w', tall: false, title: 'Birinchi imkoniyat', text: 'Qisqa tavsif', value: '', icon: 'star', image: '', link: '' },
      { kind: 'stat', size: 's', tall: false, title: 'mamnun mijoz', text: '', value: '500+', icon: 'star', image: '', link: '' },
      { kind: 'text', size: 'm', tall: false, title: 'Tez va sifatli', text: 'Qisqa tavsif', value: '', icon: 'zap', image: '', link: '' },
      { kind: 'hl', size: 'm', tall: false, title: 'Maxsus taklif', text: 'Qisqa tavsif', value: '24/7', icon: 'shield', image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const cell = (x, i) => {
        const k = x.kind || 'text', tag = linkUrl(x.link) ? 'a' : 'div', href = linkUrl(x.link) ? ` href="${esc(linkUrl(x.link))}"` : '';
        const cls = `bn ${esc(x.size || 'm')} ${x.tall ? 't' : ''} ${k === 'image' ? 'img' : k === 'hl' ? 'hl' : ''} rv t3`;
        const body = k === 'image' ? `${E.img(x.image, x.title)}<div class="bt"><h3>${text(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}</div>`
          : `${k === 'text' || k === 'hl' ? (x.icon && k === 'text' ? `<div class="bic">${icon(x.icon)}</div>` : '') : ''}${(k === 'stat' || k === 'hl') && x.value ? `<div class="big">${text(x.value)}</div>` : ''}<h3>${text(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}`;
        return `<${tag}${href} class="${cls}" style="--d:${(i % 4) * 0.07}s">${body}</${tag}>`;
      };
      return E.wrap(sec, `${E.head(sec)}<div class="bento">${it.map(cell).join('')}</div>`);
    },
  });

  /* =============== XIZMATLAR RO'YXATI =============== */
  define('services', {
    label: 'Xizmatlar ro\'yxati', icon: 'layers', desc: "Katta raqamlangan ro'yxat: ustiga borilsa rasm paydo bo'ladi",
    fields: [...HEAD, F.list('items', 'Xizmatlar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.area('text', 'Tavsif', { max: 260, rows: 2 }), F.lines('tags', 'Teglar', { hint: 'Har qatorga bittadan' }), F.img('image', "Ustiga borilganda ko'rinadigan rasm"), F.link('link', 'Havola (ixtiyoriy)')], add: () => ({ title: 'Yangi xizmat', text: '', tags: [], image: '', link: '' }), max: 10 })],
    defaults: () => ({ eyebrow: 'Xizmatlar', title: 'Biz *nima* qilamiz', text: '', items: [{ title: 'Birinchi xizmat', text: 'Qisqa tavsif.', tags: ['Teg'], image: '', link: '' }, { title: 'Ikkinchi xizmat', text: 'Qisqa tavsif.', tags: [], image: '', link: '' }, { title: 'Uchinchi xizmat', text: 'Qisqa tavsif.', tags: [], image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const row = (x, i) => { const l = linkUrl(x.link); const tag = l ? 'a' : 'div'; const tg = arr(x.tags).filter(Boolean);
        return `<${tag} class="srv rv" ${l ? `href="${esc(l)}"` : ''} ${imgUrl(x.image) ? `data-img="${esc(imgUrl(x.image))}"` : ''} style="--d:${(i % 5) * 0.06}s"><span class="n">${num2(i)}</span><div><h3>${text(x.title)}</h3>${tg.length ? `<div class="tags">${tg.map((t) => `<span>${text(t)}</span>`).join('')}</div>` : ''}</div><p>${text(x.text)}</p><span class="go">${icon('arrow')}</span></${tag}>`; };
      return E.wrap(sec, `${E.head(sec)}<div class="srvs">${it.map(row).join('')}<div class="srv-pv"><img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="></div></div>`);
    },
  });

  /* =============== VITRINA (gorizontal scroll) =============== */
  define('showcase', {
    label: 'Gorizontal vitrina', icon: 'image', desc: "Sahifa aylantirilganda yonga siljiydigan katta kartochkalar (ishlar, mahsulotlar)",
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.text('title', 'Nomi', { max: 60 }), F.text('tag', 'Kichik yozuv', { max: 50 }), F.img('image', 'Rasm'), F.link('link', 'Havola (ixtiyoriy)')], add: () => ({ title: 'Yangi', tag: '', image: '', link: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Portfolio', title: 'Tanlangan *ishlar*', text: '', items: [{ title: 'Birinchi ish', tag: 'Kategoriya', image: '', link: '' }, { title: 'Ikkinchi ish', tag: 'Kategoriya', image: '', link: '' }, { title: 'Uchinchi ish', tag: 'Kategoriya', image: '', link: '' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const card = (x, i) => { const l = linkUrl(x.link); const tag = l ? 'a' : 'div'; return `<${tag} class="hsc t3" ${l ? `href="${esc(l)}"` : ''} data-cursor="Ko'rish">${imgUrl(x.image) ? E.img(x.image, x.title) : ''}<span class="no">${num2(i)} / ${num2(it.length - 1)}</span><div class="in2"><div><h3>${text(x.title)}</h3><small>${text(x.tag)}</small></div><span class="go">${icon('arrow')}</span></div></${tag}>`; };
      return `<section class="sec s-showcase hs" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="hs-pin"><div class="hs-track"><div class="hs-intro">${sec.eyebrow ? `<span class="eyebrow">${text(sec.eyebrow)}</span>` : ''}<h2>${rich(sec.title)}</h2>${sec.text ? `<p class="sub">${text(sec.text)}</p>` : ''}</div>${it.map(card).join('')}</div><div class="hs-bar"><i></i></div></div></section>`;
    },
  });

  /* =============== LOGOLAR =============== */
  define('logos', {
    label: 'Hamkorlar lentasi', icon: 'award', desc: "Mijoz va hamkor nomlari yoki logolari: yuguruvchi lenta",
    fields: [F.text('title', 'Kichik sarlavha', { max: 80 }), F.list('items', 'Hamkorlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 40 }), F.img('image', 'Logo (ixtiyoriy)')], add: () => ({ name: 'Brend', image: '' }), max: 16 })],
    defaults: () => ({ title: 'Bizga ishonishadi', items: [{ name: 'Brend A', image: '' }, { name: 'Brend B', image: '' }, { name: 'Brend C', image: '' }, { name: 'Brend D', image: '' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && (x.name || imgUrl(x.image))); if (!it.length) return '';
      const row = `<span>${it.map((x) => (imgUrl(x.image) ? `<img src="${esc(imgUrl(x.image))}" alt="${esc(x.name)}">` : '') + (x.name ? text(x.name) : '')).join('</span><span>')}</span>`;
      return `<section class="sec s-logos logos" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="wrap">${sec.title ? `<div class="logos-t">${text(sec.title)}</div>` : ''}</div><div class="mq"><div class="track">${row}${row}${row}${row}</div></div></section>`;
    },
  });

  /* =============== RASM + MATN QATORLARI =============== */
  define('split', {
    label: 'Rasm + matn qatorlari', icon: 'layers', desc: "Navbat bilan chap/o'ngda katta rasm va matn; rasm sekin ochiladi",
    fields: [...HEAD, F.list('items', 'Qatorlar', { title: 'title', fields: [F.text('label', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 90 }), F.area('text', 'Matn', { max: 400, rows: 3 }), F.lines('bullets', 'Punktlar', { hint: 'Har qatorga bittadan' }), F.img('image', 'Rasm'), F.text('buttonText', 'Tugma matni', { max: 40 }), F.link('buttonLink', 'Tugma havolasi')], add: () => ({ label: '', title: 'Yangi qator', text: '', bullets: [], image: '', buttonText: '', buttonLink: '#' }), max: 8 })],
    defaults: () => ({ eyebrow: '', title: '', text: '', items: [{ label: '01', title: 'Birinchi *afzallik*', text: 'Batafsil tavsif.', bullets: ['Birinchi punkt', 'Ikkinchi punkt'], image: '', buttonText: '', buttonLink: '#' }, { label: '02', title: 'Ikkinchi afzallik', text: 'Batafsil tavsif.', bullets: [], image: '', buttonText: '', buttonLink: '#' }] }),
    render(sec) {
      const it = arr(sec.items); if (!it.length) return '';
      const row = (x, i) => `<div class="sprow ${i % 2 ? 'rev' : ''}"><div class="spm imr">${imgUrl(x.image) ? `<img data-par="0.07" src="${esc(imgUrl(x.image))}" alt="${esc(x.title)}" loading="lazy">` : ''}</div><div class="spt rv">${x.label ? `<span class="snum">${text(x.label)}</span>` : ''}<h3 class="big" data-split>${rich(x.title)}</h3>${x.text ? `<p>${text(x.text)}</p>` : ''}${arr(x.bullets).filter(Boolean).length ? `<ul>${arr(x.bullets).filter(Boolean).map((b) => `<li><i>${icon('check')}</i>${text(b)}</li>`).join('')}</ul>` : ''}${btn(x.buttonText, x.buttonLink, 'ghost')}</div></div>`;
      return E.wrap(sec, `${E.head(sec)}${it.map(row).join('')}`);
    },
  });

  /* =============== VIDEO =============== */
  define('video', {
    label: 'Video', icon: 'eye', desc: "Katta video oynasi: YouTube, Vimeo yoki o'zingiz yuklagan mp4",
    fields: [...HEAD, F.text('url', 'Video havolasi', { max: 300, ph: 'https://www.youtube.com/watch?v=…', hint: 'YouTube, Vimeo yoki .mp4 fayl manzili' }), F.img('poster', 'Muqova rasmi'), F.text('caption', 'Video ustidagi yozuv', { max: 80 })],
    defaults: () => ({ eyebrow: 'Video', title: 'Ish jarayonimizni *ko\'ring*', text: '', url: '', poster: '', caption: 'Ko\'rish' }),
    render(sec) {
      return E.wrap(sec, `${E.head(sec)}<div class="vid rv" data-cursor="Play">${imgUrl(sec.poster) ? E.img(sec.poster, sec.title) : ''}${sec.caption ? `<span class="vcap">${text(sec.caption)}</span>` : ''}<button class="vplay" data-act="video" data-src="${esc(sec.url || '')}" aria-label="Videoni ochish"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></button></div>`);
    },
  });

  /* =============== XARITA =============== */
  define('map', {
    label: 'Xarita va manzil', icon: 'pin', desc: "Google xaritasi, manzil, ish vaqti va telefon kartochkalari",
    fields: [...HEAD, F.text('query', 'Xarita qidiruvi', { max: 200, ph: 'Toshkent, Amir Temur ko\'chasi 1', hint: 'Manzil yoki koordinata (41.31,69.28). Bo\'sh bo\'lsa, aloqa manzili olinadi.' }), F.num('zoom', 'Masshtab (10–18)', { min: 10, max: 18 })],
    defaults: () => ({ eyebrow: 'Manzil', title: 'Bizni *toping*', text: '', query: '', zoom: 15 }),
    render(sec, S) {
      const c = S.contacts || {}; const q = String(sec.query || c.address || '').trim();
      const z = Math.max(10, Math.min(18, Number(sec.zoom) || 15));
      const frame = q ? `<iframe loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Xarita" src="https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=${z}&output=embed"></iframe>` : '<div class="ph" style="height:100%;min-height:420px;display:grid;place-items:center;color:var(--muted)">Manzil kiritilmagan</div>';
      const cards = [];
      if (c.address) cards.push(['Manzil', text(c.address)]);
      if (c.hours) cards.push(['Ish vaqti', text(c.hours)]);
      if (c.phone) cards.push(['Telefon', `<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${text(c.phone)}</a>`]);
      if (c.email) cards.push(['Email', `<a href="mailto:${esc(c.email)}">${text(c.email)}</a>`]);
      return E.wrap(sec, `${E.head(sec)}<div class="mapg"><div class="mapf rv">${frame}</div><div class="mapi">${cards.map(([k, v], i) => `<div class="mi rv" style="--d:${i * 0.08}s"><small>${k}</small><b>${v}</b></div>`).join('')}${q ? `<a class="btn" href="https://maps.google.com/maps?q=${encodeURIComponent(q)}" target="_blank" rel="noopener">Yo'nalish olish<span class="bi">${icon('arrow')}</span></a>` : ''}</div></div>`);
    },
  });

  /* =============== OLDIN / KEYIN =============== */
  define('compare', {
    label: 'Oldin / keyin', icon: 'refresh', desc: "Ikki rasm: slayder bilan solishtiriladi (natijalar, ta'mir, go'zallik)",
    fields: [...HEAD, F.img('before', 'Oldin (rasm)'), F.img('after', 'Keyin (rasm)'), F.text('labelBefore', 'Chap yozuv', { max: 20 }), F.text('labelAfter', "O'ng yozuv", { max: 20 })],
    defaults: () => ({ eyebrow: 'Natija', title: 'Oldin va *keyin*', text: '', before: '', after: '', labelBefore: 'Oldin', labelAfter: 'Keyin' }),
    render(sec) {
      if (!imgUrl(sec.before) || !imgUrl(sec.after)) return '';
      return E.wrap(sec, `${E.head(sec)}<div class="cmp rv" tabindex="0" role="slider" aria-label="Oldin va keyin" aria-valuemin="0" aria-valuemax="100" data-cursor="Suring">${E.img(sec.before, sec.labelBefore)}${E.img(sec.after, sec.labelAfter, 'af')}<span class="lb1">${text(sec.labelBefore)}</span><span class="lb2">${text(sec.labelAfter)}</span><i class="hd"></i></div>`);
    },
  });
})();

'use strict';
// Vizitka (link-in-bio) bo'limlari: profil kartasi, yo'nalishlar, narx ro'yxati, galereya, sharhlar, manzil.
// "vcard" bo'limi bor sayt vizitka rejimida chiqadi (menyu va katta footer yo'q), dizayn vcard.design orqali tanlanadi.
(function () {
  const E = window.E;
  const { esc, text, imgUrl, linkUrl, icon } = E;
  const F = E.F;
  const arr = (a) => (Array.isArray(a) ? a : []);
  const define = (type, def) => { E.sections[type] = def; E.order.push(type); };
  const rich = (v) => E.rich(v);

  E.vcDesigns = {
    emerald: "Zumrad: qorong'i yashil + oltin",
    midnight: "Yarim tun: ko'k neon",
    rose: 'Atirgul: nafis och pushti',
    gold: 'Oltin: qora + premium',
    clinic: 'Klinika: toza oq-feruza',
    sunset: 'Quyosh botishi: iliq gradient',
    mono: 'Minimal: oq-qora muharrir',
    ocean: "Dengiz: och ko'k",
    neon: 'Neon: binafsha-pushti',
    sand: 'Qum: iliq bej + terakota',
  };

  /* ---- Ijtimoiy tarmoqlar: tur -> ikonka, nom, havola ---- */
  const strip = (v) => String(v || '').trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?[^/]+\//i, '').replace(/\/+$/, '');
  const digits = (v) => String(v || '').replace(/\D/g, '');
  const SOC = {
    instagram: ['insta', 'Instagram', (v) => 'https://instagram.com/' + strip(v)],
    telegram: ['telegram', 'Telegram', (v) => 'https://t.me/' + strip(v)],
    whatsapp: ['whatsapp', 'WhatsApp', (v) => 'https://wa.me/' + digits(v)],
    youtube: ['youtube', 'YouTube', (v) => (/^@/.test(String(v).trim()) ? 'https://youtube.com/' + String(v).trim() : 'https://youtube.com/' + strip(v))],
    tiktok: ['tiktok', 'TikTok', (v) => 'https://tiktok.com/@' + strip(v)],
    facebook: ['facebook', 'Facebook', (v) => 'https://facebook.com/' + strip(v)],
    linkedin: ['linkedin', 'LinkedIn', (v) => 'https://linkedin.com/in/' + strip(v)],
    twitter: ['twitter', 'X (Twitter)', (v) => 'https://x.com/' + strip(v)],
    link: ['globe', 'Sayt', (v) => (/^https?:\/\//i.test(String(v).trim()) ? String(v).trim() : 'https://' + String(v).trim())],
    tel: ['tel', 'Telefon', (v) => 'tel:' + String(v).replace(/[^\d+]/g, '')],
    mail: ['mail', 'Email', (v) => 'mailto:' + String(v).trim()],
    pin: ['pin', 'Xarita', (v) => (/^https?:\/\//i.test(String(v).trim()) ? String(v).trim() : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(String(v).trim()))],
  };
  const socOpts = Object.keys(SOC).map((k) => [k, SOC[k][1]]);
  const socHref = (kind, v) => { const d = SOC[kind] || SOC.link; const x = String(v || '').trim(); if (!x) return ''; try { return linkUrl(d[2](x)); } catch { return ''; } };
  const ext = (h) => (/^https?:/i.test(h) ? ' target="_blank" rel="noopener"' : '');
  // Havola kartasi/tugma uchun: to'liq havola, @nom, telefon raqam yoki sayt manzili
  const smart = (u) => { const x = String(u || '').trim(); if (!x) return ''; const l = linkUrl(x); if (l) return l; if (/^(t\.me|wa\.me|instagram\.com|youtube\.com|youtu\.be|facebook\.com|tiktok\.com|linkedin\.com|maps\.google|goo\.gl)\//i.test(x) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(x)) return 'https://' + x; if (/^\+?[\d\s()-]{7,}$/.test(x)) return 'tel:' + x.replace(/[^\d+]/g, ''); return ''; };

  const HEAD = [F.text('eyebrow', 'Kichik yozuv', { max: 30 }), F.text('title', 'Sarlavha', { max: 80, hint: "So'zni *yulduzcha* ichiga olsangiz, nafis kursiv bo'ladi." })];
  const head = (sec) => (sec.title || sec.eyebrow ? `<div class="vch">${sec.eyebrow ? `<span class="vce">${text(sec.eyebrow)}</span>` : ''}${sec.title ? `<h2>${rich(sec.title)}</h2>` : ''}</div>` : '');
  const sect = (sec, cls, inner) => `<section class="vcs ${cls}" id="${esc(sec.id)}" data-sec="${esc(sec.id)}">${inner}</section>`;
  const stars = (n) => '★★★★★'.slice(0, Math.max(1, Math.min(5, Number(n) || 5)));

  /* =============== PROFIL KARTASI =============== */
  define('vcard', {
    label: 'Vizitka: profil kartasi', icon: 'user', desc: "Logotip, nom, tavsif, ko'rsatkichlar, havola kartalari va tarmoq ikonkalari",
    fields: [
      F.sel('design', 'Dizayn', Object.keys(E.vcDesigns).map((k) => [k, E.vcDesigns[k]]), { hint: "Rangni o'zgartirish: Sozlamalar → mavzu rangi." }),
      F.text('badge', 'Yuqoridagi yozuv', { max: 60 }), F.img('logoImage', 'Logotip yoki rasm'), F.text('logoText', 'Logotip harfi (rasm bo\'lmasa)', { max: 2 }), F.tog('verified', 'Tasdiqlangan belgisi'),
      F.text('name', 'Nomi', { max: 40 }), F.text('sub', 'Qo\'shimcha nom (qiya yozuv)', { max: 40 }), F.text('role', 'Qisqa yo\'nalish', { max: 60 }), F.area('text', 'Tavsif', { max: 320, rows: 3 }),
      F.list('stats', "Ko'rsatkichlar", { title: 'label', fields: [F.icon('icon', 'Ikonka'), F.num('value', 'Son'), F.text('suffix', 'Qo\'shimcha (+, %)', { max: 10 }), F.text('label', 'Yozuv', { max: 24 })], add: () => ({ icon: 'star', value: 10, suffix: '+', label: 'Yangi' }), max: 3 }),
      F.list('pills', 'Kichik yozuvlar (ish vaqti, shahar...)', { title: 'label', fields: [F.icon('icon', 'Ikonka'), F.text('label', 'Yozuv', { max: 30 })], add: () => ({ icon: 'clock', label: '9:00 – 20:00' }), max: 4 }),
      F.list('links', 'Havola kartalari', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 40 }), F.text('sub', 'Pastki yozuv', { max: 60 }), F.text('url', 'Havola, @nom yoki telefon', { max: 200 })], add: () => ({ icon: 'link', title: 'Yangi havola', sub: '', url: '' }), max: 10 }),
      F.list('socials', 'Ijtimoiy tarmoq ikonkalari', { title: 'kind', fields: [F.sel('kind', 'Tarmoq', socOpts), F.text('url', '@nom, raqam yoki havola', { max: 200 })], add: () => ({ kind: 'instagram', url: '' }), max: 8 }),
      F.text('ctaText', 'Asosiy tugma matni', { max: 40 }), F.text('ctaLink', 'Asosiy tugma havolasi (@nom, telefon, havola)', { max: 200 }),
    ],
    defaults: () => ({
      design: 'emerald', badge: 'Toshkent · 2020 yildan buyon', logoImage: '', logoText: 'N', verified: true, name: 'Nomingiz', sub: 'Yo\'nalishingiz', role: 'Asosiy xizmat', text: 'Kompaniyangiz yoki o\'zingiz haqingizda qisqa va aniq tavsif yozing.',
      stats: [{ icon: 'medal', value: 2020, suffix: '', label: 'Yildan buyon' }, { icon: 'users', value: 500, suffix: '+', label: 'Mijoz' }, { icon: 'compass', value: 5, suffix: '', label: 'Yo\'nalish' }],
      pills: [{ icon: 'clock', label: '9:00 – 20:00' }, { icon: 'calendar', label: 'Har kuni' }, { icon: 'pin', label: 'Toshkent' }],
      links: [{ icon: 'tel', title: 'Qo\'ng\'iroq qilish', sub: '+998 90 123 45 67', url: '+998901234567' }, { icon: 'telegram', title: 'Telegram', sub: '@nomingiz', url: 't.me/nomingiz' }, { icon: 'insta', title: 'Instagram', sub: '@nomingiz', url: 'instagram.com/nomingiz' }],
      socials: [{ kind: 'instagram', url: '@nomingiz' }, { kind: 'telegram', url: '@nomingiz' }, { kind: 'whatsapp', url: '+998901234567' }],
      ctaText: 'Bog\'lanish', ctaLink: '+998901234567',
    }),
    render(sec) {
      let n = 0; const st = () => `style="--i:${n++}"`;
      const av = imgUrl(sec.logoImage) ? `<img src="${esc(imgUrl(sec.logoImage))}" alt="${esc(sec.name || '')}">` : `<span>${text(String(sec.logoText || (sec.name || 'S')[0]).slice(0, 2))}</span>`;
      const stats = arr(sec.stats).filter((x) => x && x.label).slice(0, 3);
      const pills = arr(sec.pills).filter((x) => x && x.label);
      const links = arr(sec.links).filter((x) => x && x.title);
      const socs = arr(sec.socials).filter((x) => x && socHref(x.kind, x.url));
      const cta = sec.ctaText ? smart(sec.ctaLink) : '';
      return `<section class="vcs vcard" id="${esc(sec.id)}" data-sec="${esc(sec.id)}"><div class="vcbg" aria-hidden="true"><i></i><i></i><i></i></div>
        ${sec.badge ? `<div class="vcbadge" ${st()}><b></b>${text(sec.badge)}</div>` : ''}
        <div class="vcav" ${st()}><div class="vcring"><div class="vcin">${av}</div></div>${sec.verified ? `<em class="vcver" aria-label="Tasdiqlangan">${icon('check')}</em>` : ''}</div>
        <div class="vcid" ${st()}>${sec.name ? `<h1>${text(sec.name)}</h1>` : ''}${sec.sub ? `<p class="vcsub">${text(sec.sub)}</p>` : ''}${sec.role ? `<p class="vcrole">${text(sec.role)}</p>` : ''}</div>
        ${sec.text ? `<p class="vcbio" ${st()}>${text(sec.text)}</p>` : ''}
        ${stats.length ? `<div class="vcstats c${stats.length}" ${st()}>${stats.map((x) => `<div class="vcst"><span class="vci">${icon(x.icon)}</span><b data-count="${Number(x.value) || 0}" data-suf="${esc(x.suffix || '')}" data-plain="1">${Number(x.value) || 0}${text(x.suffix)}</b><small>${text(x.label)}</small></div>`).join('')}</div>` : ''}
        ${pills.length ? `<div class="vcpills" ${st()}>${pills.map((x) => `<span>${icon(x.icon)}${text(x.label)}</span>`).join('')}</div>` : ''}
        ${cta ? `<a class="vccta" ${st()} href="${esc(cta)}"${ext(cta)}>${text(sec.ctaText)}<span>${icon('arrow')}</span></a>` : ''}
        ${links.length ? `<div class="vcdiv" ${st()}><i></i>${icon('leaf')}<i></i></div><div class="vclinks">${links.map((x) => { const h = smart(x.url); const tag = h ? 'a' : 'div'; return `<${tag} class="vcl" ${st()}${h ? ` href="${esc(h)}"${ext(h)}` : ''}><span class="vci">${icon(x.icon)}</span><span class="vct"><b>${text(x.title)}</b>${x.sub ? `<small>${text(x.sub)}</small>` : ''}</span><span class="vca">${icon('arrow')}</span></${tag}>`; }).join('')}</div>` : ''}
        ${socs.length ? `<div class="vcsoc" ${st()}>${socs.map((x) => { const h = socHref(x.kind, x.url); return `<a href="${esc(h)}"${ext(h)} aria-label="${esc(SOC[x.kind] ? SOC[x.kind][1] : '')}">${icon((SOC[x.kind] || SOC.link)[0])}</a>`; }).join('')}</div>` : ''}
      </section>`;
    },
  });

  /* =============== YO'NALISHLAR (ikonkali kartalar) =============== */
  define('vcsvc', {
    label: "Vizitka: yo'nalishlar", icon: 'grid', desc: "Ikonkali kartochkalar: yo'nalish, xizmat yoki afzallik",
    fields: [...HEAD, F.list('items', 'Kartochkalar', { title: 'title', fields: [F.icon('icon', 'Ikonka'), F.text('title', 'Nomi', { max: 40 }), F.text('text', 'Qisqa tavsif', { max: 80 })], add: () => ({ icon: 'star', title: 'Yangi xizmat', text: '' }), max: 12 })],
    defaults: () => ({ eyebrow: '', title: "Yo'nalishlarimiz", items: [{ icon: 'book', title: 'Birinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'users', title: 'Ikkinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'star', title: 'Uchinchi yo\'nalish', text: 'Qisqa tavsif' }, { icon: 'zap', title: 'To\'rtinchi yo\'nalish', text: 'Qisqa tavsif' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.title); if (!it.length) return '';
      return sect(sec, 'vsvc', `${head(sec)}<div class="vcgrid n${it.length}">${it.map((x, i) => `<div class="vcc" style="--i:${i}"><span class="vci">${icon(x.icon)}</span><b>${text(x.title)}</b>${x.text ? `<small>${text(x.text)}</small>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== NARXLAR RO'YXATI =============== */
  define('vclist', {
    label: "Vizitka: narxlar ro'yxati", icon: 'percent', desc: "Xizmat nomi, qisqa izoh va narx (menyu, prays-list)",
    fields: [...HEAD, F.list('items', 'Qatorlar', { title: 'name', fields: [F.text('name', 'Nomi', { max: 50 }), F.text('desc', 'Izoh', { max: 80 }), F.text('price', 'Narx', { max: 30 })], add: () => ({ name: 'Yangi xizmat', desc: '', price: '100 000' }), max: 20 })],
    defaults: () => ({ eyebrow: 'Narxlar', title: 'Xizmatlar *narxi*', items: [{ name: 'Birinchi xizmat', desc: 'Qisqa izoh', price: '100 000' }, { name: 'Ikkinchi xizmat', desc: 'Qisqa izoh', price: '150 000' }, { name: 'Uchinchi xizmat', desc: 'Qisqa izoh', price: '250 000' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.name); if (!it.length) return '';
      return sect(sec, 'vlist', `${head(sec)}<div class="vcrows">${it.map((x, i) => `<div class="vcrow" style="--i:${i}"><span class="vcn"><b>${text(x.name)}</b>${x.desc ? `<small>${text(x.desc)}</small>` : ''}</span>${x.price ? `<span class="vcp">${text(x.price)}</span>` : ''}</div>`).join('')}</div>`);
    },
  });

  /* =============== GALEREYA =============== */
  define('vcgal', {
    label: 'Vizitka: galereya', icon: 'image', desc: "Yonga suriladigan rasmlar",
    fields: [...HEAD, F.list('items', 'Rasmlar', { title: 'caption', fields: [F.img('image', 'Rasm'), F.text('caption', 'Yozuv', { max: 50 })], add: () => ({ image: '', caption: '' }), max: 12 })],
    defaults: () => ({ eyebrow: 'Galereya', title: 'Ishlarimizdan *lavhalar*', items: [{ image: '', caption: 'Birinchi' }, { image: '', caption: 'Ikkinchi' }, { image: '', caption: 'Uchinchi' }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && imgUrl(x.image)); if (!it.length) return '';
      return sect(sec, 'vgal', `${head(sec)}<div class="vcscroll">${it.map((x, i) => `<figure style="--i:${i}"><img src="${esc(imgUrl(x.image))}" alt="${esc(x.caption || '')}" loading="lazy">${x.caption ? `<figcaption>${text(x.caption)}</figcaption>` : ''}</figure>`).join('')}</div>`);
    },
  });

  /* =============== SHARHLAR =============== */
  define('vcrev', {
    label: 'Vizitka: sharhlar', icon: 'quote', desc: 'Mijozlar fikri',
    fields: [...HEAD, F.list('items', 'Sharhlar', { title: 'name', fields: [F.area('text', 'Sharh', { max: 220, rows: 3 }), F.text('name', 'Ism', { max: 40 }), F.text('role', 'Kimligi', { max: 50 }), F.num('stars', 'Yulduz (1–5)')], add: () => ({ text: 'Juda yoqdi!', name: 'Mijoz', role: '', stars: 5 }), max: 8 })],
    defaults: () => ({ eyebrow: 'Sharhlar', title: 'Mijozlar *fikri*', items: [{ text: 'Juda yoqdi! Hammasi tez va sifatli bajarildi.', name: 'Mijoz ismi', role: 'Mijoz', stars: 5 }, { text: 'Tavsiya qilaman, ishonchli jamoa.', name: 'Mijoz ismi', role: 'Mijoz', stars: 5 }] }),
    render(sec) {
      const it = arr(sec.items).filter((x) => x && x.text); if (!it.length) return '';
      return sect(sec, 'vrev', `${head(sec)}<div class="vcrevs">${it.map((x, i) => `<blockquote style="--i:${i}"><div class="vcs5" aria-label="${esc(String(x.stars || 5))} yulduz">${stars(x.stars)}</div><p>${text(x.text)}</p><footer><b>${text(x.name)}</b>${x.role ? `<small>${text(x.role)}</small>` : ''}</footer></blockquote>`).join('')}</div>`);
    },
  });

  /* =============== MANZIL =============== */
  define('vcmap', {
    label: 'Vizitka: manzil', icon: 'pin', desc: "Manzil, mo'ljal va xaritada ochish tugmasi",
    fields: [...HEAD, F.text('address', 'Manzil', { max: 140 }), F.text('hint', "Mo'ljal", { max: 100 }), F.text('hours', 'Ish vaqti', { max: 60 }), F.text('buttonText', 'Tugma matni', { max: 30 }), F.text('buttonLink', "Xarita havolasi (bo'sh qolsa, manzildan yasaladi)", { max: 300 })],
    defaults: () => ({ eyebrow: '', title: 'Bizning *manzil*', address: "Toshkent shahri, Chilonzor tumani, Bunyodkor ko'chasi 10", hint: "Mo'ljal: metro bekati yonida", hours: 'Har kuni 9:00 – 20:00', buttonText: "Yo'nalish olish", buttonLink: '' }),
    render(sec) {
      if (!sec.address) return '';
      const h = smart(sec.buttonLink) || ('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(sec.address));
      return sect(sec, 'vmap', `${head(sec)}<div class="vcmapc"><span class="vci">${icon('pin')}</span><div class="vct"><b>${text(sec.address)}</b>${sec.hint ? `<small>${text(sec.hint)}</small>` : ''}${sec.hours ? `<small class="vch2">${icon('clock')}${text(sec.hours)}</small>` : ''}</div></div>${sec.buttonText ? `<a class="vccta ghost" href="${esc(h)}" target="_blank" rel="noopener">${text(sec.buttonText)}<span>${icon('arrow')}</span></a>` : ''}`);
    },
  });
})();

'use strict';
// Konstruktor ko'rinishida (preview): saytdagi matn ustiga bosib to'g'ridan-to'g'ri tahrirlash. Rasm ustiga bosilsa, tahrirlash paneli shu bo'limni ochadi.
(function () {
  if (!new URLSearchParams(location.search).has('preview')) return;
  let on = false, LD = null, sheet = null;
  const st = document.createElement('style');
  st.textContent = '.ied-on [data-ied]{outline:2px dashed #c8a86acc;outline-offset:3px;cursor:text!important;border-radius:4px}.ied-on a,.ied-on button{cursor:text}.ied-on img{cursor:pointer}.ied-sheet{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#fffdf9;color:#15110a;border-top:1px solid #e6dfd0;box-shadow:0 -18px 50px #15110a40;padding:14px 14px calc(14px + env(safe-area-inset-bottom));font:15px/1.4 -apple-system,Segoe UI,Roboto,Inter,sans-serif;animation:iedup .18s ease-out}@keyframes iedup{from{transform:translateY(30px);opacity:0}}.ied-sheet small{display:block;color:#6b6355;font-weight:600;margin-bottom:6px}.ied-sheet textarea{width:100%;box-sizing:border-box;border:1.5px solid #c8a86a;border-radius:12px;padding:12px;font:16px/1.4 inherit;font-family:inherit;color:#15110a;background:#fff;resize:none;outline:0;min-height:56px;max-height:38vh}.ied-sheet .r{display:flex;gap:8px;margin-top:10px}.ied-sheet button{flex:1;border:0;border-radius:12px;padding:13px;font:700 15px inherit;font-family:inherit;cursor:pointer}.ied-sheet .ok{background:linear-gradient(135deg,#e6d3a3,#c8a86a);color:#15110a}.ied-sheet .no{background:#efe8d8;color:#15110a}.ied-sheet .hint{font-size:12px;color:#6b6355;margin-top:6px}';
  document.head.appendChild(st);
  const norm = (s) => String(s == null ? '' : s).replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  const SKIP = /^(id|type|layout|fx|icon|ic|image\d*|logoImage|link|href|url|video|accent|color|bg|theme|tag|kind|size|enabled|anchor|key|slug|lang|template|font|shape|radius|spinText|price|value|qty)$/i, URLISH = /^(https?:|\/|#|data:|mailto:|tel:)/i;
  function leaves(o, base, out) {
    if (typeof o === 'string') { if (o && o.length <= 1500 && !URLISH.test(o)) out.push({ path: base, value: o }); } else if (Array.isArray(o)) o.forEach((v, i) => leaves(v, base.concat(i), out));
    else if (o && typeof o === 'object') for (const k of Object.keys(o)) { if (!SKIP.test(k)) leaves(o[k], base.concat(k), out); }
    return out;
  }
  function pool(el) {
    if (!LD) return [];
    const sec = el.closest('[data-sec]'); let scope = [];
    if (sec) { const i = (LD.sections || []).findIndex((s) => s.id === sec.dataset.sec); if (i > -1) scope = leaves(LD.sections[i], ['sections', i], []); }
    return scope.concat(leaves({ company: LD.company, announce: LD.announce, footer: LD.footer, nav: LD.nav, contacts: LD.contacts }, [], []));
  }
  function findText(el) {
    const p = pool(el);
    for (let n = el, d = 0; n && n !== document.body && d < 5; n = n.parentElement, d++) {
      const t = norm(n.textContent); if (!t || t.length > 700) continue;
      const hit = p.find((l) => norm(l.value) === t); if (hit) return { el: n, leaf: hit };
    }
    return null;
  }
  function bgUrl(el) { const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(el).backgroundImage || ''); return m ? m[1] : ''; }
  function findImage(el) {
    for (let n = el, d = 0; n && n !== document.body && d < 4; n = n.parentElement, d++) { const u = n.tagName === 'IMG' ? (n.currentSrc || n.src) : bgUrl(n); if (u) return n; }
    return null;
  }
  function closeSheet() { if (sheet) { sheet.remove(); sheet = null; parent.postMessage({ type: 'iedsheet', open: false }, '*'); } }
  function openSheet(hit) {
    closeSheet(); const el = hit.el; el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const lines = hit.leaf.value.split('\n').length, ta = document.createElement('textarea'); ta.value = hit.leaf.value; ta.rows = Math.min(6, Math.max(2, lines));
    sheet = document.createElement('div'); sheet.className = 'ied-sheet'; sheet.innerHTML = '<small>Matnni o\'zgartiring</small><div class="r"><button class="no" type="button">Bekor</button><button class="ok" type="button">Saqlash</button></div><div class="hint">*so\'z* — qiya (ajratilgan) ko\'rinadi</div>';
    sheet.insertBefore(ta, sheet.querySelector('.r')); document.body.appendChild(sheet); parent.postMessage({ type: 'iedsheet', open: true }, '*');
    const save = () => { const v = ta.value.slice(0, 1500); closeSheet(); if (v !== hit.leaf.value) parent.postMessage({ type: 'edit', path: hit.leaf.path, value: v }, '*'); };
    sheet.querySelector('.ok').onclick = save; sheet.querySelector('.no').onclick = closeSheet;
    ta.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSheet(); if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) save(); });
    setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 60);
  }
  addEventListener('message', (e) => {
    if (e.source !== parent || !e.data) return;
    if (e.data.type === 'site') { LD = e.data.data; if (on) setTimeout(mark, 80); }
    if (e.data.type === 'editmode') { on = !!e.data.on; document.documentElement.classList.toggle('ied-on', on); if (!on) closeSheet(); else mark(); }
  });
  // tahrirlanadigan joylarni belgilash (kompyuterda ko'rinadi)
  function mark() {
    document.querySelectorAll('[data-ied]').forEach((n) => n.removeAttribute('data-ied'));
    if (!on || !LD) return; let c = 0;
    document.querySelectorAll('h1,h2,h3,h4,p,li,span,a,button,small,b,em,strong,label').forEach((n) => { if (c > 400 || n.closest('.ied-sheet') || n.children.length > 3 || !n.textContent.trim()) return; const h = findText(n); if (h && h.el === n) { n.setAttribute('data-ied', ''); c++; } });
  }
  document.addEventListener('click', (e) => {
    if (!on || e.target.closest('.ied-sheet')) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const t = findText(e.target);
    if (t) return openSheet(t);
    const im = findImage(e.target);
    if (im) { const sec = im.closest('[data-sec]'); parent.postMessage({ type: 'opensec', sec: sec ? sec.dataset.sec : '', why: 'image' }, '*'); return; }
    const sec = e.target.closest('[data-sec]'); if (sec && e.target.textContent.trim()) parent.postMessage({ type: 'opensec', sec: sec.dataset.sec, why: 'text' }, '*');
  }, true);
  document.addEventListener('submit', (e) => { if (on) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  window.__ied = { findText };
  parent.postMessage({ type: 'iedready' }, '*');
})();

'use strict';
// Kinematik qatlam: WebGL fon, matn animatsiyalari, parallax, gorizontal scroll, kursor, kirish animatsiyasi.
// Hech qanday tashqi kutubxonasiz. E.hooks.afterRender orqali har renderdan keyin ishga tushadi.
(function () {
  const E = window.E; if (!E) return;
  const { $, $$ } = E;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const root = document.documentElement;
  const moOn = () => root.classList.contains('mo-on') && !reduce;
  let cleanups = [], items = [], rafId = 0, lastY = scrollY, vel = 0;

  /* ---------- Rang yordamchisi ---------- */
  function rgb(cssVar) {
    const s = document.createElement('i'); s.style.cssText = `position:absolute;visibility:hidden;color:var(${cssVar})`; document.body.appendChild(s);
    const m = getComputedStyle(s).color.match(/[\d.]+/g) || [0, 0, 0]; s.remove();
    return [m[0] / 255, m[1] / 255, m[2] / 255];
  }

  /* ---------- WebGL fon (akvarel-nur) ---------- */
  const VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  const FS = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c1,c2,c3,bg;uniform float k;uniform float mode;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/min(r.x,r.y);
  float T=t*.07;
  vec2 q=vec2(fbm(p*1.2+vec2(0.,T)),fbm(p*1.2+vec2(5.2,1.3)-T));
  vec2 w=vec2(fbm(p*1.5+2.*q+vec2(1.7,9.2)+T*1.3),fbm(p*1.5+2.*q+vec2(8.3,2.8)-T));
  float f=fbm(p*1.3+2.4*w);
  vec2 mp=(m*r-.5*r)/min(r.x,r.y);
  float md=length(p-mp);
  vec3 col=bg;
  if(mode<.5){
    col=mix(bg,c1,smoothstep(.25,.9,f)*k);
    col=mix(col,c2,smoothstep(.3,1.,length(q))*.75*k);
    col=mix(col,c3,smoothstep(.55,1.,w.x)*.55*k);
    float rib=pow(abs(sin((f*6.+w.y*3.)+T*3.)),12.);
    col+=c1*rib*.18*k;
  }else{
    float bands=smoothstep(.0,.9,abs(sin(f*9.+T*4.)));
    col=mix(bg,mix(c1,c2,uv.x),bands*.5*k);
    col=mix(col,c3,smoothstep(.6,1.,q.x)*.4*k);
  }
  col+=mix(c1,c3,.4)*.32*k*exp(-md*2.6);
  col*=1.-.4*smoothstep(.2,1.1,length(uv-.5)*1.4);
  col+=(h(gl_FragCoord.xy+t)-.5)*.022;
  gl_FragColor=vec4(col,1.);
}`;
  function startFx(host) {
    const cv = document.createElement('canvas'); cv.className = 'fxc'; host.prepend(cv);
    const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) { host.classList.add('nofx'); return () => {}; }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { host.classList.add('nofx'); return () => {}; }
    gl.useProgram(pr);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n) => gl.getUniformLocation(pr, n);
    const u = { r: U('r'), t: U('t'), m: U('m'), c1: U('c1'), c2: U('c2'), c3: U('c3'), bg: U('bg'), k: U('k'), mode: U('mode') };
    let w = 0, h = 0, run = true, vis = false, mx = 0.5, my = 0.5, tx = 0.5, ty = 0.5, t0 = performance.now(), last = 0;
    const dark = lumOf(rgb('--bg')) < 0.5;
    const paint = () => {
      const c1 = rgb('--acc'), c2 = rgb('--acc2'), c3 = rgb('--acc3'), bg = rgb('--bg');
      gl.uniform3fv(u.c1, c1); gl.uniform3fv(u.c2, c2); gl.uniform3fv(u.c3, c3); gl.uniform3fv(u.bg, bg);
      gl.uniform1f(u.k, dark ? 0.85 : 0.4); gl.uniform1f(u.mode, host.dataset.fx === 'waves' ? 1 : 0);
    };
    const size = () => { const sc = Math.min(devicePixelRatio || 1, 1.5) * 0.55; w = Math.max(2, Math.round(host.clientWidth * sc)); h = Math.max(2, Math.round(host.clientHeight * sc)); cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(u.r, w, h); };
    const frame = (now) => {
      if (!run) return; requestAnimationFrame(frame);
      if (!vis || document.hidden) return;
      if (now - last < 32) return; last = now;
      mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      gl.uniform1f(u.t, reduce ? 12 : (now - t0) / 1000); gl.uniform2f(u.m, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const mv = (e) => { const r = host.getBoundingClientRect(); tx = clamp((e.clientX - r.left) / r.width, 0, 1); ty = clamp(1 - (e.clientY - r.top) / r.height, 0, 1); };
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; }, { threshold: 0 }); io.observe(host);
    const ro = new ResizeObserver(size); ro.observe(host);
    addEventListener('pointermove', mv, { passive: true });
    size(); paint(); requestAnimationFrame(frame);
    host.classList.add('fx-ready');
    const repaint = () => paint(); addEventListener('fx-repaint', repaint);
    return () => { run = false; io.disconnect(); ro.disconnect(); removeEventListener('pointermove', mv); removeEventListener('fx-repaint', repaint); const ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); cv.remove(); };
  }
  const lumOf = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

  /* ---------- Matnni so'zlarga bo'lish ---------- */
  function splitWords(el) {
    let i = 0;
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const o = document.createElement('span'); o.className = 'wm';
          const s = document.createElement('span'); s.className = 'wi'; s.style.transitionDelay = (i * 0.05).toFixed(2) + 's'; s.textContent = p;
          o.appendChild(s); frag.appendChild(o); i++;
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== 'BR' && !c.classList.contains('wm')) walk(c);
    });
    walk(el); el.classList.add('spl');
  }

  /* ---------- Scroll hisoblari ---------- */
  const reg = (el, fn, opts) => {
    const o = Object.assign({ el, fn, vis: true }, opts);
    items.push(o);
    const io = new IntersectionObserver((es) => { o.vis = es[0].isIntersecting; if (o.vis) schedule(); }, { rootMargin: '20% 0px 20% 0px' });
    io.observe((opts && opts.watch) || el); cleanups.push(() => io.disconnect());
    return o;
  };
  const schedule = () => { if (!rafId) rafId = requestAnimationFrame(tick); };
  function tick() {
    rafId = 0;
    const y = scrollY, vh = innerHeight; vel += ((y - lastY) - vel) * 0.25; lastY = y;
    for (const o of items) if (o.vis) o.fn(o.el, vh, y, vel);
    if (Math.abs(vel) > 0.15) schedule(); else vel = 0;
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => { items.forEach((o) => o.onResize && o.onResize()); schedule(); });

  function setupScroll() {
    // Parallax
    $$('[data-par]').forEach((el) => {
      const sp = parseFloat(el.dataset.par) || 0.12;
      reg(el, (e, vh) => { const r = e.parentElement.getBoundingClientRect(); const c = r.top + r.height / 2 - vh / 2; e.style.setProperty('--py', clamp(-c * sp, -r.height * 0.068, r.height * 0.068).toFixed(1) + 'px'); }, { watch: el.parentElement });
    });
    // Hero chuqurligi
    $$('.hero').forEach((el) => reg(el, (e, vh, y) => { const r = e.getBoundingClientRect(); e.style.setProperty('--hp', clamp(-r.top / (r.height * 0.9), 0, 1).toFixed(3)); }));
    // Bayonot: so'zlar yonib boradi
    $$('.statement').forEach((el) => {
      const ws = $$('.stw', el); if (!ws.length) return;
      reg(el, (e, vh) => { const r = e.getBoundingClientRect(); const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.35), 0, 1.05); const n = Math.floor(p * ws.length * 1.04); ws.forEach((w, i) => w.classList.toggle('lit', i < n)); });
    });
    // Gorizontal scroll
    $$('.hs').forEach((hs) => {
      const pin = $('.hs-pin', hs), track = $('.hs-track', hs); if (!pin || !track) return;
      const off = () => matchMedia('(max-width:820px)').matches || reduce;
      const measure = () => { if (off()) { hs.style.height = ''; track.style.transform = ''; hs.classList.add('hs-off'); return; } hs.classList.remove('hs-off'); hs.style.height = (track.scrollWidth - pin.clientWidth + innerHeight * 0.9) + 'px'; };
      const o = reg(hs, (e, vh) => { if (off()) return; const r = e.getBoundingClientRect(); const max = track.scrollWidth - pin.clientWidth; const p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1); track.style.transform = `translate3d(${(-p * max).toFixed(1)}px,0,0)`; const bar = $('.hs-bar i', hs); if (bar) bar.style.transform = `scaleX(${p.toFixed(3)})`; }, { onResize: measure });
      measure(); setTimeout(measure, 600); $$('img', hs).forEach((im) => im.addEventListener('load', measure)); void o;
    });
    // Marquee tezlashishi
    $$('.mq .track').forEach((tr) => {
      const a = tr.getAnimations && tr.getAnimations()[0]; if (!a) return;
      reg(tr, () => { a.playbackRate = 1 + Math.min(5, Math.abs(vel) * 0.3); }, {});
      const t = setInterval(() => { if (Math.abs(vel) < 0.2 && a.playbackRate !== 1) a.playbackRate += (1 - a.playbackRate) * 0.2; }, 120); cleanups.push(() => clearInterval(t));
    });
  }

  /* ---------- Kursor (faqat sichqonchali qurilmalarda) ---------- */
  let cur = null;
  function setupCursor() {
    if (!fine || E.isPreview || cur) return;
    const dot = document.createElement('div'); dot.className = 'cur-dot'; const ring = document.createElement('div'); ring.className = 'cur-ring'; ring.innerHTML = '<span></span>';
    document.body.append(dot, ring); cur = { dot, ring };
    let x = -100, y = -100, rx = -100, ry = -100, shown = false;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; if (!shown) { shown = true; root.classList.add('cur-on'); rx = x; ry = y; } dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; root.classList.remove('cur-on'); });
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest ? e.target : null; if (!t) return;
      const lab = t.closest('[data-cursor]');
      ring.classList.toggle('hov', !!t.closest('a,button,summary,label,[data-act],input,textarea,select,.hs-track'));
      ring.classList.toggle('lab', !!lab); $('span', ring).textContent = lab ? lab.dataset.cursor : '';
    });
    document.addEventListener('pointerdown', () => ring.classList.add('down')); document.addEventListener('pointerup', () => ring.classList.remove('down'));
    (function loop() { rx += (x - rx) * 0.18; ry += (y - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); })();
  }

  /* ---------- Sichqoncha bilan o'ynash: 3D qiya, xizmatlar ro'yxati rasmi ---------- */
  addEventListener('pointermove', (e) => {
    if (!moOn()) return;
    const t3 = e.target.closest && e.target.closest('.t3');
    if (t3) { const r = t3.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5; t3.style.setProperty('--rx', (-py * 7).toFixed(2) + 'deg'); t3.style.setProperty('--ry', (px * 9).toFixed(2) + 'deg'); t3.style.setProperty('--gx', (px + 0.5) * 100 + '%'); t3.style.setProperty('--gy', (py + 0.5) * 100 + '%'); }
    const sv = e.target.closest && e.target.closest('.srvs');
    if (sv) { const pv = $('.srv-pv', sv); const row = e.target.closest('.srv'); if (pv) { const r = sv.getBoundingClientRect(); pv.style.transform = `translate(${e.clientX - r.left + 28}px,${e.clientY - r.top - 110}px)`; if (row && row.dataset.img) { const im = $('img', pv); if (im.getAttribute('src') !== row.dataset.img) im.src = row.dataset.img; pv.classList.add('on'); } else pv.classList.remove('on'); } }
  }, { passive: true });
  addEventListener('pointerout', (e) => {
    const t3 = e.target.closest && e.target.closest('.t3'); if (t3 && !t3.contains(e.relatedTarget)) { t3.style.setProperty('--rx', '0deg'); t3.style.setProperty('--ry', '0deg'); }
    const sv = e.target.closest && e.target.closest('.srvs'); if (sv && !sv.contains(e.relatedTarget)) { const pv = $('.srv-pv', sv); if (pv) pv.classList.remove('on'); }
  });

  /* ---------- Oldin/keyin slayderi ---------- */
  document.addEventListener('pointerdown', (e) => {
    const c = e.target.closest && e.target.closest('.cmp'); if (!c) return;
    const set = (ev) => { const r = c.getBoundingClientRect(); c.style.setProperty('--p', clamp(((ev.clientX - r.left) / r.width) * 100, 0, 100).toFixed(1) + '%'); };
    set(e); c.setPointerCapture && c.setPointerCapture(e.pointerId);
    const mv = (ev) => set(ev), up = () => { c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up); };
    c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up);
  });
  document.addEventListener('keydown', (e) => {
    const c = e.target.closest && e.target.closest('.cmp'); if (!c || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    const v = parseFloat(getComputedStyle(c).getPropertyValue('--p')) || 50; c.style.setProperty('--p', clamp(v + (e.key === 'ArrowLeft' ? -5 : 5), 0, 100) + '%');
  });

  /* ---------- Video ---------- */
  E.actions['video'] = (el) => {
    const src = el.dataset.src || ''; const box = el.closest('.vid'); if (!box) return;
    let yt = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/), vm = src.match(/vimeo\.com\/(\d+)/);
    let h = '';
    if (yt) h = `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>`;
    else if (vm) h = `<iframe src="https://player.vimeo.com/video/${vm[1]}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
    else if (/^(https?:\/\/|\/)[^\s"'<>]+\.(mp4|webm|mov)(\?.*)?$/i.test(src)) h = `<video src="${E.esc(src)}" controls autoplay playsinline></video>`;
    if (h) { box.classList.add('playing'); box.insertAdjacentHTML('beforeend', h); }
  };

  /* ---------- Kirish animatsiyasi ---------- */
  function intro() {
    if (!root.classList.contains('intro-on') || $('.intro')) return;
    try { sessionStorage.setItem('intro', '1'); } catch { /* ignore */ }
    const c = E.state().company || {};
    const d = document.createElement('div'); d.className = 'intro';
    d.innerHTML = `<div class="il"><span class="im">${E.text((c.logo || (c.name || 'S')[0]).slice(0, 2))}</span><b>${E.text(c.name || '')}</b></div><i class="ib"></i>`;
    document.body.appendChild(d);
    setTimeout(() => d.classList.add('out'), 1050); setTimeout(() => { d.remove(); root.classList.remove('intro-on'); }, 1900);
  }

  /* ---------- Asosiy ishga tushirish ---------- */
  function init() {
    cleanups.forEach((f) => { try { f(); } catch { /* ignore */ } }); cleanups = []; items = [];
    const on = moOn();
    if (!on) { $$('.sh').forEach((e) => e.classList.add('in')); return; }
    // Sarlavhalarni so'zma-so'z ochish
    $$('.sh h2,[data-split]').forEach((h) => { if (!h.classList.contains('spl')) splitWords(h); });
    if (E.isPreview) $$('.spl').forEach((h) => h.classList.add('in'));
    else {
      const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.25 });
      $$('.spl').forEach((h) => io.observe(h)); cleanups.push(() => io.disconnect());
    }
    // WebGL fon
    $$('[data-fx]').forEach((h) => { const stop = startFx(h); cleanups.push(stop); });
    // Rasm ochilishi
    if (!E.isPreview) {
      const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io2.unobserve(e.target); } }), { threshold: 0.18 });
      $$('.imr').forEach((h) => io2.observe(h)); cleanups.push(() => io2.disconnect());
    } else $$('.imr').forEach((h) => h.classList.add('in'));
    setupScroll(); setupCursor(); intro(); schedule();
  }
  const prev = E.hooks.afterRender;
  E.hooks.afterRender = () => { if (prev) prev(); init(); };
  E.motion = { init, startFx };
})();

'use strict';
// Buyurtma anketasi: mijozning xohishlarini 6 bosqichda so'raydigan master.
// Ma'lumot saytdagi "brief" bo'limidan olinadi (admin paneldan tahrirlanadi).
(function () {
  const E = window.E; if (!E) return;
  const { $, $$, esc, text, icon, imgUrl } = E;
  const KEY = 'brief_draft_v2';
  const arr = (a) => (Array.isArray(a) ? a : []);
  const STEPS = [['Xizmat', 'globe'], ['Biznes', 'briefcase'], ['Imkoniyatlar', 'zap'], ['Dizayn', 'design'], ['Muddat', 'calendar'], ['Aloqa', 'phone']];
  const PALETTES = [['#4f46e5', '#06b6d4', '#ec4899'], ['#16a34a', '#84cc16', '#f59e0b'], ['#0b78d1', '#12b5a6', '#7c5cff'], ['#d4a64a', '#17110a', '#f0d28a'], ['#e8452c', '#111111', '#f3ede2'], ['#d6457a', '#f08aa8', '#c9a063']];
  let sec = null, B = null, root = null, step = 0, busy = false, keyFn = null;

  const fresh = () => ({ v: 2, service: '', bizName: '', field: '', about: '', site: '', goals: [], features: [], extraWish: '', style: '', palette: -1, refs: [], links: ['', '', ''], langs: [], budget: '', deadline: '', note: '', cname: '', cphone: '', cemail: '', method: '', time: '', agree: true });
  const svcs = () => arr(sec.services);
  const svc = () => svcs().find((s) => s.id === B.service);
  const feats = () => arr(sec.features).filter((f) => { const t = String(f.types || '').split(',').map((x) => x.trim()).filter(Boolean); return !t.length || (B.service && t.includes(B.service)); });
  const estimate = () => { const s = svc(); if (!s) return 0; return (Number(s.price) || 0) + feats().filter((f) => B.features.includes(f.name)).reduce((a, f) => a + (Number(f.price) || 0), 0); };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ B, step })); } catch { /* ignore */ } };
  const clear = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };
  const tog = (a, v) => { const i = a.indexOf(v); if (i >= 0) a.splice(i, 1); else a.push(v); };

  /* ---------- Bosqichlar ---------- */
  const chips = (list, key, multi, cur) => `<div class="cps">${list.map((x) => `<button type="button" class="cp ${(multi ? cur.includes(x) : cur === x) ? 'on' : ''}" data-b="${key}" data-v="${esc(x)}">${text(x)}</button>`).join('')}</div>`;
  const fld = (key, label, val, o = {}) => `<div class="fld ${o.area ? 'ta' : ''}">${o.area ? `<textarea data-bi="${key}" rows="${o.rows || 3}" placeholder=" " maxlength="${o.max || 600}">${esc(val)}</textarea>` : `<input data-bi="${key}" value="${esc(val)}" placeholder=" " maxlength="${o.max || 120}" ${o.type ? `type="${o.type}"` : ''} ${o.list ? `list="${o.list}"` : ''} ${o.mode ? `inputmode="${o.mode}"` : ''} ${o.auto ? `autocomplete="${o.auto}"` : ''}>`}<label>${label}</label></div>`;
  const head = (t, d) => `<h3 class="bwtt">${t}</h3><p class="bd">${d}</p>`;

  function stepHtml(n) {
    if (n === 0) {
      return `${head('Qanday loyiha kerak?', "Xizmat turini tanlang. Keyingi bosqichlarda tafsilotlarni aniqlaymiz.")}<div class="opts">${svcs().map((s) => `<button type="button" class="opt ${B.service === s.id ? 'on' : ''}" data-b="svc" data-v="${esc(s.id)}"><span class="oi">${icon(s.icon)}</span><b>${text(s.name)}</b><small>${text(s.desc)}</small><span class="om">${Number(s.price) > 0 && sec.showEstimate !== false ? `<span class="op">${E.fmt(s.price)} dan</span>` : ''}${s.days ? `<span class="od">${icon('clock')} ${text(s.days)}</span>` : ''}</span><i class="ck">${icon('check')}</i></button>`).join('')}</div>`;
    }
    if (n === 1) {
      const fl = arr(sec.fieldsList).filter(Boolean);
      return `${head('Biznesingiz haqida', "Bu bizga sizga mos yechim va dizayn tanlashga yordam beradi.")}
        <div class="fgrid3">${fld('bizName', 'Kompaniya yoki brend nomi *', B.bizName, { auto: 'organization' })}${fld('field', 'Faoliyat sohasi', B.field, { list: 'bflds' })}</div>${fl.length ? `<datalist id="bflds">${fl.map((x) => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}
        ${fld('about', "Biznesingiz haqida qisqacha (nima qilasiz, kimlarga?)", B.about, { area: 1, rows: 3, max: 600 })}
        ${fld('site', "Mavjud sayt yoki Instagram / Telegram havolasi (bo'lsa)", B.site, { max: 200 })}
        ${arr(sec.goals).length ? `<label class="bl2">Loyihadan asosiy maqsadingiz <small>(bir nechtasini tanlash mumkin)</small></label>${chips(arr(sec.goals), 'goal', true, B.goals)}` : ''}`;
    }
    if (n === 2) {
      const f = feats();
      return `${head('Qanday imkoniyatlar kerak?', f.length ? "Kerakli imkoniyatlarni belgilang. Narx avtomatik hisoblanadi." : "Imkoniyatlarni suhbatda birgalikda aniqlaymiz.")}
        ${f.length ? `<div class="cps big">${f.map((x) => `<button type="button" class="cp ${B.features.includes(x.name) ? 'on' : ''}" data-b="feat" data-v="${esc(x.name)}"><span class="cx">${icon('check')}</span>${text(x.name)}${Number(x.price) > 0 && sec.showEstimate !== false ? `<em>+ ${E.fmt(x.price)}</em>` : ''}</button>`).join('')}</div>` : ''}
        ${fld('extraWish', "Boshqa istaklaringiz yoki aytmoqchi bo'lgan narsalar", B.extraWish, { area: 1, rows: 4, max: 800 })}`;
    }
    if (n === 3) {
      const st = arr(sec.styles), refs = arr(sec.references).filter((r) => imgUrl(r.image));
      return `${head('Qanday ko\'rinish yoqadi?', "Uslub, ranglar va yoqqan namunalarni tanlang. Hech biri yoqmasa, o'tkazib yuboring.")}
        ${st.length ? `<label class="bl2">Dizayn uslubi</label><div class="stys">${st.map((s) => `<button type="button" class="sty ${B.style === s.name ? 'on' : ''}" data-b="style" data-v="${esc(s.name)}"><span class="sp" style="background:linear-gradient(135deg,${esc(/^#[0-9a-f]{3,8}$/i.test(s.c1) ? s.c1 : '#4f46e5')},${esc(/^#[0-9a-f]{3,8}$/i.test(s.c2) ? s.c2 : '#06b6d4')})"><b>Aa</b></span><span class="sn">${text(s.name)}</span><small>${text(s.desc)}</small><i class="ck">${icon('check')}</i></button>`).join('')}</div>` : ''}
        <label class="bl2">Ranglar</label><div class="pals">${PALETTES.map((p, i) => `<button type="button" class="pal ${B.palette === i ? 'on' : ''}" data-b="pal" data-v="${i}" aria-label="Ranglar ${i + 1}">${p.map((c) => `<i style="background:${c}"></i>`).join('')}</button>`).join('')}<button type="button" class="cp ${B.palette === 98 ? 'on' : ''}" data-b="pal" data-v="98">Logotipimdagi ranglar</button><button type="button" class="cp ${B.palette === 99 ? 'on' : ''}" data-b="pal" data-v="99">Maslahat bering</button></div>
        ${refs.length ? `<label class="bl2">Yoqqan namunalar <small>(3 tagacha)</small></label><div class="refs">${refs.map((r) => `<button type="button" class="ref ${B.refs.includes(r.name) ? 'on' : ''}" data-b="ref" data-v="${esc(r.name)}"><img src="${esc(imgUrl(r.image))}" alt="" loading="lazy"><span>${text(r.name)}</span><i class="ck">${icon('check')}</i></button>`).join('')}</div>` : ''}
        <label class="bl2">Yoqqan saytlar havolasi <small>(ixtiyoriy)</small></label><div class="lnks">${[0, 1, 2].map((i) => `<div class="fld"><input data-bl="${i}" value="${esc(B.links[i])}" placeholder=" " maxlength="200"><label>${i + 1}-sayt havolasi</label></div>`).join('')}</div>
        ${arr(sec.languages).length ? `<label class="bl2">Sayt tili</label>${chips(arr(sec.languages), 'lang', true, B.langs)}` : ''}`;
    }
    if (n === 4) {
      const e = estimate(), s = svc();
      return `${head('Muddat va byudjet', "Taxminiy ma'lumot ham yetadi. Aniq narxni suhbatdan keyin kelishamiz.")}
        ${arr(sec.budgets).length ? `<label class="bl2">Byudjetingiz</label>${chips(arr(sec.budgets), 'budget', false, B.budget)}` : ''}
        ${arr(sec.deadlines).length ? `<label class="bl2">Qachon tayyor bo'lishi kerak?</label>${chips(arr(sec.deadlines), 'deadline', false, B.deadline)}` : ''}
        ${fld('note', "Qo'shimcha izoh", B.note, { area: 1, rows: 3, max: 800 })}
        ${sec.showEstimate !== false && s ? `<div class="est"><div><small>Taxminiy narx</small><b>${e ? E.fmt(e) + ' dan' : 'Kelishiladi'}</b></div><div><small>Taxminiy muddat</small><b>${text(s.days || 'Kelishiladi')}</b></div><p>Bu taxminiy hisob. Aniq narx va muddat vazifani muhokama qilgach belgilanadi.</p></div>` : ''}`;
    }
    const u = window.Auth && window.Auth.user && window.Auth.user();
    if (u) { B.cname = B.cname || u.name || ''; B.cphone = B.cphone || u.phone || ''; }
    return `${head("Siz bilan qanday bog'lanamiz?", "Mutaxassisimiz tez orada aloqaga chiqadi va barcha savollarga javob beradi.")}
      <div class="fgrid3">${fld('cname', 'Ismingiz *', B.cname || (u && u.name) || '', { auto: 'name' })}${fld('cphone', 'Telefon raqamingiz *', B.cphone || (u && u.phone) || '', { mode: 'tel', auto: 'tel', max: 40 })}</div>
      ${fld('cemail', 'Email (ixtiyoriy)', B.cemail || (u && u.email) || '', { type: 'email', auto: 'email' })}
      ${arr(sec.methods).length ? `<label class="bl2">Qanday bog'lanish qulay?</label>${chips(arr(sec.methods), 'method', false, B.method)}` : ''}
      ${arr(sec.times).length ? `<label class="bl2">Qulay vaqt</label>${chips(arr(sec.times), 'time', false, B.time)}` : ''}
      <label class="agree"><input type="checkbox" data-bi="agree" ${B.agree ? 'checked' : ''}><span class="tg2"></span><span>Ma'lumotlarim so'rovni ko'rib chiqish uchun ishlatilishiga roziman</span></label>`;
  }

  /* ---------- Yon panel: jonli xulosa ---------- */
  function summary() {
    const s = svc(), f = feats().filter((x) => B.features.includes(x.name)), e = estimate();
    if (!s) return `<p class="bnone">Xizmat turini tanlang, xulosa shu yerda paydo bo'ladi.</p>`;
    return `<div class="sl"><small>Xizmat</small><b>${text(s.name)}</b></div>${B.bizName ? `<div class="sl"><small>Biznes</small><b>${text(B.bizName)}</b></div>` : ''}
      ${f.length ? `<div class="sl"><small>Imkoniyatlar</small><ul>${f.map((x) => `<li>${icon('check')}${text(x.name)}</li>`).join('')}</ul></div>` : ''}
      ${B.style ? `<div class="sl"><small>Uslub</small><b>${text(B.style)}</b></div>` : ''}
      ${sec.showEstimate !== false ? `<div class="sl tot"><small>Taxminiy narx</small><b>${e ? E.fmt(e) + ' dan' : 'Kelishiladi'}</b></div>` : ''}${s.days ? `<div class="sl"><small>Muddat</small><b>${text(s.days)}</b></div>` : ''}`;
  }
  function side() {
    return `<aside class="bws"><div class="bwh"><span class="mark">${text((E.state().company.logo || (E.state().company.name || 'S')[0]).slice(0, 2))}</span><div><b>Loyiha anketasi</b><small>${text(E.state().company.name)}</small></div></div>
      <ol class="bstp">${STEPS.map(([l, i], k) => `<li class="${k === step ? 'act' : ''} ${k < step ? 'done' : ''}" data-b="goto" data-v="${k}"><span>${k < step ? icon('check') : icon(i)}</span>${l}</li>`).join('')}</ol>
      <div class="bsm" id="bsum">${summary()}</div>${sec.promise ? `<div class="bpr">${icon('clock')}<span>${text(sec.promise)}</span></div>` : ''}</aside>`;
  }

  /* ---------- Chizish ---------- */
  function paint() {
    const last = step === STEPS.length - 1;
    $('#bwb').innerHTML = `<div class="bstep in">${stepHtml(step)}</div>`;
    $('#bwf').innerHTML = `<button type="button" class="bk" data-b="back" aria-label="Orqaga" ${step === 0 ? 'hidden' : ''}>${icon('left')}<span class="t">Orqaga</span></button><span class="berr" id="berr" role="alert"></span><div class="bmini">${sec.showEstimate !== false && svc() ? `<small>Taxminan</small><b>${estimate() ? E.fmt(estimate()) : '—'}</b>` : ''}</div><button type="button" class="btn nx" data-b="${last ? 'submit' : 'next'}">${last ? "So'rovni yuborish" : step === 0 ? 'Davom etish' : 'Keyingi'} ${icon(last ? 'send' : 'arrow')}</button>`;
    $('#bwp i').style.width = `${((step + 1) / STEPS.length) * 100}%`;
    $('#bwt').textContent = `${step + 1} / ${STEPS.length}: ${STEPS[step][0]}`;
    $$('.bstp li').forEach((li, k) => { li.className = `${k === step ? 'act' : ''} ${k < step ? 'done' : ''}`; li.firstElementChild.innerHTML = k < step ? icon('check') : icon(STEPS[k][1]); });
    $('#bsum').innerHTML = summary(); $('#bwb').scrollTop = 0; save();
    const f = $('#bwb input[data-bi], #bwb textarea'); if (f && step !== 0 && matchMedia('(min-width:700px)').matches) setTimeout(() => f.focus({ preventScroll: true }), 120);
  }
  function refreshSide() { $('#bsum').innerHTML = summary(); const m = $('.bmini'); if (m) m.innerHTML = sec.showEstimate !== false && svc() ? `<small>Taxminan</small><b>${estimate() ? E.fmt(estimate()) : '—'}</b>` : ''; save(); }

  function validate(n) {
    if (n === 0 && !B.service) return 'Iltimos, xizmat turini tanlang';
    if (n === 1 && B.bizName.trim().length < 2) return 'Kompaniya yoki brend nomini kiriting';
    if (n === 5) {
      if (B.cname.trim().length < 2) return 'Ismingizni kiriting';
      if (!/^[+\d][\d\s()\-]{6,}$/.test(B.cphone.trim())) return "Telefon raqamini to'g'ri kiriting (masalan, +998 90 123 45 67)";
      if (B.cemail.trim() && !/^\S+@\S+\.\S+$/.test(B.cemail.trim())) return "Email noto'g'ri";
      if (!B.agree) return 'Davom etish uchun rozilikni belgilang';
    }
    return '';
  }
  const err = (m) => { const e = $('#berr'); if (e) { e.textContent = m; e.classList.toggle('show', !!m); } };
  function go(n) { if (n < 0 || n >= STEPS.length) return; step = n; paint(); }

  /* ---------- Yuborish ---------- */
  function compose() {
    const s = svc(), ps = B.palette >= 0 && B.palette < 98 ? PALETTES[B.palette].join(', ') : B.palette === 98 ? 'Logotipdagi ranglar' : B.palette === 99 ? 'Maslahat kerak' : '';
    const f = feats().filter((x) => B.features.includes(x.name)).map((x) => x.name);
    const links = B.links.map((x) => x.trim()).filter(Boolean);
    const extra = {}; const put = (k, v) => { if (v && String(v).trim()) extra[k] = String(v).trim().slice(0, 600); };
    put('Xizmat', s && s.name); put('Biznes nomi', B.bizName); put('Soha', B.field); put('Biznes haqida', B.about); put('Mavjud sayt', B.site); put('Maqsadlar', B.goals.join(', '));
    put('Imkoniyatlar', f.join(', ')); put('Boshqa istaklar', B.extraWish); put('Dizayn uslubi', B.style); put('Ranglar', ps); put('Namunalar', B.refs.join(', ')); put('Yoqqan saytlar', links.join(' | '));
    put('Tillar', B.langs.join(', ')); put('Byudjet', B.budget); put('Muddat', B.deadline); put('Taxminiy narx', estimate() ? `${E.money(estimate())} ${E.cur()} dan` : ''); put('Email', B.cemail); put('Aloqa usuli', B.method); put('Qulay vaqt', B.time);
    return { type: 'brief', name: B.cname.trim(), phone: B.cphone.trim(), message: B.note.trim(), items: [], extra, shipping: 0 };
  }
  async function submit() {
    if (busy) return;
    for (let n = 0; n <= 5; n++) { const m = validate(n); if (m) { if (n !== step) go(n); err(m); return; } }
    if (E.isPreview) { err("Ko'rinish rejimi: so'rov yuborilmaydi"); return; }
    if (E.account && E.account.needAuth('brief')) {
      const u = await window.Auth.modal({ title: 'So\'rovni yuborish uchun kiring', text: "Hisobingiz bo'lmasa, ro'yxatdan o'ting. So'rovingiz va uning holati hisobingizda saqlanadi." });
      if (!u) { err('Yuborish uchun hisobga kirish kerak'); return; }
      B.cname = B.cname || u.name; B.cphone = B.cphone || u.phone;
    }
    busy = true; const btn = $('.nx'); if (btn) { btn.disabled = true; btn.textContent = 'Yuborilmoqda…'; }
    const payload = compose();
    try { const r = await E.send(payload); success(r, payload); }
    catch (e) {
      busy = false; const b2 = $('.nx'); if (b2) { b2.disabled = false; b2.innerHTML = `So'rovni yuborish ${icon('send')}`; }
      if (e.status === 401 && E.account && E.account.on()) { err('Seans tugagan. Qayta urinib, hisobga kiring.'); return; }
      err(e.message);
    }
  }
  function success(r, payload) {
    busy = false; clear();
    const S = E.state(), c = S.contacts || {}, tg = c.telegram ? String(c.telegram).replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '') : '';
    const id = r.id || Math.random().toString(36).slice(2, 8);
    const u = window.Auth && window.Auth.user && window.Auth.user();
    $('.bwin').classList.add('fin');
    $('.bwin').innerHTML = `<div class="bwok"><div class="tick">${icon('check')}</div><h2>${text(r.mail ? 'Deyarli tayyor!' : (sec.successTitle || "So'rovingiz qabul qilindi!"))}</h2>
      <p class="sub">${text(r.mail ? "Pochta ilovangiz ochildi. Xabarni yuborishni unutmang, shundan keyin biz siz bilan bog'lanamiz." : (sec.successText || "Tez orada siz bilan bog'lanamiz."))}</p>
      ${r.ok ? `<div class="ref2">Murojaat raqami: <b>#${esc(id)}</b></div>` : ''}
      <div class="nxt"><div><span>1</span><b>Aloqa</b><small>${text(sec.promise || 'Tez orada qo\'ng\'iroq qilamiz')}</small></div><div><span>2</span><b>Muhokama</b><small>Vazifa, narx va muddat kelishiladi</small></div><div><span>3</span><b>Ish boshlanadi</b><small>Har kuni hisobot beramiz</small></div></div>
      <div class="bwa">${c.phone ? `<a class="btn ghost" href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ''))}">${icon('tel')} ${text(c.phone)}</a>` : ''}${tg ? `<a class="btn ghost" href="https://t.me/${esc(tg)}" target="_blank" rel="noopener">${icon('send')} Telegram</a>` : ''}${u && r.ok ? `<a class="btn ghost" href="/kabinet.html">${icon('user')} Kabinetim</a>` : ''}<button class="btn" data-b="close">Yopish</button></div></div>`;
  }

  /* ---------- Ochish / yopish ---------- */
  function close() {
    if (root) { root.remove(); root = null; }
    document.body.classList.remove('noscroll'); if (keyFn) { document.removeEventListener('keydown', keyFn); keyFn = null; }
  }
  function open(svcId) {
    sec = E.state().sections.find((s) => s.type === 'brief' && s.enabled !== false);
    if (!sec) { E.toast("Anketa hozircha mavjud emas"); return; }
    if (!svcs().length) { E.toast('Anketada xizmatlar kiritilmagan'); return; }
    B = fresh(); step = 0;
    try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && d.B && d.B.v === 2) { B = Object.assign(fresh(), d.B); if (!svc()) B.service = ''; step = Math.min(d.step || 0, 5); } } catch { /* ignore */ }
    if (svcId && svcs().some((s) => s.id === svcId)) { if (B.service !== svcId) { B.service = svcId; B.features = []; } if (step === 0) step = 1; }
    if (root) root.remove();
    root = document.createElement('div'); root.className = 'bw'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-label', 'Buyurtma anketasi');
    root.innerHTML = `<div class="bwback" data-b="close"></div><div class="bwin">${side()}<section class="bwm"><header><div class="bwt" id="bwt"></div><div class="bwp" id="bwp"><i></i></div><button type="button" class="bx" data-b="close" aria-label="Yopish">${icon('x')}</button></header><div class="bwb" id="bwb"></div><footer class="bwf" id="bwf"></footer></section></div>`;
    document.body.appendChild(root); document.body.classList.add('noscroll'); paint();
    keyFn = (e) => { if (!root) return; if (e.key === 'Escape') close(); else if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'checkbox') { e.preventDefault(); step === 5 ? submit() : next(); } };
    document.addEventListener('keydown', keyFn);
    root.addEventListener('click', onClick); root.addEventListener('input', onInput); root.addEventListener('change', onInput);
  }
  function next() { const m = validate(step); if (m) { err(m); return; } err(''); go(step + 1); }

  function onClick(e) {
    const t = e.target.closest('[data-b]'); if (!t) return;
    const k = t.dataset.b, v = t.dataset.v, one = (list, cur) => { $$(`[data-b="${k}"]`, root).forEach((x) => x.classList.toggle('on', x === t && cur)); };
    if (k === 'close') return close();
    if (k === 'next') return next();
    if (k === 'back') { err(''); return go(step - 1); }
    if (k === 'submit') return submit();
    if (k === 'goto') { const n = +v; if (n < step) go(n); else if (n === step + 1 || n <= step) { const m = validate(step); if (m) err(m); else go(n); } return; }
    err('');
    if (k === 'svc') { B.service = v; B.features = B.features.filter((x) => feats().some((f) => f.name === x)); one(null, true); refreshSide(); setTimeout(() => { if (root && step === 0) go(1); }, 260); return; }
    if (k === 'goal') { tog(B.goals, v); t.classList.toggle('on'); }
    if (k === 'feat') { tog(B.features, v); t.classList.toggle('on'); }
    if (k === 'lang') { tog(B.langs, v); t.classList.toggle('on'); }
    if (k === 'ref') { if (!B.refs.includes(v) && B.refs.length >= 3) { err('Eng ko\'pi bilan 3 ta namuna tanlash mumkin'); return; } tog(B.refs, v); t.classList.toggle('on'); }
    if (k === 'style') { B.style = B.style === v ? '' : v; one(null, !!B.style); }
    if (k === 'pal') { B.palette = B.palette === +v ? -1 : +v; $$('[data-b="pal"]', root).forEach((x) => x.classList.toggle('on', +x.dataset.v === B.palette)); }
    if (k === 'budget' || k === 'deadline' || k === 'method' || k === 'time') { B[k] = B[k] === v ? '' : v; one(null, !!B[k]); }
    refreshSide();
  }
  function onInput(e) {
    const t = e.target;
    if (t.dataset.bi) { B[t.dataset.bi] = t.type === 'checkbox' ? t.checked : t.value; if (t.dataset.bi === 'bizName') refreshSide(); else save(); }
    if (t.dataset.bl !== undefined) { B.links[+t.dataset.bl] = t.value; save(); }
    if (t.dataset.bi || t.dataset.bl !== undefined) err('');
  }

  E.actions['brief-open'] = (el) => open(el && el.dataset ? el.dataset.svc : '');
  E.openBrief = open;
})();
