create table public.activation_plans (
  code text primary key,
  days integer not null check (days > 0 and days <= 3660),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default false,
  sort_order integer not null default 0
);

create table public.activation_payments (
  id uuid primary key default gen_random_uuid(),
  mac_address text not null,
  plan_code text not null references public.activation_plans (code),
  days integer not null check (days > 0),
  amount_cents integer not null check (amount_cents > 0),
  billing_type text not null check (billing_type in ('pix', 'credit_card')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  asaas_payment_id text unique,
  asaas_customer_id text,
  invoice_url text,
  pix_payload text,
  pix_qr text,
  previous_expires_at timestamptz,
  granted_expires_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index activation_payments_mac_idx on public.activation_payments (mac_address);

alter table public.activation_plans enable row level security;
alter table public.activation_payments enable row level security;

revoke all on table public.activation_plans from anon, authenticated;
revoke all on table public.activation_payments from anon, authenticated;

insert into public.activation_plans (code, days, price_cents, active, sort_order)
values
  ('30', 30, 0, false, 1),
  ('90', 90, 0, false, 2),
  ('365', 365, 0, false, 3);
