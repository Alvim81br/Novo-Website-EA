-- Tabela de leads do site English Academy
-- Execute este SQL no Supabase (SQL Editor) ao criar o projeto.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  -- Só o chat conversacional (LeadChat.astro) pergunta o e-mail
  email text,
  unit text not null,
  course text not null,
  schedule text,
  source text,
  contacted boolean not null default false,
  -- Origem da campanha (preenchidas pelo site a partir da URL de chegada)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  fbclid text
);

-- Migração para bancos criados antes do e-mail e das colunas de campanha
-- (segura de rodar mais de uma vez):
alter table public.leads
  add column if not exists email text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists gclid text,
  add column if not exists fbclid text;

-- Segurança: o site usa a anon key apenas para INSERIR leads.
-- Ninguém consegue ler, alterar ou apagar leads sem a service role key.
alter table public.leads enable row level security;

create policy "Permitir insert anonimo de leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- Nenhuma policy de SELECT/UPDATE/DELETE para anon: leitura somente via
-- painel do Supabase ou service role (integração com CRM/Make).

-- ---------------------------------------------------------------------------
-- Painel de leads por unidade (Edge Function `leads`, em functions/leads/)
-- ---------------------------------------------------------------------------

-- Quando o comercial marcou o lead como atendido.
alter table public.leads
  add column if not exists contacted_at timestamptz;

-- O painel abre a lista da unidade pela ordem de chegada.
create index if not exists leads_unit_created_idx on public.leads (unit, created_at desc);

-- Uma chave de acesso por pessoa/unidade, com senha (PIN) própria. `unit` nulo
-- = enxerga todas as unidades (direção/matriz). O link entregue ao comercial é
-- https://www.englishacademy.net.br/painel/?k=<token> e, na primeira vez, ele
-- digita o PIN. Duas travas: a chave diz a unidade, o PIN diz quem é a pessoa.
create table if not exists public.unit_access (
  token text primary key,
  unit text,
  label text not null,
  -- SHA-256 de (pin || token): o token é o sal, e o PIN nunca fica em claro.
  pin_hash text,
  failed_attempts integer not null default 0,
  locked_until timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- Sessão de quem acertou o PIN: o aparelho guarda o id e não repete a senha.
create table if not exists public.unit_sessions (
  id text primary key,
  token text not null references public.unit_access(token) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz
);

create index if not exists unit_sessions_token_idx on public.unit_sessions (token);

-- Sem policies: só a service role (a Edge Function) lê chaves e sessões.
alter table public.unit_access enable row level security;
alter table public.unit_sessions enable row level security;

-- Criar um acesso com PIN (guarde o token e o PIN do retorno; eles não são
-- recuperáveis depois — para trocar, gere de novo):
--   with novo as (
--     select encode(gen_random_bytes(16), 'hex') as token,
--            lpad((floor(random() * 1000000))::int::text, 6, '0') as pin
--   )
--   insert into public.unit_access (token, unit, label, pin_hash)
--   select token, 'Marabá — Novo Horizonte', 'Comercial — Marabá NH',
--          encode(extensions.digest(pin || token, 'sha256'), 'hex')
--   from novo returning token, (select pin from novo);
--
-- Revogar o acesso de alguém (o link e as sessões param na hora):
--   update public.unit_access set active = false where label = 'Comercial — Marabá NH';
--   delete from public.unit_sessions where token = '<token da pessoa>';
--
-- Destravar quem errou o PIN 5 vezes, sem esperar os 15 minutos:
--   update public.unit_access set failed_attempts = 0, locked_until = null where label = '...';

-- ---------------------------------------------------------------------------
-- Leads → CRM do SGEA (Cloud Function crmSiteLeadWebhook)
-- ---------------------------------------------------------------------------
--
-- Todo lead novo é empurrado para o CRM da rede, que cria o contato e o card
-- na primeira etapa do funil comercial, na unidade que a pessoa escolheu no
-- site. O site NÃO muda por causa disso: ele continua gravando aqui com a anon
-- key, e o painel de /painel/ continua lendo esta mesma tabela — o CRM é mais
-- um leitor, não o dono. É de propósito: se o `fetch` do formulário apontasse
-- para a função do SGEA, o cadastro de um lead passaria a depender de o SGEA
-- estar de pé, e o lead que chegasse com ele fora se perderia.
--
-- Duas decisões que não se mudam sem pensar:
--
-- 1) É `pg_net` DIRETO, e não o `supabase_functions.http_request` dos
--    "Database Webhooks" do painel. Aquele só existe depois de o recurso ser
--    ligado por lá (é o que cria o schema `supabase_functions`), e um SQL que
--    só funciona depois de um clique noutro lugar é um SQL que não funciona.
--    O `pg_net` é ASSÍNCRONO — enfileira o pedido e devolve na hora —, então
--    nem a lentidão nem a queda do SGEA seguram o INSERT do lead.
--
-- 2) A CHAVE (`x-ea-chave`) é gerada no SGEA, em Administração → CRM →
--    Integrações → Leads do site, e é lá que este comando sai pronto para
--    colar. Os dois lados precisam da mesma chave; sem ela a função responde
--    401 e o lead fica gravado aqui como sempre. Rodar de novo (ao trocar a
--    chave) SUBSTITUI — daí o `create or replace` e o `drop trigger if exists`.
--
-- O comando abaixo é o que está aplicado, com a chave trocada por um lembrete:

create extension if not exists pg_net;

-- create or replace function public.lead_para_o_crm()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- begin
--   perform net.http_post(
--     url := 'https://us-central1-sgea-app.cloudfunctions.net/crmSiteLeadWebhook',
--     body := jsonb_build_object('type', 'INSERT', 'table', 'leads', 'record', to_jsonb(new)),
--     params := '{}'::jsonb,
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'x-ea-chave', '<a chave que o SGEA gera>'
--     ),
--     timeout_milliseconds := 5000
--   );
--   return new;
-- end;
-- $$;
--
-- drop trigger if exists leads_para_o_crm on public.leads;
--
-- create trigger leads_para_o_crm
--   after insert on public.leads
--   for each row
--   execute function public.lead_para_o_crm();
--
-- Conferir o que o gatilho mandou (as últimas chamadas e as respostas):
--   select id, created, url, status_code from net._http_response order by created desc limit 20;
