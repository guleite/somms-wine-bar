// RSS e sitemap — usados pelo servidor e pela versão estática (scripts/build-static.js).
import { config } from '../config.js';
import { queryPosts } from './db.js';
import { escapeHtml } from './markdown.js';
import { img } from '../views/helpers.js';

export function rss() {
  const { items } = queryPosts({ perPage: 20 });
  const x = (s) => escapeHtml(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Diário de Adega · Somm's Wine Bar</title><link>${config.siteUrl}/blog</link><description>${x(config.site.tagline)}</description><language>pt-BR</language>
${items.map((p) => `<item><title>${x(p.title)}</title><link>${config.siteUrl}/blog/${p.slug}</link><guid>${config.siteUrl}/blog/${p.slug}</guid><pubDate>${new Date(p.published_at.replace(' ', 'T') + ':00-03:00').toUTCString()}</pubDate><description>${x(p.excerpt)}</description><enclosure url="${x(img(p.cover, 900))}" type="image/jpeg" length="0"/></item>`).join('\n')}
</channel></rss>`;
}

export function sitemap() {
  const { items } = queryPosts({ perPage: 1000 });
  const urls = ['/', '/blog', '/guia-centro-oeste', ...items.map((p) => `/blog/${p.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.siteUrl}${u}</loc></url>`).join('')}</urlset>`;
}

export function robots() {
  return config.pitchMode ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow: /admin\nDisallow: /api\nSitemap: ${config.siteUrl}/sitemap.xml\n`;
}
