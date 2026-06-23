-- Trip sharing — public share token for the trips table.
-- Idempotent and additive, so it's safe to run on every `supabase db reset`.
-- (Assumes the trips table already exists from your schema/migrations.)
alter table trips add column if not exists share_id text unique;
create index if not exists idx_trips_share_id on trips (share_id);
