import { config } from '../config.js';
import { e, icon, img, site, waLink } from './helpers.js';
import { listCategories } from '../lib/db.js';

const V = Date.now().toString(36); // cache-busting dos assets a cada deploy
const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;
const pad = (n) => String(n).padStart(2, '0');
const HOURS_SHORT = 'Ter a sex, 15h às 0h · Sáb, 11h30 às 0h';

export function leadForm({ type, button = 'Quero receber', compact = false, dark = false, source = '' }) {
  return `
  <form class="lead-form${compact ? ' is-compact' : ''}${dark ? ' is-dark' : ''}" data-type="${type}" data-source="${e(source)}" novalidate>
    <div class="lead-fields">
      <label class="field"><span>Nome</span><input name="name" autocomplete="given-name" required placeholder="Seu nome"></label>
      <label class="field"><span>E-mail</span><input name="email" type="email" autocomplete="email" required placeholder="voce@email.com"></label>
      <label class="field"><span>WhatsApp</span><input name="whatsapp" type="tel" inputmode="tel" autocomplete="tel" placeholder="(61) 9 0000-0000"></label>
    </div>
    <label class="consent"><input type="checkbox" name="consent" required> <span>Aceito receber conteúdos e ofertas do Somm's. Posso cancelar quando quiser.</span></label>
    <button class="btn btn-gold" type="submit">${button} ${icon('arrow')}</button>
    <p class="form-msg" role="status" aria-live="polite"></p>
  </form>`;
}

function header(active = '') {
  const link = (href, label, key) => `<a href="${href}"${active === key ? ' class="is-active" aria-current="page"' : ''}>${label}</a>`;
  return `
  <header class="site-header" data-header>
    <div class="header-inner">
      <div class="header-left">
        <button class="menu-toggle" type="button" data-menu aria-expanded="false" aria-controls="menu">
          <span class="burger" aria-hidden="true"><i></i><i></i></span><span class="menu-label">Menu</span>
        </button>
      </div>
      <a class="brand" href="/" aria-label="Somm's Wine Bar — início">
        <img class="logo-light" src="/assets/img/logo-cream.png" alt="Somm's Wine Bar" width="188" height="42">
        <img class="logo-dark" src="/assets/img/logo-navy.png" alt="" width="188" height="42" aria-hidden="true">
      </a>
      <div class="header-right">
        <nav class="header-links" aria-label="Principal">
          ${link('/blog', 'Diário de Adega', 'blog')}
          ${link('/blog?categoria=eventos', 'Agenda', 'agenda')}
          ${link('/guia-centro-oeste', 'Guia do Centro-Oeste', 'ebook')}
          <a href="${waLink()}" target="_blank" rel="noopener" class="hl-cta" data-track="reserva-header">Reservar mesa</a>
        </nav>
        <button class="icon-btn search-btn" type="button" data-search-open aria-label="Buscar no blog">${icon('search')}</button>
      </div>
    </div>
  </header>
  ${menuOverlay()}
  <div class="search-overlay" data-search hidden>
    <form action="/blog" class="search-box wrap">
      ${icon('search')}
      <input name="q" placeholder="Buscar uva, região, harmonização…" aria-label="Buscar no blog" autocomplete="off">
      <button type="button" class="icon-btn" data-search-close aria-label="Fechar busca">${icon('close')}</button>
    </form>
    <div class="wrap search-hints">
      <span>Buscas comuns</span>
      ${['syrah', 'ânfora', 'espumante', 'cerrado', 'harmonização', 'coravin'].map((t) => `<a href="/blog?q=${encodeURIComponent(t)}">${t}</a>`).join('')}
    </div>
  </div>`;
}

function menuOverlay() {
  const cats = listCategories();
  const items = [
    ['/', 'Início', U('1598306442928-4d90f32c6866')],
    ['/blog', 'Diário de Adega', U('1611575189074-9dfbbceb258a')],
    ['/blog?categoria=eventos', 'Agenda', U('1510812431401-41d2bd2722f3')],
    ['/guia-centro-oeste', 'Guia do Centro-Oeste', U('1504279577054-acfeccf8fc52')],
    ['#visite', 'Visite o Somm\'s', U('1578911373434-0cb395d2cbfb')],
  ];
  return `
  <div class="menu-overlay" id="menu" data-menu-panel inert>
    <nav class="menu-nav" aria-label="Menu">
      <ol class="menu-main">
        ${items.map(([href, label], i) => `<li><a href="${href}" data-menu-img="${i}" style="--i:${i}"><small>${pad(i + 1)}</small><span>${label}</span></a></li>`).join('')}
      </ol>
      <div class="menu-cats">
        <p class="script">Assuntos</p>
        <div>${cats.map((c) => `<a href="/blog?categoria=${c.slug}">${e(c.name)}</a>`).join('')}</div>
      </div>
    </nav>
    <div class="menu-preview" aria-hidden="true">
      ${items.map(([, , src], i) => `<img src="${img(src, 900)}" alt="" loading="lazy"${i === 0 ? ' class="is-on"' : ''}>`).join('')}
    </div>
    <div class="menu-foot">
      <span>${e(site.address)}</span>
      <span>${HOURS_SHORT}</span>
      <a href="${site.instagram}" target="_blank" rel="noopener">@sommswinebar</a>
      <a href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-menu">Reservas pelo WhatsApp</a>
    </div>
  </div>`;
}

