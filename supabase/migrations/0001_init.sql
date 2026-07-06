-- ============================================================
-- PeabiruJobs — schema inicial
-- Execute no SQL Editor do Supabase (ou via supabase db push).
-- Todas as tabelas têm RLS: cada usuário só acessa os próprios dados.
-- ============================================================

-- ---------- user_profiles ----------
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text,
  email text,
  -- "current_role" é palavra reservada no Postgres, por isso as aspas.
  "current_role" text,
  target_role text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- career_analyses ----------
create table if not exists public.career_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  target_role text not null,
  target_area text,
  target_seniority text,
  job_title text,
  job_company text,
  status text not null default 'processing'
    check (status in ('processing', 'completed', 'reanalyzed')),
  overall_score integer check (overall_score between 0 and 100),
  summary text,
  main_strength text,
  main_gap text,
  next_best_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists career_analyses_user_idx
  on public.career_analyses (user_id, created_at desc);

-- ---------- user_documents ----------
create table if not exists public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  document_type text not null check (document_type in (
    'resume', 'linkedin_url', 'linkedin_pdf',
    'job_description', 'complementary_file', 'pasted_text'
  )),
  file_url text,
  raw_text text,
  created_at timestamptz not null default now()
);

create index if not exists user_documents_analysis_idx
  on public.user_documents (analysis_id);

-- ---------- recommendations ----------
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  category text not null check (category in (
    'competencia', 'comunicacao', 'evidencia', 'posicionamento'
  )),
  title text not null,
  description text not null,
  impact text not null check (impact in ('alto', 'medio', 'baixo')),
  effort text not null check (effort in ('alto', 'medio', 'baixo')),
  urgency text not null check (urgency in ('alta', 'media', 'baixa')),
  priority_order integer not null default 0,
  suggested_action text,
  reasoning text,
  original_text text,
  identified_issue text,
  suggested_text text,
  market_language_terms text[],
  authenticity_warning text,
  status text not null default 'pendente'
    check (status in ('pendente', 'em_andamento', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recommendations_analysis_idx
  on public.recommendations (analysis_id, priority_order);

-- ---------- fit_diagnostics ----------
create table if not exists public.fit_diagnostics (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  fit_type text not null check (fit_type in ('cargo_alvo', 'vaga_especifica')),
  score integer not null check (score between 0 and 100),
  level text not null,
  strengths text[] not null default '{}',
  gaps text[] not null default '{}',
  risks text[] not null default '{}',
  recommendation text not null,
  reasoning text,
  created_at timestamptz not null default now()
);

create index if not exists fit_diagnostics_analysis_idx
  on public.fit_diagnostics (analysis_id);

-- ---------- evolution_plans ----------
create table if not exists public.evolution_plans (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  action_title text not null,
  action_description text not null,
  action_type text not null,
  priority text not null check (priority in ('alta', 'media', 'baixa')),
  timeframe text,
  success_criteria text,
  status text not null default 'pendente'
    check (status in ('pendente', 'em_andamento', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evolution_plans_analysis_idx
  on public.evolution_plans (analysis_id);

-- ---------- analysis_versions ----------
create table if not exists public.analysis_versions (
  id uuid primary key default gen_random_uuid(),
  original_analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  new_analysis_id uuid not null references public.career_analyses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  improvements_summary text,
  remaining_gaps text,
  score_change integer,
  created_at timestamptz not null default now()
);

create index if not exists analysis_versions_user_idx
  on public.analysis_versions (user_id);

-- ============================================================
-- Trigger: cria o perfil automaticamente no cadastro
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Trigger: updated_at automático
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'user_profiles', 'career_analyses', 'recommendations', 'evolution_plans'
  ]
  loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.user_profiles enable row level security;
alter table public.career_analyses enable row level security;
alter table public.user_documents enable row level security;
alter table public.recommendations enable row level security;
alter table public.fit_diagnostics enable row level security;
alter table public.evolution_plans enable row level security;
alter table public.analysis_versions enable row level security;

-- Tabelas com user_id direto
create policy "own profile" on public.user_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own analyses" on public.career_analyses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own documents" on public.user_documents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own versions" on public.analysis_versions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tabelas filhas de career_analyses (acesso via análise do usuário)
create policy "own recommendations" on public.recommendations
  for all using (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  ) with check (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  );

create policy "own fit diagnostics" on public.fit_diagnostics
  for all using (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  ) with check (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  );

create policy "own evolution plans" on public.evolution_plans
  for all using (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  ) with check (
    analysis_id in (select id from public.career_analyses where user_id = auth.uid())
  );

-- ============================================================
-- Storage: bucket privado com pasta por usuário
-- ============================================================
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "users manage own files" on storage.objects
  for all using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
