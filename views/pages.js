import { config, WINE_STYLES } from '../config.js';
import { parseMarkdown } from '../lib/markdown.js';
import { queryPosts, upcomingEvents, facets, relatedPosts, listCategories } from '../lib/db.js';
import { layout, leadForm } from './layout.js';
import { e, icon, img, fmtDate, eventParts, styleBadge, styleInfo, site, waLink, initials, qs } from './helpers.js';

const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------- componentes

export function postCard(p, variant = '') {
  const href = `/blog/${p.slug}`;
  const ev = p.event_date ? eventParts(p.event_date) : null;
  return `
  <article class="card ${variant}">
    <a href="${href}" class="card-media" tabindex="-1" aria-hidden="true" data-cursor="Ler">
      <img src="${e(img(p.cover, variant === 'card-wide' ? 1300 : 800))}" alt="" loading="lazy">
      ${ev ? `<span class="date-chip"><strong>${ev.day}</strong>${ev.month}</span>` : ''}
    </a>
    <div class="card-body">
      <p class="card-meta"><a href="/blog?categoria=${e(p.category || '')}" class="cat-link">${e(p.category_name || 'Diário')}</a>${styleBadge(p.wine_style)}</p>
      <h3 class="card-title"><a href="${href}">${e(p.title)}</a></h3>
      ${variant !== 'card-mini' ? `<p class="card-excerpt">${e(p.subtitle || p.excerpt)}</p>` : ''}
      <p class="card-foot"><span>${e(p.author_name || "Equipe Somm's")}</span><span>${fmtDate(p.published_at)}</span><span>${p.reading_time} min</span></p>
    </div>
  </article>`;
}

function ebookBook(size = '') {
  return `<div class="book ${size}" aria-hidden="true">
    <div class="book-cover">
      <img src="/assets/img/mark-cream.png" alt="">
      <span>Guia de Vinhos do</span>
      <strong>Centro-Oeste</strong>
      <em>DF · GO · MT · MS</em>
      <small>Somm's Wine Bar</small>
    </div>
  </div>`;
}

/** Selo circular girando: "E-BOOK GRÁTIS · PDF ·" */
function spinBadge() {
  return `<svg class="spin-badge" viewBox="0 0 120 120" aria-hidden="true">
    <defs><path id="sb-circle" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>
    <circle cx="60" cy="60" r="58" />
    <text><textPath href="#sb-circle" textLength="284" lengthAdjust="spacing">E-BOOK GRÁTIS · EM PDF · DOWNLOAD ·</textPath></text>
    <path d="M60 46l14 14-14 14-14-14z" class="sb-diamond"/>
  </svg>`;
}

function ebookSection() {
  return `
  <section class="ebook-band" id="ebook" data-parallax-root>
    <p class="ebook-bg-word" aria-hidden="true" data-parallax="-0.08">Cerrado</p>
    <div class="wrap ebook-grid">
      <div class="ebook-visual">
        <div data-parallax="0.06">${ebookBook()}</div>
        ${spinBadge()}
      </div>
      <div class="ebook-copy">
        <p class="eyebrow">E-book gratuito</p>
        <h2 class="display" data-split>Guia de Vinhos <em>do Centro-Oeste</em></h2>
        <p class="lead">O Cerrado virou terra de vinho fino. Neste guia, nossos sommeliers mostram quem produz, o que provar e como a dupla poda mudou a história da região.</p>
        <ul class="checks">
          <li>Vinícolas de Goiás, Mato Grosso e Mato Grosso do Sul</li>
          <li>A técnica da dupla poda explicada em uma página</li>
          <li>Uvas, estilos e fichas de degustação</li>
          <li>Roteiro de enoturismo saindo de Brasília</li>
        </ul>
        ${leadForm({ type: 'ebook', button: 'Baixar o guia grátis', source: 'home-ebook' })}
      </div>
    </div>
  </section>`;
}

