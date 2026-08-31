export interface VideoDepoimento {
  /** Nome do aluno (opcional — aparece no rodapé do card). */
  name?: string;
  /** Legenda curta (ex.: "Aprovada no intercâmbio"). */
  caption?: string;
  /** ID do vídeo no YouTube (ex.: "dQw4w9WgXcQ"). Abre no player ao clicar. */
  youtube?: string;
  /** Vídeo MP4 hospedado no próprio site (ex.: "/depoimentos/david.mp4"). Alternativa ao YouTube. */
  mp4?: string;
  /** Miniatura própria em /public (ex.: "/depoimento-1.webp"). Sem ela, usa a do YouTube ou um gradiente. */
  thumb?: string;
  /** Gradiente de fundo quando não há miniatura (classes Tailwind). */
  gradient?: string;
}

// Depoimentos em vídeo dos alunos. Para ativar um card, basta preencher `youtube`
// (ID do vídeo) ou `mp4` (arquivo em /public) — e, se quiser, `thumb`, `name` e `caption`.
// A seção da home só aparece quando existe pelo menos um card com vídeo
// preenchido — cards sem vídeo não são exibidos (nada de player vazio no ar).
export const depoimentos: VideoDepoimento[] = [
  {
    name: 'Lincoln',
    caption: 'Fluente com o Método Callan',
    mp4: '/depoimentos/lincoln.mp4',
    thumb: '/depoimentos/lincoln.jpg',
  },
  {
    name: 'David',
    caption: 'Certificado Stage 8 na mão',
    mp4: '/depoimentos/david.mp4',
    thumb: '/depoimentos/david.jpg',
  },
  {
    name: 'Maiza',
    caption: 'Uma conquista para a família',
    mp4: '/depoimentos/maiza.mp4',
    thumb: '/depoimentos/maiza.jpg',
  },
  {
    name: 'Eliades',
    caption: 'Aluno adulto · curso concluído',
    mp4: '/depoimentos/eliades.mp4',
    thumb: '/depoimentos/eliades.jpg',
  },
  {
    name: 'Giovanni',
    caption: 'Fluência que abriu portas',
    mp4: '/depoimentos/giovanni.mp4',
    thumb: '/depoimentos/giovanni.jpg',
  },
  {
    name: 'Lady Sivani',
    caption: 'Formada nos Stages 7 e 8',
    mp4: '/depoimentos/sivani.mp4',
    thumb: '/depoimentos/sivani.jpg',
  },
  {
    name: 'Bianca',
    caption: 'Aluna Teens · 16 anos',
    mp4: '/depoimentos/bianca.mp4',
    thumb: '/depoimentos/bianca.jpg',
  },
];
