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

-- Uma chave de acesso por pessoa/unidade. `unit` nulo = enxerga todas as
-- unidades (direção/matriz). O link entregue ao comercial é
-- .../functions/v1/leads?k=<token>.
create table if not exists public.unit_access (
  token text primary key,
  unit text,
  label text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz
);

-- Sem policies: só a service role (a Edge Function) lê as chaves.
alter table public.unit_access enable row level security;

-- Gerar a chave de uma unidade (o token aparece no retorno — entregue-o à
-- pessoa e nunca o publique):
--   insert into public.unit_access (token, unit, label)
--   values (encode(gen_random_bytes(16), 'hex'), 'Marabá — Novo Horizonte', 'Comercial — Marabá NH')
--   returning token;
--
-- Revogar o acesso de alguém (o link para de funcionar na hora):
--   update public.unit_access set active = false where label = 'Comercial — Marabá NH';
