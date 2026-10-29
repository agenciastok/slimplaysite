create table if not exists public.voucher_activations (
  id uuid primary key default gen_random_uuid(),
  mac_address text not null,
  previous_expires_at timestamptz,
  granted_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.voucher_activations enable row level security;

revoke all on table public.voucher_activations from public, anon, authenticated;
