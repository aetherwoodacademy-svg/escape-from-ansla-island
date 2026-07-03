-- ============================================================
-- Patch 02: Giant Hide & Seek (safe to run repeatedly)
-- ============================================================

alter table hide_seek add column if not exists sought_member_id uuid references crew_members(id);
alter table hide_seek add column if not exists mode text not null default 'close';
alter table hide_seek add column if not exists started_by text;

create table if not exists hs_positions (
  member_id uuid primary key references crew_members(id) on delete cascade,
  lat double precision,
  lng double precision,
  accuracy double precision,
  updated_at timestamptz not null default now()
);
alter table hs_positions enable row level security;
drop policy if exists crew_all on hs_positions;
create policy crew_all on hs_positions for all using (is_crew()) with check (is_crew());

do $$ begin
  alter publication supabase_realtime add table hs_positions;
exception when duplicate_object then null; end $$;
