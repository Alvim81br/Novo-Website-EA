-- Tabela de leads do site English Academy
-- Execute este SQL no Supabase (SQL Editor) ao criar o projeto.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  unit text not null,
  course text not null,
  schedule text,
  source text,
  contacted boolean not null default false
);

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
