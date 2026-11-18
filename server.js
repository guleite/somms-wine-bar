// Somm's Wine Bar — servidor do site + blog + painel. Node puro (>= 22.13) com SQLite embutido.
import { createServer } from 'node:http';
import { readFile, writeFile, stat, mkdir } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';

process.removeAllListeners('warning'); // silencia o aviso "SQLite is experimental"

const { config, WINE_STYLES } = await import('./config.js');
const db = await import('./lib/db.js');
const { parseMarkdown, escapeHtml, slugify } = await import('./lib/markdown.js');
const pages = await import('./views/pages.js');
const { img } = await import('./views/helpers.js');

const ROOT = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(ROOT, 'public');
const UPLOADS = join(PUBLIC, 'uploads');
await mkdir(UPLOADS, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.woff2': 'font/woff2',
};

// ---------------------------------------------------------------- sessões (memória)
const sessions = new Map(); // token -> { user, expires }
const SESSION_MS = 1000 * 60 * 60 * 12;
const loginAttempts = new Map(); // ip -> { n, until }

function getSession(req) {
  const m = (req.headers.cookie || '').match(/(?:^|;\s*)somms_session=([a-f0-9]+)/);
  if (!m) return null;
  const s = sessions.get(m[1]);
  if (!s || s.expires < Date.now()) { sessions.delete(m[1]); return null; }
  s.expires = Date.now() + SESSION_MS;
  return { token: m[1], ...s };
}

// ---------------------------------------------------------------- utilitários http
function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff', ...extra });
  res.end(body);
}
const json = (res, status, data, extra) => send(res, status, JSON.stringify(data), MIME['.json'], extra);

async function readBody(req, limit = 1e6) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > limit) throw Object.assign(new Error('Conteúdo grande demais.'), { status: 413 });
    chunks.push(c);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error('JSON inválido.'), { status: 400 }); }
}

async function serveStatic(req, res, pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  if (safe.includes('..')) return false;
  let file = join(PUBLIC, safe);
  try {
    let st = await stat(file);
    if (st.isDirectory()) { file = join(file, 'index.html'); st = await stat(file); }
    const ext = extname(file).toLowerCase();
    const data = await readFile(file);
    const cache = ['.html', '.css', '.js'].includes(ext) ? 'no-cache' : pathname.startsWith('/uploads/') ? 'public, max-age=604800' : 'public, max-age=3600';
    send(res, 200, data, MIME[ext] || 'application/octet-stream', { 'Cache-Control': cache });
    return true;
  } catch {
    return false;
  }
}

function filtersFrom(url) {
  const g = (k) => (url.searchParams.get(k) || '').trim();
  return {
    category: g('categoria'),
    style: g('estilo'),
    region: g('regiao'),
    tag: g('tag').toLowerCase(),
    q: g('q').slice(0, 80),
    sort: ['recentes', 'populares', 'antigos', 'leitura'].includes(g('ordem')) ? g('ordem') : 'recentes',
    page: Number(g('pagina')) || 1,
  };
}

// ---------------------------------------------------------------- leads
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
async function handleLead(req, res) {
  const b = await readBody(req, 20000);
  const type = ['ebook', 'cupom', 'newsletter'].includes(b.type) ? b.type : null;
  if (!type) return json(res, 400, { error: 'Tipo de cadastro inválido.' });
  const email = String(b.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return json(res, 400, { error: 'Confira o seu e-mail.' });
  if (!b.consent) return json(res, 400, { error: 'Marque o aceite para continuar.' });
  const lead = {
    type,
    name: String(b.name || '').trim(),
    email,
    whatsapp: String(b.whatsapp || '').replace(/[^\d+()\s-]/g, '').trim(),
    source: String(b.source || '').trim(),
  };
  db.addLead(lead);
  if (config.leadWebhook) {
    fetch(config.leadWebhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...lead, site: 'somms-wine-bar', at: new Date().toISOString() }) })
      .catch((err) => console.warn('[lead webhook]', err.message));
  }
  const out = { ok: true };
  if (type === 'ebook') out.download = config.ebook.file;
  if (type === 'cupom') out.coupon = config.coupon.code;
  return json(res, 200, out);
}

// ---------------------------------------------------------------- API admin
function requireAuth(req, res) {
  const s = getSession(req);
  if (!s) { json(res, 401, { error: 'Faça login para continuar.' }); return null; }
  return s;
}

