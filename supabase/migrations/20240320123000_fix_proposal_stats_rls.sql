-- Add missing RLS policy for proposal_stats table
create policy proposal_stats_insert_own on proposal_stats
    for insert
    with check (user_id = auth.uid());

create policy proposal_stats_update_own on proposal_stats
    for update
    using (user_id = auth.uid());

-- Add helpful comments
comment on policy proposal_stats_insert_own on proposal_stats is 'Allow users to insert their own statistics';
comment on policy proposal_stats_update_own on proposal_stats is 'Allow users to update their own statistics'; 