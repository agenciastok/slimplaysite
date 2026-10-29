create table if not exists public.activation_vouchers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  purpose text not null check (purpose = 'app_release'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.activation_vouchers enable row level security;

revoke all on table public.activation_vouchers from public, anon, authenticated;

alter table public.voucher_activations
  add column if not exists voucher_id uuid references public.activation_vouchers (id);

insert into public.activation_vouchers (code, purpose)
values ('968425', 'app_release')
on conflict (code) do update
set purpose = excluded.purpose,
    active = true;
