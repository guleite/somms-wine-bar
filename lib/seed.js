// Conteúdo inicial do Diário de Adega (proposta). Textos escritos pela agência a partir do
// Instagram @sommswinebar e de matérias públicas — revisar com os sommeliers antes de publicar.

const U = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

export const CATEGORIES = [
  ['experiencia', "A experiência Somm's", 'Flights, Coravin e o jeito Somm\'s de servir vinho.', 'glass', 1],
  ['guias', 'Guias para começar', 'O básico bem explicado, sem esnobismo.', 'book', 2],
  ['rotulos-e-uvas', 'Rótulos & Uvas', 'Castas, estilos e garrafas que merecem a sua atenção.', 'bottle', 3],
  ['regioes', 'Regiões do mundo', 'Uma viagem por terroirs clássicos e improváveis.', 'globe', 4],
  ['cerrado', 'Cerrado & Centro-Oeste', 'O vinho que nasce no Planalto Central e arredores.', 'sun', 5],
  ['harmonizacao', 'Harmonização', 'O que beber com o que você vai comer.', 'plate', 6],
  ['eventos', 'Agenda & Degustações', 'Degustações guiadas, festivais e noites temáticas.', 'calendar', 7],
];

export const AUTHORS = [
  ['beatriz-campos', 'Beatriz Campos', 'Sommelière', 'Sommelière do Somm\'s Wine Bar. Conduz as degustações temáticas de sábado e adora apresentar regiões que pouca gente conhece.', 'https://www.instagram.com/beatrizcampos.vinhos/'],
  ['frederico-castro', 'Frederico Castro', 'Sommelier', 'Sommelier do Somm\'s Wine Bar. Responsável pela carta de mais de 400 rótulos e pelos flights servidos no Coravin.', 'https://www.instagram.com/sommelierfrederico/'],
  ['equipe', "Equipe Somm's", 'Redação do Diário de Adega', 'Textos da equipe do Somm\'s Wine Bar, na 412 Sul, em Brasília.', 'https://www.instagram.com/sommswinebar/'],
];

