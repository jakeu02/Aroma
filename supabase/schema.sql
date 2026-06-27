-- ============================================================================
-- Aroma Cafe — Supabase schema
-- Run this in the Supabase dashboard: SQL Editor → New query → paste → Run.
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES  (one row per auth user; drives admin access)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text not null default 'customer' check (role in ('customer', 'admin', 'employee')),
  created_at timestamptz not null default now()
);

-- Widen the role check for databases created before 'employee' existed.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('customer', 'admin', 'employee'));

-- Auto-create a profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper: is the current user an admin? (security definer avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: staff = admin OR employee (counter/POS access).
create or replace function public.is_staff()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'employee')
  );
$$;

-- ---------------------------------------------------------------------------
-- PRODUCTS
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id           text primary key,
  name         text not null,
  price        numeric(10,2) not null default 0,
  category     text not null check (category in ('hot', 'frappe', 'pastry')),
  description  text,
  image_key    text,                       -- maps to a bundled asset in the app
  color        text,                       -- tailwind gradient classes for the badge
  rank         integer default 0,
  sizes        jsonb,                      -- e.g. {"Small":0,"Medium":30,"Large":50}
  is_available boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- ORDERS + ORDER ITEMS
-- ---------------------------------------------------------------------------

-- Short, human-friendly order code shown on the receipt (no ambiguous chars).
create or replace function public.gen_order_code()
returns text
language plpgsql
volatile
as $$
declare
  chars  text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i      int;
begin
  for i in 1..6 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  order_code    text not null default public.gen_order_code(),
  user_id       uuid references auth.users (id) on delete set null,
  customer_name text not null,
  phone         text not null,
  email         text,
  order_type    text not null default 'pickup'
                check (order_type in ('pickup', 'delivery', 'dine-in', 'takeout')),
  table_label   text,
  subtotal      numeric(10,2) not null default 0,
  tax           numeric(10,2) not null default 0,
  total         numeric(10,2) not null default 0,
  status        text not null default 'pending'
                check (status in ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  is_priority   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- Backfill columns for anyone who created the table before these changes.
alter table public.orders
  add column if not exists order_code text not null default public.gen_order_code();
alter table public.orders
  add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.orders
  add column if not exists is_priority boolean not null default false;
alter table public.orders
  add column if not exists table_label text;

-- Widen order_type for POS dine-in / takeout on older databases.
alter table public.orders drop constraint if exists orders_order_type_check;
alter table public.orders
  add constraint orders_order_type_check check (order_type in ('pickup', 'delivery', 'dine-in', 'takeout'));

create unique index if not exists orders_order_code_idx on public.orders (order_code);
create index if not exists orders_user_id_idx on public.orders (user_id);

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   text,
  product_name text not null,
  size         text,
  quantity     integer not null default 1,
  unit_price   numeric(10,2) not null default 0,
  notes        text
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- ---------------------------------------------------------------------------
-- FEEDBACK  (rating left AFTER an order is completed)
-- ---------------------------------------------------------------------------
create table if not exists public.feedback (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid references public.orders (id) on delete cascade,
  user_id         uuid references auth.users (id) on delete set null,
  rating          integer not null check (rating between 1 and 5),  -- overall
  product_rating  integer check (product_rating between 1 and 5),
  service_rating  integer check (service_rating between 1 and 5),
  delivery_rating integer check (delivery_rating between 1 and 5),
  comment         text,
  customer_name   text,
  created_at      timestamptz not null default now()
);

-- Backfill columns for anyone who created the table before these changes.
alter table public.feedback
  add column if not exists order_id uuid references public.orders (id) on delete cascade;
alter table public.feedback
  add column if not exists user_id uuid references auth.users (id) on delete set null;
alter table public.feedback
  add column if not exists product_rating integer;
alter table public.feedback
  add column if not exists service_rating integer;
alter table public.feedback
  add column if not exists delivery_rating integer;

-- One rating per order.
create unique index if not exists feedback_order_id_idx on public.feedback (order_id);

-- ---------------------------------------------------------------------------
-- CONTACT MESSAGES
-- ---------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text,
  message    text not null,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- CAFE TABLES  (dine-in floor plan / reservations — managed by admin)
-- x/y are percentages (0–100) of the floor canvas, so layout is screen-agnostic.
-- ---------------------------------------------------------------------------
create table if not exists public.cafe_tables (
  id            uuid primary key default gen_random_uuid(),
  label         text not null default 'T1',
  kind          text not null default 'table' check (kind in ('table', 'chair', 'counter', 'plant', 'door')),
  shape         text not null default 'round' check (shape in ('round', 'square', 'rect')),
  x             numeric not null default 45,
  y             numeric not null default 45,
  seats         integer not null default 2,
  status        text not null default 'vacant' check (status in ('vacant', 'reserved', 'occupied')),
  reserved_name text,
  reserved_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Anonymous customers can browse products and submit orders/feedback/messages.
-- Only admins can read orders/messages/feedback and manage products.
-- ============================================================================
alter table public.profiles         enable row level security;
alter table public.products         enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.feedback         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.cafe_tables      enable row level security;

-- profiles: own read; admins read all + manage roles --------------------
drop policy if exists "own profile read"     on public.profiles;
drop policy if exists "admin profile read"   on public.profiles;
drop policy if exists "admin profile insert" on public.profiles;
drop policy if exists "admin profile update" on public.profiles;
create policy "own profile read"     on public.profiles for select using (auth.uid() = id);
create policy "admin profile read"   on public.profiles for select using (public.is_admin());
create policy "admin profile insert" on public.profiles for insert with check (public.is_admin());
create policy "admin profile update" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- products: world-readable, admin-writable ------------------------------
drop policy if exists "products public read" on public.products;
drop policy if exists "products admin write" on public.products;
create policy "products public read" on public.products for select using (true);
create policy "products admin write" on public.products for all
  using (public.is_admin()) with check (public.is_admin());

-- orders: anyone can create; customers read their own; staff read/update all
drop policy if exists "orders public insert" on public.orders;
drop policy if exists "orders admin read"    on public.orders;
drop policy if exists "orders staff read"    on public.orders;
drop policy if exists "orders own read"      on public.orders;
drop policy if exists "orders admin update"  on public.orders;
drop policy if exists "orders staff update"  on public.orders;
create policy "orders public insert" on public.orders for insert
  with check (user_id is null or user_id = auth.uid());
create policy "orders own read"      on public.orders for select using (auth.uid() = user_id);
create policy "orders staff read"    on public.orders for select using (public.is_staff());
create policy "orders staff update"  on public.orders for update using (public.is_staff());

-- order_items: anyone can insert; customers read their own; staff read all -
drop policy if exists "order_items public insert" on public.order_items;
drop policy if exists "order_items admin read"    on public.order_items;
drop policy if exists "order_items staff read"    on public.order_items;
drop policy if exists "order_items own read"      on public.order_items;
create policy "order_items public insert" on public.order_items for insert with check (true);
create policy "order_items own read" on public.order_items for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.user_id = auth.uid()
  )
);
create policy "order_items staff read" on public.order_items for select using (public.is_staff());

