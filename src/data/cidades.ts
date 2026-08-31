/**
 * Landing pages locais ("curso de inglês em …"), geradas por
 * src/pages/[slug].astro — uma por cidade + a versão online.
 *
 * Cada texto é escrito para a cidade (nada de página-carimbo): o Google
 * pune conteúdo idêntico replicado. Ao editar, mantenha cada intro única.
 * O formulário da página já abre com a unidade da cidade pré-selecionada.
 */
export interface Cidade {
  /** Slug da URL (ex.: 'ingles-em-parauapebas' → /ingles-em-parauapebas/). */
  slug: string;
  nome: string;
  uf: string;
  /** <title> da página (busca: "curso de inglês em {cidade}"). */
  titulo: string;
  descricao: string;
  /** Complemento dourado do H1 "Curso de inglês em {nome}". */
  headlineDestaque: string;
  intro: string;
  /** ids das unidades da cidade (src/data/units.ts). */
  unitIds: string[];
  /** Nome da unidade pré-selecionada no formulário. */
  defaultUnit: string;
  online?: boolean;
}

export const cidades: Cidade[] = [
  {
    slug: 'ingles-em-parauapebas',
    nome: 'Parauapebas',
    uf: 'PA',
    titulo: 'Curso de Inglês em Parauapebas — Método Callan | English Academy',
    descricao:
      'Curso de inglês em Parauapebas com o Método Callan: aulas diárias, 100% conversação e fluência a partir de 18 meses. 3 unidades: Cidade Nova, Cidade Jardim e Carajás. Aula experimental grátis!',
    headlineDestaque: 'onde tudo começou',
    intro:
      'Parauapebas é a casa da English Academy: foi aqui que abrimos a primeira escola, em 2013, trazendo o Método Callan de Dublin para o Pará. Hoje são três unidades na cidade — Cidade Nova, Cidade Jardim e Carajás — com aulas todos os dias, turmas reduzidas e a mesma metodologia usada em mais de 40 países.',
    unitIds: ['parauapebas-cidade-nova', 'parauapebas-cidade-jardim', 'parauapebas-carajas'],
    defaultUnit: 'Parauapebas — Cidade Nova',
  },
  {
    slug: 'ingles-em-maraba',
    nome: 'Marabá',
    uf: 'PA',
    titulo: 'Curso de Inglês em Marabá — Método Callan | English Academy',
    descricao:
      'Curso de inglês em Marabá com o Método Callan: aulas diárias, 100% conversação e fluência a partir de 18 meses. Unidades no Novo Horizonte e na Nova Marabá. Aula experimental grátis!',
    headlineDestaque: '4x mais rápido',
    intro:
      'Em Marabá, a English Academy atende os dois lados da cidade: uma unidade no Novo Horizonte (Av. Tocantins) e outra na Nova Marabá (Folha 28). Nas duas, o mesmo padrão da rede — Método Callan 100% em conversação, aulas todos os dias e turmas com em média 12 alunos, para você falar inglês desde a primeira aula.',
    unitIds: ['maraba-novo-horizonte', 'maraba-nova-maraba'],
    defaultUnit: 'Marabá — Novo Horizonte',
  },
  {
    slug: 'ingles-em-canaa-dos-carajas',
    nome: 'Canaã dos Carajás',
    uf: 'PA',
    titulo: 'Curso de Inglês em Canaã dos Carajás — Método Callan | English Academy',
    descricao:
      'Curso de inglês em Canaã dos Carajás com o Método Callan: aulas diárias, 100% conversação e fluência a partir de 18 meses. Unidade na Av. Weyne Cavalcante. Aula experimental grátis!',
    headlineDestaque: 'para quem não tem tempo a perder',
    intro:
      'Canaã dos Carajás cresce rápido — e o inglês virou diferencial em processos seletivos e oportunidades na região. Nossa unidade na Av. Weyne Cavalcante ensina com o Método Callan: 100% conversação, aulas todos os dias e turmas reduzidas, do Kids (a partir de 4 anos) ao adulto.',
    unitIds: ['canaa-dos-carajas'],
    defaultUnit: 'Canaã dos Carajás — Centro',
  },
  {
    slug: 'ingles-em-belem',
    nome: 'Belém',
    uf: 'PA',
    titulo: 'Curso de Inglês em Belém — Método Callan | English Academy',
    descricao:
      'Curso de inglês em Belém com o Método Callan: aulas diárias, 100% conversação e fluência a partir de 18 meses. Unidade em Nazaré, na Av. Generalíssimo Deodoro. Aula experimental grátis!',
    headlineDestaque: 'fluência a partir de 18 meses',
    intro:
      'No coração de Nazaré, na Av. Generalíssimo Deodoro, a English Academy Belém aplica o método que ensina inglês 4x mais rápido que escolas tradicionais: o Método Callan, 100% focado em conversação, com aulas diárias e turmas de em média 12 alunos — e a Garantia de Fluência que só a nossa rede oferece.',
    unitIds: ['belem-nazare'],
    defaultUnit: 'Belém — Nazaré',
  },
  {
    slug: 'ingles-em-imperatriz',
    nome: 'Imperatriz',
    uf: 'MA',
    titulo: 'Curso de Inglês em Imperatriz — Método Callan | English Academy',
    descricao:
      'Curso de inglês em Imperatriz (MA) com o Método Callan: aulas diárias, 100% conversação e fluência a partir de 18 meses. Unidade no Centro, na Av. Dorgival Pinheiro. Aula experimental grátis!',
    headlineDestaque: 'de verdade, no Maranhão',
    intro:
      'A English Academy Imperatriz fica no Centro, na Av. Dorgival Pinheiro de Sousa, e traz para o Maranhão o método que já formou alunos fluentes em toda a nossa rede: Método Callan, 100% conversação, aulas todos os dias e turmas reduzidas — do Kids ao Executive.',
    unitIds: ['imperatriz'],
    defaultUnit: 'Imperatriz — Centro',
  },
  {
    slug: 'curso-de-ingles-online',
    nome: 'Online — todo o Brasil',
    uf: 'BR',
    titulo: 'Curso de Inglês Online ao Vivo — Método Callan | English Academy Live',
    descricao:
      'Curso de inglês online ao vivo com o Método Callan, de qualquer lugar do Brasil: professores em tempo real, 100% conversação e turmas reduzidas na English Academy Live. Aula experimental grátis!',
    headlineDestaque: 'ao vivo, de onde você estiver',
    intro:
      'A English Academy Live leva o Método Callan para qualquer lugar do Brasil: aulas 100% ao vivo (nada de videoaula gravada), professores treinados pela Callan Organisation e a mesma energia das nossas salas presenciais — na nossa plataforma exclusiva, com turmas reduzidas e horários para sua rotina.',
    unitIds: ['live'],
    defaultUnit: 'English Academy Live',
    online: true,
  },
];
