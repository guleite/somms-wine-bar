// Gera a versão estática do site (para o GitHub Pages) em _site/.
//
//   node scripts/build-static.js
//
// O conteúdo vem do conteúdo de exemplo (seed), num banco temporário. Por não ter servidor:
// - os filtros e a busca do blog rodam no navegador (blog/index.json);
// - os formulários mostram o resultado (PDF, cupom) mas não salvam o contato;
// - o painel /admin não é publicado.
// Variáveis: BASE_PATH (padrão /somms-wine-bar), SITE_URL (padrão https://guleite.github.io/somms-wine-bar).
import { mkdirSync, rmSync, writeFileSync, cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

process.removeAllListeners('warning');
const BASE = (process.env.BASE_PATH ?? '/somms-wine-bar').replace(/\/+$/, '');
process.env.SITE_URL ||= 'https://guleite.github.io' + BASE;
const tmpDb = join(tmpdir(), `somms-static-${process.pid}-${Date.now()}.db`);
process.env.DB_PATH = tmpDb;

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '_site');

const { config, WINE_STYLES } = await import('../config.js');
const db = await import('../lib/db.js');
const pages = await import('../views/pages.js');
const { icon } = await import('../views/helpers.js');
const { rss, sitemap, robots } = await import('../lib/feeds.js');

// "/blog?x=1" -> "/somms-wine-bar/blog/?x=1"; arquivos (com extensão) só ganham o prefixo.
function fixPath(p) {
  const m = p.match(/^([^?#]*)(.*)$/);
  let path = m[1];
  if (path !== '/' && !/\.[a-z0-9]+$/i.test(path) && !path.endsWith('/')) path += '/';
  return BASE + path + m[2];
}
function rewrite(html) {
  return html
    .replace(/(\s(?:href|src|action|poster)=")(\/(?!\/)[^"]*)"/g, (_, a, p) => `${a}${fixPath(p)}"`)
    .replace('window.SOMMS={', `window.SOMMS={"base":${JSON.stringify(BASE)},"static":true,`);
}
function write(rel, content) {
  const file = join(OUT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// arquivos públicos (sem o painel e sem uploads)
cpSync(join(ROOT, 'public'), OUT, {
  recursive: true,
  filter: (src) => !/[\\/]public[\\/](admin|uploads)([\\/]|$)/.test(src),
});

const emptyFilters = { category: '', style: '', region: '', tag: '', q: '', sort: 'recentes', page: 1 };
write('index.html', rewrite(pages.homePage()));
write('blog/index.html', rewrite(pages.blogPage(emptyFilters)));
write('guia-centro-oeste/index.html', rewrite(pages.ebookPage()));
write('404.html', rewrite(pages.notFoundPage()));

const { items } = db.queryPosts({ perPage: 10000 });
for (const p of items) write(`blog/${p.slug}/index.html`, rewrite(pages.postPage(db.getPostBySlug(p.slug))));

// índice para filtrar e buscar no navegador
const index = {
  cats: Object.fromEntries(db.listCategories().map((c) => [c.slug, c.name])),
  styles: Object.fromEntries(WINE_STYLES.map((s) => [s.slug, s.name])),
  icons: { close: icon('close'), glass: icon('glass', 'empty-icon') },
  posts: items.map((p) => ({
    cat: p.category || '',
    style: p.wine_style || '',
    region: p.region || '',
    tags: String(p.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
    text: [p.title, p.subtitle, p.excerpt, p.content, p.tags].join(' ').toLowerCase(),
    date: p.published_at || p.updated_at || '',
    views: p.views || 0,
    rt: p.reading_time || 0,
    card: rewrite(pages.postCard(p)),
    wide: rewrite(pages.postCard(p, 'card-wide')),
  })),
};
write('blog/index.json', JSON.stringify(index));

write('feed.xml', rss());
write('sitemap.xml', sitemap());
write('robots.txt', robots());
write('.nojekyll', '');

db.db.close();
for (const f of [tmpDb, tmpDb + '-wal', tmpDb + '-shm']) if (existsSync(f)) rmSync(f, { force: true });
console.log(`Versão estática gerada em _site/ (${items.length} posts, base "${BASE || '/'}", site ${config.siteUrl})`);
