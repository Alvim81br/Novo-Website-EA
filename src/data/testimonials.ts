export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  city: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: 'Excelente!! Método perfeito! Conversação e aprendizado garantidos!',
    name: 'Anilton Carneiro',
    role: 'Servidor Público',
    city: 'Marabá-PA',
  },
  {
    quote: 'Uma ótima escola pra aprender o idioma de forma rápida e prática, focando na conversação.',
    name: 'Pamela Barbosa',
    role: 'Estudante',
    city: 'Imperatriz-MA',
  },
  {
    quote: 'Excelente método, indico a todos que quiserem aprender inglês!',
    name: 'Marcio Roberto',
    role: 'Autônomo',
    city: 'Marabá-PA',
  },
  {
    quote: 'Ótimos professores, didática maravilhosa com atendimento maravilhoso. Super indico!',
    name: 'Valéria Schirmer',
    role: 'Atendente Comercial',
    city: 'Canaã dos Carajás-PA',
  },
  {
    quote: 'Ótimos professores e ensino de qualidade. Recomendo! Focando na conversação.',
    name: 'Simone Rodrigues',
    role: 'Designer de Produtos',
    city: 'Canaã dos Carajás-PA',
  },
  {
    quote: 'Melhor escola de inglês que já estudei! Método fantástico de aprendizado! Recomendo!',
    name: 'Francisco Santos',
    role: 'Engenheiro Civil',
    city: 'Belém-PA',
  },
];
