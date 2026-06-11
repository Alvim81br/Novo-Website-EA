# 🛡️ Novo Website English Academy

Website oficial da **English Academy** — Curso de Inglês 4x Mais Rápido com o Método Callan.

Construído com [Astro](https://astro.build) + [Tailwind CSS 4](https://tailwindcss.com): site 100% estático, ultrarrápido e otimizado para SEO e campanhas (Core Web Vitals).

## 🚀 Comandos

| Comando           | Ação                                              |
| :---------------- | :------------------------------------------------ |
| `npm install`     | Instala as dependências                            |
| `npm run dev`     | Servidor local em `http://localhost:4321`          |
| `npm run build`   | Gera o site de produção em `./dist/`               |
| `npm run preview` | Visualiza o build de produção localmente           |

## 📄 Páginas

| Rota                  | Conteúdo                                                        |
| :-------------------- | :-------------------------------------------------------------- |
| `/`                   | Home — hero, diferenciais, método, cursos, depoimentos, FAQ      |
| `/english-academy/`   | A escola: história, números, DNA e valores                       |
| `/metodo-callan/`     | Método Callan, Garantia de Fluência, Passaporte, Extra Clubs, App|
| `/cursos/`            | Turmas: Adultos, Teens, Kids e Online ao Vivo                    |
| `/blog/`              | Blog "Dicas Para Aprender Inglês Mais Rápido"                    |
| `/unidades/`          | As 8 unidades (PA/MA) + English Academy Live                     |
| `/aula-experimental/` | Página de conversão com formulário de leads                     |

## 🗂️ Onde editar o conteúdo

- **Unidades / WhatsApp / Instagram** → `src/data/units.ts`
- **Turmas e cursos** → `src/data/courses.ts`
- **Depoimentos** → `src/data/testimonials.ts`
- **FAQ** → `src/data/faq.ts`
- **Navegação, redes sociais, textos globais** → `src/data/site.ts`
- **Artigos do blog** → adicione arquivos `.md` em `src/content/blog/`
- **Cores e fontes da marca** → `src/styles/global.css` (tokens `@theme`)
- **Logo** → `src/components/Logo.astro` e `public/favicon.svg` (SVG criado a partir do brand book; substitua pelo arquivo oficial quando desejar)

## 📥 Formulário de leads (Supabase)

O formulário de `/aula-experimental/` grava os leads em uma tabela `leads` no Supabase.

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL de `supabase/schema.sql` no SQL Editor
3. Copie `.env.example` para `.env` e preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
4. Faça o build/deploy com essas variáveis de ambiente configuradas

> A anon key só permite **inserir** leads (RLS). A leitura é feita pelo painel do Supabase ou por integrações (Make, CRM) com a service role key.
>
> **Sem Supabase configurado**, o formulário automaticamente encaminha o lead formatado para o WhatsApp da escola — o site nunca perde um lead.

## 🌐 Deploy (futuro)

O site é estático — funciona em Netlify, Vercel ou qualquer hospedagem:

- **Build command:** `npm run build` · **Output:** `dist/`
- Configure as variáveis `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` no painel da hospedagem
- Aponte o domínio `www.englishacademybr.com` para a hospedagem escolhida

## 🎨 Identidade

Paleta oficial: Azul Royal `#00327D` · Dourado `#CFA13F` · Vermelho `#D92E2E` · tipografia Montserrat + Lato — conforme o brand book da English Academy.
