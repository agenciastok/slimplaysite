create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_name_len check (char_length(name) between 2 and 80),
  constraint contact_messages_email_len check (char_length(email) between 6 and 160),
  constraint contact_messages_message_len check (char_length(message) between 10 and 2000)
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from public, anon, authenticated;
