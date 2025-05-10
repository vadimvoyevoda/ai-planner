-- Create profiles table linked to auth.users
create table profiles (
    id uuid primary key references auth.users on delete cascade,
    first_name varchar(100) not null,
    last_name varchar(100) not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Create profiles RLS policies
create policy profiles_select_own on profiles
    for select
    using (id = auth.uid());

create policy profiles_update_own on profiles
    for update
    using (id = auth.uid());

create policy profiles_insert_own on profiles
    for insert
    with check (id = auth.uid());

-- Create updated_at trigger for profiles
create trigger set_profiles_updated_at
    before update on profiles
    for each row
    execute function set_updated_at_timestamp();

-- Create password reset tokens table
create table password_reset_tokens (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    token_hash varchar(255) not null,
    created_at timestamptz not null default now(),
    used boolean not null default false,
    constraint valid_token check (
        (extract(epoch from (now() - created_at)) / 60) <= 30 or used = true
    )
);

-- Create indexes for password_reset_tokens
create index idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
create index idx_password_reset_tokens_token_hash on password_reset_tokens(token_hash);

-- Create meeting categories table
create table meeting_categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    suggested_attire varchar(255) default null
);

-- Insert initial meeting categories
insert into meeting_categories (name, suggested_attire) values
    ('Biznesowe', 'Strój formalny - garnitur/kostium biznesowy'),
    ('Prywatne', 'Strój casualowy'),
    ('Edukacyjne', 'Strój smart casual'),
    ('Medyczne', 'Wygodny, luźny strój'),
    ('Urzędowe', 'Strój formalny');

-- Add helpful comments
comment on table profiles is 'User profiles managed by Supabase Auth';
comment on table password_reset_tokens is 'Tokens for password reset functionality with 30-minute expiration';
comment on table meeting_categories is 'Predefined categories for meetings with suggested attire';

-- migrate:down
drop table if exists password_reset_tokens;
drop table if exists users cascade;
drop table if exists meeting_categories cascade; 