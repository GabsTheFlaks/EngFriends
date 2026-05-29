-- =========================================================================
-- ENGFRIENDS — SUPABASE DATABASE SCHEMA
-- Execute este script no SQL Editor do seu projeto Supabase na ordem exata.
-- =========================================================================

-- 1. Perfis de usuário (Sincronizado automaticamente com auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_index integer not null default 0,
  created_at timestamptz default now()
);

-- 2. Canais de chat e DMs
create table public.rooms (
  id text primary key,
  name text not null,
  type text not null check (type in ('channel', 'dm')),
  created_at timestamptz default now()
);

-- 3. Mensagens de chat
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text references public.rooms(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  content text not null,
  type text not null default 'text' check (type in ('text', 'image')),
  created_at timestamptz default now()
);

-- 4. Notificações in-app
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- 5. Assinaturas Push (Web Push Notifications)
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- =========================================================================
-- TRIGGER AUTOMÁTICO DE CRIAÇÃO DE PERFIL
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

-- Trigger disparado após inserção na tabela auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

-- profiles
alter table public.profiles enable row level security;
create policy "Qualquer usuário autenticado pode ler perfis"
  on public.profiles for select using (auth.role() = 'authenticated');
create policy "Usuário edita apenas o próprio perfil"
  on public.profiles for update using (auth.uid() = id);

-- rooms
alter table public.rooms enable row level security;
create policy "Qualquer autenticado lê salas"
  on public.rooms for select using (auth.role() = 'authenticated');

-- messages
alter table public.messages enable row level security;
create policy "Autenticado lê mensagens"
  on public.messages for select using (auth.role() = 'authenticated');
create policy "Autenticado insere mensagens"
  on public.messages for insert with check (auth.role() = 'authenticated');

-- notifications
alter table public.notifications enable row level security;
create policy "Usuário lê próprias notificações"
  on public.notifications for select using (auth.uid() = user_id);
create policy "Usuário atualiza próprias notificações"
  on public.notifications for update using (auth.uid() = user_id);

-- push_subscriptions
alter table public.push_subscriptions enable row level security;
create policy "Usuário gerencia próprias subscriptions"
  on public.push_subscriptions for all using (auth.uid() = user_id);

-- =========================================================================
-- DADOS INICIAIS (Canais Fixos)
-- =========================================================================

insert into public.rooms (id, name, type) values
  ('alunos-eng', 'Alunos Eng.', 'channel'),
  ('estruturas-i', 'Estruturas I', 'channel'),
  ('calculo-ii', 'Cálculo II', 'channel'),
  ('geral', 'Geral', 'channel'),
  ('projetos', 'Projetos', 'channel')
on conflict (id) do nothing;

-- =========================================================================
-- STORAGE BUCKET POLICIES (chat-media)
-- Nota: Crie o bucket chamado 'chat-media' como público primeiro no painel.
-- =========================================================================

create policy "Autenticado faz upload em chat-media"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');
