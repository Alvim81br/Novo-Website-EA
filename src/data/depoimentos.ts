export interface VideoDepoimento {
  /** Nome do aluno (opcional — aparece no rodapé do card). */
  name?: string;
  /** Legenda curta (ex.: "Aprovada no intercâmbio"). */
  caption?: string;
  /** ID do vídeo no YouTube (ex.: "dQw4w9WgXcQ"). Abre no player ao clicar. */
  youtube?: string;
  /** Miniatura própria em /public (ex.: "/depoimento-1.webp"). Sem ela, usa a do YouTube ou um gradiente. */
  thumb?: string;
  /** Gradiente de fundo quando não há miniatura (classes Tailwind). */
  gradient?: string;
}

// Depoimentos em vídeo dos alunos. Para ativar um card, basta preencher `youtube`
// com o ID do vídeo (e, se quiser, `thumb`, `name` e `caption`).
export const depoimentos: VideoDepoimento[] = [
  { gradient: 'from-navy-700 via-navy-800 to-navy-950' },
  { gradient: 'from-red-ea via-[#a02233] to-[#5e1325]' },
  { gradient: 'from-navy-600 via-navy-700 to-[#7c1a32]' },
  { gradient: 'from-[#7c1a32] via-red-ea to-navy-800' },
  { gradient: 'from-gold-500 via-gold-600 to-navy-800' },
];
