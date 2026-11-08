-- Evelyn One: sirf 4 products (19 L, 1.5 L, 0.5 L, 300 ml)
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run (ek hi dafa)

-- 1) Products me variants (Pure / Mix / Custom, ya First time / Refill) ka column
alter table public.products add column if not exists variants jsonb default '[]'::jsonb;

-- 2) Purane water (aqua) products hata do, sirf ye 4 rahein
delete from public.products where category = 'aqua';

-- 3) 4 naye products. variants = har option ki price (PKR), note aur image.
--    Image abhi khali hai: Admin panel -> Products -> Edit se har option ki image upload karein.
insert into public.products (name, description, category, price_usd, price_pkr, unit, featured, in_stock, variants)
values
(
  'Evelyn One 19 L',
  'First time PKR 1,500 (bottle with security deposit included). After that, refill / pure bottle only PKR 200.',
  'aqua', null, 1500, '', true, true,
  '[
    {"key":"first-time","label":"First time (with bottle)","price_pkr":1500,"note":"Includes bottle with security","image":""},
    {"key":"refill","label":"Refill","price_pkr":200,"note":"Refill / pure bottle only","image":""}
  ]'::jsonb
),
(
  'Evelyn One 1.5 L',
  'Pure PKR 380 and Mix PKR 350. Customize bottle available: minimum order 50 PET bottles.',
  'aqua', null, 380, '', true, true,
  '[
    {"key":"pure","label":"Pure","price_pkr":380,"note":"","image":""},
    {"key":"mix","label":"Mix","price_pkr":350,"note":"","image":""},
    {"key":"custom","label":"Custom · 50 PET","price_pkr":380,"note":"Customize bottle: minimum order 50 PET bottles","image":""}
  ]'::jsonb
),
(
  'Evelyn One 0.5 L',
  'Pure PKR 400 and Mix PKR 370. Customize bottle available: minimum order 50 PET bottles.',
  'aqua', null, 400, '', false, true,
  '[
    {"key":"pure","label":"Pure","price_pkr":400,"note":"","image":""},
    {"key":"mix","label":"Mix","price_pkr":370,"note":"","image":""},
    {"key":"custom","label":"Custom · 50 PET","price_pkr":400,"note":"Customize bottle: minimum order 50 PET bottles","image":""}
  ]'::jsonb
),
(
  'Evelyn One 300 ml',
  'Pure PKR 400 and Mix PKR 370. Customize bottle available: minimum order 50 PET bottles.',
  'aqua', null, 400, '', false, true,
  '[
    {"key":"pure","label":"Pure","price_pkr":400,"note":"","image":""},
    {"key":"mix","label":"Mix","price_pkr":370,"note":"","image":""},
    {"key":"custom","label":"Custom · 50 PET","price_pkr":400,"note":"Customize bottle: minimum order 50 PET bottles","image":""}
  ]'::jsonb
);
