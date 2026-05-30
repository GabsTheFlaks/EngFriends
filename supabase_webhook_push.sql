-- =================================================================================
-- EngFriends - Setup de Webhook para Push Notifications via Trigger SQL
-- =================================================================================

-- 1. Habilitar a extensão pg_net para fazer requisições HTTP do banco de dados
create extension if not exists pg_net;

-- 2. Criar a função que aciona o Cloudflare Worker
create or replace function public.trigger_push_notification()
returns trigger as $$
declare
  -- A URL final em produção para o seu Cloudflare Worker
  worker_url text := 'https://engfriends-push-worker.equipexprojeto.workers.dev/notify'; 
  payload jsonb;
begin
  -- Monta o payload no formato esperado pelo POST /notify do Cloudflare Worker
  payload := jsonb_build_object(
    'user_id', new.user_id,
    'title', new.title,
    'body', new.body,
    'url', '/'
  );

  -- Dispara a requisição HTTP POST assíncrona
  perform net.http_post(
    url := worker_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := payload
  );

  return new;
end;
$$ language plpgsql security definer;

-- 3. Criar o Trigger que é executado após cada inserção na tabela de notificações
drop trigger if exists push_notification_trigger on public.notifications;
create trigger push_notification_trigger
  after insert on public.notifications
  for each row execute function public.trigger_push_notification();
