create table public.resellers (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.resellers (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  email text not null check (email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  phone text not null default '' check (char_length(phone) <= 30),
  password_hash text not null,
  credits integer not null default 0 check (credits >= 0),
  created_at timestamptz not null default now()
);

create unique index resellers_email_uidx on public.resellers (email);
create index resellers_parent_idx on public.resellers (parent_id);

create table public.reseller_devices (
  id bigint generated always as identity primary key,
  reseller_id uuid not null references public.resellers (id) on delete cascade,
  mac_address varchar(64) not null references public.device_macs (mac_address) on update cascade on delete cascade,
  comment text not null default '' check (char_length(comment) <= 80),
  package_label text not null default '1 ano',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (mac_address)
);

create index reseller_devices_reseller_idx on public.reseller_devices (reseller_id);

create table public.reseller_credit_moves (
  id bigint generated always as identity primary key,
  reseller_id uuid not null references public.resellers (id) on delete cascade,
  delta integer not null check (delta <> 0),
  reason text not null check (reason in ('activation', 'refund', 'transfer_in', 'transfer_out')),
  created_at timestamptz not null default now()
);

create index reseller_credit_moves_reseller_idx on public.reseller_credit_moves (reseller_id, created_at desc);

alter table public.resellers enable row level security;
alter table public.reseller_devices enable row level security;
alter table public.reseller_credit_moves enable row level security;

revoke all on table public.resellers from anon, authenticated;
revoke all on table public.reseller_devices from anon, authenticated;
revoke all on table public.reseller_credit_moves from anon, authenticated;
