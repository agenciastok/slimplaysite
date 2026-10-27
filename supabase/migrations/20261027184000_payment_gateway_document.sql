alter table public.payment_gateway
  add column if not exists document text not null default '';
