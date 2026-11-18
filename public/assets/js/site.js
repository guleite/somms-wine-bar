/* Somm's Wine Bar — interações do site (sem dependências) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const html = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('somms:' + k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('somms:' + k, JSON.stringify(v)); } catch { /* modo privado */ } },
  };
  const DAY = 864e5;
  const track = (name, data = {}) => {
    // Gancho para GA4 / Meta Pixel: window.dataLayer recebe todos os eventos.
    (window.dataLayer = window.dataLayer || []).push({ event: 'somms_' + name, ...data });
  };
  const toast = (msg) => {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2400);
  };

  // ---------------------------------------------------- tela de entrada (+18)
  let gateResolve;
  const gateDone = new Promise((r) => { gateResolve = r; });
  const gate = $('[data-gate]');
  if (html.classList.contains('gate') && gate) {
    const ok = $('[data-gate-ok]', gate);
    setTimeout(() => ok.focus({ preventScroll: true }), 300);
    ok.addEventListener('click', () => {
      store.set('age', Date.now());
      track('idade_confirmada');
      if (reduce) { html.classList.remove('gate'); gateResolve(); return; }
      html.classList.add('gate-leave');
      setTimeout(gateResolve, 450); // a página começa a se revelar enquanto a cortina sobe
      setTimeout(() => html.classList.remove('gate', 'gate-leave'), 1000);
    });
  } else {
    html.classList.remove('gate');
    gateResolve();
  }
  const gateOpen = () => html.classList.contains('gate');

  // ---------------------------------------------------- transição entre páginas
  if (html.classList.contains('pt-in')) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      html.classList.add('pt-reveal');
      html.classList.remove('pt-in');
      setTimeout(() => html.classList.remove('pt-reveal'), 1000);
    }));
  }
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('a[href]');
    if (!a || ev.defaultPrevented || reduce) return;
    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey || ev.button !== 0) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-filter-link')) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || /\.(pdf|xml|csv)$/i.test(url.pathname) || url.pathname.startsWith('/admin')) return;
    if (url.pathname === location.pathname && url.search === location.search && url.hash) return; // âncora na mesma página
    ev.preventDefault();
    try { sessionStorage.setItem('somms:pt', '1'); } catch { /* sem storage */ }
    html.classList.add('pt-out');
    setTimeout(() => { location.href = url.href; }, 680);
  });
  addEventListener('pageshow', (ev) => { if (ev.persisted) html.classList.remove('pt-out', 'pt-in', 'pt-reveal'); });

  // ---------------------------------------------------- cabeçalho
  const header = $('[data-header]');
  const hero = $('[data-hero]');
  const hasHero = document.body.classList.contains('has-hero') && hero;
  function onScroll() {
    const y = scrollY;
    const limit = hasHero ? Math.max(60, hero.offsetHeight - (header?.offsetHeight || 80)) : 0;
    header?.classList.toggle('is-solid', !hasHero || y > limit);
    document.body.classList.toggle('is-scrolled', y > 60);
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  // ---------------------------------------------------- menu de tela cheia
  const menu = $('[data-menu-panel]');
  const menuBtn = $('[data-menu]');
  function setMenu(open) {
    if (!menu) return;
    document.body.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    $('.menu-label', menuBtn).textContent = open ? 'Fechar' : 'Menu';
    if (open) { menu.removeAttribute('inert'); setTimeout(() => $('.menu-main a', menu)?.focus({ preventScroll: true }), 600); }
    else menu.setAttribute('inert', '');
  }
  menuBtn?.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('a', menu || document.createElement('div')).forEach((a) => a.addEventListener('click', () => setTimeout(() => setMenu(false), 50)));
  $$('[data-menu-img]').forEach((a) => {
    const show = () => $$('.menu-preview img').forEach((im, k) => im.classList.toggle('is-on', k === Number(a.dataset.menuImg)));
    a.addEventListener('mouseenter', show);
    a.addEventListener('focus', show);
  });

  // ---------------------------------------------------- busca
  const search = $('[data-search]');
  const openSearch = () => { search.hidden = false; setTimeout(() => $('input', search).focus(), 30); };
  const closeSearch = () => { if (search) search.hidden = true; };
  $('[data-search-open]')?.addEventListener('click', openSearch);
  $('[data-search-close]')?.addEventListener('click', closeSearch);
  search?.addEventListener('click', (ev) => { if (ev.target === search) closeSearch(); });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { closeSearch(); closeModal(); if (document.body.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); } }
    if (ev.key === '/' && !gateOpen() && !/input|textarea|select/i.test(document.activeElement.tagName)) { ev.preventDefault(); openSearch(); }
  });

  // ---------------------------------------------------- títulos palavra a palavra + entradas
  function splitWords(el) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'w';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--wi', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
      });
    };
    walk(el);
    el.classList.add('is-split');
  }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  const REVEAL = '.card, .sec-head .link-script, .story-copy, .event, .chapters li, .ebook-copy, .exp-copy, .hover-list li, .footer-hero-copy .footer-addr, .footer-hero-copy .btn-row, .page-desc, .head-search, .post-sub, .post-byline';
  if (!reduce) {
    $$('[data-split]').forEach(splitWords);
    $$(REVEAL).forEach((el) => el.classList.add('reveal'));
  }
  gateDone.then(() => {
    $$('[data-split], .reveal, .frame, .flight-glasses').forEach((el) => io.observe(el));
  });

  // ---------------------------------------------------- carrossel de destaques
  const slider = $('[data-slider]');
  if (slider) {
    const slides = $$('.slide', slider);
    const bars = $$('[data-goto]', slider);
    const current = $('[data-slide-current]', slider);
    let idx = 0;
    const go = (n) => {
      idx = (n + slides.length) % slides.length;
      slides.forEach((s, k) => {
        s.classList.toggle('is-active', k === idx);
        s.toggleAttribute('inert', k !== idx);
      });
      bars.forEach((b) => b.classList.remove('is-on'));
      void slider.offsetWidth; // reinicia a animação da barra de progresso
      bars.forEach((b, k) => { b.classList.toggle('is-on', k === idx); b.toggleAttribute('aria-current', k === idx); });
      current.textContent = String(idx + 1).padStart(2, '0');
    };
    slides.forEach((s, k) => s.toggleAttribute('inert', k !== 0));
    $('[data-prev]', slider)?.addEventListener('click', () => go(idx - 1));
    $('[data-next]', slider)?.addEventListener('click', () => go(idx + 1));
    bars.forEach((b) => b.addEventListener('click', () => go(Number(b.dataset.goto))));
    // a barra de progresso dita o tempo de cada destaque
    slider.addEventListener('animationend', (ev) => { if (ev.target.parentElement?.matches('.slider-progress .is-on')) go(idx + 1); });
    slider.addEventListener('focusin', () => slider.classList.add('is-paused'));
    slider.addEventListener('focusout', () => slider.classList.remove('is-paused'));
    document.addEventListener('visibilitychange', () => slider.classList.toggle('is-paused', document.hidden));
    // arrastar / deslizar
    let startX = null, moved = false;
    slider.addEventListener('pointerdown', (ev) => { startX = ev.clientX; moved = false; });
    slider.addEventListener('pointermove', (ev) => { if (startX !== null && Math.abs(ev.clientX - startX) > 10) moved = true; });
    slider.addEventListener('pointerup', (ev) => {
      if (startX === null) return;
      const dx = ev.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    });
    slider.addEventListener('click', (ev) => { if (moved) { ev.preventDefault(); ev.stopPropagation(); moved = false; } }, true);
    gateDone.then(() => setTimeout(() => slider.classList.add('is-init'), html.classList.contains('pt-reveal') ? 300 : 60));
  }

  // ---------------------------------------------------- parallax, cursor e imagem flutuante (um só loop)
  const px = reduce ? [] : $$('[data-parallax]').map((el) => ({ el, s: parseFloat(el.dataset.parallax) || 0.1, root: el.closest('[data-parallax-root]') || el.parentElement }));
  let dirty = true;
  addEventListener('scroll', () => { dirty = true; }, { passive: true });
  addEventListener('resize', () => { dirty = true; });
  function parallax() {
    const vh = innerHeight;
    px.forEach((p) => {
      const r = p.root.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      const d = r.top + r.height / 2 - vh / 2;
      p.el.style.transform = `translate3d(0, ${(d * -p.s).toFixed(1)}px, 0)`;
    });
  }

  let mx = innerWidth / 2, my = innerHeight / 2;
  let cursor = null, cx = mx, cy = my;
  let hoverBox = null, hx = mx, hy = my;
  if (finePointer && !reduce) {
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.innerHTML = '<span></span>';
    document.body.appendChild(cursor);
    const label = $('span', cursor);
    addEventListener('pointermove', (ev) => { mx = ev.clientX; my = ev.clientY; cursor.classList.add('is-on'); }, { passive: true });
    document.addEventListener('mouseout', (ev) => { if (!ev.relatedTarget) cursor.classList.remove('is-on'); });
    document.addEventListener('pointerover', (ev) => {
      const t = ev.target.closest('a, button, input, select, textarea, label, [data-cursor]');
      const base = cursor.classList.contains('is-on') ? 'cursor is-on' : 'cursor';
      if (t?.dataset.cursor) { label.textContent = t.dataset.cursor; cursor.className = base + ' is-label'; }
      else cursor.className = base + (t ? ' is-link' : '');
    });

    const items = $$('[data-hover-img]');
    if (items.length) {
      hoverBox = document.createElement('div');
      hoverBox.className = 'hover-img';
      hoverBox.innerHTML = '<img alt="">';
      document.body.appendChild(hoverBox);
      const im = $('img', hoverBox);
      items.forEach((a) => {
        a.addEventListener('mouseenter', () => { im.src = a.dataset.hoverImg; hoverBox.classList.add('is-on'); });
        a.addEventListener('mouseleave', () => hoverBox.classList.remove('is-on'));
      });
    }
  }
  (function tick() {
    if (dirty) { parallax(); dirty = false; }
    if (cursor) {
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
    }
    if (hoverBox) {
      hx += (mx - hx) * 0.1; hy += (my - hy) * 0.1;
      hoverBox.style.setProperty('--x', hx.toFixed(1) + 'px');
      hoverBox.style.setProperty('--y', hy.toFixed(1) + 'px');
    }
    requestAnimationFrame(tick);
  })();

  // ---------------------------------------------------- filtros do blog (sem recarregar)
  const results = $('[data-results]');
  async function loadResults(href, push = true) {
    if (!results) { location.href = href; return; }
    const url = new URL(href, location.origin);
    results.classList.add('is-loading');
    try {
      const params = new URLSearchParams(url.search);
      params.set('parcial', '1');
      const htmlText = await (await fetch('/blog?' + params)).text();
      results.innerHTML = htmlText;
      if (push) history.pushState({}, '', url.pathname + url.search);
      syncFilterUI(url.searchParams);
      $$('.card', results).forEach((el) => { el.classList.add('reveal'); io.observe(el); });
      const top = results.getBoundingClientRect().top + scrollY - 170;
      if (scrollY > top) scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      track('filtro', Object.fromEntries(url.searchParams));
    } catch {
      location.href = href;
    } finally {
      results.classList.remove('is-loading');
    }
  }
  function syncFilterUI(sp) {
    const cat = sp.get('categoria') || '';
    $$('.cat-tabs a').forEach((a) => {
      const acat = new URL(a.href).searchParams.get('categoria') || '';
      a.classList.toggle('is-on', acat === cat);
    });
    const form = $('.filters-panel');
    if (form) {
      form.categoria.value = cat;
      form.q.value = sp.get('q') || '';
      const est = sp.get('estilo') || '';
      $$('input[name="estilo"]', form).forEach((r) => { r.checked = r.value === est; });
      form.regiao.value = sp.get('regiao') || '';
      form.ordem.value = sp.get('ordem') || 'recentes';
      const tag = sp.get('tag') || '';
      $$('.tag-cloud a', form).forEach((a) => a.classList.toggle('is-on', new URL(a.href).searchParams.get('tag') === tag));
    }
    const hs = $('.head-search input[name="q"]');
    if (hs) hs.value = sp.get('q') || '';
  }
  function formHref(form) {
    const sp = new URLSearchParams();
    new FormData(form).forEach((v, k) => { if (v && !(k === 'ordem' && v === 'recentes')) sp.set(k, v); });
    // mantém o que está na URL e não está neste formulário
    const cur = new URLSearchParams(location.search);
    for (const k of ['categoria', 'estilo', 'regiao', 'tag', 'q', 'ordem']) if (!form.elements[k] && cur.get(k)) sp.set(k, cur.get(k));
    if (form.classList.contains('head-search')) sp.delete('tag');
    return '/blog' + (sp.toString() ? '?' + sp : '');
  }
  if (results) {
    document.addEventListener('click', (ev) => {
      const a = ev.target.closest('[data-filter-link]');
      if (!a || ev.metaKey || ev.ctrlKey) return;
      ev.preventDefault();
      loadResults(a.href);
    });
    $$('[data-filter-form]').forEach((form) => {
      form.addEventListener('submit', (ev) => { ev.preventDefault(); loadResults(formHref(form)); });
      form.addEventListener('change', (ev) => { if (ev.target.matches('input[type=radio], select')) loadResults(formHref(form)); });
    });
    addEventListener('popstate', () => loadResults(location.href, false));
    $('[data-filters-toggle]')?.addEventListener('click', () => $('[data-filters]').classList.toggle('is-open'));
  }

  // ---------------------------------------------------- formulários de lead
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  async function submitLead(form) {
    const msg = $('.form-msg', form);
    const data = Object.fromEntries(new FormData(form));
    data.type = form.dataset.type;
    data.source = (form.dataset.source || '') + ' | ' + location.pathname;
    data.consent = form.consent?.checked;
    $$('input', form).forEach((i) => i.classList.remove('is-invalid'));
    const fail = (text, field) => { msg.textContent = text; msg.className = 'form-msg is-error'; field?.classList.add('is-invalid'); field?.focus(); };
    if (form.name && form.name.required && !String(data.name || '').trim()) return fail('Conte pra gente o seu nome.', form.name);
    if (!EMAIL.test(data.email || '')) return fail('Confira o seu e-mail.', form.email);
    if (!data.consent) return fail('Marque o aceite para continuar.');
    const btn = $('button[type=submit]', form);
    btn.disabled = true;
    msg.textContent = 'Enviando…';
    msg.className = 'form-msg';
    try {
      const r = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const out = await r.json();
      if (!r.ok) throw new Error(out.error || 'Não foi possível enviar.');
      store.set('lead-' + data.type, Date.now());
      track('lead', { tipo: data.type, origem: form.dataset.source });
      onLeadSuccess(form, data, out);
    } catch (err) {
      fail(err.message);
    } finally {
      btn.disabled = false;
    }
  }
  function onLeadSuccess(form, data, out) {
    if (data.type === 'ebook') {
      const first = String(data.name || '').trim().split(' ')[0];
      form.outerHTML = `<div class="lead-success"><p class="script">Pronto${first ? ', ' + first.replace(/[<>&"]/g, '') : ''}!</p><p class="display-sm">Seu guia está aqui</p><p>O download começou automaticamente. Se não abrir, use o botão abaixo. Boa leitura e bons vinhos.</p><a class="btn btn-wine" href="${out.download}" download>Baixar o PDF</a></div>`;
      const a = document.createElement('a');
      a.href = out.download; a.download = ''; document.body.appendChild(a); a.click(); a.remove();
    } else if (data.type === 'cupom') {
      const card = form.closest('.coupon-card');
      $('[data-step="form"]', card).hidden = true;
      $('[data-step="code"]', card).hidden = false;
      $('[data-coupon-code]', card).textContent = out.coupon;
    } else {
      form.outerHTML = '<div class="lead-success"><p class="script">Saúde!</p><p class="display-sm light">Inscrição confirmada</p><p class="muted-light">Você vai receber o próximo Diário de Adega no seu e-mail.</p></div>';
    }
  }
  document.addEventListener('submit', (ev) => {
    const form = ev.target.closest('.lead-form');
    if (!form) return;
    ev.preventDefault();
    submitLead(form);
  });

  // ---------------------------------------------------- pop-up de intenção de saída
  const modal = $('[data-exit-modal]');
  let modalShown = false;
  function openModal(reason) {
    if (!modal || modalShown || gateOpen() || document.body.classList.contains('menu-open')) return;
    const last = store.get('exit-shown');
    if (last && Date.now() - last < 3 * DAY) return;
    if (store.get('lead-ebook')) return; // já baixou o guia
    modalShown = true;
    store.set('exit-shown', Date.now());
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('input', modal)?.focus(), 60);
    track('popup_saida', { motivo: reason });
  }
  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  $$('[data-close]', modal || document.createElement('div')).forEach((el) => el.addEventListener('click', closeModal));
  let armedAt = Date.now();
  gateDone.then(() => { armedAt = Date.now(); });
  // desktop: o mouse sai pelo topo da janela
  document.addEventListener('mouseout', (ev) => {
    if (!ev.relatedTarget && ev.clientY <= 8 && Date.now() - armedAt > 6000) openModal('mouse');
  });
  // celular: depois de ler um pouco, rolagem rápida para cima (gesto de "voltar")
  let lastY = scrollY, lastT = Date.now(), maxDepth = 0;
  addEventListener('scroll', () => {
    const now = Date.now();
    const y = scrollY;
    maxDepth = Math.max(maxDepth, y / Math.max(1, document.body.scrollHeight - innerHeight));
    const speed = (lastY - y) / Math.max(1, now - lastT);
    if (matchMedia('(pointer: coarse)').matches && maxDepth > 0.4 && speed > 2.2 && now - armedAt > 15000) openModal('rolagem');
    lastY = y; lastT = now;
  }, { passive: true });
  // ?popup=saida força a exibição (útil para apresentar a proposta)
  if (new URLSearchParams(location.search).get('popup') === 'saida') {
    store.set('exit-shown', 0); store.set('lead-ebook', null);
    gateDone.then(() => setTimeout(() => openModal('forcado'), 900));
  }

  // ---------------------------------------------------- cupom lateral
  const coupon = $('[data-coupon]');
  if (coupon) {
    const state = store.get('coupon');
    const minimize = () => { coupon.classList.add('is-min'); store.set('coupon', { min: true, at: Date.now() }); };
    $('[data-coupon-close]', coupon).addEventListener('click', minimize);
    $('[data-coupon-open]', coupon).addEventListener('click', () => { coupon.classList.remove('is-min'); track('cupom_aberto'); });
    $('[data-copy]', coupon).addEventListener('click', async () => {
      const code = $('[data-coupon-code]', coupon).textContent.trim();
      try { await navigator.clipboard.writeText(code); toast('Cupom copiado: ' + code); } catch { toast(code); }
    });
    if (store.get('lead-cupom')) {
      $('[data-step="form"]', coupon).hidden = true;
      $('[data-step="code"]', coupon).hidden = false;
    }
    const show = () => {
      if (!coupon.hidden) return;
      coupon.hidden = false;
      if (state?.min) coupon.classList.add('is-min');
      else track('cupom_exibido');
    };
    const forced = new URLSearchParams(location.search).get('popup') === 'cupom';
    gateDone.then(() => {
      if (forced) { setTimeout(() => { coupon.classList.remove('is-min'); coupon.hidden = false; }, 900); return; }
      // aparece após 25s ou ao passar de 50% de leitura em um post
      setTimeout(show, state?.min ? 1500 : 25000);
      if (document.body.classList.contains('is-post')) {
        addEventListener('scroll', function onS() {
          const p = scrollY / Math.max(1, document.body.scrollHeight - innerHeight);
          if (p > 0.5) { show(); removeEventListener('scroll', onS); }
        }, { passive: true });
      }
    });
  }

  // ---------------------------------------------------- post: progresso, compartilhar
  const bar = $('[data-progress]');
  if (bar) {
    const content = $('.post-content');
    const upd = () => {
      const r = content.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.4 - r.top) / r.height));
      bar.style.width = (p * 100).toFixed(1) + '%';
    };
    addEventListener('scroll', upd, { passive: true });
    upd();
  }
  $$('[data-share]').forEach((b) => b.addEventListener('click', async () => {
    const data = { title: b.dataset.title, url: b.dataset.share };
    if (navigator.share) { try { await navigator.share(data); } catch { /* cancelado */ } }
    else { try { await navigator.clipboard.writeText(data.url); toast('Link copiado'); } catch { /* sem permissão */ } }
  }));
  $$('[data-copy-link]').forEach((b) => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copyLink); toast('Link copiado'); } catch { toast(b.dataset.copyLink); }
  }));

  // ---------------------------------------------------- cliques em CTA (reservas, anúncios)
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-track]');
    if (a) track('cta', { id: a.dataset.track, href: a.href });
  });
})();
