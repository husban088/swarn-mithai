-- Supabase SQL Editor me ek baar run karein: purane products ke naam "Apna Pani" se "Evelyn One" ho jayenge.
update public.products
set name = replace(name, 'Apna Pani', 'Evelyn One'),
    description = replace(coalesce(description, ''), 'Apna Pani', 'Evelyn One')
where name ilike '%Apna Pani%' or description ilike '%Apna Pani%';
