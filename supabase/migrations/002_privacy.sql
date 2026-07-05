-- =============================================================================
-- Migration 002 — Privacy preferences, blocks, reports
-- Run in Supabase SQL Editor
-- =============================================================================

alter table public.profiles
  add column if not exists show_on_map        boolean not null default true,
  add column if not exists allow_chat         boolean not null default true,
  add column if not exists name_display_mode  text    not null default 'nickname'
    check (name_display_mode in ('nickname', 'fullname'));

-- =============================================================================
-- BLOCKS
-- =============================================================================
create table if not exists public.user_blocks (
  blocker_id  uuid not null references public.profiles(id) on delete cascade,
  blocked_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

alter table public.user_blocks enable row level security;
create policy "blocks: own read"   on public.user_blocks for select using (auth.uid() = blocker_id);
create policy "blocks: own insert" on public.user_blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks: own delete" on public.user_blocks for delete using (auth.uid() = blocker_id);

-- =============================================================================
-- REPORTS
-- =============================================================================
create table if not exists public.user_reports (
  id          uuid primary key default uuid_generate_v4(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_id uuid not null references public.profiles(id) on delete cascade,
  reason      text not null,
  details     text,
  created_at  timestamptz not null default now(),
  constraint no_self_report check (reporter_id <> reported_id)
);

alter table public.user_reports enable row level security;
create policy "reports: own insert" on public.user_reports for insert with check (auth.uid() = reporter_id);