function bottomBar() {
  return `
  <nav class="bottom-bar" aria-label="Atalhos">
    <a href="${site.instagram}" target="_blank" rel="noopener"><span class="bb-grid" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Instagram</a>
    <span class="bb-scroll" aria-hidden="true">Role para explorar</span>
    <div class="bb-right"><a href="/blog?categoria=eventos">Agenda</a><span aria-hidden="true"></span><a href="#visite">Visite</a></div>
  </nav>`;
}

function gate() {
  return `
  <div class="gate-screen" data-gate role="dialog" aria-modal="true" aria-labelledby="gate-text" style="background-image:url('${U('1504279577054-acfeccf8fc52', 1800)}')">
    <div class="gate-inner">
      <img src="/assets/img/logo-cream.png" alt="Somm's Wine Bar" width="240" height="54">
      <p id="gate-text">Bem-vindo ao Somm's. Ao entrar no nosso site — e no nosso mundo — você confirma ter 18 anos ou mais e se compromete a apreciar o vinho com moderação.</p>
      <button class="gate-btn" type="button" data-gate-ok>Entrar</button>
      <small>Venda e consumo de bebidas alcoólicas proibidos para menores de 18 anos.</small>
    </div>
  </div>`;
}

function footer() {
  const cats = listCategories();
  return `
  <footer class="site-footer">
    <section class="footer-hero" id="visite" data-parallax-root>
      <div class="frame footer-frame"><img data-parallax="0.12" src="${U('1474722883778-792e7990302f', 900)}" alt="Taças de vinho tinto servidas no balcão" loading="lazy"></div>
      <div class="footer-hero-copy">
        <h2 class="footer-title"><span class="script">Visite</span><span class="caps">o Somm's</span></h2>
        <p class="footer-addr">${e(site.address)}<br>${HOURS_SHORT}</p>
        <div class="btn-row center">
          <a class="btn btn-gold" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-rodape">Reservar mesa ${icon('arrow')}</a>
          <a class="btn btn-ghost-light" href="${site.mapsUrl}" target="_blank" rel="noopener">Como chegar</a>
        </div>
      </div>
    </section>
    <div class="footer-news">
      <div class="wrap footer-news-inner">
        <div>
          <p class="eyebrow eyebrow-gold">Clube Somm's</p>
          <h2 class="display light">Receba o Diário de Adega <em>e a agenda de degustações</em></h2>
          <p class="muted-light">Um e-mail por quinzena, com textos dos nossos sommeliers, datas de degustação e convites para o festival.</p>
        </div>
        ${leadForm({ type: 'newsletter', button: 'Assinar', dark: true, compact: true, source: 'rodape' })}
      </div>
    </div>
    <div class="wrap footer-grid">
      <div class="footer-brand">
        <img src="/assets/img/logo-cream.png" alt="Somm's Wine Bar" width="200" height="45" loading="lazy">
        <p>Vinhos selecionados, taças servidas no Coravin e gastronomia pensada para harmonizar. Experiências para quem valoriza detalhes.</p>
        <div class="social">
          <a href="${site.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon('instagram')}</a>
          <a href="${waLink()}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon('whatsapp')}</a>
        </div>
      </div>
      <div>
        <h3>Diário de Adega</h3>
        <ul>${cats.map((c) => `<li><a href="/blog?categoria=${c.slug}">${e(c.name)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h3>Visite</h3>
        <p>${e(site.address)}<br>CEP ${e(site.cep)}</p>
        <p>${site.hours.map(([d, h]) => `${e(d)}: ${e(h)}`).join('<br>')}</p>
        <a class="link-gold" href="${site.mapsUrl}" target="_blank" rel="noopener">Como chegar ${icon('arrow')}</a>
      </div>
      <div>
        <h3>Para levar</h3>
        <ul>
          <li><a href="/guia-centro-oeste">E-book: Guia de Vinhos do Centro-Oeste</a></li>
          <li><a href="/blog?categoria=eventos">Agenda de degustações</a></li>
          <li><a href="${waLink()}" target="_blank" rel="noopener">Reservas pelo WhatsApp</a></li>
          <li><a href="/feed.xml">Feed RSS</a></li>
        </ul>
      </div>
    </div>
    <div class="wrap footer-legal">
      <p>© ${new Date().getFullYear()} Somm's Wine Bar · Aprecie com moderação. Venda proibida para menores de 18 anos.</p>
      ${config.pitchMode ? '<p>Proposta desenvolvida por <strong>Concept Agência</strong></p>' : ''}
    </div>
  </footer>`;
}

function popups() {
  const c = config.coupon;
  return `
  <div class="modal" data-exit-modal hidden role="dialog" aria-modal="true" aria-labelledby="exit-title">
    <div class="modal-backdrop" data-close></div>
    <div class="modal-card">
      <button class="icon-btn modal-close" type="button" data-close aria-label="Fechar">${icon('close')}</button>
      <div class="modal-media">
        <div class="book book-sm" aria-hidden="true"><div class="book-cover"><img src="/assets/img/mark-cream.png" alt=""><span>Guia de Vinhos do</span><strong>Centro-Oeste</strong><small>Somm's Wine Bar</small></div></div>
      </div>
      <div class="modal-body">
        <p class="eyebrow">Antes de ir embora</p>
        <h2 id="exit-title" class="display">Leve o guia <em>de presente</em></h2>
        <p>O <strong>Guia de Vinhos do Centro-Oeste</strong>: vinícolas de Goiás, Mato Grosso e Mato Grosso do Sul, a técnica da dupla poda e um roteiro de rótulos para provar. Grátis, em PDF.</p>
        ${leadForm({ type: 'ebook', button: 'Baixar grátis', compact: true, source: 'popup-saida' })}
        <button class="btn-text" type="button" data-close>Agora não, obrigado</button>
      </div>
    </div>
  </div>

  <aside class="coupon" data-coupon hidden aria-label="Cupom de desconto">
    <button class="coupon-tab" type="button" data-coupon-open>${icon('gift')}<span>${e(c.code.replace(/\D/g, '') || '10')}% off</span></button>
    <div class="coupon-card">
      <button class="icon-btn coupon-close" type="button" data-coupon-close aria-label="Minimizar">${icon('close')}</button>
      <p class="script coupon-kicker">Presente da casa</p>
      <h3 class="display">${e(c.headline)}</h3>
      <div class="coupon-step" data-step="form">
        <p>Deixe seu contato e liberamos o cupom na hora.</p>
        <form class="lead-form is-compact" data-type="cupom" data-source="popup-lateral" novalidate>
          <label class="field"><span>E-mail</span><input name="email" type="email" required placeholder="voce@email.com"></label>
          <label class="field"><span>WhatsApp</span><input name="whatsapp" type="tel" placeholder="(61) 9 0000-0000"></label>
          <label class="consent"><input type="checkbox" name="consent" required> <span>Aceito receber ofertas do Somm's.</span></label>
          <button class="btn btn-gold" type="submit">Liberar cupom</button>
          <p class="form-msg" role="status" aria-live="polite"></p>
        </form>
      </div>
      <div class="coupon-step" data-step="code" hidden>
        <div class="ticket"><span>Seu cupom</span><strong data-coupon-code>${e(c.code)}</strong><button type="button" class="icon-btn" data-copy aria-label="Copiar cupom">${icon('copy')}</button></div>
        <p class="tiny">${e(c.rules)}</p>
        <a class="btn btn-wine" href="${waLink()}" target="_blank" rel="noopener" data-track="reserva-cupom">Reservar e usar o cupom</a>
      </div>
    </div>
  </aside>`;
}

export function layout({ title, description = site.description, body, active = '', image = '', head = '', bodyClass = '', url = '', hero = true }) {
  const fullTitle = title ? `${title} · Somm's Wine Bar` : "Somm's Wine Bar · Diário de Adega";
  const ogImage = image || 'https://images.unsplash.com/photo-1598306442928-4d90f32c6866?auto=format&fit=crop&w=1200&q=70';
  const classes = [bodyClass, hero ? 'has-hero' : 'no-hero'].filter(Boolean).join(' ');
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(fullTitle)}</title>
<meta name="description" content="${e(description)}">
${config.pitchMode ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:title" content="${e(fullTitle)}">
<meta property="og:description" content="${e(description)}">
<meta property="og:image" content="${e(ogImage)}">
<meta property="og:type" content="website">
${url ? `<link rel="canonical" href="${e(config.siteUrl + url)}">` : ''}
<meta name="theme-color" content="#131428">
<link rel="icon" href="/assets/img/favicon.png" type="image/png">
<link rel="alternate" type="application/rss+xml" title="Diário de Adega" href="/feed.xml">
<script>(function(h){h.classList.add('js');try{${config.ageGate ? "if(!localStorage.getItem('somms:age'))h.classList.add('gate');" : ''}if(sessionStorage.getItem('somms:pt')){h.classList.add('pt-in');sessionStorage.removeItem('somms:pt')}}catch(e){}})(document.documentElement)</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baskervville:ital@0;1&family=Pinyon+Script&family=Prompt:wght@300;400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/site.css?v=${V}">
${head}
<script>window.SOMMS=${JSON.stringify({ whatsapp: site.whatsappUrl, ebook: config.ebook.file, coupon: config.coupon.code })};</script>
<script src="/assets/js/site.js?v=${V}" defer></script>
</head>
<body class="${classes}">
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${header(active)}
<main id="conteudo">
${body}
</main>
${footer()}
${bottomBar()}
${popups()}
<div class="page-curtain" aria-hidden="true"><img src="/assets/img/mark-cream.png" alt=""></div>
${config.ageGate ? gate() : ''}
</body>
</html>`;
}
