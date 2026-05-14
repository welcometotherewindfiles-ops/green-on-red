-- ============================================================
-- Green on Red — Supabase Database Schema
-- Run this in your Supabase SQL editor to set up the database.
-- ============================================================

-- ─── PROFILES ───────────────────────────────────────────────
-- Extends Supabase auth.users with role and display name.
-- A row is automatically created when a new user signs up
-- via the trigger below.

create type user_role as enum ('admin', 'member');

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  role        user_role not null default 'member',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', null),
    'member'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at on profiles
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();


-- ─── CATEGORIES ─────────────────────────────────────────────
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  icon        text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

-- Seed the six fixed categories
insert into public.categories (name, slug, description, icon, sort_order) values
  ('Strategies',      'strategies',      'Trading strategies, setups, and playbooks.',                             '📈', 1),
  ('Fundamentals',    'fundamentals',    'Core concepts, market education, and analysis frameworks.',             '📚', 2),
  ('Risk Management', 'risk-management', 'Position sizing, stop losses, and portfolio risk.',                     '🛡️', 3),
  ('Brokerages',      'brokerages',      'Broker reviews, platform guides, and comparisons.',                     '🏦', 4),
  ('Backtesting',     'backtesting',     'Historical testing, data sources, and methodology.',                    '🔬', 5),
  ('Automation',      'automation',      'Algorithmic trading, scripts, and workflow tools.',                     '⚙️', 6);


-- ─── MEETINGS ───────────────────────────────────────────────
create type meeting_format as enum ('in-person', 'online', 'hybrid');

create table public.meetings (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  meeting_date     timestamptz not null,
  format           meeting_format not null default 'online',
  location         text,
  zoom_link        text,
  notes            text,              -- admin summary / rich text
  presentation_url text,
  recording_url    text,              -- unlisted YouTube URL
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.handle_updated_at();

-- Index for chronological queries
create index meetings_date_idx on public.meetings (meeting_date desc);


-- ─── CONTENT ITEMS ──────────────────────────────────────────
create type content_type as enum ('post', 'link', 'file');

create table public.content_items (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  content_type  content_type not null,
  body          text,           -- rich text HTML for posts
  url           text,           -- external URL for links
  file_url      text,           -- Supabase storage URL for files
  file_name     text,           -- original filename for display
  description   text,           -- optional short summary
  published_at  timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger content_items_updated_at
  before update on public.content_items
  for each row execute procedure public.handle_updated_at();

-- Index for reverse-chronological listing
create index content_items_published_idx on public.content_items (published_at desc);


-- ─── JUNCTION: CONTENT ↔ CATEGORIES (many-to-many) ──────────
create table public.content_categories (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  category_id     uuid not null references public.categories(id) on delete cascade,
  primary key (content_item_id, category_id)
);

create index content_categories_category_idx on public.content_categories (category_id);


-- ─── JUNCTION: CONTENT ↔ MEETINGS (many-to-many) ────────────
create table public.content_meetings (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  meeting_id      uuid not null references public.meetings(id) on delete cascade,
  primary key (content_item_id, meeting_id)
);

create index content_meetings_meeting_idx on public.content_meetings (meeting_id);


-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
-- All tables are fully private. Authenticated users can read
-- everything. Only the admin can insert / update / delete.
-- The admin's user ID is identified by their role in profiles.

alter table public.profiles       enable row level security;
alter table public.categories     enable row level security;
alter table public.meetings       enable row level security;
alter table public.content_items  enable row level security;
alter table public.content_categories enable row level security;
alter table public.content_meetings   enable row level security;


-- Helper function: returns true if the caller is the admin
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;


-- profiles: users can read their own row; admin reads all
create policy "profiles: authenticated read own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles: admin full access"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- categories: all authenticated users can read
create policy "categories: authenticated read"
  on public.categories for select
  to authenticated using (true);

create policy "categories: admin write"
  on public.categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- meetings: all authenticated users can read
create policy "meetings: authenticated read"
  on public.meetings for select
  to authenticated using (true);

create policy "meetings: admin write"
  on public.meetings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- content_items: all authenticated users can read
create policy "content_items: authenticated read"
  on public.content_items for select
  to authenticated using (true);

create policy "content_items: admin write"
  on public.content_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- content_categories: all authenticated users can read
create policy "content_categories: authenticated read"
  on public.content_categories for select
  to authenticated using (true);

create policy "content_categories: admin write"
  on public.content_categories for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- content_meetings: all authenticated users can read
create policy "content_meetings: authenticated read"
  on public.content_meetings for select
  to authenticated using (true);

create policy "content_meetings: admin write"
  on public.content_meetings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ─── STORAGE BUCKETS ────────────────────────────────────────
-- Run these separately in the Supabase dashboard > Storage,
-- OR uncomment and run via SQL if your project supports it.

-- insert into storage.buckets (id, name, public) values
--   ('content-files', 'content-files', false),
--   ('presentations', 'presentations', false);

-- Storage RLS (add in Supabase dashboard > Storage > Policies):
-- Allow authenticated users to SELECT (download)
-- Allow admin only to INSERT / UPDATE / DELETE