async function handleApi(req, res, url) {
  const { pathname } = url;
  const method = req.method;

  // ---- público
  if (pathname === '/api/leads' && method === 'POST') return handleLead(req, res);

  if (pathname === '/api/posts' && method === 'GET') {
    const admin = getSession(req);
    const f = filtersFrom(url);
    const r = db.queryPosts({
      ...f,
      perPage: Math.min(Number(url.searchParams.get('limite')) || 9, 100),
      includeDrafts: Boolean(admin && url.searchParams.get('todos')),
      status: url.searchParams.get('status') || '',
    });
    const fields = admin ? (p) => p : ({ content, ...rest }) => rest;
    return json(res, 200, { ...r, items: r.items.map(fields) });
  }

  if (pathname === '/api/meta' && method === 'GET') {
    const { cats, regions, tags } = db.facets();
    return json(res, 200, { categories: db.listCategories(), authors: db.listAuthors(), styles: WINE_STYLES, cats, regions, tags });
  }

  // ---- autenticação
  if (pathname === '/api/login' && method === 'POST') {
    const ip = req.socket.remoteAddress || '';
    const att = loginAttempts.get(ip) || { n: 0, until: 0 };
    if (att.until > Date.now()) return json(res, 429, { error: 'Muitas tentativas. Aguarde alguns minutos.' });
    const b = await readBody(req, 5000);
    const user = db.db.prepare('SELECT * FROM users WHERE username = ?').get(String(b.user || '').trim());
    if (!user || !db.checkPassword(String(b.pass || ''), user.hash)) {
      att.n += 1;
      if (att.n >= 5) { att.until = Date.now() + 5 * 60 * 1000; att.n = 0; }
      loginAttempts.set(ip, att);
      return json(res, 401, { error: 'Usuário ou senha incorretos.' });
    }
    loginAttempts.delete(ip);
    const token = randomBytes(24).toString('hex');
    sessions.set(token, { user: { id: user.id, username: user.username, name: user.name }, expires: Date.now() + SESSION_MS });
    return json(res, 200, { ok: true, user: { username: user.username, name: user.name } }, {
      'Set-Cookie': `somms_session=${token}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_MS / 1000}`,
    });
  }
  if (pathname === '/api/logout' && method === 'POST') {
    const s = getSession(req);
    if (s) sessions.delete(s.token);
    return json(res, 200, { ok: true }, { 'Set-Cookie': 'somms_session=; HttpOnly; Path=/; Max-Age=0' });
  }
  if (pathname === '/api/me') {
    const s = getSession(req);
    return s ? json(res, 200, { user: s.user }) : json(res, 401, { error: 'Sem sessão.' });
  }

  // ---- daqui para baixo, só logado
  const session = requireAuth(req, res);
  if (!session) return;

  if (pathname === '/api/stats') return json(res, 200, db.stats());

  if (pathname === '/api/preview' && method === 'POST') {
    const b = await readBody(req, 2e6);
    const { html } = pages.renderPostBody({ content: String(b.content || ''), category: b.category || '' });
    return json(res, 200, { html });
  }

  if (pathname === '/api/posts' && method === 'POST') {
    const b = await readBody(req, 2e6);
    try { return json(res, 201, db.createPost(b)); } catch (err) { return json(res, 400, { error: err.message }); }
  }

  const m = pathname.match(/^\/api\/posts\/(\d+)$/);
  if (m) {
    const id = Number(m[1]);
    if (method === 'GET') { const p = db.getPostById(id); return p ? json(res, 200, p) : json(res, 404, { error: 'Post não encontrado.' }); }
    if (method === 'PUT') {
      const b = await readBody(req, 2e6);
      try { const p = db.updatePost(id, b); return p ? json(res, 200, p) : json(res, 404, { error: 'Post não encontrado.' }); }
      catch (err) { return json(res, 400, { error: err.message }); }
    }
    if (method === 'DELETE') return db.deletePost(id) ? json(res, 200, { ok: true }) : json(res, 404, { error: 'Post não encontrado.' });
  }

  if (pathname === '/api/categories' && method === 'POST') {
    const b = await readBody(req, 5000);
    try { return json(res, 201, db.saveCategory(b)); } catch (err) { return json(res, 400, { error: err.message }); }
  }

  if (pathname === '/api/upload' && method === 'POST') {
    const b = await readBody(req, 9e6);
    const m2 = String(b.data || '').match(/^data:image\/(png|jpe?g|webp|gif);base64,(.+)$/);
    if (!m2) return json(res, 400, { error: 'Envie uma imagem JPG, PNG, WebP ou GIF.' });
    const buf = Buffer.from(m2[2], 'base64');
    if (buf.length > 6e6) return json(res, 413, { error: 'Imagem acima de 6 MB.' });
    const ext = m2[1] === 'jpeg' ? 'jpg' : m2[1];
    const base = slugify(String(b.name || 'imagem').replace(/\.[a-z0-9]+$/i, '')) || 'imagem';
    const name = `${Date.now().toString(36)}-${base}.${ext}`;
    await writeFile(join(UPLOADS, name), buf);
    return json(res, 201, { url: `/uploads/${name}` });
  }

  if (pathname === '/api/leads' && method === 'GET') return json(res, 200, db.listLeads({ type: url.searchParams.get('tipo') || '' }));

  if (pathname === '/api/leads.csv' && method === 'GET') {
    const rows = db.listLeads();
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = ['id;tipo;nome;email;whatsapp;origem;data', ...rows.map((r) => [r.id, r.type, r.name, r.email, r.whatsapp, r.source, r.created_at].map(esc).join(';'))].join('\n');
    return send(res, 200, '﻿' + csv, 'text/csv; charset=utf-8', { 'Content-Disposition': 'attachment; filename="leads-somms.csv"' });
  }

  return json(res, 404, { error: 'Rota não encontrada.' });
}

