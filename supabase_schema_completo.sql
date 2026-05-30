-- =========================================================================
-- ENGFRIENDS — SCHEMA SQL COMPLETO E DEFINITIVO
-- Execute INTEIRO no SQL Editor do Supabase (projeto jwmvwxamgvjkmemgxyio)
--
-- ⚠️  Seguro para rodar múltiplas vezes: usa IF NOT EXISTS e ON CONFLICT.
-- ⚠️  Antes de rodar: crie o bucket 'chat-media' como PÚBLICO no painel
--     Storage → New Bucket → Nome: chat-media → Public: ON
-- =========================================================================


-- =========================================================================
-- PARTE 1 — TABELAS
-- =========================================================================

-- 1. Perfis de usuário (sincronizado com auth.users via trigger)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_index integer not null default 0,
  ra text default null,
  course text default null,
  period text default null,
  updated_at timestamptz default null,
  created_at timestamptz default now()
);

-- 2. Canais de chat e DMs
create table if not exists public.rooms (
  id text primary key,
  name text not null,
  type text not null check (type in ('channel', 'dm')),
  -- created_by: dono do canal (pode ser null para canais do sistema)
  created_by uuid references auth.users(id) on delete set null default null,
  created_at timestamptz default now()
);

-- 3. Mensagens de chat
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text references public.rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  type text not null default 'text' check (type in ('text', 'image')),
  created_at timestamptz default now()
);

-- 4. Notificações in-app
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- 5. Assinaturas Push (Web Push Notifications)
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);


-- =========================================================================
-- PARTE 2 — COLUNAS EXTRAS (seguro para re-rodar)
-- O database.types.ts espera ra, course, period, updated_at em profiles.
-- Se a tabela já existia sem essas colunas, esse bloco as adiciona.
-- =========================================================================

do $$
begin
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='ra') then
    alter table public.profiles add column ra text default null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='course') then
    alter table public.profiles add column course text default null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='period') then
    alter table public.profiles add column period text default null;
  end if;
  if not exists (select 1 from information_schema.columns where table_schema='public' and table_name='profiles' and column_name='updated_at') then
    alter table public.profiles add column updated_at timestamptz default null;
  end if;
end $$;


-- =========================================================================
-- PARTE 3 — TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL
-- Cria o registro em profiles quando um novo usuário faz signup.
-- =========================================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Dropar e recriar o trigger para garantir idempotência
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- =========================================================================
-- PARTE 4 — ROW LEVEL SECURITY (RLS)
-- Dropar policies existentes antes de recriar (idempotente).
-- =========================================================================

-- ── profiles ──
alter table public.profiles enable row level security;

drop policy if exists "Qualquer usuário autenticado pode ler perfis" on public.profiles;
create policy "Qualquer usuário autenticado pode ler perfis"
  on public.profiles for select
  using (auth.role() = 'authenticated');

drop policy if exists "Usuário edita apenas o próprio perfil" on public.profiles;
create policy "Usuário edita apenas o próprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Usuário insere o próprio perfil" on public.profiles;
create policy "Usuário insere o próprio perfil"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ── rooms ──
alter table public.rooms enable row level security;

drop policy if exists "Qualquer autenticado lê salas" on public.rooms;
create policy "Qualquer autenticado lê salas"
  on public.rooms for select
  using (auth.role() = 'authenticated');

-- [CORREÇÃO] Permite criar novos canais (ChatTab → handleCreateChatSubmit)
drop policy if exists "Autenticado cria salas" on public.rooms;
create policy "Autenticado cria salas"
  on public.rooms for insert
  with check (auth.role() = 'authenticated');

-- [CORRECÇÃO DE SEGURANCA]
-- Apenas o criador do canal pode deleta-lo (via campo created_by)
-- Canais do sistema (created_by IS NULL) nao podem ser deletados por nenhum usuário via frontend.
drop policy if exists "Autenticado deleta salas" on public.rooms;
create policy "Criador deleta própria sala"
  on public.rooms for delete
  using (created_by IS NOT NULL AND auth.uid() = created_by);


-- ── messages ──
alter table public.messages enable row level security;

