# Somm's Wine Bar — Diário de Adega

Site com blog e painel para cadastrar posts. Node puro (sem dependências), SQLite embutido no Node e páginas geradas no servidor.

## Como rodar

Requer **Node 22.13 ou mais novo** (testado no 24).

```bash
npm start          # http://localhost:5187
npm run dev        # mesmo, reiniciando a cada alteração
npm run reset-db   # apaga o banco (com o servidor parado); o conteúdo de exemplo volta na próxima inicialização
npm run ebook      # gera de novo o PDF do e-book a partir de ebook-src/guia.html (usa o Edge/Chrome instalado)
```

- Site: `/` (home), `/blog` (filtros), `/blog/<slug>` (post), `/guia-centro-oeste` (e-book)
- Painel: `/admin`. Usuário e senha de teste ficam em `config.js` (`admin`); **troque em produção** pelas variáveis `ADMIN_USER` e `ADMIN_PASS`.
- Também há `/feed.xml`, `/sitemap.xml` e `/robots.txt`.

## Versão estática (GitHub Pages)

A cada push na `main`, o GitHub Actions (`.github/workflows/pages.yml`) gera e publica uma cópia estática em **https://guleite.github.io/somms-wine-bar/**. Para gerar localmente: `npm run static` (sai em `_site/`).

Serve para apresentar o site. Diferenças em relação à versão com servidor:
- o conteúdo é o de exemplo (posts criados no painel não aparecem lá);
- filtros e busca do blog rodam no navegador;
- os formulários mostram o PDF e o cupom, mas **não salvam o contato**;
- não tem o painel `/admin`.

## Variáveis de ambiente

| Variável | Para quê | Padrão |
|---|---|---|
| `PORT` | porta do servidor | 5187 |
| `SITE_URL` | endereço público (links do RSS, sitemap, compartilhamento) | `http://localhost:5187` |
| `PITCH_MODE` | `0` desliga o modo proposta (tira o `noindex`, libera o robots e remove o crédito da Concept no rodapé) | ligado |
| `ADMIN_USER` / `ADMIN_PASS` | acesso ao painel | ver `config.js` |
| `COUPON_CODE` | código do cupom do popup lateral | SOMMS10 |
| `LEAD_WEBHOOK` | URL que recebe cada lead em JSON (CRM, Zapier, Make…) | vazio |
| `DB_PATH` | caminho do banco SQLite | `data/somms.db` |
| `AGE_GATE` | `0` desliga a tela de entrada "tenho 18 anos" | ligado |

## Visual e experiência

Inspirado no ritmo de sites de vinícola: telas cheias, tipografia grande em caixa alta com uma linha manuscrita dourada, muito respiro e movimento lento.

- **Tela de entrada (18+)**: aparece uma vez por visitante (fica salvo no navegador). Os popups só começam depois dela.
- **Cabeçalho** transparente sobre a foto de abertura, sólido ao rolar; **menu em tela cheia** com prévia de imagem ao passar o mouse.
- **Transição entre páginas** com uma cortina; se o JavaScript falhar, a cortina some sozinha em 3s.
- **Home**: slider de abertura (troca sozinho, aceita arrastar), textos que sobem palavra por palavra, imagens que se revelam e se movem devagar ao rolar, faixa de categorias corrida, bloco da experiência em azul, banda do e-book e lista "mais lidos" com foto que segue o mouse.
- **Cursor** dourado no computador ("Ler" sobre os posts). No celular e com "reduzir movimento" ligado no sistema, as animações ficam desligadas ou simplificadas.
- Fontes: Baskervville (títulos), Pinyon Script (linha manuscrita), Prompt (interface) e Source Serif 4 (texto dos posts). Cores: azul #23264A, vinho #6B1A2E, dourado #B8925A, papel #F7F2EA.

## Painel (/admin)

- **Visão geral**: posts, leituras, leads e posts mais lidos; atalhos para testar os popups.
- **Posts**: busca e filtro por status/categoria; editar, ver e excluir.
- **Editor**: título, slug automático, subtítulo, texto com barra de formatação, modo dividido com prévia real do post, resumo, rascunho/publicado, data, destaque, capa (URL ou upload), categoria, autor, estilo de vinho, região, tags e data de evento. `Ctrl+S` salva.
- **Leads**: inscrições do e-book, do cupom e da newsletter, com exportação em CSV.
- **Categorias**: listar e criar.

### Formatação dos posts

```
## Título de seção        ### Subtítulo
**negrito**  *itálico*  [link](https://...)
- item de lista
> citação em destaque
---                        (divisor com cacho de uva)
![descrição](https://url-da-imagem.jpg "legenda")

:::ficha Nome do vinho
Uva: Syrah
Região: Cristalina (GO)
:::

:::dica
Dica do sommelier em destaque.
:::

[[anuncio]]                (anúncio no meio do texto; ou [[anuncio:flight]], [[anuncio:ebook]],
                            [[anuncio:harmonizacao]], [[anuncio:agenda]])
```

Se o post não tiver `[[anuncio]]`, um anúncio entra sozinho depois do 3º parágrafo (e outro perto do fim nos textos longos), escolhido pela categoria do post. Os anúncios são editados em `config.js` → `ads`.

## Captação de contatos

- **Popup de saída**: no computador, quando o mouse sai pelo topo; no celular, quando a pessoa volta a rolar rápido para cima depois de ler 40% da página. Aparece no máximo a cada 3 dias e não aparece para quem já baixou o e-book. Para testar: `?popup=saida`.
- **Cupom lateral**: aparece após 25 s (ou na metade do post), pode ser minimizado numa aba. Para testar: `?popup=cupom`.
- **E-book**: seção na home, página própria e anúncios no blog; o download começa ao enviar o formulário.
- Cada formulário grava o lead no banco e, se `LEAD_WEBHOOK` estiver definido, envia para lá também. Os cliques importantes disparam eventos em `window.dataLayer` (pronto para Google Tag Manager / GA4).

## Publicar

O site precisa de um servidor com Node (Dokploy, VPS, Railway, Render…). **Não roda no GitHub Pages**, porque o blog e o painel dependem do servidor.

- Mantenha as pastas `data/` (banco) e `public/uploads/` (imagens enviadas) em volume persistente.
- Defina `SITE_URL`, `ADMIN_USER`, `ADMIN_PASS` e `PITCH_MODE=0`.
- As fotos de exemplo vêm do Unsplash por link; troque pelas fotos da casa quando houver.

## A confirmar com o cliente

- Telefone completo e horários de domingo e segunda (`config.js` → `site`).
- Regras do cupom (validade, se vale em todos os dias, se acumula com outras promoções).
- Os 13 posts de exemplo foram escritos para a proposta: textos, autoria atribuída aos sommeliers e números de leitura são fictícios.
- Evento da Lorangi (21/11, 19h) e o Festival (05/12): datas, horários e detalhes.
- Conteúdo do e-book (`ebook-src/guia.html`): vinícolas e informações do Centro-Oeste devem ser revisadas antes de divulgar.
