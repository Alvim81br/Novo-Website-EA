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
| `/unidades/`          | As 9 unidades (PA/MA) + English Academy Live                     |
| `/aula-experimental/` | Página de conversão com formulário de leads                     |
| `/obrigado/`          | Confirmação do formulário — dispara a conversão (noindex)        |
| `/painel/`            | Painel de leads do comercial, por unidade (noindex, interno)     |
| `/politica-de-privacidade/` | Política de privacidade (LGPD)                             |
| `/ingles-em-{cidade}/` | Landing pages locais (Parauapebas, Marabá, Canaã, Belém, Imperatriz) |
| `/curso-de-ingles-online/` | Landing page da English Academy Live                        |

## 🗂️ Onde editar o conteúdo

- **Unidades / WhatsApp / Instagram / horários** → `src/data/units.ts` (o botão "Como chegar" é gerado do endereço; preencha `hours` por unidade para exibir o horário de funcionamento)
- **Turmas e cursos** → `src/data/courses.ts`
- **Depoimentos em texto** → `src/data/testimonials.ts`
- **Depoimentos em vídeo** → `src/data/depoimentos.ts` — preencha `mp4` (arquivo em `/public/depoimentos/`, servido pelo CDN da hospedagem) ou `youtube` (ID de um YouTube Shorts); a seção da home fica oculta enquanto nenhum card tiver vídeo
- **FAQ** → `src/data/faq.ts` (as perguntas exibidas em `/aula-experimental/` são as listadas em `perguntasConversao`)
- **Selo de avaliações do Google** → `src/data/site.ts` (`googleReviews`) — use os números reais do Perfil da Empresa; liga o selo no formulário e as estrelas no schema
- **Landing pages por cidade** → `src/data/cidades.ts` (título, descrição e texto local de cada página; o formulário abre com a unidade da cidade pré-selecionada)
- **Navegação, redes sociais, textos globais** → `src/data/site.ts`
- **Artigos do blog** → adicione arquivos `.md` em `src/content/blog/`
- **Cores e fontes da marca** → `src/styles/global.css` (tokens `@theme`)
- **Logo** → `src/components/Logo.astro` usa a arte oficial `public/logo-ea.png`; favicons em `public/favicon-16x16.png`, `favicon-32x32.png` e `apple-touch-icon.png` (gerados do escudo oficial)

## 📥 Formulário de leads (Supabase)

O formulário de `/aula-experimental/` grava os leads em uma tabela `leads` no Supabase.

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o SQL de `supabase/schema.sql` no SQL Editor
3. Copie `.env.example` para `.env` e preencha `PUBLIC_SUPABASE_URL` e `PUBLIC_SUPABASE_ANON_KEY` (Project Settings → API)
4. Faça o build/deploy com essas variáveis de ambiente configuradas

> A tabela tem a coluna `email`, preenchida pelo chat conversacional (o formulário não pergunta
> e-mail). Em bancos criados antes disso, rode de novo o `supabase/schema.sql` — o `alter table`
> do arquivo é seguro de repetir.
>
> A anon key só permite **inserir** leads (RLS). A leitura é feita pelo painel do Supabase, pelo
> painel por unidade (abaixo) ou por integrações (Make, CRM) com a service role key.
>
> **Sem Supabase configurado** (ou se o insert falhar), o formulário automaticamente encaminha o lead formatado para o WhatsApp **da unidade escolhida** — o site nunca perde um lead.
>
> ⚠️ **Plano gratuito do Supabase pausa o projeto após ~7 dias sem atividade** — e projeto pausado = formulário caindo no fallback. O workflow `.github/workflows/supabase-keep-alive.yml` pinga a API a cada 3 dias, mas o GitHub **desativa crons após 60 dias sem commits no repositório**; se o repo ficar parado, reative o workflow na aba Actions ou verifique o projeto no painel do Supabase.

## 👥 Painel de leads por unidade