drop policy if exists "Autenticado lê mensagens" on public.messages;
create policy "Autenticado lê mensagens"
  on public.messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "Autenticado insere mensagens" on public.messages;
create policy "Autenticado insere mensagens"
  on public.messages for insert
  with check (auth.role() = 'authenticated');

-- [CORRECÇÃO DE SEGURANCA]
-- Apenas o próprio remetente pode deletar suas mensagens (auth.uid() = sender_id)
-- Isso impede que qualquer usuário autenticado apague mensagens de outros.
drop policy if exists "Autenticado deleta mensagens" on public.messages;
drop policy if exists "Usuário deleta próprias mensagens" on public.messages;
create policy "Usuário deleta próprias mensagens"
  on public.messages for delete
  using (auth.uid() = sender_id);


-- ── notifications ──
alter table public.notifications enable row level security;

drop policy if exists "Usuário lê próprias notificações" on public.notifications;
create policy "Usuário lê próprias notificações"
  on public.notifications for select
  using (auth.uid() = user_id);

drop policy if exists "Usuário atualiza próprias notificações" on public.notifications;
create policy "Usuário atualiza próprias notificações"
  on public.notifications for update
  using (auth.uid() = user_id);

-- [CORREÇÃO] Permite que qualquer autenticado INSIRA notificações para outros
-- (useChat.ts insere notificações para os destinatários após enviar mensagem)
drop policy if exists "Autenticado insere notificações" on public.notifications;
create policy "Autenticado insere notificações"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');


-- ── push_subscriptions ──
alter table public.push_subscriptions enable row level security;

drop policy if exists "Usuário gerencia próprias subscriptions" on public.push_subscriptions;
create policy "Usuário gerencia próprias subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id);


-- =========================================================================
-- PARTE 5 — STORAGE POLICIES (bucket: chat-media)
-- ⚠️  ANTES: crie o bucket 'chat-media' como PÚBLICO no painel do Supabase!
--     Storage → New Bucket → Nome: chat-media → Public bucket: ON
-- =========================================================================

-- Upload: apenas autenticados
drop policy if exists "Autenticado faz upload em chat-media" on storage.objects;
create policy "Autenticado faz upload em chat-media"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');

-- [CORREÇÃO #05 do Code Review]
-- Leitura: qualquer pessoa pode ler (bucket público)
-- Necessário para que as imagens do chat sejam visíveis via URL pública.
drop policy if exists "Leitura pública de chat-media" on storage.objects;
create policy "Leitura pública de chat-media"
  on storage.objects for select
  using (bucket_id = 'chat-media');


-- =========================================================================
-- PARTE 6 — DADOS INICIAIS (Canais Fixos)
-- =========================================================================

insert into public.rooms (id, name, type) values
  ('alunos-eng', 'Alunos Eng.', 'channel'),
  ('estruturas-i', 'Estruturas I', 'channel'),
  ('calculo-ii', 'Cálculo II', 'channel'),
  ('geral', 'Geral', 'channel'),
  ('projetos', 'Projetos', 'channel')
on conflict (id) do nothing;


-- =========================================================================
-- PARTE 7 — ÍNDICES DE PERFORMANCE
-- Aceleram as queries mais frequentes dos hooks useChat e useNotifications.
-- =========================================================================

create index if not exists idx_messages_room_id_created
  on public.messages (room_id, created_at desc);

create index if not exists idx_messages_room_id_sender
  on public.messages (room_id, sender_id);

create index if not exists idx_notifications_user_id_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_push_subscriptions_user_id
  on public.push_subscriptions (user_id);


-- =========================================================================
-- PARTE 8 — HABILITAR REALTIME
-- Publica as tabelas para que Supabase Realtime envie eventos postgres_changes.
-- =========================================================================

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.profiles;


-- =========================================================================
-- ✅ PRONTO!
-- Após executar:
-- 1. Vá em Storage → Verifique que o bucket 'chat-media' existe e é público
-- 2. Vá em Database → Replication → Confirme que messages, notifications
--    e profiles aparecem na publicação supabase_realtime
-- 3. Teste criando um usuário via signup no app
-- =========================================================================
