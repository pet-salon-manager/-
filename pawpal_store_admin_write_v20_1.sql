alter table public.pawpal_stores enable row level security;

drop policy if exists "pawpal_stores_authenticated_write" on public.pawpal_stores;

create policy "pawpal_stores_authenticated_write"
on public.pawpal_stores
for all
to authenticated
using (true)
with check (true);

grant insert, update, delete, select
on table public.pawpal_stores
to authenticated;
