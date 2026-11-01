-- Parent emails collected (optionally) at the Curio Island Ad-free purchase.
-- Run once in the Supabase SQL editor of the project that should hold them.
create table if not exists public.curio_parents (
  id uuid primary key default gen_random_uuid(),
  email text not null check (length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source text not null default 'ad_free',
  lang text,
  created_at timestamptz not null default now()
);
create unique index if not exists curio_parents_email_key on public.curio_parents (lower(email));
alter table public.curio_parents enable row level security;
-- The app may add an email but never read, change or delete any.
create policy "curio app can add a parent email" on public.curio_parents for insert to anon with check (true);