function glasses() {
  return `<div class="flight-glasses" aria-hidden="true">
    ${[['Leve', '#E7A097', 34], ['Médio', '#9C2A3E', 52], ['Encorpado', '#4A0F1F', 70]].map(([l, c, h], i) => `
      <div class="glass" style="--wine:${c};--d:${i * 0.25}s">
        <svg viewBox="0 0 80 150"><defs><clipPath id="bowl${i}"><path d="M10 6h60l-3 34c-2 22-14 34-27 34S15 62 13 40Z"/></clipPath></defs>
          <g clip-path="url(#bowl${i})"><rect class="wine-fill" x="0" y="${(74 - 68 * h / 100).toFixed(1)}" width="80" height="80"/></g>
          <path d="M10 6h60l-3 34c-2 22-14 34-27 34S15 62 13 40Z" fill="none" stroke="currentColor" stroke-width="1.2"/>
          <path d="M40 74v58M24 140h32" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>
        <span>${l}</span>
      </div>`).join('')}
  </div>`;
}

// ---------------------------------------------------------------- home

export function homePage() {
  const latest = queryPosts({ perPage: 13 }).items;
  let slides = queryPosts({ featured: true, perPage: 4 }).items;
  if (slides.length < 4) slides = [...slides, ...latest.filter((p) => !slides.some((s) => s.id === p.id))].slice(0, 4);
  const grid = latest.filter((p) => !slides.some((s) => s.id === p.id)).slice(0, 6);
  const popular = queryPosts({ sort: 'populares', perPage: 5 }).items;
  const events = upcomingEvents(3);
  const { cats } = facets();
  const marquee = cats.map((c) => `<a href="/blog?categoria=${c.slug}">${e(c.name)}<sup>${pad(c.count)}</sup></a><span class="m-sep" aria-hidden="true">◆</span>`).join('');

  const body = `
  <h1 class="sr-only">Somm's Wine Bar — Diário de Adega</h1>
  <section class="hero-slider" data-slider data-hero aria-roledescription="carrossel" aria-label="Destaques do Diário de Adega">
    <div class="slides" data-cursor="Arraste">
      ${slides.map((p, i) => `
      <article class="slide${i === 0 ? ' is-active' : ''}" aria-roledescription="slide" aria-label="${i + 1} de ${slides.length}">
        <div class="slide-media"><img src="${e(img(p.cover, 1920))}" alt="${e(p.cover_caption || p.title)}"${i ? ' loading="lazy"' : ''}></div>
        <div class="slide-copy">
          <p class="slide-kicker anim" style="--d:0">${e(p.category_name)}</p>
          <h2 class="slide-title anim" style="--d:1"><a href="/blog/${p.slug}">${e(p.title)}</a></h2>
          <p class="slide-meta anim" style="--d:2">${e(p.author_name || "Equipe Somm's")} · ${p.reading_time} min de leitura</p>
          <a class="link-script light anim" style="--d:3" href="/blog/${p.slug}">Ler o texto</a>
        </div>
      </article>`).join('')}
    </div>
    <div class="slider-count" aria-hidden="true"><strong data-slide-current>01</strong><i></i><span>${pad(slides.length)}</span></div>
    <div class="slider-arrows">
      <button type="button" data-prev aria-label="Destaque anterior"><svg viewBox="0 0 64 12"><path d="M64 6H2M8 1 2 6l6 5"/></svg></button>
      <button type="button" data-next aria-label="Próximo destaque"><svg viewBox="0 0 64 12"><path d="M0 6h62M56 1l6 5-6 5"/></svg></button>
    </div>
    <div class="slider-progress">
      ${slides.map((p, i) => `<button type="button" data-goto="${i}" aria-label="Ir para o destaque ${i + 1}"${i === 0 ? ' class="is-on" aria-current="true"' : ''}><i></i></button>`).join('')}
    </div>
  </section>

  <section class="story" data-parallax-root>
    <div class="wrap">
      <h2 class="h-giant center" data-split>Um diário <br>escrito <em>à taça</em></h2>
      <div class="story-grid">
        <div class="frame f1"><img data-parallax="0.1" src="${U('1553682544-4ccf2778c9a8', 700)}" alt="Vinho branco sendo servido no balcão" loading="lazy"></div>
        <div class="story-copy">
          <p>O Somm's nasceu para servir vinho sem cerimônia e com muito cuidado. O Diário de Adega é a extensão da nossa conversa de balcão: o que estamos provando, de onde vêm os rótulos, como harmonizar e quando vale a pena abrir aquela garrafa.</p>
          <p>Textos curtos para ler com uma taça na mão — escritos pelos sommeliers que servem você na 412 Sul.</p>
          <a class="link-script" href="/blog">Conheça o Diário</a>
        </div>
        <div class="frame f2"><img data-parallax="0.12" src="${U('1578911373434-0cb395d2cbfb', 1200)}" alt="Parede de garrafas de vinho do Somm's" loading="lazy"></div>
      </div>
    </div>
  </section>

  <section class="latest">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="display" data-split>Novos <em>na adega</em></h2>
        <a class="link-script" href="/blog">Todos os textos</a>
      </div>
      <div class="ed-grid">${grid.map((p) => postCard(p)).join('')}</div>
    </div>
  </section>

  <section class="marquee" aria-label="Assuntos do Diário de Adega">
    <div class="marquee-track">
      <div class="marquee-group">${marquee}</div>
      <div class="marquee-group" aria-hidden="true">${marquee.replace(/<a /g, '<a tabindex="-1" ')}</div>
    </div>
  </section>

  <section class="quote-sec" data-parallax-root>
    <div class="frame q1"><img data-parallax="0.16" src="${U('1611575189074-9dfbbceb258a', 600)}" alt="" loading="lazy"></div>
    <div class="frame q2"><img data-parallax="0.1" src="${U('1495929427389-a6451f2e01fa', 900)}" alt="" loading="lazy"></div>
    <blockquote>
      <p class="h-giant" data-split>“O vinho é poesia engarrafada”</p>
      <cite>Robert Louis Stevenson</cite>
    </blockquote>
    <div class="frame q3"><img data-parallax="0.14" src="${U('1547595628-c61a29f496f0', 1100)}" alt="" loading="lazy"></div>
  </section>

  <section class="experience" data-parallax-root>
    <div class="wrap">
      <div class="exp-head">
        <p class="eyebrow eyebrow-gold center">A experiência Somm's</p>
        <h2 class="h-giant light" data-split>Três taças <em>lado a lado</em></h2>
      </div>
      <div class="exp-grid">
        <div class="frame exp-photo"><img data-parallax="0.1" src="${U('1562601579-599dec564e06', 1200)}" alt="Flight de vinhos servido no Somm's" loading="lazy"></div>
        <div class="exp-copy">
          <p class="lead light">No Somm's você prova antes de escolher. Nossos flights são servidos no Coravin, com rótulos que normalmente só sairiam em garrafa — uma descoberta de cada vez.</p>
          ${glasses()}
          <div class="stats">
            <div><strong>400+</strong><span>rótulos na carta</span></div>
            <div><strong>Coravin</strong><span>taças sem abrir a garrafa</span></div>
            <div><strong>Sábados</strong><span>degustações guiadas</span></div>
          </div>
          <div class="btn-row">
            <a class="btn btn-gold" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-flight">Reservar mesa ${icon('arrow')}</a>
            <a class="btn btn-ghost-light" href="/blog/flights-por-que-provar-vinhos-lado-a-lado-muda-tudo">Como funciona um flight</a>
          </div>
        </div>
      </div>

      ${events.length ? `
      <div class="agenda-block">
        <div class="sec-head">
          <h2 class="display light" data-split>Próximas <em>degustações</em></h2>
          <a class="link-script light" href="/blog?categoria=eventos">Toda a agenda</a>
        </div>
        <div class="events">
          ${events.map((p) => { const d = eventParts(p.event_date); return `
            <article class="event">
              <div class="event-date"><strong>${d.day}</strong><span>${d.month}</span><small>${d.weekday}</small></div>
              <div class="event-body">
                <h3><a href="/blog/${p.slug}">${e(p.title)}</a></h3>
                <p>${e(p.subtitle)}</p>
              </div>
              <div class="event-cta">
                <a class="btn btn-gold btn-sm" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-evento">Garantir vaga</a>
                <a class="link-arrow light" href="/blog/${p.slug}">Detalhes ${icon('arrow')}</a>
              </div>
            </article>`; }).join('')}
        </div>
      </div>` : ''}
    </div>
  </section>

  ${ebookSection()}

  <section class="popular-sec">
    <div class="wrap">
      <div class="sec-head">
        <h2 class="display" data-split>Os mais <em>lidos</em></h2>
        <a class="link-script" href="/blog?ordem=populares">Ver ranking</a>
      </div>
      <ol class="hover-list">
        ${popular.map((p, i) => `
        <li><a href="/blog/${p.slug}" data-hover-img="${e(img(p.cover, 600))}" data-cursor="Ler">
          <span class="num">${pad(i + 1)}</span>
          <span class="hl-title"><small>${e(p.category_name)}</small>${e(p.title)}</span>
          <span class="hl-meta">${p.reading_time} min</span>
        </a></li>`).join('')}
      </ol>
    </div>
  </section>`;

  return layout({ title: '', body, active: 'home', url: '/', bodyClass: 'is-home' });
}

