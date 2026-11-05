alter table public.orders add column if not exists payment_method text default 'cod';
alter table public.orders add column if not exists payment_status text default 'unpaid';
alter table public.orders add column if not exists payment_ref text;
alter table public.orders add column if not exists receipt_url text;

alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders drop constraint if exists orders_payment_status_check;
