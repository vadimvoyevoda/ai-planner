-- Initial data population migration

-- Insert meeting categories
INSERT INTO meeting_categories (id, name, suggested_attire, created_at) VALUES
  ('a1b2c3d4-e5f6-4789-abcd-123456789abc', 'Biznesowe', 'Strój formalny - garnitur/kostium biznesowy', now()),
  ('b2c3d4e5-f6a7-4789-abcd-223456789abc', 'Prywatne', 'Strój casualowy', now()),
  ('c3d4e5f6-a7b8-4789-abcd-323456789abc', 'Edukacyjne', 'Strój smart casual', now()),
  ('d4e5f6a7-b8c9-4789-abcd-423456789abc', 'Medyczne', 'Wygodny, luźny strój', now()),
  ('e5f6a7b8-c9d0-4789-abcd-523456789abc', 'Urzędowe', 'Strój formalny', now()),
  ('f6a7b8c9-d0e1-4789-abcd-623456789abc', 'Sportowe', 'Strój sportowy i odpowiednie obuwie', now()),
  ('a7b8c9d0-e1f2-4789-abcd-723456789abc', 'Konferencja', 'Strój biznesowy casual', now()),
  ('b8c9d0e1-f2a3-4789-abcd-823456789abc', 'Rozmowa rekrutacyjna', 'Strój formalny lub smart casual', now());

-- Create function to help insert sample meetings
CREATE OR REPLACE FUNCTION insert_sample_meetings_for_user(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  category_id UUID;
  now_timestamp TIMESTAMPTZ := now();
  tomorrow TIMESTAMPTZ := now() + INTERVAL '1 day';
  next_week TIMESTAMPTZ := now() + INTERVAL '7 days';
BEGIN
  -- Get random category_id
  SELECT id INTO category_id FROM meeting_categories ORDER BY random() LIMIT 1;
  
  -- Insert a few sample meetings for the user
  INSERT INTO meetings (
    user_id, 
    title, 
    description, 
    category_id, 
    start_time, 
    end_time, 
    location_name, 
    ai_generated, 
    created_at
  ) VALUES 
  (
    user_uuid, 
    'Spotkanie projektowe', 
    'Omówienie postępów w projekcie i planowanie kolejnych kroków', 
    category_id, 
    tomorrow + INTERVAL '10 hours', 
    tomorrow + INTERVAL '11 hours', 
    'Biuro główne, sala konferencyjna 2A', 
    false, 
    now_timestamp
  ),
  (
    user_uuid, 
    'Spotkanie z klientem', 
    'Prezentacja prototypu i zebranie opinii', 
    category_id, 
    next_week + INTERVAL '13 hours', 
    next_week + INTERVAL '14 hours 30 minutes', 
    'Kawiarnia "Pod palmą", ul. Przykładowa 5', 
    false, 
    now_timestamp
  );

  -- Insert sample meeting preferences for user
  INSERT INTO meeting_preferences (
    user_id, 
    preferred_distribution, 
    preferred_times_of_day, 
    min_break_minutes, 
    unavailable_weekdays
  ) VALUES (
    user_uuid,
    'rozłożone',
    ARRAY['rano', 'dzień']::time_of_day[],
    30,
    ARRAY[0, 6]
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert sample stats
  INSERT INTO proposal_stats (
    user_id,
    period_type,
    period_start_date,
    total_generations,
    accepted_proposals,
    last_updated
  ) VALUES (
    user_uuid,
    'month',
    date_trunc('month', now())::date,
    3,
    1,
    now_timestamp
  ),
  (
    user_uuid,
    'year',
    date_trunc('year', now())::date,
    5,
    2,
    now_timestamp
  );
END;
$$ LANGUAGE plpgsql;

-- Create a sample admin user function
-- This will only create a user if the function is called directly via SQL
-- Normal users should be created through the Auth API
CREATE OR REPLACE FUNCTION create_sample_admin_user()
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Create a new user through auth.users directly
  -- NOTE: In production, you should NEVER do this directly
  -- This is only for development purposes
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Add profile info
  INSERT INTO profiles (id, first_name, last_name, created_at, updated_at)
  VALUES (new_user_id, 'Admin', 'User', now(), now());

  -- Create sample data for this user
  PERFORM insert_sample_meetings_for_user(new_user_id);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- This comment shows how to create a test user manually
COMMENT ON FUNCTION create_sample_admin_user() IS 'To create a test admin user, run: SELECT create_sample_admin_user();';

-- Drop the helper functions when we're done with them
DROP FUNCTION IF EXISTS insert_sample_meetings_for_user CASCADE;
-- NOTE: We don't drop create_sample_admin_user as it might be useful to keep 