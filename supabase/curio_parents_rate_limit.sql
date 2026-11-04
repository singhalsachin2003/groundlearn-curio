-- Stop anyone holding the app's public key from flooding the table.
create or replace function public.curio_parents_rate_limit() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.curio_parents where created_at > now() - interval '1 minute') >= 20
     or (select count(*) from public.curio_parents where created_at > now() - interval '1 day') >= 2000 then
    raise exception 'Too many sign-ups right now, please try again later' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function public.curio_parents_rate_limit() from public, anon, authenticated;
drop trigger if exists curio_parents_rate_limit on public.curio_parents;
create trigger curio_parents_rate_limit before insert on public.curio_parents
  for each row execute function public.curio_parents_rate_limit();
create index if not exists curio_parents_created_at on public.curio_parents (created_at);