-- feedback: customers rate their own order; owner + admin can read -------
drop policy if exists "feedback public insert" on public.feedback;
drop policy if exists "feedback insert"        on public.feedback;
drop policy if exists "feedback own read"      on public.feedback;
drop policy if exists "feedback admin read"    on public.feedback;
create policy "feedback insert"   on public.feedback for insert
  with check (user_id is null or user_id = auth.uid());
create policy "feedback own read" on public.feedback for select using (auth.uid() = user_id);
create policy "feedback admin read" on public.feedback for select using (public.is_admin());

-- contact_messages: anyone can insert, only admin can read/update -------
drop policy if exists "messages public insert" on public.contact_messages;
drop policy if exists "messages admin read"    on public.contact_messages;
drop policy if exists "messages admin update"  on public.contact_messages;
create policy "messages public insert" on public.contact_messages for insert with check (true);
create policy "messages admin read"    on public.contact_messages for select using (public.is_admin());
create policy "messages admin update"  on public.contact_messages for update using (public.is_admin());

-- cafe_tables: admins build the layout; employees view + set table status
drop policy if exists "tables admin all"    on public.cafe_tables;
drop policy if exists "tables staff read"   on public.cafe_tables;
drop policy if exists "tables staff update" on public.cafe_tables;
create policy "tables admin all"    on public.cafe_tables for all
  using (public.is_admin()) with check (public.is_admin());
create policy "tables staff read"   on public.cafe_tables for select using (public.is_staff());
create policy "tables staff update" on public.cafe_tables for update using (public.is_staff());

-- ============================================================================
-- PUBLIC ORDER TRACKING
-- Customers look up their own order with the order code printed on the receipt
-- PLUS the phone number they ordered with. SECURITY DEFINER lets this one
-- function read a single matching order without exposing the orders table via
-- RLS, and the code+phone pair prevents guessing/enumeration.
-- ============================================================================
create or replace function public.track_order(p_code text, p_phone text)
returns jsonb
language plpgsql
security definer set search_path = public
stable
as $$
declare
  v_order public.orders;
  v_items jsonb;
begin
  select * into v_order
  from public.orders
  where upper(order_code) = upper(trim(p_code))
    and phone = trim(p_phone);

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'product_name', oi.product_name,
           'size',         oi.size,
           'quantity',     oi.quantity,
           'unit_price',   oi.unit_price,
           'notes',        oi.notes
         )), '[]'::jsonb)
  into v_items
  from public.order_items oi
  where oi.order_id = v_order.id;

  return jsonb_build_object(
    'order_code',    v_order.order_code,
    'customer_name', v_order.customer_name,
    'order_type',    v_order.order_type,
    'status',        v_order.status,
    'total',         v_order.total,
    'created_at',    v_order.created_at,
    'items',         v_items
  );
end;
$$;

grant execute on function public.track_order(text, text) to anon, authenticated;

-- ============================================================================
-- REALTIME — let customers see live order-status changes without refreshing.
-- RLS still applies, so each client only receives updates for orders it can
-- read (its own). Safe to re-run; ignores "already in publication" errors.
-- ============================================================================
do $$
begin
  alter publication supabase_realtime add table public.orders;
exception
  when duplicate_object then null;
  when undefined_object then null;  -- publication missing on self-hosted setups
end $$;

do $$
begin
  alter publication supabase_realtime add table public.cafe_tables;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

-- ============================================================================
-- MAKE SOMEONE AN ADMIN  (whitelist — admins are provisioned manually)
-- 1. Create the account in the dashboard: Authentication → Users → Add user
--    (set a password; tick "Auto Confirm User"). Self-signup is disabled in
--    the app, so this is the only way in.
-- 2. Grant the role, replacing the email:
--      update public.profiles set role = 'admin' where email = 'you@example.com';
-- ============================================================================
