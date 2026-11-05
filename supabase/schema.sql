-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text default '',
  category text not null check (category in ('sweets','aqua')),
  image_url text,
  price_usd numeric(10,2),
  price_pkr numeric(12,2),
  unit text default '',
  featured boolean default false,
  in_stock boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  country text not null,
  currency text not null,
  total numeric(12,2) not null,
  items jsonb not null,
  customer jsonb not null,
  status text not null default 'pending',
  created_at timestamptz default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;
-- Server service-role key use karta hai (RLS bypass), isliye public policies ki zarurat nahi.

insert into storage.buckets (id, name, public) values ('products', 'products', true)
on conflict (id) do nothing;

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images" on storage.objects
  for select using (bucket_id = 'products');

insert into public.products (name, description, category, price_usd, price_pkr, unit, featured)
select * from (values
  ('Gulab Jamun', 'Soft khoya dumplings soaked in rose-cardamom syrup.', 'sweets', 11.00, 1200.00, 'Box (500 g)', true),
  ('Kaju Katli', 'Silky cashew fudge finished with edible silver leaf.', 'sweets', 18.00, 2600.00, 'Box (500 g)', true),
  ('Rasmalai', 'Saffron milk dumplings in chilled pistachio cream.', 'sweets', 14.00, 1700.00, 'Box (500 g)', true),
  ('Motichoor Ladoo', 'Fine boondi pearls, ghee, and a hint of saffron.', 'sweets', 10.00, 1100.00, 'Box (500 g)', false),
  ('Jalebi', 'Crisp golden spirals dipped in warm sugar syrup.', 'sweets', 8.00, 800.00, 'Box (500 g)', false),
  ('Gajar Halwa', 'Slow-cooked carrot halwa with nuts and khoya.', 'sweets', 12.00, 1400.00, 'Box (500 g)', false),
  ('Pistachio Barfi', 'Dense milk barfi layered with Iranian pistachios.', 'sweets', 16.00, 2200.00, 'Box (500 g)', true),
  ('Aqua Pure 500 ml', 'Purified drinking water, 500 ml bottles.', 'aqua', null, 450.00, 'Pack of 12', false),
  ('Aqua Pure 1.5 L', 'Purified drinking water, 1.5 L bottles.', 'aqua', null, 700.00, 'Pack of 6', true),
  ('Aqua Pure 19 L', 'Refillable family-size water bottle.', 'aqua', null, 350.00, 'Per bottle', true)
) as v(name, description, category, price_usd, price_pkr, unit, featured)
where not exists (select 1 from public.products);