const POSTS = [
  {
    title: 'Flights: por que provar vinhos lado a lado muda tudo',
    subtitle: 'Três taças, uma pergunta. O jeito mais rápido de descobrir do que você realmente gosta.',
    category: 'experiencia', wine_style: 'varios', region: '', author: 'frederico-castro', featured: 1,
    tags: 'flights, degustação, coravin, iniciantes',
    cover: U('1598306442928-4d90f32c6866'), cover_caption: 'Um flight bem montado conta uma história do primeiro ao último gole.',
    published_at: '2026-11-16 10:00',
    content: `Quem prova um vinho sozinho sabe se gostou. Quem prova três lado a lado descobre **por que** gostou. Essa é a ideia por trás dos flights, a forma de servir que é a assinatura do Somm's: pequenas doses de rótulos diferentes, servidas ao mesmo tempo, para você comparar com calma.

Não é prova técnica nem aula. É conversa. O sommelier escolhe um tema, separa as taças e você vai percebendo as diferenças no nariz e na boca, sem pressa e sem precisar decorar nenhum termo.

## Como funciona um flight

Cada flight gira em torno de uma pergunta simples. Algumas que a gente adora fazer:

- **A mesma uva em três lugares.** Um Syrah do Cerrado, um Shiraz australiano e um Syrah do Rhône. Mesma casta, três sotaques.
- **Três estilos de branco.** Um fresco e sem madeira, um com passagem por barrica e um laranja, feito com contato com as cascas.
- **Velho Mundo x Novo Mundo.** Dois vinhos de clima e tradição diferentes, para entender o que o terroir faz.

[[anuncio]]

## Por que comparar ensina mais

O paladar é relativo. Um tinto pode parecer leve até você provar um ainda mais leve ao lado. A acidez de um branco só salta aos olhos quando ele divide a mesa com outro mais redondo. Comparar dá referência, e referência é o que transforma gosto em preferência.

> Ninguém aprende vinho decorando notas. Aprende provando um ao lado do outro.

:::dica Como provar um flight
Comece sempre pelo mais leve e termine no mais estruturado. Entre uma taça e outra, um gole de água. E volte à primeira no final: ela vai parecer outro vinho.
:::

## O papel do Coravin

Só conseguimos servir flights com rótulos raros porque usamos o [Coravin](/blog/coravin-taca-de-rotulos-raros), um sistema que retira o vinho sem abrir a garrafa. Isso significa que aquele vinho especial pode ser servido em uma dose, para uma pessoa, numa terça-feira qualquer.

![Taças de vinho branco e tinto lado a lado](${U('1598306442837-613a3def54ff')} "Do mais leve ao mais estruturado: a ordem importa.")

## Para quem é

Para quem está começando e quer descobrir o próprio gosto sem gastar uma garrafa inteira em cada aposta. E para quem já conhece e quer sair do óbvio. O flight é o atalho nos dois casos.

Na próxima visita, peça ao sommelier um flight com o tema que você quiser. Ou deixe que ele escolha: a gente adora surpreender.`,
  },
  {
    title: 'Sábado no Somm\'s: os vinhos de ânfora da Lorangi',
    subtitle: 'Uma viagem entre o Brasil e a Geórgia em quatro taças, com vinhos fermentados em qvevri.',
    category: 'eventos', wine_style: 'laranja', region: 'Brasil & Geórgia', author: 'frederico-castro', featured: 0,
    tags: 'ânfora, qvevri, degustação, geórgia, saperavi, rkatsiteli',
    cover: U('1680258702656-d00ad980099f'), cover_caption: 'Ânforas de barro: o recipiente mais antigo do vinho volta à moda.',
    published_at: '2026-11-17 18:00', event_date: '2026-11-21',
    content: `Neste sábado, **21 de novembro**, o Somm's abre uma degustação especial com os vinhos da **Vinícola Lorangi Marani**, uma experiência para conhecer a tradição milenar dos vinhos georgianos e a técnica de elaboração em qvevri, as grandes ânforas de barro.

:::ficha Degustação Vinhos de Ânfora
Quando: sábado, 21 de novembro, às 19h
Onde: Somm's Wine Bar, CLS 412, Bloco A
Investimento: R$ 149 por pessoa
Reservas: pelo WhatsApp do Somm's
:::

## O que vamos provar

Quatro rótulos que mostram como a ânfora conversa com uvas brasileiras e georgianas:

1. **Tannat 70% e Syrah 30%**, elaborado em qvevri.
2. **Egiodola**, vinho de ânfora.
3. **Saperavi**, a grande tinta da Geórgia.
4. **Rkatsiteli**, a branca georgiana que vira um vinho âmbar quando fermenta com as cascas.

[[anuncio]]

## Por que vale a pena

Vinho de ânfora não é modismo: é a forma mais antiga de fazer vinho de que se tem notícia. Se você ainda não conhece, leia o nosso guia sobre [vinhos de ânfora e vinhos laranja](/blog/vinhos-de-anfora-a-tradicao-georgiana) antes de vir. E chegue com curiosidade, porque essas taças costumam surpreender.

As vagas são limitadas. Garanta a sua pelo WhatsApp.`,
  },
  {
    title: 'Vinhos de ânfora: a tradição georgiana de 8 mil anos na sua taça',
    slug: 'vinhos-de-anfora-a-tradicao-georgiana',
    subtitle: 'O que é um qvevri, por que alguns brancos ficam cor de âmbar e como beber vinho laranja.',
    category: 'rotulos-e-uvas', wine_style: 'laranja', region: 'Geórgia', author: 'beatriz-campos', featured: 1,
    tags: 'ânfora, qvevri, vinho laranja, geórgia, natural',
    cover: U('1709239736068-42eef6821d9d'), cover_caption: 'Antes do inox e do carvalho, havia o barro.',
    published_at: '2026-11-10 09:00',
    content: `Muito antes das barricas de carvalho e dos tanques de inox, o vinho era feito em barro. Na Geórgia, no Cáucaso, essa história tem cerca de **8 mil anos** e continua viva em um recipiente com nome difícil e personalidade enorme: o **qvevri**.

## O que é um qvevri

É uma grande ânfora de barro, em formato de ovo, enterrada no chão até a boca. O mosto fermenta ali dentro, muitas vezes com cascas, sementes e até engaços, e depois descansa por meses protegido da variação de temperatura pela própria terra. O método é reconhecido pela UNESCO como patrimônio cultural imaterial.

> O barro respira sem perfumar. O vinho ganha textura, mas não ganha gosto de madeira.

## Por que alguns brancos ficam laranja

Quando uvas brancas fermentam em contato com as cascas, como se faz com os tintos, o vinho extrai cor, aromas e taninos. O resultado tem tons que vão do dourado ao âmbar e é chamado de **vinho laranja** ou **vinho âmbar**. Não tem laranja nenhuma ali dentro: o nome vem da cor.

[[anuncio]]

:::ficha Rkatsiteli em qvevri
Uva: Rkatsiteli (branca)
Cor: âmbar brilhante
Nariz: damasco seco, chá preto, casca de laranja, mel
Boca: seca, com taninos finos e acidez viva
Serviço: 12 a 14 °C, em taça de tinto
Combina com: queijos curados, cogumelos, pratos com especiarias
:::

## As uvas da Geórgia

- **Saperavi:** uma das poucas tintas com polpa colorida. Dá vinhos profundos, ácidos e longevos.
- **Rkatsiteli:** a branca mais plantada do país, perfeita para o contato com cascas.
- **Mtsvane:** branca aromática, mais delicada.

## Como beber vinho laranja

Trate como um tinto leve. Sirva um pouco mais fresco que um tinto e mais quente que um branco, em taça ampla. E pense na comida: com taninos e acidez, ele segura pratos que deixariam um branco comum sem graça.

![Ânforas de barro em uma vinícola](${U('1680258702656-d00ad980099f')} "Ânforas de barro: o mesmo princípio usado há milênios.")

:::dica Primeira vez?
Comece por um laranja de maceração curta, com poucos dias de contato com as cascas. Ele é mais fácil de entender. Depois vá para os de meses em ânfora.
:::

No Somm's, a ânfora aparece com frequência nos flights e nas degustações de sábado. Fique de olho na agenda.`,
  },
  {
    title: '2º Somm\'s Wine Festival: 5 de dezembro na Torre de TV Digital',
    subtitle: 'O festival volta à Flor do Cerrado com expositores, importadoras e muita taça pela frente.',
    category: 'eventos', wine_style: 'varios', region: 'Brasília', author: 'equipe', featured: 1,
    tags: 'festival, brasília, torre de tv digital, evento',
    cover: U('1510812431401-41d2bd2722f3'), cover_caption: 'Brindes, descobertas e a vista mais bonita de Brasília.',
    published_at: '2026-11-12 12:00', event_date: '2026-12-05',
    content: `Está confirmado: a segunda edição do **Somm's Wine Festival** acontece no dia **5 de dezembro**, de novo na **Torre de TV Digital**, a Flor do Cerrado de Oscar Niemeyer.

A primeira edição encheu a cúpula de vidro de gente curiosa, taças erguidas e conversas sobre vinho com o pôr do sol de fundo. Para a próxima, estamos preparando ainda mais rótulos, produtores e experiências.

:::ficha 2º Somm's Wine Festival
Quando: sábado, 5 de dezembro de 2026
Onde: Torre de TV Digital, Brasília
Ingressos: em breve pelo WhatsApp do Somm's
:::

## O que esperar

- Importadoras e vinícolas convidadas com rótulos para provar.
- Sommeliers do Somm's guiando quem quiser explorar.
- Rótulos do Brasil e de regiões menos óbvias, como Geórgia, Moldávia e Japão.

[[anuncio]]

## Fique por perto

Os detalhes de ingressos, expositores e programação saem primeiro aqui no Diário de Adega e no nosso Instagram. Deixe seu contato na newsletter para receber o aviso antes de todo mundo.`,
  },
  {
    title: 'Vale do São Francisco: vinho no sertão, com mais de uma safra por ano',
    subtitle: 'Como o semiárido nordestino virou região vinícola e o que provamos na degustação da Garziera.',
    category: 'regioes', wine_style: 'tinto', region: 'Vale do São Francisco', author: 'beatriz-campos', featured: 0,
    tags: 'vale do são francisco, pernambuco, bahia, vinho brasileiro, garziera',
    cover: U('1506377247377-2a5b3b417ebb'), cover_caption: 'Sol o ano todo e água do rio: a receita do vinho tropical.',
    published_at: '2026-11-15 11:00',
    content: `Quando se fala em vinho brasileiro, a cabeça vai direto para a Serra Gaúcha. Mas uma das regiões mais surpreendentes do país fica no sertão, entre **Pernambuco e Bahia**, às margens do Rio São Francisco.

## Vinho tropical

Na região de Petrolina, Lagoa Grande e Casa Nova, faz calor o ano inteiro e quase não chove. Parece o oposto do que a videira gosta, mas a irrigação com a água do rio dá ao produtor o controle total do ciclo da planta. Com o manejo da poda, é possível colher **mais de uma vez por ano**, algo raríssimo no mundo do vinho.

> No Vale, quem decide quando a uva vai amadurecer é o produtor, não o calendário.

## O estilo dos vinhos

Tintos frutados e macios, brancos aromáticos e espumantes, especialmente os moscatéis, frescos e perfumados. São vinhos de prazer imediato, ótimos para o nosso clima.

[[anuncio]]

## A noite da Garziera

No sábado, 14 de novembro, recebemos no Somm's a degustação **Descobrindo o Vale do São Francisco na taça**, com quatro rótulos da **Vinícola Garziera**, apresentados pela nossa sommelière. Foi uma noite de bons vinhos, descobertas e muita troca, e ficou claro como esse terroir ainda é pouco conhecido em Brasília.

![Uvas brancas em colheita](${U('1472352327492-9765783b74e1')} "No semiárido, a colheita pode acontecer em quase qualquer mês.")

:::dica Para provar em casa
Procure um espumante moscatel do Vale para o próximo almoço de verão. Sirva bem gelado, entre 4 e 6 °C, com frutas e queijos frescos.
:::

Quer provar os rótulos do Vale? Pergunte ao sommelier quais estão na carta da semana.`,
  },
  {
    title: 'Syrah do Cerrado: como a dupla poda colocou o Planalto Central no mapa',
    subtitle: 'Inverter o calendário da videira foi a ideia que fez o Centro-Oeste produzir vinhos finos.',
    category: 'cerrado', wine_style: 'tinto', region: 'Cerrado', author: 'frederico-castro', featured: 1,
    tags: 'cerrado, syrah, dupla poda, goiás, distrito federal, vinho brasileiro',
    cover: U('1504279577054-acfeccf8fc52'), cover_caption: 'Colheita no inverno seco: o segredo dos vinhos do Cerrado.',
    published_at: '2026-11-05 09:00',
    content: `Durante muito tempo, plantar uva para vinho fino no Cerrado parecia teimosia. O problema era o calendário: a uva amadurecia justamente no verão, a época das chuvas, quando a umidade dilui o açúcar e traz doenças. A virada veio com uma ideia simples e genial: **mudar a época da colheita**.

## O que é a dupla poda

A técnica, também chamada de poda invertida, foi desenvolvida por pesquisadores em Minas Gerais e se espalhou pelo Sudeste e pelo Centro-Oeste. Funciona assim:

1. Uma primeira poda, de formação, faz a planta crescer durante o verão chuvoso, sem deixar frutos.
2. Uma segunda poda, no fim do verão, induz a produção.
3. A uva amadurece no **inverno seco**, entre junho e agosto, com dias ensolarados e noites frias.

Resultado: maturação lenta, açúcar concentrado e a acidez preservada pelas noites frescas. Tudo que um bom vinho precisa.

> O Cerrado não ganhou um clima novo. Ganhou um calendário novo.

[[anuncio]]

## Por que a Syrah virou estrela

A Syrah se adaptou muito bem ao manejo e ao sol do Planalto. Os tintos costumam ter fruta escura madura, pimenta e um frescor que surpreende quem espera um vinho pesado. A Sauvignon Blanc também vem se destacando entre os brancos.

:::ficha Syrah do Cerrado (perfil típico)
Cor: rubi profundo, com reflexos violáceos
Nariz: amora, ameixa, pimenta-do-reino, violeta
Boca: encorpado, taninos macios, final fresco
Serviço: 16 a 18 °C
Combina com: carnes grelhadas, cordeiro, queijos curados
:::

## Quem está fazendo

Em **Cocalzinho de Goiás**, a cerca de 100 km de Brasília, a Pireneus Vinhos e Vinhedos trabalha com Syrah, Tempranillo, Sangiovese e Barbera, usando a poda invertida para colher no inverno. Em Mato Grosso, na Chapada dos Guimarães, também há projetos repetindo o manejo da dupla poda com Syrah.

![Cachos de uva tinta no vinhedo](${U('1537640538966-79f369143f8f')} "Uva madura no inverno: dias de sol e noites frias.")

Quer conhecer as vinícolas da região, as uvas e as rotas para visitar? Baixe grátis o nosso [Guia de Vinhos do Centro-Oeste](/guia-centro-oeste).`,
  },
  {
    title: 'Coravin: como servimos taças de rótulos raros sem abrir a garrafa',
    slug: 'coravin-taca-de-rotulos-raros',
    subtitle: 'Uma agulha, um gás inerte e a liberdade de provar aquele vinho especial em uma única taça.',
    category: 'experiencia', wine_style: 'varios', region: '', author: 'frederico-castro', featured: 0,
    tags: 'coravin, serviço, taça, rótulos raros',
    cover: U('1553361371-9b22f78e8b1d'), cover_caption: 'A taça certa, na hora certa, sem desperdício.',
    published_at: '2026-10-28 10:00',
    content: `Todo wine bar enfrenta o mesmo dilema: abrir uma garrafa especial para servir uma taça é arriscar perder o resto. O vinho em contato com o ar começa a oxidar e, em poucos dias, já não é o mesmo. É por isso que tantos lugares só servem em taça os rótulos mais simples.

No Somm's, a solução tem nome: **Coravin**.

## Como funciona

1. Uma agulha muito fina atravessa a rolha, sem retirá-la.
2. O sistema injeta **argônio**, um gás inerte, que empurra o vinho para fora pela agulha.
3. Quando a agulha sai, a rolha natural se fecha sozinha. O oxigênio não entra.

O vinho que ficou na garrafa continua protegido e pode esperar semanas, meses, até a próxima taça.

[[anuncio]]

## O que isso muda para você

- Taças de rótulos que normalmente só seriam vendidos em garrafa.
- Flights com vinhos de faixas de preço e regiões diferentes.
- Liberdade para provar antes de decidir pela garrafa.

> Com o Coravin, a pergunta deixa de ser "qual garrafa vamos abrir?" e vira "o que você está com vontade de provar?".

![Garrafas de vinho deitadas na adega](${U('1562601579-599dec564e06')} "Mais de 400 rótulos, muitos deles disponíveis em taça.")

:::dica Peça para ver
Se tiver curiosidade, peça ao sommelier para servir sua taça com o Coravin na mesa. É rápido e vale a demonstração.
:::`,
  },
  {
    title: 'Harmonização sem mistério: 5 regras (e quando quebrá-las)',
    subtitle: 'Peso com peso, acidez contra gordura e outras ideias que funcionam em qualquer mesa.',
    category: 'harmonizacao', wine_style: 'varios', region: '', author: 'beatriz-campos', featured: 0,
    tags: 'harmonização, comida, iniciantes, queijos',
    cover: U('1566995541428-f2246c17cda1'), cover_caption: 'A melhor harmonização é a que faz os dois parecerem melhores.',
    published_at: '2026-10-22 09:00',
    content: `Harmonizar não é acertar uma combinação mágica. É fazer o vinho e a comida conversarem, de modo que um deixe o outro melhor. Cinco regras resolvem a maior parte das situações.

## 1. Peso com peso

Pratos leves pedem vinhos leves. Pratos intensos pedem vinhos com corpo. Um peixe grelhado some ao lado de um tinto potente; uma costela faz um branco delicado parecer água.

## 2. Acidez corta gordura

Frituras, queijos cremosos e molhos amanteigados ficam ótimos com vinhos de acidez alta, como espumantes e brancos frescos. A acidez limpa a boca e prepara para a próxima garfada.

## 3. Tanino ama proteína

Os taninos dos tintos se suavizam com a proteína e a gordura da carne. Por isso a combinação de tinto estruturado com carne vermelha é clássica.

[[anuncio]]

## 4. O vinho deve ser mais doce que a sobremesa

Se a sobremesa for mais doce que o vinho, ele vai parecer azedo. Para doces, escolha vinhos doces: Porto, colheita tardia, moscatéis.

## 5. Do mesmo lugar, combina

Pratos e vinhos que nasceram na mesma região costumam se entender. Massa ao sugo com tinto italiano. Bacalhau com branco português.

> Regra boa é a que você sabe quando quebrar.

## Quando quebrar

Picantes não gostam de álcool alto e tanino, que ampliam a ardência. Prefira brancos aromáticos com um toque de doçura. E espumante combina com quase tudo: na dúvida, abra um.

:::dica Queijos e vinhos
Queijos frescos com brancos e espumantes. Queijos de casca mofada, como brie, com espumantes e Chardonnay. Curados com tintos. Azuis com vinhos doces.
:::`,
  },
  {
    title: 'O que beber com o cardápio do Somm\'s: um roteiro prato a prato',
    subtitle: 'Do tartar ao petit gâteau, as sugestões dos nossos sommeliers para cada etapa da noite.',
    category: 'harmonizacao', wine_style: 'tinto', region: '', author: 'beatriz-campos', featured: 0,
    tags: 'harmonização, cardápio, gastronomia, chef',
    cover: U('1767510533093-ffb6421a002d'), cover_caption: 'Cozinha pensada para harmonizar.',
    published_at: '2026-10-14 10:00',
    content: `A cozinha do Somm's foi pensada para conversar com a carta de vinhos. Aqui vai um roteiro com algumas das nossas sugestões favoritas. O cardápio muda com as estações, então use como ponto de partida e peça ajuda ao sommelier na mesa.

## Para começar: tartar de filé

Carne crua, temperos vivos e batatas. Pede um tinto leve e fresco, como um **Pinot Noir** servido levemente refrescado, ou um **rosé seco** de boa acidez.

## Salada Doçura do Pomar

Folhas, amêndoas caramelizadas, tomate confit, bacon e molho Dijon. O doce, o defumado e a mostarda pedem um **Sauvignon Blanc** cheio de frescor.

[[anuncio]]

## Salmão grelhado ao molho béarnaise

A manteiga do béarnaise pede um branco com mais corpo. Um **Chardonnay com leve passagem por madeira** acompanha a textura sem esconder o peixe.

## Filé mignon imperial

Demi-glace e fettuccine na fonduta de brie: é hora do tinto de corpo. Um **Syrah do Cerrado** ou um **Malbec** de altitude seguram a intensidade do prato.

:::ficha A escolha da casa
Prato: filé mignon imperial
Vinho: Syrah do Cerrado
Por quê: fruta escura e pimenta conversam com o demi-glace; a acidez equilibra a fonduta
:::

## Para fechar: petit gâteau

Chocolate quente e sorvete. Lembre da regra: o vinho precisa ser mais doce que a sobremesa. Um **Porto Ruby** é parceiro certeiro.

![Vinho branco sendo servido no balcão](${U('1553682544-4ccf2778c9a8')} "Na dúvida, peça uma taça para cada prato.")`,
  },
  {
    title: 'Como ler um rótulo de vinho em 60 segundos',
    subtitle: 'Uva, região, safra e as palavras que realmente importam na hora de escolher.',
    category: 'guias', wine_style: 'varios', region: '', author: 'equipe', featured: 0,
    tags: 'rótulo, iniciantes, como escolher, safra',
    cover: U('1592119748016-a61c40a44320'), cover_caption: 'Tudo que você precisa saber está no rótulo. Ou quase.',
    published_at: '2026-10-08 09:00',
    content: `Parado na frente da prateleira, todo rótulo parece igual. Mas, em um minuto, dá para tirar dele quase tudo que importa. Vamos por partes.

## 1. Uva ou região?

Vinhos do **Novo Mundo** (Brasil, Chile, Argentina, Austrália) costumam destacar a **uva** no rótulo: Malbec, Cabernet, Chardonnay. Vinhos do **Velho Mundo** (França, Itália, Espanha, Portugal) costumam destacar a **região**: Bordeaux, Chianti, Rioja, Douro. Nesse caso, a uva está implícita nas regras da denominação.

## 2. A safra

É o ano da colheita. Para brancos leves e rosés, quanto mais jovem, melhor. Para tintos de guarda, safras mais antigas podem estar no auge.

[[anuncio]]

## 3. O teor alcoólico

Uma pista de corpo. Abaixo de 12,5% tende a ser leve; acima de 14%, encorpado e mais quente.

## 4. As siglas de origem

DOC, DOCG, AOC, DO: indicam que o vinho segue regras de uma região demarcada. Não garantem que você vai gostar, mas garantem origem.

## 5. Palavras de estilo

- **Brut, Extra Brut, Nature:** níveis de açúcar dos espumantes, do mais doce ao mais seco.
- **Reserva, Gran Reserva:** em alguns países, indicam tempo mínimo de envelhecimento.
- **Sur lie, barrique, ânfora:** pistas de como o vinho foi elaborado.

![Garrafas com rótulos na prateleira](${U('1516594915697-87eb3b1c14ea')} "Uva, região e safra: o tripé de qualquer rótulo.")

:::dica O truque do sommelier
Não sabe por onde começar? Diga do que gostou na última vez. "Gostei daquele tinto macio" vale mais que qualquer sigla.
:::`,
  },
  {
    title: 'Moldávia: o país do vinho que você ainda não conhece',
    subtitle: 'Adegas subterrâneas gigantes, uvas nativas e uma tradição que está chegando ao Brasil.',
    category: 'regioes', wine_style: 'tinto', region: 'Moldávia', author: 'equipe', featured: 0,
    tags: 'moldávia, leste europeu, fetească neagră, degustação',
    cover: U('1765850258613-9e671f59a9ad'), cover_caption: 'Na Moldávia, algumas adegas são cidades inteiras debaixo da terra.',
    published_at: '2026-10-30 10:00',
    content: `Espremida entre a Romênia e a Ucrânia, a Moldávia é um dos países mais ligados ao vinho no mundo: a videira está por toda parte, na paisagem, na economia e na mesa. Ainda assim, quase ninguém por aqui já provou um rótulo moldavo.

## Adegas do tamanho de cidades

As antigas minas de calcário do país viraram adegas subterrâneas monumentais. **Cricova** tem dezenas de quilômetros de galerias por onde se circula de carro. **Mileștii Mici** é conhecida por guardar uma das maiores coleções de vinho do mundo.

## As uvas nativas

- **Fetească Neagră:** tinta elegante, com fruta escura e especiarias.
- **Fetească Albă:** branca aromática e delicada.
- **Rară Neagră:** tinta leve, fresca, de taninos suaves.

[[anuncio]]

## A noite moldava no Somm's

No sábado, 31 de outubro, recebemos a degustação **Descobrindo a Moldávia na taça**: quatro rótulos apresentados pela embaixadora da I'M Winery no Brasil, Daiany Nastoli. Para muita gente na mesa, foi o primeiro contato com o país.

![Barris em adega](${U('1608232385022-8ba61bec6c59')} "Tradição de guarda em adegas de calcário.")

Alguns desses rótulos entram na carta em taça. Pergunte ao sommelier.`,
  },
  {
    title: 'Vinhos do Japão chegaram ao Somm\'s',
    subtitle: 'A uva Koshu, os vinhedos aos pés do Monte Fuji e uma importação de estoque limitado.',
    category: 'rotulos-e-uvas', wine_style: 'branco', region: 'Japão', author: 'frederico-castro', featured: 0,
    tags: 'japão, koshu, yamanashi, branco, importação',
    cover: U('1585553616435-2dc0a54e271d'), cover_caption: 'Delicado, cítrico e pensado para a comida japonesa.',
    published_at: '2026-11-03 10:00',
    content: `Sim, o Japão faz vinho. E dos bons. Uma importação histórica acaba de desembarcar no Somm's, com estoque limitado, para quem gosta de descobrir novos horizontes no mundo do vinho.

## A uva Koshu

A grande protagonista é a **Koshu**, uva de casca rosada cultivada há séculos na região de **Yamanashi**, aos pés do Monte Fuji. Ela dá brancos leves, de baixo teor alcoólico, com notas cítricas, de flor branca e um final quase salino.

:::ficha Koshu de Yamanashi (perfil típico)
Cor: palha muito claro
Nariz: yuzu, pera, flor branca
Boca: leve, seca, acidez delicada, final mineral
Serviço: 8 a 10 °C
Combina com: sashimi, tempurá, ostras, saladas cítricas
:::

[[anuncio]]

## E os tintos?

O Japão também tem a **Muscat Bailey A**, uma tinta criada no próprio país, de vinhos frutados e leves. Uma curiosidade que vale a taça.

## Como garantir a sua garrafa

O estoque é limitado. Você pode provar no salão ou reservar pelo WhatsApp do Somm's.`,
  },
  {
    title: 'Espumantes brasileiros para as festas: um guia rápido',
    subtitle: 'Brut, Nature, moscatel, método tradicional: o que muda e qual escolher para cada momento.',
    category: 'guias', wine_style: 'espumante', region: 'Serra Gaúcha', author: 'beatriz-campos', featured: 0,
    tags: 'espumante, festas, brasil, brut, moscatel',
    cover: U('1776530899794-aaaa3b9dd1a1'), cover_caption: 'O Brasil é referência mundial em espumantes.',
    published_at: '2026-11-18 08:00',
    content: `Fim de ano chegando, e a pergunta mais comum no balcão é sempre a mesma: qual espumante levar? A boa notícia é que o Brasil está entre os melhores produtores do mundo nessa categoria. A outra boa notícia é que dá para escolher bem sabendo só três coisas.

## 1. O método

- **Tradicional (champenoise):** a segunda fermentação acontece na própria garrafa. Bolhas finas, notas de pão e brioche, mais complexidade.
- **Charmat:** a segunda fermentação acontece em tanques. Vinhos mais frutados, frescos e acessíveis.

## 2. O nível de açúcar

Do mais seco ao mais doce: **Nature**, **Extra Brut**, **Brut**, **Demi-Sec**. O Brut é o mais versátil para a mesa.

[[anuncio]]

## 3. A uva

Chardonnay e Pinot Noir dominam os espumantes clássicos. Já o **moscatel** dá espumantes doces, perfumados e de baixo álcool, ótimos com frutas e sobremesas.

:::dica Qual levar para a ceia
Para a entrada e os pratos salgados, um Brut de método tradicional. Para a sobremesa, um moscatel. Para brindar à meia-noite, o que você mais gosta: brinde é emoção, não técnica.
:::

![Espumante sendo servido em taças](${U('1776530899794-aaaa3b9dd1a1')} "Sirva entre 6 e 8 °C, em taça tulipa.")`,
  },
];

export function seed(db, createPost) {
  const insCat = db.prepare('INSERT OR IGNORE INTO categories (slug, name, description, icon, position) VALUES (?, ?, ?, ?, ?)');
  for (const c of CATEGORIES) insCat.run(...c);
  const insAuth = db.prepare('INSERT OR IGNORE INTO authors (slug, name, role, bio, instagram) VALUES (?, ?, ?, ?, ?)');
  for (const a of AUTHORS) insAuth.run(...a);
  if (db.prepare('SELECT COUNT(*) AS n FROM posts').get().n) return;
  // visualizações fictícias para a ordenação "mais lidos" ter dados na proposta
  const views = [412, 188, 365, 290, 154, 331, 207, 176, 149, 263, 121, 198, 87];
  POSTS.forEach((p, i) => {
    const created = createPost({ ...p, status: 'published' });
    db.prepare('UPDATE posts SET views = ? WHERE id = ?').run(views[i] || 50, created.id);
  });
}
