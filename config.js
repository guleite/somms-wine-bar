// Configuração central do site. Tudo que é "placeholder" está marcado com [CONFIRMAR].
// Variáveis de ambiente sobrescrevem os valores padrão (veja README.md).

const env = process.env;

export const config = {
  port: Number(env.PORT || 5187),
  // Proposta (pitch): noindex + robots Disallow + crédito no rodapé. Desligue ao publicar de verdade.
  pitchMode: env.PITCH_MODE !== '0',
  siteUrl: env.SITE_URL || 'http://localhost:5187',
  // Tela de entrada "tenho 18 anos" (aparece uma vez por visitante). AGE_GATE=0 desliga.
  ageGate: env.AGE_GATE !== '0',

  // Primeiro acesso ao painel: usuário criado a partir destas variáveis (troque em produção).
  admin: {
    user: env.ADMIN_USER || 'admin',
    pass: env.ADMIN_PASS || 'somms2026', // credencial de teste — troque via ADMIN_PASS
    name: 'Equipe Somm\'s',
  },

  // Encaminha cada lead (e-book, cupom, newsletter) para um CRM/automação. Vazio = só salva no banco.
  leadWebhook: env.LEAD_WEBHOOK || '',

  site: {
    name: "Somm's Wine Bar",
    blogName: 'Diário de Adega',
    tagline: 'Histórias, rótulos e harmonizações contadas por quem vive o vinho.',
    description:
      "Somm's Wine Bar, na 412 Sul em Brasília: mais de 400 rótulos, taças servidas no Coravin, flights de degustação e gastronomia pensada para harmonizar.",
    address: 'CLS 412, Bloco A, Loja 27 — Asa Sul, Brasília/DF',
    cep: '70278-120',
    mapsUrl: 'https://maps.google.com/?q=CLS+412+Bloco+A+Loja+27+Asa+Sul+Brasilia',
    hours: [
      ['Terça a sexta', '15h às 0h'],
      ['Sábado', '11h30 às 0h'],
      ['Domingo e segunda', 'consulte'], // [CONFIRMAR]
    ],
    instagram: 'https://www.instagram.com/sommswinebar/',
    whatsappUrl: 'https://wa.me/message/RMXR7NCDVYLUL1', // link do perfil do Instagram
    phone: '(61) 3978-33XX', // [CONFIRMAR] número completo
  },

  // Cupom do pop-up lateral. [CONFIRMAR] regra comercial com o cliente.
  coupon: {
    code: env.COUPON_CODE || 'SOMMS10',
    headline: '10% off no seu primeiro flight',
    rules: 'Válido de terça a sexta, para consumo no salão. Não cumulativo.',
  },

  ebook: {
    title: 'Guia de Vinhos do Centro-Oeste',
    file: '/ebook/guia-vinhos-centro-oeste.pdf',
  },

  // Anúncios in-line inseridos dentro dos posts. "match" = categorias onde o anúncio tem prioridade.
  ads: [
    {
      id: 'flight',
      kicker: 'No Somm\'s',
      title: 'Prove lado a lado: monte o seu flight',
      text: 'Três taças servidas no Coravin, escolhidas pelo sommelier para você comparar estilos, uvas e regiões.',
      cta: 'Reservar mesa',
      href: 'whatsapp',
      image: 'https://images.unsplash.com/photo-1598306442928-4d90f32c6866?auto=format&fit=crop&w=700&q=70',
      match: ['guias', 'rotulos-e-uvas', 'experiencia'],
    },
    {
      id: 'ebook',
      kicker: 'E-book gratuito',
      title: 'Guia de Vinhos do Centro-Oeste',
      text: 'Vinícolas, uvas e a técnica da dupla poda que colocou o Cerrado no mapa do vinho. Baixe grátis.',
      cta: 'Baixar o guia',
      href: '/guia-centro-oeste',
      image: 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?auto=format&fit=crop&w=700&q=70',
      match: ['regioes', 'cerrado'],
    },
    {
      id: 'harmonizacao',
      kicker: 'Cozinha do Somm\'s',
      title: 'Da taça para o prato',
      text: 'O cardápio do chef foi pensado para harmonizar. Peça a sugestão do sommelier para cada prato.',
      cta: 'Quero reservar',
      href: 'whatsapp',
      image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=700&q=70',
      match: ['harmonizacao'],
    },
    {
      id: 'agenda',
      kicker: 'Agenda',
      title: 'Degustações guiadas aos sábados',
      text: 'Uma região ou vinícola por encontro, apresentada pelos nossos sommeliers. Vagas limitadas.',
      cta: 'Ver próximas datas',
      href: '/blog?categoria=eventos',
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=700&q=70',
      match: ['eventos'],
    },
  ],
};

export const WINE_STYLES = [
  { slug: 'tinto', name: 'Tinto', color: '#6E1A2E' },
  { slug: 'branco', name: 'Branco', color: '#D8C27A' },
  { slug: 'rose', name: 'Rosé', color: '#E7A097' },
  { slug: 'espumante', name: 'Espumante', color: '#E9D9A6' },
  { slug: 'laranja', name: 'Laranja / Âmbar', color: '#D08A3A' },
  { slug: 'varios', name: 'Vários estilos', color: '#8C7F95' },
];