// ---------------------------------------------------------------- blog / filtros

export function blogResults(filters, result) {
  const { items, total, page, pages } = result;
  const active = [];
  const cat = filters.category && listCategories().find((c) => c.slug === filters.category);
  if (cat) active.push(['categoria', cat.name]);
  if (filters.style) active.push(['estilo', styleInfo(filters.style)?.name || filters.style]);
  if (filters.region) active.push(['regiao', filters.region]);
  if (filters.tag) active.push(['tag', `#${filters.tag}`]);
  if (filters.q) active.push(['q', `“${filters.q}”`]);
  const base = { categoria: filters.category, estilo: filters.style, regiao: filters.region, tag: filters.tag, q: filters.q, ordem: filters.sort === 'recentes' ? '' : filters.sort };
  const without = (k) => `/blog${qs({ ...base, [k]: '' })}`;

  return `
  <div class="results-bar">
    <p><strong>${pad(total)}</strong> ${total === 1 ? 'texto encontrado' : 'textos encontrados'}</p>
    <div class="active-filters">
      ${active.map(([k, label]) => `<a href="${without(k)}" class="chip is-on" data-filter-link>${e(label)} ${icon('close')}</a>`).join('')}
      ${active.length > 1 ? '<a href="/blog" class="btn-text" data-filter-link>Limpar tudo</a>' : ''}
    </div>
  </div>
  ${items.length ? `<div class="grid-3 results-grid">${items.map((p, i) => postCard(p, i === 0 && page === 1 && !active.length ? 'card-wide' : '')).join('')}</div>` : `
    <div class="empty">
      ${icon('glass', 'empty-icon')}
      <h3 class="display">Nenhum texto com esses filtros <em>ainda</em></h3>
      <p>Tente outra combinação ou peça uma sugestão ao nosso sommelier.</p>
      <a class="btn btn-ghost" href="/blog" data-filter-link>Ver todos os textos</a>
    </div>`}
  ${pages > 1 ? `<nav class="pagination" aria-label="Paginação">
    ${Array.from({ length: pages }, (_, i) => i + 1).map((n) => `<a href="/blog${qs({ ...base, pagina: n })}" class="${n === page ? 'is-current' : ''}" data-filter-link>${pad(n)}</a>`).join('')}
  </nav>` : ''}`;
}

