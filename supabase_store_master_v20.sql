-- PawPal v20.0 店舗マスタ
create extension if not exists pgcrypto;
create table if not exists public.pawpal_stores (
 id uuid primary key default gen_random_uuid(),
 external_id text not null unique,
 name text not null,
 primary_type text not null default 'ペットショップ',
 prefecture text default '', address text default '', website text default '',
 phone text default '', business_hours text default '',
 latitude double precision, longitude double precision,
 is_recommended boolean not null default false,
 coupon_text text default '', reservation_url text default '',
 source_name text default 'PawPal運営',
 is_published boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.pawpal_stores enable row level security;
drop policy if exists "Public read published stores" on public.pawpal_stores;
create policy "Public read published stores" on public.pawpal_stores
for select to anon, authenticated using (is_published=true);
create or replace function public.pawpal_touch_store_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at=now(); return new; end; $$;
drop trigger if exists pawpal_stores_touch_updated_at on public.pawpal_stores;
create trigger pawpal_stores_touch_updated_at before update on public.pawpal_stores
for each row execute function public.pawpal_touch_store_updated_at();
