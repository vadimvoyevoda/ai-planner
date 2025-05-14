-- Repopulate Database Script
-- Run this in the Supabase SQL Editor

-- Insert meeting categories
INSERT INTO meeting_categories (id, name, suggested_attire, created_at) VALUES
  ('a1b2c3d4-e5f6-4789-abcd-123456789abc', 'Biznesowe', 'Strój formalny - garnitur/kostium biznesowy', now()),
  ('b2c3d4e5-f6a7-4789-abcd-223456789abc', 'Prywatne', 'Strój casualowy', now()),
  ('c3d4e5f6-a7b8-4789-abcd-323456789abc', 'Edukacyjne', 'Strój smart casual', now()),
  ('d4e5f6a7-b8c9-4789-abcd-423456789abc', 'Medyczne', 'Wygodny, luźny strój', now()),
  ('e5f6a7b8-c9d0-4789-abcd-523456789abc', 'Urzędowe', 'Strój formalny', now()),
  ('f6a7b8c9-d0e1-4789-abcd-623456789abc', 'Sportowe', 'Strój sportowy i odpowiednie obuwie', now()),
  ('a7b8c9d0-e1f2-4789-abcd-723456789abc', 'Konferencja', 'Strój biznesowy casual', now()),
  ('b8c9d0e1-f2a3-4789-abcd-823456789abc', 'Rozmowa rekrutacyjna', 'Strój formalny lub smart casual', now())
ON CONFLICT (id) DO NOTHING;

-- If you already have a user account, you can get the user ID from the auth.users table
-- and use it in the code below to add sample meetings for that user
-- Replace 'YOUR_USER_ID' with your actual user ID

-- Create user preferences (run this after creating your user account)
-- INSERT INTO meeting_preferences (
--   user_id, 
--   preferred_distribution, 
--   preferred_times_of_day, 
--   min_break_minutes, 
--   unavailable_weekdays
-- ) VALUES (
--   'YOUR_USER_ID',
--   'rozłożone',
--   ARRAY['rano', 'dzień']::time_of_day[],
--   30,
--   ARRAY[0, 6]
-- )
-- ON CONFLICT (user_id) DO NOTHING;

-- Sample meetings (uncomment and replace YOUR_USER_ID with your actual user ID)
-- INSERT INTO meetings (
--   user_id, 
--   title, 
--   description, 
--   category_id, 
--   start_time, 
--   end_time, 
--   location_name, 
--   ai_generated, 
--   created_at
-- ) VALUES 
-- (
--   'YOUR_USER_ID', 
--   'Spotkanie projektowe', 
--   'Omówienie postępów w projekcie i planowanie kolejnych kroków', 
--   'a1b2c3d4-e5f6-4789-abcd-123456789abc', 
--   now() + INTERVAL '1 day 10 hours', 
--   now() + INTERVAL '1 day 11 hours', 
--   'Biuro główne, sala konferencyjna 2A', 
--   false, 
--   now()
-- ),
-- (
--   'YOUR_USER_ID', 
--   'Spotkanie z klientem', 
--   'Prezentacja prototypu i zebranie opinii', 
--   'b2c3d4e5-f6a7-4789-abcd-223456789abc', 
--   now() + INTERVAL '7 days 13 hours', 
--   now() + INTERVAL '7 days 14 hours 30 minutes', 
--   'Kawiarnia "Pod palmą", ul. Przykładowa 5', 
--   false, 
--   now()
-- );

-- NOTE: After creating a user through the app:
-- 1. Go to the Supabase Dashboard
-- 2. Go to Authentication > Users and find your user ID
-- 3. Replace YOUR_USER_ID in the commented sections above with that ID
-- 4. Uncomment those sections
-- 5. Run this script again 