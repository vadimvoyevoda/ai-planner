-- Create meeting categories table
create table meeting_categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null,
    suggested_attire varchar(100),
    created_at timestamptz not null default now()
);

-- Enable RLS on meeting_categories
alter table meeting_categories enable row level security;

-- Create meeting_categories RLS policies
create policy meeting_categories_select_all on meeting_categories
    for select
    using (true);

-- Create meeting preferences table
create table meeting_preferences (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    preferred_distribution meeting_distribution not null default 'rozłożone',
    preferred_times_of_day time_of_day[] not null default '{"rano", "dzień", "wieczór"}',
    min_break_minutes integer default null,
    unavailable_weekdays integer[] not null default '{}',
    constraint unique_user_preferences unique (user_id),
    constraint valid_min_break check (min_break_minutes >= 0)
);

-- Enable RLS on meeting_preferences
alter table meeting_preferences enable row level security;

-- Create meeting_preferences RLS policies
create policy meeting_preferences_select_own on meeting_preferences
    for select
    using (user_id = auth.uid());

create policy meeting_preferences_insert_own on meeting_preferences
    for insert
    with check (user_id = auth.uid());

create policy meeting_preferences_update_own on meeting_preferences
    for update
    using (user_id = auth.uid());

create policy meeting_preferences_delete_own on meeting_preferences
    for delete
    using (user_id = auth.uid());

-- Create meetings table
create table meetings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    title varchar(255) not null,
    description text,
    category_id uuid not null references meeting_categories(id),
    start_time timestamptz not null,
    end_time timestamptz not null,
    location_name varchar(255),
    coordinates point,
    ai_generated boolean not null default false,
    original_note text,
    ai_generated_notes text,
    created_at timestamptz not null default now(),
    deleted_at timestamptz,
    constraint valid_meeting_times check (end_time > start_time)
);

-- Create indexes for meetings
create index idx_meetings_user_id_start_time on meetings(user_id, start_time);
create index idx_meetings_category_id on meetings(category_id);
create index idx_meetings_deleted_at on meetings(deleted_at) where deleted_at is null;

-- Enable RLS on meetings
alter table meetings enable row level security;

-- Create meetings RLS policies
create policy meetings_select_own on meetings
    for select
    using (user_id = auth.uid());

create policy meetings_insert_own on meetings
    for insert
    with check (user_id = auth.uid());

create policy meetings_update_own on meetings
    for update
    using (user_id = auth.uid());

create policy meetings_delete_own on meetings
    for delete
    using (user_id = auth.uid());

-- Add helpful comments
comment on table meeting_preferences is 'User preferences for meeting scheduling and AI-based suggestions';
comment on table meetings is 'User meetings with support for AI-generated content and soft delete';
comment on column meetings.coordinates is 'PostGIS point type for meeting location coordinates';
comment on column meetings.ai_generated_notes is 'Markdown-formatted AI-generated meeting notes'; 