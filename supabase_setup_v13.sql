-- PawPal v13: Supabase Auth + secure family sharing
-- Supabase SQL Editorで1回実行してください。
create extension if not exists pgcrypto;

create table if not exists public.pawpal_families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_hash text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.pawpal_family_members (
  family_id uuid not null references public.pawpal_families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','member')),
  created_at timestamptz not null default now(),
  primary key (family_id,user_id)
);

create table if not exists public.pawpal_backups (
  family_id uuid primary key references public.pawpal_families(id) on delete cascade,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pawpal_families enable row level security;
alter table public.pawpal_family_members enable row level security;
alter table public.pawpal_backups enable row level security;

create or replace function public.is_pawpal_family_member(p_family uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.pawpal_family_members
    where family_id=p_family and user_id=auth.uid()
  );
$$;

drop policy if exists "families member select" on public.pawpal_families;
create policy "families member select"
on public.pawpal_families for select to authenticated
using (public.is_pawpal_family_member(id));

drop policy if exists "members member select" on public.pawpal_family_members;
create policy "members member select"
on public.pawpal_family_members for select to authenticated
using (public.is_pawpal_family_member(family_id));

drop policy if exists "backups member select" on public.pawpal_backups;
drop policy if exists "backups member insert" on public.pawpal_backups;
drop policy if exists "backups member update" on public.pawpal_backups;

create policy "backups member select"
on public.pawpal_backups for select to authenticated
using (public.is_pawpal_family_member(family_id));

create policy "backups member insert"
on public.pawpal_backups for insert to authenticated
with check (public.is_pawpal_family_member(family_id));

create policy "backups member update"
on public.pawpal_backups for update to authenticated
using (public.is_pawpal_family_member(family_id))
with check (public.is_pawpal_family_member(family_id));

create or replace function public.create_pawpal_family(p_name text,p_code text)
returns table(family_id uuid,family_name text)
language plpgsql security definer set search_path=public,auth as $$
declare
  v_id uuid;
  v_hash text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if length(trim(p_name))<1 then raise exception 'family name required'; end if;
  if length(p_code)<8 then raise exception 'code must be at least 8 characters'; end if;
  v_hash=encode(digest('pawpal:'||p_code,'sha256'),'hex');
  insert into public.pawpal_families(name,invite_hash,owner_id)
  values(trim(p_name),v_hash,auth.uid()) returning id into v_id;
  insert into public.pawpal_family_members(family_id,user_id,role)
  values(v_id,auth.uid(),'owner');
  return query select v_id,trim(p_name);
end;
$$;

create or replace function public.join_pawpal_family(p_code text)
returns table(family_id uuid,family_name text)
language plpgsql security definer set search_path=public,auth as $$
declare
  v_id uuid;
  v_name text;
  v_hash text;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  v_hash=encode(digest('pawpal:'||p_code,'sha256'),'hex');
  select id,name into v_id,v_name from public.pawpal_families where invite_hash=v_hash;
  if v_id is null then raise exception 'invalid share code'; end if;
  insert into public.pawpal_family_members(family_id,user_id,role)
  values(v_id,auth.uid(),'member')
  on conflict (family_id,user_id) do nothing;
  return query select v_id,v_name;
end;
$$;

revoke all on function public.create_pawpal_family(text,text) from public;
revoke all on function public.join_pawpal_family(text) from public;
grant execute on function public.create_pawpal_family(text,text) to authenticated;
grant execute on function public.join_pawpal_family(text) to authenticated;
