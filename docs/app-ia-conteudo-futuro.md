# Conteúdo arquivado: "App com Inteligência Artificial"

**Arquivado em:** agosto de 2026
**Motivo:** o app com IA descrito abaixo é um projeto próprio da English Academy, **ainda em
desenvolvimento**. O site prometia recursos que o aluno não recebia ao se matricular, então o
conteúdo foi substituído pelo do **Callan App** (o aplicativo oficial do método, esse sim liberado
para os alunos hoje).

**O que fazer quando o app próprio ficar pronto:** revisar os textos abaixo (números, promessas e
recursos precisam bater com o que o app realmente entregar) e recolá-los nos pontos indicados. Os
ícones `iaChat`, `raio`, `maleta`, `livro` e `progresso` continuam definidos em
`src/components/Icon.astro` justamente para isso.

> ⚠️ Lembrete que vale para qualquer versão futura deste texto: a English Academy vende **apenas
> livros físicos**. Não prometer eBooks nem livros digitais.

---

## 1. Card "05" da Home

**Volta para:** `src/pages/index.astro`, array `exclusivos` (era o 5º item).

```js
{
  title: 'App com Inteligência Artificial',
  text: 'Seu professor de inglês no bolso, 24/7: conversação com IA, feedback instantâneo de pronúncia e progresso integrado às aulas.',
  href: '/metodo-callan/#app',
},
```

---

## 2. Seção do app em `/metodo-callan/#app`

**Volta para:** `src/pages/metodo-callan.astro`, seção `<section id="app">`.

### Cabeçalho

```astro
<SectionHeading
  eyebrow="Tecnologia exclusiva"
  title="Seu professor de inglês no bolso, 24/7"
  subtitle="Nosso aplicativo coloca o poder da Inteligência Artificial ao seu serviço — o casamento perfeito entre tecnologia de ponta e metodologia comprovada."
/>
```

### Os 6 cards (array `appFeatures`)

```js
const appFeatures = [
  {
    icon: 'iaChat',
    title: 'Conversação com IA',
    text: 'Pratique com nossa assistente virtual que responde de forma natural e corrige seus erros em tempo real.',
  },
  {
    icon: 'raio',
    title: 'Feedback Instantâneo',
    text: 'Correções imediatas de pronúncia, gramática e vocabulário enquanto você pratica.',
  },
  {
    icon: 'microfone',
    title: 'Pronúncia Perfeita',
    text: 'Reconhecimento de voz avançado que analisa sua pronúncia e dá dicas específicas para melhorar.',
  },
  {
    icon: 'maleta',
    title: 'Cenários Realistas',
    text: 'Simule situações reais: entrevistas de emprego, viagens internacionais, reuniões de negócios.',
  },
  {
    icon: 'livro',
    title: 'Vocabulário Expandido',
    text: 'Jogos interativos e flashcards inteligentes que se adaptam ao que você precisa aprender.',
  },
  {
    icon: 'progresso',
    title: 'Progresso Integrado',
    text: 'Seu desempenho no app é integrado às aulas — seus professores sabem exatamente onde apoiar você.',
  },
];
```

### Linha final da seção

```astro
<p class="reveal mt-10 text-center text-sm text-gray-500">
  Disponível na Apple Store e no Google Play para todos os alunos.
</p>
```

---

## 3. Pilar "App Exclusivo"

**Volta para:** `src/pages/metodo-callan.astro`, array `pilares` (6º item).

```js
{
  icon: 'celular',
  title: 'App Exclusivo',
  text: 'Pratique em todo lugar: estude de forma fluida e natural o que aprendeu em sala, de qualquer lugar, pelo celular.',
},
```

---

## 4. Diferencial "06 · App Exclusivo com IA"

**Volta para:** `src/pages/english-academy.astro`, array `diferenciais` (item `num: '06'`).

```js
{
  num: '06',
  title: 'App Exclusivo com IA',
  text: 'Pratique conversação com IA, receba correções em tempo real e estude de onde quiser.',
  icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" class="h-7 w-7"><rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18.5h2"/><path d="m16.5 8.5.6 1.4 1.4.6-1.4.6-.6 1.4-.6-1.4-1.4-.6 1.4-.6z" fill="currentColor" stroke="none"/></svg>`,
},
```
