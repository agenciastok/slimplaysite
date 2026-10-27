alter table public.activation_payments
  add column if not exists pix_expires_at timestamptz;

update public.activation_plans
set active = false
where code in ('30', '90');

update public.activation_plans
set days = 365, price_cents = 1200, active = true, sort_order = 1
where code = '365';

alter table public.reseller_credit_moves drop constraint reseller_credit_moves_reason_check;

alter table public.reseller_credit_moves
  add constraint reseller_credit_moves_reason_check
  check (reason in ('activation', 'refund', 'transfer_in', 'transfer_out', 'purchase', 'purchase_refund'));

create table public.reseller_credit_payments (
  id uuid primary key default gen_random_uuid(),
  reseller_id uuid not null references public.resellers (id) on delete restrict,
  credits integer not null check (credits > 0),
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  asaas_payment_id text unique,
  asaas_customer_id text,
  pix_payload text,
  pix_qr text,
  pix_expires_at timestamptz,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index reseller_credit_payments_reseller_idx on public.reseller_credit_payments (reseller_id, created_at desc);

alter table public.reseller_credit_payments enable row level security;
revoke all on table public.reseller_credit_payments from anon, authenticated;

create table public.payment_gateway (
  id integer primary key check (id = 1),
  api_key text not null,
  webhook_token text not null,
  sandbox boolean not null default false
);

alter table public.payment_gateway enable row level security;
revoke all on table public.payment_gateway from public, anon, authenticated;
grant select on table public.payment_gateway to service_role;
