-- Create proposal stats table
create table proposal_stats (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users on delete cascade,
    period_type stats_period_type not null,
    period_start_date date not null,
    total_generations integer not null default 0,
    accepted_proposals integer not null default 0,
    last_updated timestamptz not null default now(),
    constraint unique_user_period unique (user_id, period_type, period_start_date),
    constraint valid_stats check (accepted_proposals <= total_generations)
);

-- Create index for proposal stats
create index idx_proposal_stats_user_id on proposal_stats(user_id);

-- Enable RLS on proposal_stats
alter table proposal_stats enable row level security;

-- Create proposal_stats RLS policies
create policy proposal_stats_select_own on proposal_stats
    for select
    using (user_id = auth.uid());

-- Create stats update function
create or replace function update_proposal_stats()
returns trigger as $$
declare
    current_month date := date_trunc('month', now())::date;
    current_year date := date_trunc('year', now())::date;
    month_stats_id uuid;
    year_stats_id uuid;
begin
    -- Update monthly stats
    select id into month_stats_id from proposal_stats 
    where user_id = new.user_id 
      and period_type = 'month' 
      and period_start_date = current_month;
      
    if not found then
        insert into proposal_stats 
            (user_id, period_type, period_start_date, total_generations, accepted_proposals)
        values 
            (new.user_id, 'month', current_month, 0, 0)
        returning id into month_stats_id;
    end if;
    
    -- Update yearly stats
    select id into year_stats_id from proposal_stats 
    where user_id = new.user_id 
      and period_type = 'year' 
      and period_start_date = current_year;
      
    if not found then
        insert into proposal_stats 
            (user_id, period_type, period_start_date, total_generations, accepted_proposals)
        values 
            (new.user_id, 'year', current_year, 0, 0)
        returning id into year_stats_id;
    end if;
    
    -- Update counters
    if tg_op = 'insert' and new.ai_generated = true then
        -- Increment acceptance counter for AI-generated meetings
        update proposal_stats set 
            accepted_proposals = accepted_proposals + 1,
            last_updated = now()
        where id in (month_stats_id, year_stats_id);
        
        -- Increment generation counter
        update proposal_stats set 
            total_generations = total_generations + 1,
            last_updated = now()
        where id in (month_stats_id, year_stats_id);
    end if;
    
    return new;
end;
$$ language plpgsql;

-- Create trigger for stats updates
create trigger update_stats_after_meeting_insert
    after insert on meetings
    for each row
    execute function update_proposal_stats();

-- Create acceptance rate calculation function
create or replace function calculate_overall_acceptance_rate(period_type_param stats_period_type)
returns decimal as $$
declare
    total_gens integer;
    total_accepts integer;
    acceptance_rate decimal;
begin
    select 
        coalesce(sum(total_generations), 0),
        coalesce(sum(accepted_proposals), 0)
    into 
        total_gens, total_accepts
    from 
        proposal_stats
    where 
        period_type = period_type_param;
        
    if total_gens = 0 then
        return 0;
    else
        return round((total_accepts::decimal / total_gens::decimal) * 100, 2);
    end if;
end;
$$ language plpgsql;

-- Create data cleanup function
create or replace function cleanup_old_data()
returns void as $$
begin
    -- Soft delete meetings older than a year
    update meetings 
    set deleted_at = now() 
    where 
        deleted_at is null and 
        end_time < (now() - interval '1 year');
        
    -- Delete used password reset tokens
    delete from password_reset_tokens 
    where 
        used = true or 
        created_at < (now() - interval '24 hours');
end;
$$ language plpgsql;

-- Create upcoming meetings view
create view upcoming_meetings as
select 
    m.id,
    m.user_id,
    m.title,
    m.description,
    c.name as category_name,
    c.suggested_attire,
    m.start_time,
    m.end_time,
    m.location_name,
    m.coordinates,
    m.ai_generated,
    m.ai_generated_notes
from 
    meetings m
join 
    meeting_categories c on m.category_id = c.id
where 
    m.deleted_at is null
    and m.start_time > now()
order by 
    m.start_time asc;

-- Add helpful comments
comment on table proposal_stats is 'Statistics for AI-generated meeting proposals';
comment on function update_proposal_stats() is 'Updates statistics when new AI-generated meetings are created';
comment on function calculate_overall_acceptance_rate(stats_period_type) is 'Calculates the acceptance rate of AI-generated meeting proposals for a given period type';
comment on function cleanup_old_data() is 'Performs routine cleanup of old meetings and expired tokens';
comment on view upcoming_meetings is 'View of all upcoming meetings with their categories and details'; 