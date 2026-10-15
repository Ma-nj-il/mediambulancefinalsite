
do $$ begin
  create type public.app_role as enum ('admin', 'hospital');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.application_status as enum ('pending','under_review','changes_requested','approved','rejected');
exception when duplicate_object then null;
end $$;
do $$ begin
  create type public.partnership_status as enum ('active','suspended');
exception when duplicate_object then null;
end $$;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.admin_profiles to authenticated;
grant all on public.admin_profiles to service_role;
alter table public.admin_profiles enable row level security;
create policy "admins read own profile" on public.admin_profiles for select to authenticated using (user_id = auth.uid() and public.has_role(auth.uid(),'admin'));

create sequence public.application_ref_seq start 1001;

create table public.hospital_applications (
  id uuid primary key default gen_random_uuid(),
  application_reference text not null unique default ('RQ-' || to_char(now(),'YYYY') || '-' || nextval('public.application_ref_seq')),
  hospital_name text not null,
  hospital_address text not null,
  city_district text not null,
  contact_person text not null,
  phone text not null,
  email text not null,
  ambulance_count int not null default 0,
  ambulance_categories text,
  gps_availability text,
  status public.application_status not null default 'pending',
  partnership_status public.partnership_status,
  review_notes text,
  rejection_reason text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.hospital_applications (status, submitted_at desc);
create index on public.hospital_applications (lower(email));

create table public.ambulances (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  registration_number text not null,
  category text,
  gps_available text,
  status text not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.ambulances (hospital_application_id);

create table public.drivers (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  ambulance_id uuid references public.ambulances(id) on delete set null,
  full_name text not null,
  phone text not null,
  licence_number text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.drivers (hospital_application_id);

create table public.application_documents (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  document_type text not null,
  private_storage_key text not null unique,
  original_filename text not null,
  mime_type text not null,
  file_size int not null,
  uploaded_at timestamptz not null default now()
);

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  previous_status public.application_status,
  new_status public.application_status not null,
  changed_by uuid,
  reason text,
  created_at timestamptz not null default now()
);

create table public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.admin_audit_logs (created_at desc);

do $$ declare t text; begin
  foreach t in array array['hospital_applications','ambulances','drivers','application_documents','application_status_history','admin_audit_logs'] loop
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "admins read" on public.%I for select to authenticated using (public.has_role(auth.uid(),''admin''))', t);
  end loop;
end $$;
grant update on public.hospital_applications, public.ambulances, public.drivers to authenticated;
create policy "admins update" on public.hospital_applications for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins update" on public.ambulances for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));
create policy "admins update" on public.drivers for update to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.guard_application_update()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  if coalesce(current_setting('resq.workflow', true), '') <> 'on' then
    if new.status is distinct from old.status or new.partnership_status is distinct from old.partnership_status
       or new.reviewed_by is distinct from old.reviewed_by or new.approved_at is distinct from old.approved_at
       or new.application_reference is distinct from old.application_reference then
      raise exception 'Workflow fields can only be changed through review actions';
    end if;
  end if;
  return new;
end $$;
create trigger guard_application_update before update on public.hospital_applications for each row execute function public.guard_application_update();

create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at := now(); return new; end $$;
create trigger touch_amb before update on public.ambulances for each row execute function public.touch_updated_at();
create trigger touch_drv before update on public.drivers for each row execute function public.touch_updated_at();

create or replace function public.change_application_status(_id uuid, _new public.application_status, _reason text default null)
returns public.hospital_applications language plpgsql security definer set search_path = public as $$
declare cur public.hospital_applications; res public.hospital_applications; ok boolean;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into cur from public.hospital_applications where id = _id for update;
  if not found then raise exception 'Application not found'; end if;
  ok := case cur.status
    when 'pending' then _new in ('under_review','changes_requested','approved','rejected')
    when 'under_review' then _new in ('changes_requested','approved','rejected')
    when 'changes_requested' then _new in ('under_review','approved','rejected')
    else false end;
  if not ok then raise exception 'Cannot change status from % to %', cur.status, _new; end if;
  if _new in ('rejected','changes_requested') and coalesce(trim(_reason),'') = '' then
    raise exception 'A reason is required';
  end if;
  perform set_config('resq.workflow','on', true);
  update public.hospital_applications set
    status = _new,
    reviewed_at = now(),
    reviewed_by = auth.uid(),
    rejection_reason = case when _new = 'rejected' then _reason else rejection_reason end,
    review_notes = case when _new = 'changes_requested' then _reason else coalesce(nullif(trim(_reason),''), review_notes) end,
    approved_at = case when _new = 'approved' then now() else approved_at end,
    partnership_status = case when _new = 'approved' then 'active'::public.partnership_status else partnership_status end
  where id = _id returning * into res;
  perform set_config('resq.workflow','off', true);
  insert into public.application_status_history (hospital_application_id, previous_status, new_status, changed_by, reason)
    values (_id, cur.status, _new, auth.uid(), _reason);
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'application.status.' || _new, 'hospital_application', _id, jsonb_build_object('from', cur.status, 'to', _new, 'reason', _reason));
  return res;
end $$;

create or replace function public.set_partnership_status(_id uuid, _status public.partnership_status, _reason text default null)
returns public.hospital_applications language plpgsql security definer set search_path = public as $$
declare cur public.hospital_applications; res public.hospital_applications;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  select * into cur from public.hospital_applications where id = _id for update;
  if not found or cur.status <> 'approved' then raise exception 'Only approved hospitals can change partnership status'; end if;
  if cur.partnership_status = _status then raise exception 'Hospital is already %', _status; end if;
  perform set_config('resq.workflow','on', true);
  update public.hospital_applications set partnership_status = _status where id = _id returning * into res;
  perform set_config('resq.workflow','off', true);
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'hospital.partnership.' || _status, 'hospital_application', _id, jsonb_build_object('reason', _reason));
  return res;
end $$;

create or replace function public.log_admin_action(_action text, _entity_type text, _entity_id uuid, _metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata) values (auth.uid(), _action, _entity_type, _entity_id, _metadata);
end $$;

create or replace function public.mark_admin_password_changed()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  update public.admin_profiles set must_change_password = false, updated_at = now() where user_id = auth.uid();
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id) values (auth.uid(), 'admin.password.changed', 'admin', auth.uid());
end $$;

create or replace function public.record_admin_login()
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'Forbidden'; end if;
  update public.admin_profiles set last_login_at = now() where user_id = auth.uid();
end $$;

revoke execute on function public.change_application_status, public.set_partnership_status, public.log_admin_action, public.mark_admin_password_changed, public.record_admin_login from public, anon;
grant execute on function public.change_application_status, public.set_partnership_status, public.log_admin_action, public.mark_admin_password_changed, public.record_admin_login, public.has_role to authenticated;

create policy "admins read application documents" on storage.objects for select to authenticated
  using (bucket_id = 'application-documents' and public.has_role(auth.uid(),'admin'));
