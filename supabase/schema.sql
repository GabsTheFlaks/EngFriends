-- 1. Perfis de usuário
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_index integer not null default 0,
  created_at timestamptz default now()
);

-- 2. Canais de chat
create table rooms (
  id text primary key,
  name text not null,
  type text not null check (type in ('channel', 'dm')),
  created_at timestamptz default now()
);

-- 3. Mensagens
create table messages (
  id uuid primary key default gen_random_uuid(),
  room_id text references rooms(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  content text not null,
  type text not null default 'text' check (type in ('text', 'image')),
  created_at timestamptz default now()
);

-- 4. Notificações in-app
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read boolean not null default false,
  created_at timestamptz default now()
);

-- 5. Push subscriptions
create table push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at timestamptz default now()
);

-- Função que cria o perfil automaticamente após signup
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

-- Trigger que chama a função após inserção em auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- profiles
alter table profiles enable row level security;
create policy "Qualquer usuário autenticado pode ler perfis"
  on profiles for select using (auth.role() = 'authenticated');
create policy "Usuário edita apenas o próprio perfil"
  on profiles for update using (auth.uid() = id);

-- rooms
alter table rooms enable row level security;
create policy "Qualquer autenticado lê salas"
  on rooms for select using (auth.role() = 'authenticated');

-- messages
alter table messages enable row level security;
create policy "Autenticado lê mensagens"
  on messages for select using (auth.role() = 'authenticated');
create policy "Autenticado insere mensagens"
  on messages for insert with check (auth.role() = 'authenticated');

-- notifications
alter table notifications enable row level security;
create policy "Usuário lê próprias notificações"
  on notifications for select using (auth.uid() = user_id);
create policy "Usuário atualiza próprias notificações"
  on notifications for update using (auth.uid() = user_id);

-- push_subscriptions
alter table push_subscriptions enable row level security;
create policy "Usuário gerencia próprias subscriptions"
  on push_subscriptions for all using (auth.uid() = user_id);

insert into rooms (id, name, type) values
  ('alunos-eng', 'Alunos Eng.', 'channel'),
  ('estruturas-i', 'Estruturas I', 'channel'),
  ('calculo-ii', 'Cálculo II', 'channel'),
  ('geral', 'Geral', 'channel'),
  ('projetos', 'Projetos', 'channel');

-- 6. Configurar Supabase Storage
-- No painel Supabase -> Storage:
-- Criar bucket chamado chat-media
-- Marcar como Public bucket
-- Executar a policy de escrita:
create policy "Autenticado faz upload em chat-media"
  on storage.objects for insert
  with check (bucket_id = 'chat-media' and auth.role() = 'authenticated');
