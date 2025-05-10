-- Enable required extensions
create extension if not exists "postgis";
create extension if not exists "pgcrypto";

-- Create custom enums
create type meeting_distribution as enum ('rozłożone', 'skondensowane');
create type time_of_day as enum ('rano', 'dzień', 'wieczór');
create type stats_period_type as enum ('month', 'year');

-- Create updated_at timestamp function
create or replace function set_updated_at_timestamp()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

comment on function set_updated_at_timestamp() is 'Automatically sets the updated_at timestamp when a row is updated'; 