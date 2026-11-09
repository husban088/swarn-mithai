-- =====================================================================
-- Pehle se add kiye hue SAARE reviews delete (Pakistan + USA dono, product pages ke reviews)
-- Supabase Dashboard -> SQL Editor -> New query -> paste -> Run
-- Sirf reviews table khali hoti hai. Products / orders / users ko haath nahi lagata.
-- =====================================================================
delete from public.reviews;

-- Check: ye 0 dikhana chahiye
select count(*) as reviews_left from public.reviews;
