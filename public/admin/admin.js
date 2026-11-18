/* Painel do Diário de Adega — SPA sem dependências */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('[data-main]');
  let meta = null;
  let dirty = false;

  async function api(path, opts = {}) {
    const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (r.status === 401 && !path.endsWith('/login')) { showLogin(); throw new Error('Sessão expirada.'); }
    const data = r.headers.get('content-type')?.includes('json') ? await r.json() : await r.text();
    if (!r.ok) throw new Error(data.error || 'Erro inesperado.');
    return data;
  }
  function toast(msg, error = false) {
    const t = $('[data-toast]');
    t.textContent = msg;
    t.classList.toggle('is-error', error);
    t.hidden = false;
    clearTimeout(t._h);
    t._h = setTimeout(() => (t.hidden = true), 2600);
  }
  const fmt = (s) => (s ? new Date(s.replace(' ', 'T')).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
  const thumb = (url) => (url || '').replace(/([?&])w=\d+/, '$1w=160') || '/assets/img/placeholder.svg';
  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

  // ------------------------------------------------------------ sessão
  function showLogin() {
    $('[data-view="app"]').hidden = true;
    $('[data-view="login"]').hidden = false;
    setTimeout(() => $('[data-login] input').focus(), 50);
  }
  async function showApp(user) {
    $('[data-view="login"]').hidden = true;
    $('[data-view="app"]').hidden = false;
    $('[data-user]').textContent = `Olá, ${user.name || user.username}`;
    meta = await api('/api/meta');
    route();
  }
  $('[data-login]').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    const msg = $('[data-login-msg]');
    msg.textContent = '';
    try {
      const out = await api('/api/login', { method: 'POST', body: { user: f.user.value, pass: f.pass.value } });
      f.reset();
      showApp(out.user);
    } catch (err) {
      msg.textContent = err.message;
      msg.className = 'form-msg is-error';
    }
  });
  $('[data-logout]').addEventListener('click', async () => {
    await api('/api/logout', { method: 'POST' });
    showLogin();
  });

  // ------------------------------------------------------------ rotas
  addEventListener('hashchange', () => {
    if (dirty && !confirm('Há alterações não salvas. Sair mesmo assim?')) { history.back(); return; }
    dirty = false;
    route();
  });
  addEventListener('beforeunload', (ev) => { if (dirty) { ev.preventDefault(); ev.returnValue = ''; } });

  function route() {
    const [, name = 'painel', id] = location.hash.split('/');
    $$('[data-route]').forEach((a) => a.classList.toggle('is-on', a.dataset.route === (name === 'editar' ? 'posts' : name)));
    const views = { painel: viewDashboard, posts: viewPosts, novo: () => viewEditor(), editar: () => viewEditor(Number(id)), leads: viewLeads, categorias: viewCategories };
    (views[name] || viewDashboard)().catch((err) => toast(err.message, true));
    scrollTo(0, 0);
  }

  // ------------------------------------------------------------ visão geral
  async function viewDashboard() {
    const s = await api('/api/stats');
    const byType = Object.fromEntries(s.leadsByType.map((r) => [r.type, r.n]));
    const maxViews = Math.max(1, ...s.top.map((p) => p.views));
    main.innerHTML = `
      <div class="page-title"><h1>Visão <em>geral</em></h1><a class="btn btn-wine btn-sm" href="#/novo">+ Novo post</a></div>
      <div class="kpis">
        <div class="kpi"><span>Posts publicados</span><strong>${s.published}</strong><small>${s.drafts} rascunho(s)</small></div>
        <div class="kpi"><span>Leituras</span><strong>${s.views.toLocaleString('pt-BR')}</strong><small>somando todos os posts</small></div>
        <div class="kpi"><span>Downloads do e-book</span><strong>${byType.ebook || 0}</strong><small>leads do guia</small></div>
        <div class="kpi"><span>Cupons + newsletter</span><strong>${(byType.cupom || 0) + (byType.newsletter || 0)}</strong><small>${byType.cupom || 0} cupons · ${byType.newsletter || 0} assinaturas</small></div>
      </div>
      <div class="panels">
        <div class="panel"><h2>Mais lidos</h2><div class="bar-list">
          ${s.top.map((p) => `<div><a href="#/editar/${p.id}">${esc(p.title)}</a><span>${p.views}</span><i style="width:${(p.views / maxViews) * 100}%"></i></div>`).join('')}
        </div></div>
        <div class="panel"><h2>Atalhos</h2>
          <div class="form-grid">
            <a class="btn btn-ghost btn-sm" href="#/novo">Escrever um post</a>
            <a class="btn btn-ghost btn-sm" href="#/leads">Ver leads e exportar CSV</a>
            <a class="btn btn-ghost btn-sm" href="/" target="_blank" rel="noopener">Abrir o site</a>
            <a class="btn btn-ghost btn-sm" href="/?popup=saida" target="_blank" rel="noopener">Testar pop-up de saída</a>
            <a class="btn btn-ghost btn-sm" href="/blog?popup=cupom" target="_blank" rel="noopener">Testar pop-up de cupom</a>
          </div>
        </div>
      </div>`;
  }

  // ------------------------------------------------------------ lista de posts
  async function viewPosts() {
    main.innerHTML = `
      <div class="page-title"><h1>Posts</h1><a class="btn btn-wine btn-sm" href="#/novo">+ Novo post</a></div>
      <form class="toolbar" data-filter>
        <input name="q" placeholder="Buscar por título, tag, texto…" type="search">
        <select name="status"><option value="">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option></select>
        <select name="categoria"><option value="">Todas as categorias</option>${meta.categories.map((c) => `<option value="${c.slug}">${esc(c.name)}</option>`).join('')}</select>
      </form>
      <div class="table-wrap"><table>
        <thead><tr><th>Post</th><th>Categoria</th><th>Status</th><th>Publicação</th><th>Leituras</th><th></th></tr></thead>
        <tbody data-rows><tr><td colspan="6" class="empty-row">Carregando…</td></tr></tbody>
      </table></div>`;
    const form = $('[data-filter]');
    const load = async () => {
      const p = new URLSearchParams({ todos: 1, limite: 100, q: form.q.value, status: form.status.value, categoria: form.categoria.value });
      const { items } = await api('/api/posts?' + p);
      $('[data-rows]').innerHTML = items.length ? items.map((p) => `
        <tr>
          <td><div class="t-post"><img src="${esc(thumb(p.cover))}" alt=""><div><strong>${esc(p.title)}</strong><small>/blog/${esc(p.slug)}${p.featured ? ' · ★ destaque' : ''}</small></div></div></td>
          <td>${esc(p.category_name || '—')}</td>
          <td><span class="status ${p.status}">${p.status === 'published' ? 'Publicado' : 'Rascunho'}</span></td>
          <td>${fmt(p.published_at)}</td>
          <td>${p.views}</td>
          <td><div class="row-actions">
            <a href="#/editar/${p.id}">Editar</a>
            <a href="/blog/${esc(p.slug)}" target="_blank" rel="noopener">Ver</a>
            <button type="button" class="danger" data-del="${p.id}" data-title="${esc(p.title)}">Excluir</button>
          </div></td>
        </tr>`).join('') : '<tr><td colspan="6" class="empty-row">Nenhum post encontrado.</td></tr>';
    };
    let t;
    form.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 250); });
    form.addEventListener('submit', (ev) => ev.preventDefault());
    main.onclick = async (ev) => {
      const b = ev.target.closest('[data-del]');
      if (!b) return;
      if (!confirm(`Excluir definitivamente "${b.dataset.title}"? Essa ação não pode ser desfeita.`)) return;
      await api('/api/posts/' + b.dataset.del, { method: 'DELETE' });
      toast('Post excluído.');
      load();
    };
    load();
  }

  // ------------------------------------------------------------ editor
  async function viewEditor(id) {
    const p = id ? await api('/api/posts/' + id) : {
      title: '', slug: '', subtitle: '', excerpt: '', content: '## Primeiro intertítulo\n\nEscreva aqui o seu texto.\n', cover: '', cover_caption: '',
      category: meta.categories[0]?.slug || '', author: meta.authors[0]?.slug || '', wine_style: '', region: '', tags: '', featured: 0, status: 'draft', published_at: '', event_date: '',
    };
    const opt = (list, val, valueKey, labelKey, empty) =>
      (empty ? `<option value="">${empty}</option>` : '') + list.map((o) => `<option value="${esc(o[valueKey])}" ${o[valueKey] === val ? 'selected' : ''}>${esc(o[labelKey])}</option>`).join('');

    main.innerHTML = `
      <div class="page-title">
        <h1>${id ? 'Editar <em>post</em>' : 'Novo <em>post</em>'}</h1>
        <div class="actions-bar">
          ${id ? `<a class="btn btn-ghost btn-sm" href="/blog/${esc(p.slug)}" target="_blank" rel="noopener" data-view-link>Ver no site</a>` : ''}
          <button class="btn btn-ghost btn-sm" type="button" data-save="draft">Salvar rascunho</button>
          <button class="btn btn-wine btn-sm" type="button" data-save="published">${p.status === 'published' ? 'Atualizar' : 'Publicar'}</button>
        </div>
      </div>
      <form class="editor" data-editor>
        <div class="form-grid">
          <textarea class="title-input" name="title" rows="1" placeholder="Título do post" required aria-label="Título">${esc(p.title)}</textarea>
          <div class="slug-line">Endereço: /blog/<input name="slug" value="${esc(p.slug)}" aria-label="Endereço (slug)" placeholder="gerado-a-partir-do-titulo"></div>
          <label>Linha fina <small>(subtítulo exibido abaixo do título)</small><input name="subtitle" value="${esc(p.subtitle)}"></label>
          <div class="md-wrap">
            <div class="md-tools" data-tools>
              <button type="button" data-md="h2" title="Intertítulo">H2</button>
              <button type="button" data-md="h3" title="Subtítulo">H3</button>
              <button type="button" data-md="b" title="Negrito"><b>B</b></button>
              <button type="button" data-md="i" title="Itálico"><i>I</i></button>
              <button type="button" data-md="link">Link</button>
              <button type="button" data-md="ul">Lista</button>
              <button type="button" data-md="quote">Citação</button>
              <span class="sep"></span>
              <button type="button" data-md="img">Imagem</button>
              <button type="button" data-md="ficha">Ficha de vinho</button>
              <button type="button" data-md="dica">Dica</button>
              <button type="button" data-md="ad">Anúncio</button>
              <button type="button" data-md="hr">Divisor</button>
              <span class="tabs"><button type="button" data-mode="edit">Escrever</button><button type="button" data-mode="split" class="is-on">Lado a lado</button><button type="button" data-mode="preview">Prévia</button></span>
            </div>
            <div class="md-area" data-area>
              <textarea name="content" spellcheck="true" aria-label="Conteúdo">${esc(p.content)}</textarea>
              <div class="md-preview prose" data-preview></div>
            </div>
            <p class="md-help">Use <code>## Intertítulo</code>, <code>**negrito**</code>, <code>*itálico*</code>, <code>[texto](link)</code>, <code>&gt; citação</code>. Blocos: <code>:::ficha Nome</code> … <code>:::</code> e <code>:::dica</code> … <code>:::</code>. <code>[[anuncio]]</code> posiciona o anúncio; sem ele, o anúncio entra sozinho após o 3º parágrafo.</p>
          </div>
          <label>Resumo <small>(opcional: aparece nos cards e no Google; vazio = gerado do texto)</small><textarea name="excerpt" rows="2">${esc(p.excerpt)}</textarea></label>
        </div>

        <div class="editor-side">
          <div class="side-box">
            <h3>Publicação</h3>
            <label>Status<select name="status"><option value="draft" ${p.status !== 'published' ? 'selected' : ''}>Rascunho</option><option value="published" ${p.status === 'published' ? 'selected' : ''}>Publicado</option></select></label>
            <label>Data de publicação<input type="datetime-local" name="published_at" value="${esc((p.published_at || '').replace(' ', 'T'))}"></label>
            <label class="check"><input type="checkbox" name="featured" ${p.featured ? 'checked' : ''}> Destaque na home</label>
          </div>
          <div class="side-box">
            <h3>Capa</h3>
            <div class="cover-prev" data-cover-prev style="${p.cover ? `background-image:url('${esc(thumb(p.cover).replace('w=160', 'w=640'))}')` : ''}">${p.cover ? '' : 'Sem imagem'}</div>
            <label>URL da imagem<input name="cover" value="${esc(p.cover)}" placeholder="https://…"></label>
            <span class="btn btn-ghost btn-xs btn-file">Enviar do computador<input type="file" accept="image/*" data-upload="cover"></span>
            <label>Legenda da capa<input name="cover_caption" value="${esc(p.cover_caption)}"></label>
          </div>
          <div class="side-box">
            <h3>Classificação</h3>
            <label>Categoria<select name="category">${opt(meta.categories, p.category, 'slug', 'name')}</select></label>
            <label>Autor<select name="author">${opt(meta.authors, p.author, 'slug', 'name')}</select></label>
            <label>Estilo de vinho<select name="wine_style">${opt(meta.styles, p.wine_style, 'slug', 'name', '—')}</select></label>
            <label>Região<input name="region" list="regions" value="${esc(p.region)}" placeholder="Ex.: Cerrado, Douro…"></label>
            <datalist id="regions">${meta.regions.map((r) => `<option value="${esc(r.name)}">`).join('')}</datalist>
            <label>Tags <small>(separadas por vírgula)</small><input name="tags" value="${esc(p.tags)}"></label>
            <label>Data do evento <small>(só para Agenda)</small><input type="date" name="event_date" value="${esc(p.event_date)}"></label>
          </div>
          <p class="err" data-err></p>
        </div>
      </form>`;

    const form = $('[data-editor]');
    const ta = form.content;
    const preview = $('[data-preview]');
    let slugTouched = Boolean(id);

    const grow = () => { form.title.style.height = 'auto'; form.title.style.height = form.title.scrollHeight + 2 + 'px'; };
    grow();
    form.title.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') ev.preventDefault(); });
    form.title.addEventListener('input', () => { grow(); if (!slugTouched) form.slug.value = slugify(form.title.value); });
    form.slug.addEventListener('input', () => { slugTouched = true; });
    form.addEventListener('input', () => { dirty = true; });

    // prévia ao vivo (renderizada pelo servidor, idêntica ao site)
    let pt;
    const renderPreview = async () => {
      try {
        const { html } = await api('/api/preview', { method: 'POST', body: { content: ta.value, category: form.category.value } });
        preview.innerHTML = html || '<p style="color:#999">A prévia aparece aqui.</p>';
      } catch { /* sessão */ }
    };
    ta.addEventListener('input', () => { clearTimeout(pt); pt = setTimeout(renderPreview, 350); });
    renderPreview();

    $$('[data-mode]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-mode]').forEach((x) => x.classList.toggle('is-on', x === b));
      const area = $('[data-area]');
      area.classList.toggle('only-edit', b.dataset.mode === 'edit');
      area.classList.toggle('only-preview', b.dataset.mode === 'preview');
      if (b.dataset.mode !== 'edit') renderPreview();
    }));

    // barra de formatação
    const wrap = (before, after = before, placeholder = 'texto') => {
      const { selectionStart: s, selectionEnd: e2, value } = ta;
      const sel = value.slice(s, e2) || placeholder;
      ta.setRangeText(before + sel + after, s, e2, 'end');
      ta.focus();
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const block = (text) => {
      const { selectionStart: s, value } = ta;
      const pre = s > 0 && value[s - 1] !== '\n' ? '\n\n' : '';
      ta.setRangeText(`${pre}${text}\n`, s, ta.selectionEnd, 'end');
      ta.focus();
      ta.dispatchEvent(new Event('input', { bubbles: true }));
    };
    const fileInput = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*' });
    fileInput.addEventListener('change', async () => {
      const url = await upload(fileInput.files[0]);
      if (url) block(`![Legenda da imagem](${url})`);
      fileInput.value = '';
    });
    $('[data-tools]').addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-md]');
      if (!b) return;
      ({
        h2: () => block('## Intertítulo'),
        h3: () => block('### Subtítulo'),
        b: () => wrap('**'),
        i: () => wrap('*'),
        link: () => { const url = prompt('Endereço do link (https://… ou /blog/…):'); if (url) wrap('[', `](${url})`, 'texto do link'); },
        ul: () => block('- Item um\n- Item dois'),
        quote: () => block('> Uma frase que merece destaque.'),
        img: () => fileInput.click(),
        ficha: () => block(':::ficha Nome do vinho\nUva: \nRegião: \nNariz: \nBoca: \nServiço: \nCombina com: \n:::'),
        dica: () => block(':::dica Título da dica\nTexto da dica do sommelier.\n:::'),
        ad: () => block('[[anuncio]]'),
        hr: () => block('---'),
      })[b.dataset.md]?.();
    });

    // capa
    const setCover = (url) => {
      form.cover.value = url;
      const prev = $('[data-cover-prev]');
      prev.style.backgroundImage = url ? `url('${url.replace(/([?&])w=\d+/, '$1w=640')}')` : '';
      prev.textContent = url ? '' : 'Sem imagem';
      dirty = true;
    };
    form.cover.addEventListener('change', () => setCover(form.cover.value.trim()));
    $('[data-upload="cover"]').addEventListener('change', async (ev) => {
      const url = await upload(ev.target.files[0]);
      if (url) setCover(url);
      ev.target.value = '';
    });

    // salvar
    const save = async (status) => {
      const data = Object.fromEntries(new FormData(form));
      data.featured = form.featured.checked;
      data.status = status || data.status;
      const err = $('[data-err]');
      err.textContent = '';
      if (!data.title.trim()) { err.textContent = 'Dê um título ao post.'; form.title.focus(); return; }
      try {
        const out = id ? await api('/api/posts/' + id, { method: 'PUT', body: data }) : await api('/api/posts', { method: 'POST', body: data });
        dirty = false;
        toast(out.status === 'published' ? 'Post publicado!' : 'Rascunho salvo.');
        if (!id) location.hash = '#/editar/' + out.id;
        else viewEditor(id);
      } catch (e2) {
        err.textContent = e2.message;
        toast(e2.message, true);
      }
    };
    $$('[data-save]').forEach((b) => b.addEventListener('click', () => save(b.dataset.save)));
    form.addEventListener('keydown', (ev) => { if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') { ev.preventDefault(); save(); } });
    form.addEventListener('submit', (ev) => ev.preventDefault());
  }

  async function upload(file) {
    if (!file) return null;
    if (file.size > 6e6) { toast('Imagem acima de 6 MB. Reduza antes de enviar.', true); return null; }
    const data = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
    try {
      const out = await api('/api/upload', { method: 'POST', body: { name: file.name, data } });
      toast('Imagem enviada.');
      return out.url;
    } catch (err) {
      toast(err.message, true);
      return null;
    }
  }

  // ------------------------------------------------------------ leads
  async function viewLeads() {
    const rows = await api('/api/leads');
    const label = { ebook: 'E-book', cupom: 'Cupom', newsletter: 'Newsletter' };
    main.innerHTML = `
      <div class="page-title"><h1>Leads</h1><a class="btn btn-wine btn-sm" href="/api/leads.csv">Exportar CSV</a></div>
      <div class="toolbar">
        <select data-type><option value="">Todos os tipos</option><option value="ebook">E-book</option><option value="cupom">Cupom</option><option value="newsletter">Newsletter</option></select>
        <span class="tiny">${rows.length} contato(s) no total</span>
      </div>
      <div class="table-wrap"><table>
        <thead><tr><th>Data</th><th>Tipo</th><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Origem</th></tr></thead>
        <tbody data-rows></tbody>
      </table></div>`;
    const render = (type) => {
      const list = type ? rows.filter((r) => r.type === type) : rows;
      $('[data-rows]').innerHTML = list.length ? list.map((r) => `
        <tr><td>${esc(new Date(r.created_at.replace(' ', 'T') + 'Z').toLocaleString('pt-BR'))}</td><td><span class="status published">${label[r.type] || esc(r.type)}</span></td>
        <td>${esc(r.name || '—')}</td><td><a href="mailto:${esc(r.email)}">${esc(r.email)}</a></td><td>${esc(r.whatsapp || '—')}</td><td class="tiny">${esc(r.source)}</td></tr>`).join('')
        : '<tr><td colspan="6" class="empty-row">Nenhum lead ainda. Eles chegam pelo e-book, pelo cupom e pela newsletter.</td></tr>';
    };
    $('[data-type]').addEventListener('change', (ev) => render(ev.target.value));
    render('');
  }

  // ------------------------------------------------------------ categorias
  async function viewCategories() {
    meta = await api('/api/meta');
    const icons = ['glass', 'book', 'bottle', 'globe', 'sun', 'plate', 'calendar', 'grape'];
    main.innerHTML = `
      <div class="page-title"><h1>Categorias</h1></div>
      <div class="panels">
        <div class="table-wrap"><table>
          <thead><tr><th>Nome</th><th>Endereço</th><th>Posts</th></tr></thead>
          <tbody>${meta.cats.map((c) => `<tr><td><strong>${esc(c.name)}</strong><br><small class="tiny">${esc(c.description)}</small></td><td>/blog?categoria=${esc(c.slug)}</td><td>${c.count}</td></tr>`).join('')}</tbody>
        </table></div>
        <form class="panel form-grid" data-cat>
          <h2>Nova categoria</h2>
          <label>Nome<input name="name" required></label>
          <label>Descrição curta<input name="description"></label>
          <label>Ícone<select name="icon">${icons.map((i) => `<option>${i}</option>`).join('')}</select></label>
          <button class="btn btn-wine btn-sm">Salvar categoria</button>
        </form>
      </div>`;
    $('[data-cat]').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      try {
        await api('/api/categories', { method: 'POST', body: Object.fromEntries(new FormData(ev.target)) });
        toast('Categoria salva.');
        viewCategories();
      } catch (err) { toast(err.message, true); }
    });
  }

  // ------------------------------------------------------------ início
  api('/api/me').then((r) => showApp(r.user)).catch(() => showLogin());
})();
