-- Partner sign-in and organization-scoped read access. Additive; does not provision users.
-- Keep legacy core tables usable when an earlier 0000 migration created them without
-- organization links. Existing rows remain unassigned until an administrator maps them.
alter table public.ambulances
  add column if not exists hospital_application_id uuid
  references public.hospital_applications(id) on delete cascade;
alter table public.drivers
  add column if not exists hospital_application_id uuid
  references public.hospital_applications(id) on delete cascade;
create index if not exists ambulances_hospital_application_id_idx
  on public.ambulances (hospital_application_id);
create index if not exists drivers_hospital_application_id_idx
  on public.drivers (hospital_application_id);

create table if not exists public.partner_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null check (role in ('hospital', 'provider')),
  hospital_application_id uuid references public.hospital_applications(id) on delete cascade,
  display_name text not null,
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint partner_account_organization_matches_role check (
    (role = 'hospital' and hospital_application_id is not null)
    or (role = 'provider' and hospital_application_id is null)
  )
);
create unique index if not exists partner_accounts_hospital_unique
  on public.partner_accounts (hospital_application_id)
  where hospital_application_id is not null;
create index if not exists partner_accounts_role_idx on public.partner_accounts (role, is_active);

grant select on public.partner_accounts to authenticated;
grant all on public.partner_accounts to service_role;
alter table public.partner_accounts enable row level security;
drop policy if exists "partners read own account" on public.partner_accounts;
create policy "partners read own account" on public.partner_accounts
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "admins read partner accounts" on public.partner_accounts;
create policy "admins read partner accounts" on public.partner_accounts
  for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.has_partner_access(_role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.partner_accounts p
    where p.user_id = auth.uid()
      and p.role = _role
      and p.is_active
      and (
        _role = 'provider'
        or exists (
          select 1 from public.hospital_applications h
          where h.id = p.hospital_application_id
            and h.status = 'approved'
            and h.partnership_status = 'active'
        )
      )
  )
$$;

create or replace function public.record_partner_login(_role public.app_role)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_partner_access(_role) then raise exception 'Forbidden'; end if;
  update public.partner_accounts
    set last_login_at = now(), updated_at = now()
    where user_id = auth.uid() and role = _role;
end $$;

create or replace function public.mark_partner_password_changed()
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.partner_accounts
    set must_change_password = false, updated_at = now()
    where user_id = auth.uid()
      and role in ('hospital', 'provider')
      and is_active;
  if not found then raise exception 'Forbidden'; end if;
end $$;

grant execute on function public.has_partner_access, public.record_partner_login,
  public.mark_partner_password_changed to authenticated;
revoke execute on function public.has_partner_access, public.record_partner_login,
  public.mark_partner_password_changed from public, anon;

drop policy if exists "hospital partners read own approved application" on public.hospital_applications;
create policy "hospital partners read own approved application" on public.hospital_applications
  for select to authenticated using (
    status = 'approved'
    and partnership_status = 'active'
    and exists (
      select 1 from public.partner_accounts p
      where p.user_id = auth.uid()
        and p.role = 'hospital'
        and p.is_active
        and not p.must_change_password
        and p.hospital_application_id = hospital_applications.id
    )
  );
drop policy if exists "hospital partners read own ambulances" on public.ambulances;
create policy "hospital partners read own ambulances" on public.ambulances
  for select to authenticated using (
    exists (
      select 1 from public.partner_accounts p
      join public.hospital_applications h on h.id = p.hospital_application_id
      where p.user_id = auth.uid()
        and p.role = 'hospital'
        and p.is_active
        and not p.must_change_password
        and h.status = 'approved'
        and h.partnership_status = 'active'
        and p.hospital_application_id = ambulances.hospital_application_id
    )
  );
drop policy if exists "hospital partners read own drivers" on public.drivers;
create policy "hospital partners read own drivers" on public.drivers
  for select to authenticated using (
    exists (
      select 1 from public.partner_accounts p
      join public.hospital_applications h on h.id = p.hospital_application_id
      where p.user_id = auth.uid()
        and p.role = 'hospital'
        and p.is_active
        and not p.must_change_password
        and h.status = 'approved'
        and h.partnership_status = 'active'
        and p.hospital_application_id = drivers.hospital_application_id
    )
  );
