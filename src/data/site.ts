/** Configurações e textos globais do site. */
export const site = {
  name: 'English Academy',
  tagline: 'Fale Inglês Fluente 4x Mais Rápido!',
  slogan: 'Inglês de verdade é na English Academy',
  experience: 'The best English experience',
  description:
    'Curso de inglês 4x mais rápido com o Método Callan. Aulas diárias, 100% conversação e turmas reduzidas. Accredited School desde 2013. Unidades em Parauapebas, Marabá, Canaã dos Carajás, Belém, Imperatriz e online ao vivo.',
  url: 'https://www.englishacademy.net.br',
  email: 'contato@englishacademy.live',
  social: {
    instagram: 'https://instagram.com/english_academy_br',
    tiktok: 'https://www.englishacademybr.com/tiktok',
    youtube: 'https://www.englishacademybr.com/youtube',
  },
  livePlatform: 'https://www.englishacademy.live',
  /**
   * IDs de medição (GA4, Meta Pixel, GTM). Preencha aqui OU nas variáveis de
   * ambiente PUBLIC_GTM_ID / PUBLIC_GA4_ID / PUBLIC_META_PIXEL_ID do painel
   * da hospedagem (a variável de ambiente tem prioridade).
   *
   * Se `gtmId` estiver preenchido, o site carrega SÓ o GTM — configure GA4 e
   * Pixel dentro do contêiner para não contar eventos em dobro. Sem GTM, o
   * site carrega GA4 e Pixel diretamente com os IDs abaixo.
   *
   * Nenhum script de medição é carregado antes de o visitante aceitar os
   * cookies no aviso de privacidade (LGPD).
   */
  analytics: {
    gtmId: '', // ex.: GTM-XXXXXXX
    ga4Id: '', // ex.: G-XXXXXXXXXX
    metaPixelId: '', // ex.: 1234567890
  },
  /**
   * Selo de avaliações do Google (prova social ao lado do formulário) e
   * aggregateRating no schema (estrelas na busca). Preencha com os números
   * REAIS do Perfil da Empresa no Google — nunca estime: nota exibida
   * diferente da nota pública derruba a confiança e viola as diretrizes
   * do Google. Enquanto rating/count forem 0, nada é exibido.
   */
  googleReviews: {
    rating: 0, // ex.: 4.9 (use ponto, não vírgula)
    count: 0, // ex.: 320 (total de avaliações)
    url: '', // link do perfil no Google Maps (botão "ver avaliações")
  },
};

// Sem "Home": o logotipo no cabeçalho já leva à página inicial.
export const nav = [
  { label: 'English Academy', href: '/english-academy/' },
  { label: 'Método Callan', href: '/metodo-callan/' },
  { label: 'Cursos', href: '/cursos/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Unidades', href: '/unidades/' },
];
