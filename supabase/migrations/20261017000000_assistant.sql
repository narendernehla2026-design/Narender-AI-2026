create table if not exists public.assistant_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New conversation' check (char_length(title) between 1 and 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table if not exists public.assistant_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  created_at timestamptz not null default now(),
  constraint assistant_messages_owned_chat_fk
    foreign key (chat_id, user_id)
    references public.assistant_chats(id, user_id)
    on delete cascade
);

create table if not exists public.assistant_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('personal', 'work', 'preference', 'project', 'note')),
  title text not null check (char_length(title) between 1 and 120),
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assistant_rate_limits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0)
);

create index if not exists assistant_chats_user_updated_idx
  on public.assistant_chats(user_id, updated_at desc);
create index if not exists assistant_messages_chat_created_idx
  on public.assistant_messages(chat_id, created_at);
create index if not exists assistant_messages_user_created_idx
  on public.assistant_messages(user_id, created_at desc);
create index if not exists assistant_memories_user_updated_idx
  on public.assistant_memories(user_id, updated_at desc);

grant select, insert, update, delete
  on public.assistant_chats, public.assistant_messages, public.assistant_memories
  to authenticated;

alter table public.assistant_chats enable row level security;
alter table public.assistant_messages enable row level security;
alter table public.assistant_memories enable row level security;
alter table public.assistant_rate_limits enable row level security;

drop policy if exists assistant_chats_owner_all on public.assistant_chats;
create policy assistant_chats_owner_all on public.assistant_chats
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists assistant_messages_owner_all on public.assistant_messages;
create policy assistant_messages_owner_all on public.assistant_messages
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists assistant_memories_owner_all on public.assistant_memories;
create policy assistant_memories_owner_all on public.assistant_memories
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

revoke all on public.assistant_rate_limits from anon, authenticated;

create or replace function public.consume_assistant_request()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid := auth.uid();
  current_window timestamptz := date_trunc('minute', now());
  current_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  insert into public.assistant_rate_limits (user_id, window_started_at, request_count)
  values (current_user_id, current_window, 1)
  on conflict (user_id) do update
    set window_started_at = excluded.window_started_at,
        request_count = case
          when public.assistant_rate_limits.window_started_at = excluded.window_started_at
            then public.assistant_rate_limits.request_count + 1
          else 1
        end
  returning request_count into current_count;

  return current_count <= 20;
end;
$$;

revoke all on function public.consume_assistant_request() from public, anon;
grant execute on function public.consume_assistant_request() to authenticated;