Página onde **cada comercial vê só os leads da sua unidade**, liga ou chama no WhatsApp com um
toque e marca quem já foi atendido. Feita para o celular. A chave da direção (linha com `unit`
nulo em `unit_access`) enxerga todas as unidades e mostra o nome da escola em cada card.

**Como se entra — duas travas:** a pessoa abre `…/painel/?k=<chave>` (a chave diz a unidade) e
digita o **PIN de 6 dígitos** dela (que diz quem é). Só o link não abre nada: link encaminhado,
print ou celular emprestado não bastam. Acertando, o aparelho guarda uma sessão de 30 dias, a
chave sai da barra de endereço (não fica no histórico) e a senha não é pedida de novo ali.
Cinco erros de PIN bloqueiam aquele acesso por 15 minutos. O rodapé tem "Sair deste aparelho".

São duas peças, e a divisão tem motivo:

| Peça | Onde | Papel |
| :--- | :--- | :---- |
| Página | `src/pages/painel.astro` | O HTML, servido pelo Netlify junto com o site |
| Dados | `supabase/functions/leads/` | Edge Function que devolve **JSON** com os leads da chave |

> ⚠️ **Não devolva HTML pela Edge Function.** O runtime do Supabase reescreve o `content-type`
> da resposta para `text/plain` (confirmado nos logs: `response.headers.content_type`), e o
> navegador mostra o código em vez da página. Com JSON isso é inofensivo — quem lê é o `fetch()`.

- **Como a página fala com a função** → `/api/leads`, um proxy declarado no `netlify.toml` e no
  `vercel.json`. Fica tudo na mesma origem: sem CORS e sem expor a URL do Supabase na página.
- **Criar acesso / trocar PIN / revogar** → tabela `unit_access` (SQL pronto em `supabase/schema.sql`).
  Revogar é `active = false` mais apagar as sessões daquele token: o acesso morre na hora.
  O PIN é guardado só como hash (SHA-256 de `pin || token`) — não dá para consultá-lo depois,
  só gerar um novo.
- **Publicar mudanças nos dados** → `supabase functions deploy leads` (ou o MCP do Supabase).
  A função roda com a service role, que nunca sai do servidor; a página não embute chave nenhuma.
- **Privacidade** → `noindex`, fora do sitemap e a chave só trafega na URL do painel. São dados
  pessoais: o link é interno e a chave não deve circular fora da equipe (LGPD).

## 💬 Chat conversacional de captura (balão do canto inferior direito)

`src/components/LeadChat.astro` — o balão flutuante de todas as páginas. Alguns segundos
depois que a pessoa chega, o chat **abre sozinho** e conduz a conversa pergunta a pergunta,
com os "três pontinhos" de quem está digitando entre uma mensagem e outra:

> Olá, tudo bem? → Gostaria de receber uma proposta personalizada? → nome → e-mail →
> telefone com DDD → unidade mais próxima → mensagem de agradecimento

O lead cai na **mesma tabela `leads`** do formulário de `/aula-experimental/` (com o e-mail
na coluna `email` e `source` no formato `chat:/pagina`). Se o Supabase falhar, a conversa
termina no **WhatsApp da unidade escolhida**, com os dados já preenchidos — nenhum lead se perde.

Onde mexer (topo do arquivo):

| O quê | Onde |
| :---- | :--- |
| Nome, status e foto de quem conversa | `agent` — hoje a Kamila (`/public/consultora-kamila.webp`); para trocar, coloque a foto quadrada (~240px, enquadrada no rosto) em `/public` e atualize nome e caminho |
| Chamada de conversão ao lado do balão | `teaser` (antes dela aparecem os "três pontinhos", como se a consultora estivesse digitando) |
| Perguntas, respostas e validações | função `conversation()` no `<script>` |
| Tempos de entrada | `TYPING_MS` (digitando) → `TEASER_MS` (chamada) → `AUTO_OPEN_MS` (janela abre sozinha) |
| Unidades oferecidas | `src/data/units.ts` (só as `listedUnits`) |

