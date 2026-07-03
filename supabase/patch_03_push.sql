-- ============================================================
-- Patch 03: The Call — push subscriptions (safe to run repeatedly)
-- ============================================================

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references crew_members(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);
alter table push_subscriptions enable row level security;
drop policy if exists crew_all on push_subscriptions;
create policy crew_all on push_subscriptions for all using (is_crew()) with check (is_crew());
