import { config, WINE_STYLES } from '../config.js';
import { escapeHtml } from '../lib/markdown.js';

export const e = escapeHtml;
export const site = config.site;

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_FULL = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

export function fmtDate(s, full = false) {
  if (!s) return '';
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  if (!y) return '';
  return full ? `${d} de ${MONTHS_FULL[m - 1]} de ${y}` : `${d} ${MONTHS[m - 1]} ${y}`;
}
export function eventParts(s) {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return { day: String(d).padStart(2, '0'), month: MONTHS[m - 1], weekday: WEEKDAYS[wd], year: y };
}

/** Redimensiona imagens do Unsplash; demais URLs passam direto. */
export function img(url, w = 900) {
  if (!url) return '/assets/img/placeholder.svg';
  if (url.includes('images.unsplash.com')) return url.replace(/([?&])w=\d+/, `$1w=${w}`);
  return url;
}

export function styleInfo(slug) {
  return WINE_STYLES.find((s) => s.slug === slug) || null;
}
export function styleBadge(slug) {
  const s = styleInfo(slug);
  return s ? `<span class="style-badge"><i style="--dot:${s.color}"></i>${e(s.name)}</span>` : '';
}

export function waLink() {
  return site.whatsappUrl;
}

export function initials(name = '') {
  return name.split(/\s+/).filter((w) => /^[A-ZÀ-Ú]/.test(w)).slice(0, 2).map((w) => w[0]).join('') || 'S';
}

export function qs(params) {
  const p = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 1 && !(Array.isArray(v) && !v.length));
  return p.length ? '?' + p.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&') : '';
}

// Ícones de traço fino (24x24, currentColor)
const PATHS = {
  glass: '<path d="M7 3h10l-.6 6.2A4.4 4.4 0 0 1 12 13a4.4 4.4 0 0 1-4.4-3.8L7 3Z"/><path d="M12 13v7M8.5 21h7"/><path d="M7.4 7h9.2"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/><path d="M8 7h8M8 10.5h6"/>',
  bottle: '<path d="M10 2h4v4.5c0 1 1.7 2 2.3 3.6.4 1 .7 2.2.7 3.4V21a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-7.5c0-1.2.3-2.4.7-3.4C8.3 8.5 10 7.5 10 6.5V2Z"/><path d="M7 14h10v5H7z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2 6 6M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8"/>',
  plate: '<circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="3.5"/><path d="M3 3v6M5 3v6M3 6h2M4 9v12M21 3c-1.5 1-2 3-2 5s1 3 2 3v10"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M8 14h3v3H8z"/>',
  grape: '<circle cx="9" cy="10" r="2.3"/><circle cx="14" cy="10" r="2.3"/><circle cx="11.5" cy="14" r="2.3"/><circle cx="16.5" cy="14" r="2.3"/><circle cx="6.5" cy="14" r="2.3"/><circle cx="9" cy="18" r="2.3"/><circle cx="14" cy="18" r="2.3"/><path d="M11.5 7.7V3c2 0 4 1 5 2.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h10"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  pin: '<path d="M12 22s7-6.4 7-12a7 7 0 1 0-14 0c0 5.6 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/>',
  instagram: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/>',
  whatsapp: '<path d="M20 11.6A8.4 8.4 0 0 1 7.6 19L3 20.3l1.3-4.4A8.4 8.4 0 1 1 20 11.6Z"/><path d="M9 8.5c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c0 .2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5.4.7 1 1.4 1.7 1.9.5.3.8.5 1 .4l.7-.8c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.2.4.4 0 .4-.1 1-.6 1.4-.4.4-1.4.8-2.6.4a9 9 0 0 1-4.6-4.1c-.6-1.1-.4-2.2 0-2.9Z" fill="currentColor" stroke="none"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9h14v-9M12 8v13M12 8S10.5 3 8 3.6C6 4 6.8 8 12 8Zm0 0s1.5-5 4-4.4c2 .4 1.2 4.4-4 4.4Z"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 20h16"/>',
  share: '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
  link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  filter: '<path d="M3 5h18M6 12h12M10 19h4"/>',
  thermo: '<path d="M14 14.8V5a2 2 0 1 0-4 0v9.8a4 4 0 1 0 4 0Z"/><path d="M12 9v7"/>',
};
export function icon(name, cls = '') {
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[name] || PATHS.glass}</svg>`;
}
