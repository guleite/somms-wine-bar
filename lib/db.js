import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';
import { readingTime, plainExcerpt, slugify } from './markdown.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
export const DB_PATH = process.env.DB_PATH || join(root, 'data', 'somms.db');

mkdirSync(dirname(DB_PATH), { recursive: true });
const isNew = !existsSync(DB_PATH);
export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS categories (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT 'glass',
  position INTEGER DEFAULT 99
);
CREATE TABLE IF NOT EXISTS authors (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  instagram TEXT DEFAULT ''
);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover TEXT DEFAULT '',
  cover_caption TEXT DEFAULT '',
  category TEXT REFERENCES categories(slug) ON UPDATE CASCADE,
  wine_style TEXT DEFAULT '',
  region TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  author TEXT REFERENCES authors(slug) ON UPDATE CASCADE,
  featured INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  event_date TEXT DEFAULT '',
  reading_time INTEGER DEFAULT 3,
  views INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at);
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  source TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  name TEXT DEFAULT '',
  hash TEXT NOT NULL
);
`);

// ---------- senhas ----------
export function hashPassword(pass) {
  const salt = randomBytes(16).toString('hex');
  const h = scryptSync(pass, salt, 64).toString('hex');
  return `${salt}:${h}`;
}
export function checkPassword(pass, stored) {
  const [salt, h] = String(stored).split(':');
  if (!salt || !h) return false;
  const a = Buffer.from(h, 'hex');
  const b = scryptSync(pass, salt, 64);
  return a.length === b.length && timingSafeEqual(a, b);
}

if (!db.prepare('SELECT COUNT(*) AS n FROM users').get().n) {
  db.prepare('INSERT INTO users (username, name, hash) VALUES (?, ?, ?)').run(
    config.admin.user,
    config.admin.name,
    hashPassword(config.admin.pass),
  );
}

// ---------- posts ----------
const POST_FIELDS = ['slug', 'title', 'subtitle', 'excerpt', 'content', 'cover', 'cover_caption', 'category', 'wine_style', 'region', 'tags', 'author', 'featured', 'status', 'event_date', 'published_at'];

export function normalizePost(input = {}) {
  const p = {};
  for (const f of POST_FIELDS) if (input[f] !== undefined) p[f] = input[f];
  p.title = String(p.title || '').trim();
  p.slug = slugify(p.slug || p.title);
  p.featured = p.featured ? 1 : 0;
  p.status = p.status === 'published' ? 'published' : 'draft';
  p.tags = String(p.tags || '')
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
    .join(', ');
  p.content = String(p.content || '');
  p.excerpt = String(p.excerpt || '').trim() || plainExcerpt(p.content);
  p.reading_time = readingTime(p.content);
  if (p.status === 'published' && !p.published_at) p.published_at = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).slice(0, 16);
  if (p.published_at) p.published_at = String(p.published_at).replace('T', ' ').slice(0, 16);
  for (const f of ['subtitle', 'cover', 'cover_caption', 'category', 'wine_style', 'region', 'author', 'event_date']) p[f] = String(p[f] || '').trim();
  if (!p.category) p.category = null;
  if (!p.author) p.author = null;
  return p;
}

export function createPost(input) {
  const p = normalizePost(input);
  if (!p.title) throw new Error('O título é obrigatório.');
  p.slug = uniqueSlug(p.slug);
  const cols = Object.keys(p);
  const res = db
    .prepare(`INSERT INTO posts (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`)
    .run(...cols.map((c) => p[c]));
  return getPostById(Number(res.lastInsertRowid));
}

export function updatePost(id, input) {
  const current = getPostById(id);
  if (!current) return null;
  const p = normalizePost({ ...current, ...input });
  if (!p.title) throw new Error('O título é obrigatório.');
  p.slug = uniqueSlug(p.slug, id);
  const cols = Object.keys(p);
  db.prepare(`UPDATE posts SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...cols.map((c) => p[c]), id);
  return getPostById(id);
}

export function deletePost(id) {
  return db.prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0;
}

function uniqueSlug(slug, ignoreId = 0) {
  let s = slug || 'post';
  let n = 2;
  while (db.prepare('SELECT id FROM posts WHERE slug = ? AND id != ?').get(s, ignoreId)) s = `${slug}-${n++}`;
  return s;
}

const SELECT_POST = `
  SELECT p.*, c.name AS category_name, c.icon AS category_icon,
         a.name AS author_name, a.role AS author_role, a.bio AS author_bio, a.instagram AS author_instagram
  FROM posts p
  LEFT JOIN categories c ON c.slug = p.category
  LEFT JOIN authors a ON a.slug = p.author`;

export function getPostById(id) {
  return db.prepare(`${SELECT_POST} WHERE p.id = ?`).get(id) || null;
}
export function getPostBySlug(slug, { includeDrafts = false } = {}) {
  return db.prepare(`${SELECT_POST} WHERE p.slug = ? ${includeDrafts ? '' : "AND p.status = 'published'"}`).get(slug) || null;
}

