// Markdown enxuto para os posts, com blocos próprios do universo do vinho.
//
//   ## Título / ### Subtítulo        > citação em destaque
//   - lista / 1. lista numerada      --- divisor (cacho de uva)
//   ![legenda](url)                  imagem com legenda (linha sozinha)
//   **negrito** *itálico* [link](url) `código`
//
//   :::ficha Nome do vinho           -> card "ficha técnica" (linhas Chave: valor)
//   Uva: Syrah
//   :::
//
//   :::dica                          -> caixa "dica do sommelier"
//   texto
//   :::
//
//   [[anuncio]] ou [[anuncio:ebook]] -> espaço de anúncio in-line (preenchido na renderização)

export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function safeUrl(url = '') {
  const u = String(url).trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(u)) return escapeHtml(u);
  return '#';
}

function inline(text) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const raw = href.replace(/&amp;/g, '&');
    const ext = /^https?:/i.test(raw);
    return `<a href="${safeUrl(raw)}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  });
  return s;
}

export function slugify(s = '') {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

/**
 * Converte markdown em uma lista de blocos HTML.
 * Retorna { blocks: [{type, html}], headings: [{id, text}] }
 */
export function parseMarkdown(src = '') {
  const lines = String(src).replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  const headings = [];
  let i = 0;

  const push = (type, html) => blocks.push({ type, html });

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (!t) { i++; continue; }

    // blocos especiais :::
    const fence = t.match(/^:::(ficha|dica)\s*(.*)$/);
    if (fence) {
      const kind = fence[1];
      const title = fence[2];
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') { body.push(lines[i]); i++; }
      i++;
      if (kind === 'ficha') {
        const rows = body
          .map((l) => l.trim())
          .filter(Boolean)
          .map((l) => {
            const idx = l.indexOf(':');
            if (idx < 0) return `<div class="ficha-row ficha-note"><dd>${inline(l)}</dd></div>`;
            return `<div class="ficha-row"><dt>${inline(l.slice(0, idx))}</dt><dd>${inline(l.slice(idx + 1).trim())}</dd></div>`;
          })
          .join('');
        push('ficha', `<aside class="ficha"><p class="ficha-kicker">Ficha de degustação</p>${title ? `<h4 class="ficha-title">${inline(title)}</h4>` : ''}<dl>${rows}</dl></aside>`);
      } else {
        const paras = body.join('\n').split(/\n\s*\n/).map((p) => `<p>${inline(p.trim())}</p>`).join('');
        push('dica', `<aside class="dica"><p class="dica-kicker">Dica do sommelier</p>${title ? `<h4>${inline(title)}</h4>` : ''}${paras}</aside>`);
      }
      continue;
    }

    const ad = t.match(/^\[\[anuncio(?::([a-z0-9-]+))?\]\]$/i);
    if (ad) { push('ad', ad[1] || ''); i++; continue; }

    const h = t.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2].replace(/\s+#+$/, '');
      const id = slugify(text);
      if (level === 2) headings.push({ id, text });
      push(`h${level}`, `<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(t)) { push('hr', '<hr class="divider">'); i++; continue; }

    const img = t.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      const caption = img[3] || img[1];
      push('figure', `<figure class="post-figure"><img src="${safeUrl(img[2])}" alt="${escapeHtml(img[1])}" loading="lazy">${caption ? `<figcaption>${inline(caption)}</figcaption>` : ''}</figure>`);
      i++;
      continue;
    }

    if (t.startsWith('>')) {
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) { q.push(lines[i].trim().replace(/^>\s?/, '')); i++; }
      push('quote', `<blockquote class="pullquote"><p>${inline(q.join(' '))}</p></blockquote>`);
      continue;
    }

    if (/^[-*]\s+/.test(t)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^[-*]\s+/, '')); i++; }
      push('ul', `<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`);
      continue;
    }

    if (/^\d+[.)]\s+/.test(t)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i].trim())) { items.push(lines[i].trim().replace(/^\d+[.)]\s+/, '')); i++; }
      push('ol', `<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`);
      continue;
    }

    // parágrafo: junta linhas até uma linha vazia ou início de outro bloco
    const para = [t];
    i++;
    while (i < lines.length) {
      const n = lines[i].trim();
      if (!n || /^(#{2,3}\s|>|[-*]\s|\d+[.)]\s|:::|!\[|\[\[anuncio|-{3,}$)/.test(n)) break;
      para.push(n);
      i++;
    }
    push('p', `<p>${inline(para.join(' '))}</p>`);
  }

  return { blocks, headings };
}

export function readingTime(src = '') {
  const words = String(src).replace(/[#>*_\[\]()!:-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 200));
}

export function plainExcerpt(src = '', max = 180) {
  const text = String(src)
    .replace(/:::[\s\S]*?:::/g, ' ')
    .replace(/\[\[[^\]]*\]\]/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}
