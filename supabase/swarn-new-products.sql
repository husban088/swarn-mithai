-- =====================================================================
-- Swarn: new products (Supabase Dashboard -> SQL Editor -> New query -> paste -> Run)
-- 1) video_url column add karta hai
-- 2) purani saari MITHAI (sweets) products + unke views/reviews delete karta hai
--    (Aqua water products ko haath nahi lagata)
-- 3) 20 varieties + 1 Special Box add karta hai
--
-- NOTE: Prices PLACEHOLDER hain ($20 har box). Admin panel se ya neeche wali
-- UPDATE query se apni asli prices set kar lein.
-- =====================================================================

alter table public.products add column if not exists video_url text;
alter table public.products add column if not exists images jsonb default '[]'::jsonb;

delete from public.product_views
  where product_id in (select id from public.products where category = 'sweets');
delete from public.reviews
  where product_id in (select id from public.products where category = 'sweets');
delete from public.products where category = 'sweets';

insert into public.products
  (name, description, category, price_usd, unit, featured, in_stock, created_at)
select v.name, v.description, 'sweets', 20.00, v.unit, v.featured, true,
       now() + (v.n * interval '1 second')
from (values
  (1,  'Special Event Box (16 pcs)', 'Special rates for weddings, birthdays and baby-born celebrations. A gift-ready box of 16 pieces, chosen from our 20 varieties.', 'Box (16 pcs)', true),
  (2,  'Khoya Barfi', 'Classic milk barfi made from slow-cooked khoya. Rich, soft and melt-in-the-mouth.', 'Box (16 pcs)', true),
  (3,  'Almond Barfi', 'Dense, creamy barfi loaded with finely ground almonds.', 'Box (16 pcs)', false),
  (4,  'Pistachio Barfi', 'Silky barfi layered with pistachios for a deep nutty flavour and a green finish.', 'Box (16 pcs)', true),
  (5,  'Mango Barfi', 'Soft barfi with sweet mango, a fruity favourite for every celebration.', 'Box (16 pcs)', true),
  (6,  'Chocolate Barfi', 'Fudgy milk barfi with rich chocolate. A treat for kids and adults alike.', 'Box (16 pcs)', false),
  (7,  'Coffee Barfi', 'Milk barfi infused with coffee for a smooth, slightly bitter-sweet taste.', 'Box (16 pcs)', false),
  (8,  'Orange Barfi', 'Light, citrusy barfi with a fresh orange aroma.', 'Box (16 pcs)', false),
  (9,  'Besan Barfi', 'Roasted gram flour barfi cooked in ghee, grainy, fragrant and traditional.', 'Box (16 pcs)', false),
  (10, 'Kaju Katli', 'Silky cashew fudge cut into thin diamonds, finished with a delicate shine.', 'Box (16 pcs)', true),
  (11, 'Gulab Jamun', 'Soft khoya dumplings soaked in warm rose-cardamom syrup.', 'Box (16 pcs)', true),
  (12, 'Laddu', 'Hand-rolled laddu made with ghee and a hint of cardamom.', 'Box (16 pcs)', false),
  (13, 'Kalakand', 'Grainy, milky kalakand with a soft texture and mild sweetness.', 'Box (16 pcs)', false),
  (14, 'Pink Kalakand', 'The classic kalakand in a pretty pink, a favourite for gifting.', 'Box (16 pcs)', true),
  (15, 'Milk Cake', 'Caramelised, slow-cooked milk cake with a rich golden-brown taste.', 'Box (16 pcs)', true),
  (16, 'Habshi Halwa', 'Dark, rich halwa cooked slowly with ghee and dry fruits.', 'Box (16 pcs)', false),
  (17, 'Khoya Pera', 'Traditional milk pera with a smooth texture, made from fresh khoya.', 'Box (16 pcs)', false),
  (18, 'Gajar Halwa', 'Slow-cooked carrot halwa with nuts and khoya.', 'Box (16 pcs)', false),
  (19, 'Coconut Barfi', 'Soft coconut barfi with a light, creamy sweetness.', 'Box (16 pcs)', false),
  (20, 'Pateesa', 'Delicate, flaky pateesa that melts on the tongue.', 'Box (16 pcs)', false),
  (21, 'Pineapple Barfi', 'Barfi with a bright pineapple flavour, soft and refreshing.', 'Box (16 pcs)', false)
) as v(n, name, description, unit, featured);

-- Apni asli price set karne ke liye (example):
-- update public.products set price_usd = 24 where name = 'Kaju Katli';
-- update public.products set price_usd = 20 where name like 'Special Event Box%';

-- Agar Aqua products bhi hatane hon (zaroorat na ho to ye mat chalayein):
-- delete from public.products where category = 'aqua';