export function blogPage(filters) {
  const result = queryPosts({ ...filters, perPage: 9 });
  const { cats, styles, regions, tags } = facets();
  const styleCount = Object.fromEntries(styles.map((s) => [s.slug, s.count]));
  const cat = filters.category && cats.find((c) => c.slug === filters.category);
  const title = cat ? cat.name : filters.q ? `Busca: ${filters.q}` : 'Diário de Adega';
  const totalPublished = cats.reduce((a, c) => a + c.count, 0);

  const body = `
  <section class="page-head" data-hero data-parallax-root>
    <div class="page-head-bg" data-parallax="0.2" style="background-image:url('${U('1611575189074-9dfbbceb258a', 1900)}')"></div>
    <div class="wrap page-head-inner">
      <p class="page-kicker">${cat ? 'Categoria' : 'O blog do Somm\'s'}</p>
      <h1 class="h-giant light" data-split>${cat ? e(cat.name) : 'Diário <em>de Adega</em>'}</h1>
      <p class="page-desc">${cat ? e(cat.description) : 'Rótulos, regiões, harmonizações e a agenda da casa. Filtre pelo que você está com vontade de ler — ou de beber.'}</p>
      <form class="head-search" action="/blog" data-filter-form>
        ${icon('search')}
        <input name="q" value="${e(filters.q || '')}" placeholder="Buscar uva, região, prato…" aria-label="Buscar">
        ${filters.category ? `<input type="hidden" name="categoria" value="${e(filters.category)}">` : ''}
        <button class="btn btn-gold btn-sm">Buscar</button>
      </form>
    </div>
  </section>

  <div class="cat-tabs-wrap">
    <nav class="cat-tabs" aria-label="Categorias">
      <a href="/blog${qs({ q: filters.q })}" class="${!filters.category ? 'is-on' : ''}" data-filter-link>Todos <small>${pad(totalPublished)}</small></a>
      ${cats.map((c) => `<a href="/blog${qs({ categoria: c.slug, q: filters.q })}" class="${filters.category === c.slug ? 'is-on' : ''}" data-filter-link>${e(c.name)} <small>${pad(c.count)}</small></a>`).join('')}
    </nav>
  </div>

  <section class="wrap blog-layout">
    <aside class="filters" data-filters>
      <button class="btn btn-ghost filters-toggle" type="button" data-filters-toggle>${icon('filter')} Filtrar</button>
      <form class="filters-panel" action="/blog" data-filter-form>
        <input type="hidden" name="categoria" value="${e(filters.category || '')}">
        <input type="hidden" name="q" value="${e(filters.q || '')}">
        <fieldset>
          <legend>Estilo de vinho</legend>
          <div class="style-options">
            ${WINE_STYLES.map((s) => `
              <label class="style-opt">
                <input type="radio" name="estilo" value="${s.slug}" ${filters.style === s.slug ? 'checked' : ''}>
                <span><i style="--dot:${s.color}"></i>${e(s.name)}<small>${styleCount[s.slug] || 0}</small></span>
              </label>`).join('')}
            <label class="style-opt"><input type="radio" name="estilo" value="" ${!filters.style ? 'checked' : ''}><span><i style="--dot:transparent"></i>Qualquer estilo</span></label>
          </div>
        </fieldset>
        <fieldset>
          <legend>Região</legend>
          <select name="regiao" aria-label="Região">
            <option value="">Todas as regiões</option>
            ${regions.map((r) => `<option value="${e(r.name)}" ${filters.region === r.name ? 'selected' : ''}>${e(r.name)} (${r.count})</option>`).join('')}
          </select>
        </fieldset>
        <fieldset>
          <legend>Ordenar por</legend>
          <select name="ordem" aria-label="Ordenar">
            ${[['recentes', 'Mais recentes'], ['populares', 'Mais lidos'], ['leitura', 'Leitura rápida'], ['antigos', 'Mais antigos']].map(([v, l]) => `<option value="${v}" ${filters.sort === v ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </fieldset>
        <fieldset>
          <legend>Assuntos</legend>
          <div class="tag-cloud">${tags.map((t) => `<a href="/blog${qs({ tag: t.name })}" class="${filters.tag === t.name ? 'is-on' : ''}" data-filter-link>#${e(t.name)}</a>`).join('')}</div>
        </fieldset>
        <noscript><button class="btn btn-wine">Aplicar filtros</button></noscript>
      </form>
      <div class="filter-ad">
        ${ebookBook('book-xs')}
        <p class="script">E-book grátis</p>
        <p class="display-sm light">Guia de Vinhos do Centro-Oeste</p>
        <a class="btn btn-gold btn-sm btn-block" href="/guia-centro-oeste" data-track="ebook-sidebar">Baixar ${icon('download')}</a>
      </div>
    </aside>
    <div class="results" data-results aria-live="polite">
      ${blogResults(filters, result)}
    </div>
  </section>`;

  return layout({ title, body, active: filters.category === 'eventos' ? 'agenda' : 'blog', url: '/blog', bodyClass: 'is-blog' });
}

// ---------------------------------------------------------------- post

function adHtml(ad) {
  const href = ad.href === 'whatsapp' ? waLink() : ad.href;
  const ext = /^https?:/.test(href);
  return `
  <aside class="inline-ad" data-ad="${e(ad.id)}">
    <img src="${e(ad.image)}" alt="" loading="lazy">
    <div class="inline-ad-body">
      <p class="inline-ad-kicker">${e(ad.kicker)}</p>
      <p class="inline-ad-title">${e(ad.title)}</p>
      <p>${e(ad.text)}</p>
      <a class="btn btn-gold btn-sm" href="${e(href)}"${ext ? ' target="_blank" rel="noopener"' : ''} data-track="anuncio-${e(ad.id)}">${e(ad.cta)} ${icon('arrow')}</a>
    </div>
  </aside>`;
}

/** Renderiza o corpo do post, encaixando anúncios in-line. */
export function renderPostBody(post) {
  const { blocks, headings } = parseMarkdown(post.content);
  const ads = [...config.ads].sort((a, b) => (b.match.includes(post.category) ? 1 : 0) - (a.match.includes(post.category) ? 1 : 0));
  let next = 0;
  const pick = (id) => {
    if (id) { const f = ads.find((a) => a.id === id); if (f) return f; }
    return ads[next++ % ads.length];
  };
  const hasMarker = blocks.some((b) => b.type === 'ad');
  const out = [];
  let paras = 0;
  let adsPlaced = 0;
  blocks.forEach((b, i) => {
    if (b.type === 'ad') { out.push(adHtml(pick(b.html))); adsPlaced++; return; }
    out.push(b.html);
    if (b.type === 'p') paras++;
    if (!hasMarker && paras === 3 && b.type === 'p' && adsPlaced === 0) { out.push(adHtml(pick())); adsPlaced++; }
    // segundo anúncio em textos longos, perto de 70%
    if (blocks.length > 14 && adsPlaced === 1 && i === Math.floor(blocks.length * 0.7)) { out.push(adHtml(pick())); adsPlaced++; }
  });
  return { html: out.join('\n'), headings };
}

export function postPage(post) {
  const { html, headings } = renderPostBody(post);
  const related = relatedPosts(post, 3);
  const tags = post.tags ? post.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const url = `/blog/${post.slug}`;
  const fullUrl = config.siteUrl + url;
  const ev = post.event_date ? eventParts(post.event_date) : null;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: img(post.cover, 1200),
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Person', name: post.author_name || "Somm's Wine Bar" },
    publisher: { '@type': 'Organization', name: "Somm's Wine Bar" },
    mainEntityOfPage: fullUrl,
  };

  const body = `
  <div class="read-progress" aria-hidden="true"><span data-progress></span></div>
  <article class="post">
    <header class="post-hero" data-hero data-parallax-root>
      <div class="post-hero-media" data-parallax="0.18"><img src="${e(img(post.cover, 1920))}" alt="${e(post.cover_caption || post.title)}"></div>
      <div class="post-hero-inner">
        <nav class="crumbs" aria-label="Você está em"><a href="/">Início</a><span>/</span><a href="/blog">Diário de Adega</a></nav>
        <p class="post-kicker"><a href="/blog?categoria=${e(post.category || '')}">${e(post.category_name || 'Diário')}</a></p>
        <h1 class="post-title" data-split>${e(post.title)}</h1>
        ${post.subtitle ? `<p class="post-sub">${e(post.subtitle)}</p>` : ''}
        <div class="post-byline">
          <span class="avatar">${initials(post.author_name)}</span>
          <span>${e(post.author_name || "Equipe Somm's")}</span>
          <span class="dot" aria-hidden="true">◆</span>
          <span>${fmtDate(post.published_at, true)}</span>
          <span class="dot" aria-hidden="true">◆</span>
          <span>${post.reading_time} min de leitura</span>
        </div>
        <p class="card-meta center">${styleBadge(post.wine_style)}${post.region ? `<a class="region-link" href="/blog?regiao=${encodeURIComponent(post.region)}">${icon('pin')} ${e(post.region)}</a>` : ''}</p>
      </div>
      ${post.cover_caption ? `<p class="post-caption">${e(post.cover_caption)}</p>` : ''}
      <span class="scroll-cue" aria-hidden="true"></span>
    </header>

    <div class="wrap post-layout">
      <aside class="post-share" aria-label="Compartilhar">
        <span>Compartilhe</span>
        <a href="https://wa.me/?text=${encodeURIComponent(post.title + ' ' + fullUrl)}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">${icon('whatsapp')}</a>
        <button type="button" data-share="${e(fullUrl)}" data-title="${e(post.title)}" aria-label="Compartilhar">${icon('share')}</button>
        <button type="button" data-copy-link="${e(fullUrl)}" aria-label="Copiar link">${icon('link')}</button>
      </aside>

      <div class="post-content prose">
        ${ev ? `
        <div class="event-banner">
          <div class="event-date"><strong>${ev.day}</strong><span>${ev.month}</span><small>${ev.weekday}</small></div>
          <div><p class="eyebrow">Evento</p><p>Vagas limitadas. Reserve a sua pelo WhatsApp.</p></div>
          <a class="btn btn-wine btn-sm" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-evento-post">Garantir vaga</a>
        </div>` : ''}
        ${headings.length >= 3 ? `
        <details class="toc" open>
          <summary>Neste texto</summary>
          <ol>${headings.map((h) => `<li><a href="#${h.id}">${e(h.text)}</a></li>`).join('')}</ol>
        </details>` : ''}
        ${html}

        ${tags.length ? `<div class="post-tags">${tags.map((t) => `<a href="/blog?tag=${encodeURIComponent(t)}">#${e(t)}</a>`).join('')}</div>` : ''}

        <div class="post-end-cta">
          <div>
            <p class="script">Gostou da leitura?</p>
            <p class="display-sm light">Agora prove na taça</p>
            <p class="muted-light">Reserve sua mesa no Somm's e peça ao sommelier um flight inspirado neste texto.</p>
          </div>
          <a class="btn btn-gold" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-fim-post">Reservar mesa ${icon('arrow')}</a>
        </div>

        <section class="author-box">
          <span class="avatar avatar-xl">${initials(post.author_name)}</span>
          <div>
            <p class="script">Escrito por</p>
            <h3>${e(post.author_name || "Equipe Somm's")}</h3>
            <p>${e(post.author_bio || '')}</p>
            ${post.author_instagram ? `<a class="link-arrow" href="${e(post.author_instagram)}" target="_blank" rel="noopener">${icon('instagram')} Seguir no Instagram</a>` : ''}
          </div>
        </section>
      </div>

      <aside class="post-aside">
        <div class="aside-card aside-reserve">
          <img src="/assets/img/mark-cream.png" alt="" class="aside-mark">
          <p class="script">Somm's Wine Bar</p>
          <p class="display-sm light">Mais de 400 rótulos, muitos em taça</p>
          <p class="muted-light">Ter a sex 15h–0h · Sáb 11h30–0h<br>CLS 412, Bloco A · Asa Sul</p>
          <a class="btn btn-gold btn-block" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-aside">Reservar mesa</a>
        </div>
        <div class="aside-card aside-ebook">
          ${ebookBook('book-xs')}
          <p class="script">E-book grátis</p>
          <p class="display-sm">Guia de Vinhos do Centro-Oeste</p>
          <p>Grátis, em PDF.</p>
          <a class="btn btn-wine btn-block btn-sm" href="/guia-centro-oeste" data-track="ebook-aside">Baixar o e-book</a>
        </div>
      </aside>
    </div>
  </article>

  ${related.length ? `
  <section class="related">
    <div class="wrap">
      <div class="sec-head"><h2 class="display" data-split>Para a <em>próxima taça</em></h2><a class="link-script" href="/blog">Todos os textos</a></div>
      <div class="grid-3">${related.map((p) => postCard(p)).join('')}</div>
    </div>
  </section>` : ''}`;

  return layout({
    title: post.title,
    description: post.excerpt,
    image: img(post.cover, 1200),
    body,
    active: 'blog',
    bodyClass: 'is-post',
    url,
    head: `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`,
  });
}

// ---------------------------------------------------------------- e-book (landing)

export function ebookPage() {
  const body = `
  <section class="ebook-hero" data-hero data-parallax-root>
    <div class="page-head-bg" data-parallax="0.2" style="background-image:url('${U('1504279577054-acfeccf8fc52', 1900)}')"></div>
    <div class="wrap ebook-hero-grid">
      <div class="ebook-copy">
        <p class="page-kicker">E-book gratuito · PDF</p>
        <h1 class="h-giant light" data-split>Guia de Vinhos <em>do Centro-Oeste</em></h1>
        <p class="lead light">O Cerrado aprendeu a fazer vinho fino invertendo o calendário da videira. Este guia, feito pelos sommeliers do Somm's, mostra quem produz, o que provar e por onde começar.</p>
        <ul class="checks light">
          <li>A dupla poda explicada de um jeito simples</li>
          <li>Vinícolas de Goiás, Mato Grosso e Mato Grosso do Sul</li>
          <li>As uvas que melhor se adaptaram ao Planalto</li>
          <li>Fichas de degustação e roteiro de enoturismo</li>
        </ul>
      </div>
      <div class="ebook-form-card">
        ${ebookBook()}
        <p class="display-sm">Receba o guia agora</p>
        ${leadForm({ type: 'ebook', button: 'Baixar grátis', source: 'landing-ebook' })}
      </div>
    </div>
  </section>
  <section class="section">
    <div class="wrap ebook-toc">
      <div><p class="eyebrow">O que tem dentro</p><h2 class="display" data-split>Seis capítulos <em>para ler e provar</em></h2></div>
      <ol class="chapters">
        ${[
          ['O Cerrado entra no mapa', 'Por que o Planalto Central parecia improvável e o que mudou.'],
          ['Dupla poda em uma página', 'Como colher no inverno seco transformou a qualidade da uva.'],
          ['Goiás', 'Os vinhedos de altitude dos Pireneus, a 100 km de Brasília.'],
          ['Mato Grosso e Mato Grosso do Sul', 'Da Chapada dos Guimarães à porta do Pantanal.'],
          ['Uvas e estilos', 'Syrah, Sauvignon Blanc e outras castas que se deram bem aqui.'],
          ['Roteiro e fichas de degustação', 'Para visitar, provar e anotar suas impressões.'],
        ].map(([t, d], i) => `<li><span class="num">${pad(i + 1)}</span><div><h3>${t}</h3><p>${d}</p></div></li>`).join('')}
      </ol>
    </div>
  </section>`;
  return layout({ title: 'E-book: Guia de Vinhos do Centro-Oeste', description: 'Baixe grátis o Guia de Vinhos do Centro-Oeste, feito pelos sommeliers do Somm\'s Wine Bar.', body, active: 'ebook', url: '/guia-centro-oeste' });
}

export function notFoundPage() {
  const body = `
  <section class="section notfound">
    <div class="wrap-narrow center">
      <p class="script big-script">Erro 404</p>
      <h1 class="h-giant" data-split>Essa garrafa <em>não está na adega</em></h1>
      <p class="lead center-block">A página que você procura foi movida ou não existe. Que tal uma das nossas leituras?</p>
      <div class="btn-row center"><a class="btn btn-wine" href="/blog">Ir para o Diário de Adega</a><a class="btn btn-ghost" href="/">Página inicial</a></div>
    </div>
  </section>`;
  return layout({ title: 'Página não encontrada', body, hero: false });
}
