-- =============================================================================
-- Auzia — Supabase Schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query)
-- =============================================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- =============================================================================
-- PROFILES  (extends auth.users 1-to-1)
-- =============================================================================
create table public.profiles (
  id                         uuid primary key references auth.users(id) on delete cascade,
  nickname                   text not null default '',
  first_name                 text not null default '',
  last_name                  text not null default '',
  email                      text not null default '',
  avatar_url                 text,
  avatar_initials            text not null default '',
  avatar_color               text not null default '#2E7D32',
  country_of_origin          text not null default '',
  country_of_origin_flag     text not null default '',
  country_of_residence       text not null default '',
  country_of_residence_flag  text not null default '',
  city_of_residence          text not null default '',
  work_field                 text not null default '',
  status                     text,
  phone_number               text,
  linkedin                   text,
  instagram                  text,
  about_me                   text,
  latitude                   double precision not null default 0,
  longitude                  double precision not null default 0,
  is_looking_for_opportunities boolean not null default false,
  has_completed_onboarding   boolean not null default false,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now()
);

-- Auto-create a profile row the moment someone signs up (email or Google)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, avatar_initials)
  values (
    new.id,
    coalesce(new.email, ''),
    upper(left(coalesce(new.email, 'AU'), 2))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- =============================================================================
-- CONNECTIONS  (friend / diaspora connections)
-- =============================================================================
create table public.connections (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  note        text,
  status      text not null default 'pending'
                check (status in ('pending', 'accepted', 'rejected')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint no_self_connection check (sender_id <> receiver_id),
  unique(sender_id, receiver_id)
);

create trigger connections_updated_at
  before update on public.connections
  for each row execute procedure public.set_updated_at();

-- Helper: count accepted connections per user (used for profile stats)
create or replace function public.connection_count(user_id uuid)
returns bigint language sql stable as $$
  select count(*) from public.connections
  where (sender_id = user_id or receiver_id = user_id)
    and status = 'accepted';
$$;

-- =============================================================================
-- MESSAGES
-- =============================================================================
create table public.messages (
  id          uuid primary key default uuid_generate_v4(),
  sender_id   uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint no_self_message check (sender_id <> receiver_id)
);

-- Index for conversation fetching (both orderings)
create index messages_pair_idx
  on public.messages (least(sender_id, receiver_id), greatest(sender_id, receiver_id), created_at desc);

-- Conversation view — last message per unique pair
create or replace view public.conversations_view as
select distinct on (
    least(sender_id, receiver_id),
    greatest(sender_id, receiver_id)
  )
  m.id,
  least(m.sender_id, m.receiver_id)    as user_a,
  greatest(m.sender_id, m.receiver_id) as user_b,
  m.sender_id,
  m.receiver_id,
  m.content,
  m.read,
  m.created_at
from public.messages m
order by
  least(m.sender_id, m.receiver_id),
  greatest(m.sender_id, m.receiver_id),
  m.created_at desc;

-- Unread count helper
create or replace function public.unread_count(viewer_id uuid, other_id uuid)
returns bigint language sql stable as $$
  select count(*) from public.messages
  where receiver_id = viewer_id
    and sender_id   = other_id
    and read = false;
$$;

-- =============================================================================
-- PRODUCTS  (stores, brands, restaurants)
-- =============================================================================
create table public.products (
  id           uuid primary key default uuid_generate_v4(),
  kind         text not null check (kind in ('store', 'brand')),
  title        text not null,
  description  text not null default '',
  category     text not null default 'Autre'
                 check (category in ('Épicerie', 'Restaurant', 'Service', 'Boutique', 'Autre')),
  emoji        text,
  tags         text[] not null default '{}',
  image_url    text,
  address      text,
  city         text not null default '',
  country      text not null default '',
  country_flag text not null default '',
  cities       text[] not null default '{}',  -- for brands: cities they're available in
  latitude     double precision not null default 0,
  longitude    double precision not null default 0,
  contact_phone text,
  contact_email text,
  website      text,
  maps_link    text,
  rating       double precision,              -- recomputed by trigger
  review_count integer not null default 0,    -- recomputed by trigger
  added_by     uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger products_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- Algerian products stocked by a store (prod_items)
create table public.product_items (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name       text not null,
  emoji      text not null default '🛍️',
  description text,
  sort_order integer not null default 0
);

-- Algerian dishes served by a restaurant
create table public.product_dishes (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name       text not null,
  emoji      text not null default '🍽️',
  description text,
  sort_order integer not null default 0
);

-- Which stores stock a brand (brand ↔ store M2M)
create table public.brand_store_links (
  brand_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.products(id) on delete cascade,
  primary key (brand_id, store_id)
);

-- =============================================================================
-- PRODUCT RATINGS
-- =============================================================================
create table public.product_ratings (
  id         uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rating     integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique(product_id, user_id)
);

-- Recompute avg rating + count after any change
create or replace function public.refresh_product_rating()
returns trigger language plpgsql as $$
declare
  target_id uuid;
begin
  target_id := coalesce(new.product_id, old.product_id);
  update public.products set
    rating       = (select round(avg(rating)::numeric, 1) from public.product_ratings where product_id = target_id),
    review_count = (select count(*)                       from public.product_ratings where product_id = target_id)
  where id = target_id;
  return coalesce(new, old);
end;
$$;

create trigger on_rating_change
  after insert or update or delete on public.product_ratings
  for each row execute procedure public.refresh_product_rating();

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================
create table public.notifications (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  type           text not null
                   check (type in ('connection_request', 'connection_accepted', 'message', 'announcement')),
  content        text not null,
  read           boolean not null default false,
  action_user_id uuid references public.profiles(id) on delete set null,
  action_id      uuid,    -- the connection.id or message.id that triggered this
  created_at     timestamptz not null default now()
);

-- Auto-notify receiver on new connection request
-- Auto-notify sender when their request is accepted
create or replace function public.notify_on_connection()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  actor_nick text;
begin
  if TG_OP = 'INSERT' and new.status = 'pending' then
    select nickname into actor_nick from public.profiles where id = new.sender_id;
    insert into public.notifications (user_id, type, content, action_user_id, action_id)
    values (new.receiver_id, 'connection_request', actor_nick || ' vous a envoyé une demande de connexion', new.sender_id, new.id);

  elsif TG_OP = 'UPDATE' and old.status = 'pending' and new.status = 'accepted' then
    select nickname into actor_nick from public.profiles where id = new.receiver_id;
    insert into public.notifications (user_id, type, content, action_user_id, action_id)
    values (new.sender_id, 'connection_accepted', actor_nick || ' a accepté votre demande de connexion', new.receiver_id, new.id);
  end if;

  return new;
end;
$$;

create trigger on_connection_change
  after insert or update of status on public.connections
  for each row execute procedure public.notify_on_connection();

-- Auto-notify receiver when a new message arrives
create or replace function public.notify_on_message()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  sender_nick text;
begin
  select nickname into sender_nick from public.profiles where id = new.sender_id;
  insert into public.notifications (user_id, type, content, action_user_id, action_id)
  values (new.receiver_id, 'message', sender_nick || ' vous a envoyé un message', new.sender_id, new.id);
  return new;
end;
$$;

create trigger on_new_message
  after insert on public.messages
  for each row execute procedure public.notify_on_message();

-- =============================================================================
-- STORAGE BUCKETS  (run separately in Storage → New bucket, or here)
-- =============================================================================
-- Avatars: public read, owner write
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict do nothing;

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict do nothing;

-- Storage policies
create policy "avatar_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatar_owner_upload" on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "avatar_owner_update" on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "product_image_public_read" on storage.objects for select using (bucket_id = 'product-images');
create policy "product_image_owner_upload" on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid() is not null);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles        enable row level security;
alter table public.connections     enable row level security;
alter table public.messages        enable row level security;
alter table public.products        enable row level security;
alter table public.product_items   enable row level security;
alter table public.product_dishes  enable row level security;
alter table public.brand_store_links enable row level security;
alter table public.product_ratings enable row level security;
alter table public.notifications   enable row level security;

-- PROFILES
create policy "profiles: anyone can read"        on public.profiles for select using (true);
create policy "profiles: only self can insert"   on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: only self can update"   on public.profiles for update using (auth.uid() = id);

-- CONNECTIONS
create policy "connections: participants can read" on public.connections for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "connections: sender can create"     on public.connections for insert
  with check (auth.uid() = sender_id);
create policy "connections: receiver can respond"  on public.connections for update
  using (auth.uid() = receiver_id);  -- accept / reject

-- MESSAGES
create policy "messages: participants can read"  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "messages: sender can insert"      on public.messages for insert
  with check (auth.uid() = sender_id);
create policy "messages: receiver can mark read" on public.messages for update
  using (auth.uid() = receiver_id);

-- PRODUCTS  (public read, authenticated users can submit)
create policy "products: public read"       on public.products for select using (true);
create policy "products: auth users insert" on public.products for insert with check (auth.uid() = added_by);
create policy "products: owner update"      on public.products for update using (auth.uid() = added_by);
create policy "products: owner delete"      on public.products for delete using (auth.uid() = added_by);

-- PRODUCT ITEMS / DISHES / LINKS — public read, product owner writes
create policy "product_items: public read" on public.product_items for select using (true);
create policy "product_items: owner write" on public.product_items for all
  using (auth.uid() = (select added_by from public.products where id = product_id));

create policy "product_dishes: public read" on public.product_dishes for select using (true);
create policy "product_dishes: owner write" on public.product_dishes for all
  using (auth.uid() = (select added_by from public.products where id = product_id));

create policy "brand_store_links: public read" on public.brand_store_links for select using (true);
create policy "brand_store_links: owner write" on public.brand_store_links for all
  using (auth.uid() = (select added_by from public.products where id = brand_id));

-- RATINGS — public read, own row write
create policy "ratings: public read"   on public.product_ratings for select using (true);
create policy "ratings: own insert"    on public.product_ratings for insert with check (auth.uid() = user_id);
create policy "ratings: own update"    on public.product_ratings for update using (auth.uid() = user_id);

-- NOTIFICATIONS — only recipient
create policy "notifications: own read"   on public.notifications for select using (auth.uid() = user_id);
create policy "notifications: own update" on public.notifications for update using (auth.uid() = user_id);

-- =============================================================================
-- REALTIME  (enable per-table broadcast)
-- =============================================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.connections;
alter publication supabase_realtime add table public.notifications;