// ---------------------------------------------------------------- feeds
function rss() {
  const { items } = db.queryPosts({ perPage: 20 });
  const x = (s) => escapeHtml(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Diário de Adega · Somm's Wine Bar</title><link>${config.siteUrl}/blog</link><description>${x(config.site.tagline)}</description><language>pt-BR</language>
${items.map((p) => `<item><title>${x(p.title)}</title><link>${config.siteUrl}/blog/${p.slug}</link><guid>${config.siteUrl}/blog/${p.slug}</guid><pubDate>${new Date(p.published_at.replace(' ', 'T') + ':00-03:00').toUTCString()}</pubDate><description>${x(p.excerpt)}</description><enclosure url="${x(img(p.cover, 900))}" type="image/jpeg" length="0"/></item>`).join('\n')}
</channel></rss>`;
}
function sitemap() {
  const { items } = db.queryPosts({ perPage: 1000 });
  const urls = ['/', '/blog', '/guia-centro-oeste', ...items.map((p) => `/blog/${p.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${config.siteUrl}${u}</loc></url>`).join('')}</urlset>`;
}

// ---------------------------------------------------------------- roteador
const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';
  try {
    if (path.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Método não permitido', 'text/plain');

    if (path === '/') return send(res, 200, pages.homePage());

    if (path === '/blog') {
      const f = filtersFrom(url);
      if (url.searchParams.get('parcial')) {
        const result = db.queryPosts({ ...f, perPage: 9 });
        return send(res, 200, pages.blogResults(f, result));
      }
      return send(res, 200, pages.blogPage(f));
    }

    const cat = path.match(/^\/blog\/categoria\/([a-z0-9-]+)$/);
    if (cat) return send(res, 301, '', 'text/plain', { Location: `/blog?categoria=${cat[1]}` });

    const post = path.match(/^\/blog\/([a-z0-9-]+)$/);
    if (post) {
      const s = getSession(req);
      const p = db.getPostBySlug(post[1], { includeDrafts: Boolean(s) });
      if (!p) return send(res, 404, pages.notFoundPage());
      if (!s && p.status === 'published') db.incrementViews(p.id);
      return send(res, 200, pages.postPage(p));
    }

    if (path === '/guia-centro-oeste') return send(res, 200, pages.ebookPage());
    if (path === '/feed.xml') return send(res, 200, rss(), 'application/rss+xml; charset=utf-8');
    if (path === '/sitemap.xml') return send(res, 200, sitemap(), MIME['.xml']);
    if (path === '/robots.txt') {
      return send(res, 200, config.pitchMode ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nDisallow: /admin\nDisallow: /api\nSitemap: ${config.siteUrl}/sitemap.xml\n`, MIME['.txt']);
    }
    if (path === '/admin') return (await serveStatic(req, res, '/admin/index.html')) || send(res, 404, 'Painel não encontrado');

    if (await serveStatic(req, res, url.pathname)) return;
    return send(res, 404, pages.notFoundPage());
  } catch (err) {
    console.error(err);
    const status = err.status || 500;
    if (path.startsWith('/api/')) return json(res, status, { error: err.status ? err.message : 'Erro interno.' });
    return send(res, status, '<h1>Erro interno</h1>');
  }
});

server.listen(config.port, () => {
  console.log(`Somm's Wine Bar rodando em http://localhost:${config.port}  (painel: /admin)`);
});