Regras de bom senso já embutidas: abre sozinho **uma vez por visita**, não reaparece se a
pessoa fechar (sessão), não insiste com quem já enviou o lead (30 dias no `localStorage`),
não abre na `/obrigado/`, respeita `prefers-reduced-motion` e só foca o campo de texto
depois do primeiro clique (não abre o teclado do celular sozinho).

> **Testando e não aparece nada?** É porque uma dessas regras está valendo para o seu
> navegador — você já fechou o chat nesta sessão ou já enviou um lead de teste. Abra a
> página com **`?chat=1`** no fim da URL (ex.: `/?chat=1`) que ele ignora as marcas e roda
> a sequência do começo. O balão, esse, aparece sempre — clicar nele abre a conversa.

> Os botões e links de WhatsApp das páginas (CTAs, rodapé, cards de unidade) **continuam
> como estavam** — o chat substituiu apenas o antigo balão flutuante de WhatsApp.

## 📊 Medição de campanhas (GA4 · Meta Pixel · GTM)

O site tem medição pronta, desligada por padrão — para ativar, preencha os IDs em
`src/data/site.ts` (`analytics`) **ou** nas variáveis `PUBLIC_GTM_ID` / `PUBLIC_GA4_ID` /
`PUBLIC_META_PIXEL_ID` / `PUBLIC_CLARITY_ID` da hospedagem e faça o deploy:

- **LGPD:** nenhum script carrega antes de o visitante aceitar os cookies no banner
  (`CookieConsent.astro`); recusou, nada é carregado.
- **Com GTM preenchido**, GA4 e Pixel devem ser configurados como tags *dentro* do contêiner
  (o site não os carrega direto, para não medir em dobro). Sem GTM, GA4 e Pixel carregam direto.
- **Conversões:** o envio do formulário redireciona para `/obrigado/`, que dispara
  `generate_lead` (GA4) e `Lead` (Meta) — use essa página/evento como conversão nas campanhas.
  O chat conversacional dispara o mesmo `generate_lead` (com `method: 'chat'`) ao gravar o lead,
  respeitando a regra de **uma conversão por visita**. Todo clique em link de WhatsApp dispara
  `whatsapp_click` (GA4) / `Contact` (Meta).
- **Eventos do chat:** `chat_opened` (com `mode: auto|click`), `chat_lead_start`,
  `chat_declined` e `chat_lead_submit` — úteis para medir onde a conversa perde gente.
- **Atribuição:** UTMs (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`),
  `gclid` e `fbclid` da visita são gravados junto com o lead no Supabase.
- **Checklist manual:** cadastrar o domínio no [Google Search Console](https://search.google.com/search-console)
  e enviar o sitemap `https://www.englishacademy.net.br/sitemap-index.xml`.

## 🌐 Deploy (Cloudflare)

O site é publicado no **Cloudflare Workers** (arquivos estáticos, banda ilimitada no plano
gratuito) pelo workflow `.github/workflows/deploy-site.yml` — todo merge no `main` vai ao ar
sozinho. A configuração fica em `wrangler.jsonc`.

- **Segredos necessários no GitHub** (Settings → Secrets → Actions): `CLOUDFLARE_API_TOKEN`
  (template "Edit Cloudflare Workers") e `CLOUDFLARE_ACCOUNT_ID` — sem eles o deploy é pulado
  com aviso, sem quebrar o CI
- **Domínio oficial:** `www.englishacademy.net.br` — zona no Cloudflare (nameservers apontados
  no registro da Hostinger); o bloco `routes` do `wrangler.jsonc` liga o domínio ao site
- Build: `npm run build` · saída em `dist/` · deploy manual: `npx wrangler@4 deploy`
- As variáveis `PUBLIC_*` (Supabase, medição) podem ser definidas no passo de build do workflow

## 🎨 Identidade

Paleta oficial: Azul Royal `#00327D` · Dourado `#CFA13F` · Vermelho `#D92E2E` · tipografia Montserrat + Lato — conforme o brand book da English Academy.
