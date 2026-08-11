-- PawPal v12 Supabase setup
-- Supabase SQL Editor で1回だけ実行してください。

create table if not exists public.pawpal_backups (
  family_id text primary key,
  family_name text not null default '',
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.pawpal_backups enable row level security;

-- 共有コードをハッシュ化した family_id を使う簡易共有方式です。
-- v12はまず動作確認用の構成です。正式運用ではSupabase Authを追加し、
-- family_idごとに認証ユーザーを制限するRLSへ強化してください。

drop policy if exists "pawpal anon select" on public.pawpal_backups;
drop policy if exists "pawpal anon insert" on public.pawpal_backups;
drop policy if exists "pawpal anon update" on public.pawpal_backups;

create policy "pawpal anon select"
on public.pawpal_backups for select
to anon
using (true);

create policy "pawpal anon insert"
on public.pawpal_backups for insert
to anon
with check (true);

create policy "pawpal anon update"
on public.pawpal_backups for update
to anon
using (true)
with check (true);