/** Busca com filtros. Retorna { items, total, page, pages } */
export function queryPosts({ category, style, region, tag, q, sort = 'recentes', page = 1, perPage = 9, includeDrafts = false, status, excludeId, featured } = {}) {
  const where = [];
  const args = [];
  if (!includeDrafts) where.push("p.status = 'published'");
  else if (status) { where.push('p.status = ?'); args.push(status); }
  if (category) { where.push('p.category = ?'); args.push(category); }
  if (style) { where.push('p.wine_style = ?'); args.push(style); }
  if (region) { where.push('p.region = ?'); args.push(region); }
  if (featured) where.push('p.featured = 1');
  if (excludeId) { where.push('p.id != ?'); args.push(excludeId); }
  if (tag) { where.push("(', ' || p.tags || ',') LIKE ?"); args.push(`%, ${tag},%`); }
  if (q) {
    where.push('(p.title LIKE ? OR p.subtitle LIKE ? OR p.excerpt LIKE ? OR p.content LIKE ? OR p.tags LIKE ?)');
    const like = `%${q}%`;
    args.push(like, like, like, like, like);
  }
  const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const order =
    sort === 'populares' ? 'p.views DESC, p.published_at DESC'
    : sort === 'antigos' ? 'p.published_at ASC'
    : sort === 'leitura' ? 'p.reading_time ASC, p.published_at DESC'
    : "COALESCE(p.published_at, p.updated_at) DESC";
  const total = db.prepare(`SELECT COUNT(*) AS n FROM posts p ${w}`).get(...args).n;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pg = Math.min(Math.max(1, Number(page) || 1), pages);
  const items = db.prepare(`${SELECT_POST} ${w} ORDER BY ${order} LIMIT ? OFFSET ?`).all(...args, perPage, (pg - 1) * perPage);
  return { items, total, page: pg, pages };
}

export function relatedPosts(post, n = 3) {
  const same = db
    .prepare(`${SELECT_POST} WHERE p.status = 'published' AND p.id != ? ORDER BY (p.category = ?) DESC, (p.wine_style = ?) DESC, p.published_at DESC LIMIT ?`)
    .all(post.id, post.category || '', post.wine_style || '', n);
  return same;
}

export function upcomingEvents(n = 3) {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .prepare(`${SELECT_POST} WHERE p.status = 'published' AND p.event_date >= ? ORDER BY p.event_date ASC LIMIT ?`)
    .all(today, n);
}

export function incrementViews(id) {
  db.prepare('UPDATE posts SET views = views + 1 WHERE id = ?').run(id);
}

export function facets() {
  const cats = db
    .prepare(`SELECT c.*, (SELECT COUNT(*) FROM posts p WHERE p.category = c.slug AND p.status='published') AS count FROM categories c ORDER BY c.position, c.name`)
    .all();
  const styles = db.prepare(`SELECT wine_style AS slug, COUNT(*) AS count FROM posts WHERE status='published' AND wine_style != '' GROUP BY wine_style`).all();
  const regions = db.prepare(`SELECT region AS name, COUNT(*) AS count FROM posts WHERE status='published' AND region != '' GROUP BY region ORDER BY count DESC, region`).all();
  const tagRows = db.prepare(`SELECT tags FROM posts WHERE status='published' AND tags != ''`).all();
  const tagCount = {};
  for (const r of tagRows) for (const t of r.tags.split(',').map((x) => x.trim()).filter(Boolean)) tagCount[t] = (tagCount[t] || 0) + 1;
  const tags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([name, count]) => ({ name, count }));
  return { cats, styles, regions, tags };
}

export function listCategories() {
  return db.prepare('SELECT * FROM categories ORDER BY position, name').all();
}
export function listAuthors() {
  return db.prepare('SELECT * FROM authors ORDER BY name').all();
}
export function saveCategory({ slug, name, description = '', icon = 'glass' }) {
  const s = slugify(slug || name);
  if (!name || !s) throw new Error('Informe o nome da categoria.');
  db.prepare(
    `INSERT INTO categories (slug, name, description, icon) VALUES (?, ?, ?, ?)
     ON CONFLICT(slug) DO UPDATE SET name = excluded.name, description = excluded.description, icon = excluded.icon`,
  ).run(s, name, description, icon);
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(s);
}

// ---------- leads ----------
export function addLead({ type, name = '', email = '', whatsapp = '', source = '' }) {
  const res = db
    .prepare('INSERT INTO leads (type, name, email, whatsapp, source) VALUES (?, ?, ?, ?, ?)')
    .run(type, name.slice(0, 120), email.slice(0, 160), whatsapp.slice(0, 40), source.slice(0, 300));
  return Number(res.lastInsertRowid);
}
export function listLeads({ type } = {}) {
  return type
    ? db.prepare('SELECT * FROM leads WHERE type = ? ORDER BY id DESC').all(type)
    : db.prepare('SELECT * FROM leads ORDER BY id DESC').all();
}

export function stats() {
  const g = (sql) => db.prepare(sql).get().n;
  return {
    posts: g('SELECT COUNT(*) AS n FROM posts'),
    published: g("SELECT COUNT(*) AS n FROM posts WHERE status='published'"),
    drafts: g("SELECT COUNT(*) AS n FROM posts WHERE status='draft'"),
    views: g('SELECT COALESCE(SUM(views),0) AS n FROM posts'),
    leads: g('SELECT COUNT(*) AS n FROM leads'),
    leadsByType: db.prepare('SELECT type, COUNT(*) AS n FROM leads GROUP BY type').all(),
    top: db.prepare("SELECT id, title, slug, views FROM posts WHERE status='published' ORDER BY views DESC LIMIT 5").all(),
  };
}

// ---------- seed ----------
if (isNew || !db.prepare('SELECT COUNT(*) AS n FROM categories').get().n) {
  const { seed } = await import('./seed.js');
  seed(db, createPost);
}
