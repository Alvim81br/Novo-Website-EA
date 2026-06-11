export interface CourseClass {
  name: string;
  duration: string;
  hours: string;
  frequency: string;
  age?: string;
  highlight?: boolean;
}

export interface CourseSegment {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  audience: string;
  groups: { label: string; classes: CourseClass[] }[];
}

export const segments: CourseSegment[] = [
  {
    id: 'adultos',
    title: 'Inglês para Adultos',
    subtitle: 'Eleve sua carreira dominando o inglês em 18 meses.',
    description:
      'Para jovens e adultos (a partir de 14 anos), em aulas dinâmicas e diretas, focadas no aprendizado rápido e permanente. Turmas para um público exigente, que não tem tempo a perder. Com carga horária robusta — até 3 vezes maior que escolas tradicionais — o aluno iniciante chega à fluência 4 vezes mais rápido.',
    audience: 'A partir de 14 anos',
    groups: [
      {
        label: 'Turmas Diárias',
        classes: [
          {
            name: 'Expert',
            duration: '1 ano e meio',
            hours: '1h30/aula + 1h extra',
            frequency: '5x por semana',
            highlight: true,
          },
          {
            name: 'Master',
            duration: '2 anos',
            hours: '1h/aula + 1h extra',
            frequency: '5x por semana',
          },
        ],
      },
      {
        label: 'Turmas Tradicionais',
        classes: [
          {
            name: 'Premium',
            duration: '2 anos e meio',
            hours: '1h30/aula + 1h extra',
            frequency: '3x por semana',
          },
          {
            name: 'Executive',
            duration: '3 anos e meio',
            hours: '2h/aula + 1h extra',
            frequency: '2x por semana',
          },
        ],
      },
    ],
  },
  {
    id: 'adolescentes',
    title: 'Inglês para Adolescentes',
    subtitle: 'Fale a língua do mundo e brilhe no ENEM.',
    description:
      'Indicado para adolescentes a partir de 12 anos, com foco em aulas dinâmicas e divertidas, onde a meta é aprender de forma rápida e interativa. Inglês para quem não perde tempo: essa é a idade de aproveitar a vida — sem perder o foco no futuro. As turmas conciliam a precisão do Método Callan com a imersão e a diversão que esse público não abre mão.',
    audience: 'A partir de 12 anos',
    groups: [
      {
        label: 'Turmas Teens',
        classes: [
          {
            name: 'Teens',
            duration: '3 anos',
            hours: '1h30/aula',
            frequency: '2x por semana',
            age: 'a partir de 13 anos',
          },
        ],
      },
    ],
  },
  {
    id: 'criancas',
    title: 'Inglês para Crianças',
    subtitle: 'Prepare seu filho para ser protagonista global.',
    description:
      'Aulas lúdicas, divertidas e diretas com o Callan For Kids. Não perca essa fase especial: aproveite a melhor fase da vida para seu filho aprender inglês de verdade. A infância é o período ideal para a absorção de uma segunda língua — um investimento que renderá frutos por toda a vida.',
    audience: 'A partir de 4 anos',
    groups: [
      {
        label: 'Turmas Kids',
        classes: [
          {
            name: 'Little Kids',
            duration: '1 módulo por ano',
            hours: '1h/aula',
            frequency: '2x por semana',
            age: 'a partir de 4 anos',
          },
          {
            name: 'Kids Classic',
            duration: '1 módulo por ano',
            hours: '1h/aula',
            frequency: '2x por semana',
            age: 'a partir de 7 anos',
          },
        ],
      },
    ],
  },
  {
    id: 'online',
    title: 'Online e ao Vivo',
    subtitle: 'O Método Callan ao vivo, de onde você estiver.',
    description:
      'Para jovens e adultos a partir dos 14 anos que querem estudar com flexibilidade e conforto, com o Método Callan ministrado ao vivo por professores experientes na plataforma English Academy Live. A mesma metodologia, a mesma energia — de qualquer lugar do Brasil.',
    audience: 'A partir de 14 anos · 100% online ao vivo',
    groups: [],
  },
];
