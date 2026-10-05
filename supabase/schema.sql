-- =========================================================
-- ESQUEMA DO BANCO DE DADOS SENTINELA - ISA GESTÃO EMPRESARIAL
-- Compatível com Supabase / PostgreSQL 15+
-- =========================================================

-- Habilitar extensão UUID
create extension if not exists "uuid-ossp";

-- 1. TABELA DE CONFIGURAÇÕES DA PLATAFORMA
create table if not exists public.platform_settings (
  id text primary key default 'default_settings',
  openai_api_key text default '',
  anthropic_api_key text default '',
  gemini_api_key text default '',
  active_ai_model text default 'gpt-4o-mini',
  kiwify_api_token text default '',
  kiwify_webhook_secret text default '',
  kiwify_webhook_url text default '',
  auto_kick_on_refund boolean default true,
  whatsapp_provider_type text default 'zapi',
  whatsapp_server_url text default 'https://api.z-api.io',
  whatsapp_instance_name text default '',
  whatsapp_api_key text default '',
  sla_warning_minutes integer default 20,
  notify_supervisors_on_conflict boolean default true,
  supabase_url text default '',
  supabase_anon_key text default '',
  updated_at timestamp with time zone default now()
);

-- 2. TABELA DE PRODUTOS
create table if not exists public.products (
  id text primary key,
  name text not null,
  platform text default 'Kiwify',
  active_students integer default 0,
  created_at timestamp with time zone default now()
);

-- 3. TABELA DE GRUPOS DE WHATSAPP
create table if not exists public.whatsapp_groups (
  id text primary key,
  name text not null,
  group_jid text not null unique,
  product_name text default 'Formação IA Pro',
  participant_count integer default 0,
  is_monitored boolean default true,
  unread_alerts integer default 0,
  health_status text default 'healthy',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 4. TABELA DE ALUNOS / CLIENTES
create table if not exists public.students (
  id text primary key,
  name text not null,
  email text,
  phone text not null,
  kiwify_order_id text,
  product_name text default 'Formação IA Pro',
  group_id text,
  access_status text default 'active', -- 'active' | 'revoked' | 'refund_requested'
  current_sentiment text default 'positive', -- 'positive' | 'neutral' | 'negative' | 'churn_risk'
  last_interaction text default 'Hoje',
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 5. TABELA DE MENSAGENS RECEBIDAS DOS GRUPOS
create table if not exists public.group_messages (
  id text primary key default uuid_generate_v4()::text,
  group_id text references public.whatsapp_groups(id) on delete cascade,
  sender_phone text not null,
  sender_name text,
  message_text text not null,
  sentiment text default 'neutral',
  is_alert boolean default false,
  raw_payload jsonb,
  created_at timestamp with time zone default now()
);

-- 6. TABELA DE ALERTAS / OCORRÊNCIAS SENTINELA
create table if not exists public.alerts (
  id text primary key,
  student_id text,
  student_name text not null,
  student_phone text not null,
  group_id text,
  group_name text not null,
  product_name text default 'Formação IA Pro',
  severity text not null default 'medium', -- 'critical' | 'high' | 'medium' | 'low'
  category text not null, -- 'refund_risk' | 'conflict' | 'unanswered_question'
  status text not null default 'open', -- 'open' | 'assigned' | 'resolved' | 'ticketed'
  message_snippet text not null,
  ai_analysis text,
  assigned_to text,
  created_at timestamp with time zone default now(),
  resolved_at timestamp with time zone
);

-- 7. TABELA DE TICKETS DE SUPORTE (KANBAN)
create table if not exists public.support_tickets (
  id text primary key,
  protocol text not null unique,
  student_name text not null,
  student_phone text not null,
  product_name text default 'Formação IA Pro',
  group_name text not null,
  category text not null,
  urgency text not null default 'medium', -- 'urgent' | 'high' | 'medium' | 'low'
  tier text not null default 'N1 Suporte', -- 'N1 Suporte' | 'N2 Técnico' | 'N3 Especialista'
  status text not null default 'new', -- 'new' | 'in_progress' | 'waiting_student' | 'resolved'
  assigned_to text,
  summary text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 8. TABELA DE USUÁRIOS DO SISTEMA (RBAC)
create table if not exists public.system_users (
  id text primary key,
  name text not null,
  email text not null unique,
  phone text not null,
  role text not null default 'attendant', -- 'admin' | 'supervisor' | 'attendant' | 'viewer'
  status text not null default 'active', -- 'active' | 'pending' | 'suspended'
  assigned_group_ids text[] default '{}',
  permissions text[] default '{}',
  avatar text default 'US',
  created_at timestamp with time zone default now(),
  last_active_at timestamp with time zone default now()
);

-- HABILITAR RLS COM POLÍTICAS ABERTAS PARA A API KEY DO APP
alter table public.platform_settings enable row level security;
alter table public.products enable row level security;
alter table public.whatsapp_groups enable row level security;
alter table public.students enable row level security;
alter table public.group_messages enable row level security;
alter table public.alerts enable row level security;
alter table public.support_tickets enable row level security;
alter table public.system_users enable row level security;

-- Políticas de acesso para anon e authenticated (Acesso via cliente da aplicação)
create policy "Allow all on platform_settings" on public.platform_settings for all using (true) with check (true);
create policy "Allow all on products" on public.products for all using (true) with check (true);
create policy "Allow all on whatsapp_groups" on public.whatsapp_groups for all using (true) with check (true);
create policy "Allow all on students" on public.students for all using (true) with check (true);
create policy "Allow all on group_messages" on public.group_messages for all using (true) with check (true);
create policy "Allow all on alerts" on public.alerts for all using (true) with check (true);
create policy "Allow all on support_tickets" on public.support_tickets for all using (true) with check (true);
create policy "Allow all on system_users" on public.system_users for all using (true) with check (true);

-- Inserir configuração padrão inicial
insert into public.platform_settings (
  id,
  whatsapp_provider_type,
  whatsapp_server_url,
  whatsapp_instance_name,
  active_ai_model,
  auto_kick_on_refund,
  sla_warning_minutes,
  notify_supervisors_on_conflict
) values (
  'default_settings',
  'zapi',
  'https://api.z-api.io',
  'minha-instancia-zapi',
  'gpt-4o-mini',
  true,
  20,
  true
) on conflict (id) do nothing;
