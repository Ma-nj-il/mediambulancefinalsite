-- Website administration expansion: explicit device requests, persistent notifications,
-- request notes/history, and staff permission roles. Additive only; no records are copied,
-- reclassified, dropped, or truncated. Apply only after testing in a non-production project.

do $$ begin
  create type public.admin_staff_role as enum
    ('super_admin', 'application_manager', 'request_manager', 'report_viewer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.website_request_status as enum
    ('new', 'pending', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

alter table public.admin_profiles
  add column if not exists staff_role public.admin_staff_role not null default 'super_admin';

create or replace function public.has_admin_permission(_permission text)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.admin_profiles p
    join public.user_roles r on r.user_id = p.user_id and r.role = 'admin'
    where p.user_id = auth.uid()
      and p.is_active = true
      and (
        p.staff_role = 'super_admin'
        or (p.staff_role = 'application_manager' and _permission in ('applications.read','applications.write','reports.read'))
        or (p.staff_role = 'request_manager' and _permission in ('requests.read','requests.write','reports.read'))
        or (p.staff_role = 'report_viewer' and _permission in ('applications.read','requests.read','reports.read','audit.read'))
      )
  )
$$;

create sequence if not exists public.device_request_ref_seq start 1001;

create table if not exists public.device_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default ('DEV-' || to_char(now(), 'YYYY') || '-' || nextval('public.device_request_ref_seq')),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete restrict,
  device_category text not null check (device_category in ('gps', 'dashcam', 'gps_dashcam')),
  gps_quantity int not null default 0 check (gps_quantity between 0 and 10000),
  dashcam_quantity int not null default 0 check (dashcam_quantity between 0 and 10000),
  vehicle_quantity int check (vehicle_quantity between 0 and 10000),
  request_description text check (request_description is null or char_length(request_description) <= 2000),
  status public.website_request_status not null default 'new',
  assigned_admin uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint device_request_quantities_match check (
    (device_category = 'gps' and gps_quantity > 0 and dashcam_quantity = 0)
    or (device_category = 'dashcam' and dashcam_quantity > 0 and gps_quantity = 0)
    or (device_category = 'gps_dashcam' and gps_quantity > 0 and dashcam_quantity > 0)
  )
);
create index if not exists device_requests_status_created_idx on public.device_requests (status, created_at desc);
create index if not exists device_requests_hospital_idx on public.device_requests (hospital_application_id, created_at desc);
create index if not exists device_requests_category_idx on public.device_requests (device_category, created_at desc);

create table if not exists public.device_request_history (
  id uuid primary key default gen_random_uuid(),
  device_request_id uuid not null references public.device_requests(id) on delete cascade,
  previous_status public.website_request_status,
  new_status public.website_request_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists device_request_history_request_idx on public.device_request_history (device_request_id, created_at desc);

create table if not exists public.device_request_notes (
  id uuid primary key default gen_random_uuid(),
  device_request_id uuid not null references public.device_requests(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists device_request_notes_request_idx on public.device_request_notes (device_request_id, created_at desc);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null check (notification_type in (
    'new_application', 'new_gps_request', 'new_dashcam_request', 'new_inquiry',
    'application_approved', 'application_rejected', 'request_status_changed',
    'request_completed', 'system_alert'
  )),
  title text not null,
  description text not null,
  related_record_id uuid,
  related_record_type text not null,
  recipient_admin uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists admin_notifications_recipient_idx on public.admin_notifications (recipient_admin, created_at desc);
create index if not exists admin_notifications_record_idx on public.admin_notifications (related_record_type, related_record_id);

create table if not exists public.admin_notification_reads (
  notification_id uuid not null references public.admin_notifications(id) on delete cascade,
  admin_user_id uuid not null references auth.users(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (notification_id, admin_user_id)
);
create index if not exists admin_notification_reads_admin_idx on public.admin_notification_reads (admin_user_id, read_at desc);

create or replace view public.website_request_index
with (security_invoker = true) as
  select a.id, a.application_reference as request_number, a.hospital_name,
    'hospital_registration'::text as category, 'Hospital registration'::text as title,
    a.status::text as status, a.submitted_at, a.updated_at, 'application'::text as source
  from public.hospital_applications a
  union all
  select i.id, ('INQ-' || upper(left(replace(i.id::text, '-', ''), 8)))::text as request_number,
    null::text as hospital_name, 'general_inquiry'::text as category, i.subject as title,
    i.status, i.submitted_at, i.updated_at, 'inquiry'::text as source
  from public.contact_inquiries i
  union all
  select d.id, d.request_number, a.hospital_name,
    case d.device_category when 'gps' then 'gps_device' when 'dashcam' then 'dashcam' else 'gps_and_dashcam' end,
    case d.device_category when 'gps' then 'GPS device request' when 'dashcam' then 'Dashcam request' else 'GPS and dashcam request' end,
    d.status::text, d.created_at, d.updated_at, 'device_request'::text
  from public.device_requests d
  join public.hospital_applications a on a.id = d.hospital_application_id;
grant select on public.website_request_index to authenticated, service_role;

create or replace view public.admin_notification_inbox
with (security_invoker = true) as
  select n.id, n.notification_type, n.title, n.description,
    n.related_record_id, n.related_record_type, n.recipient_admin,
    n.created_at, r.read_at
  from public.admin_notifications n
  left join public.admin_notification_reads r
    on r.notification_id = n.id and r.admin_user_id = auth.uid();
grant select on public.admin_notification_inbox to authenticated, service_role;

alter table public.device_requests enable row level security;
alter table public.device_request_history enable row level security;
alter table public.device_request_notes enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_notification_reads enable row level security;

grant select on public.device_requests, public.device_request_history, public.device_request_notes to authenticated;
grant insert on public.device_request_notes to authenticated;
grant select on public.admin_notifications, public.admin_notification_reads to authenticated;
grant insert, delete on public.admin_notification_reads to authenticated;
grant all on public.device_requests, public.device_request_history, public.device_request_notes,
  public.admin_notifications, public.admin_notification_reads to service_role;

drop policy if exists "request staff read device requests" on public.device_requests;
create policy "request staff read device requests" on public.device_requests for select to authenticated
  using (public.has_admin_permission('requests.read'));
drop policy if exists "request staff read device history" on public.device_request_history;
create policy "request staff read device history" on public.device_request_history for select to authenticated
  using (public.has_admin_permission('requests.read'));
drop policy if exists "request staff read device notes" on public.device_request_notes;
create policy "request staff read device notes" on public.device_request_notes for select to authenticated
  using (public.has_admin_permission('requests.read'));
drop policy if exists "request staff add device notes" on public.device_request_notes;
create policy "request staff add device notes" on public.device_request_notes for insert to authenticated
  with check (public.has_admin_permission('requests.write') and author_id = auth.uid());

drop policy if exists "admins read notifications" on public.admin_notifications;
create policy "admins read notifications" on public.admin_notifications for select to authenticated
  using (
    (recipient_admin is null or recipient_admin = auth.uid())
    and (
      (related_record_type = 'hospital_application' and public.has_admin_permission('applications.read'))
      or (related_record_type in ('contact_inquiry', 'device_request') and public.has_admin_permission('requests.read'))
      or (related_record_type = 'system' and public.has_admin_permission('reports.read'))
    )
  );
drop policy if exists "admins read notification receipts" on public.admin_notification_reads;
create policy "admins read notification receipts" on public.admin_notification_reads for select to authenticated
  using (admin_user_id = auth.uid() and public.has_admin_permission('reports.read'));
drop policy if exists "admins add notification receipts" on public.admin_notification_reads;
create policy "admins add notification receipts" on public.admin_notification_reads for insert to authenticated
  with check (admin_user_id = auth.uid() and public.has_admin_permission('reports.read'));
drop policy if exists "admins remove notification receipts" on public.admin_notification_reads;
create policy "admins remove notification receipts" on public.admin_notification_reads for delete to authenticated
  using (admin_user_id = auth.uid() and public.has_admin_permission('reports.read'));

drop trigger if exists touch_device_request on public.device_requests;
create trigger touch_device_request before update on public.device_requests
  for each row execute function public.touch_updated_at();

create or replace function public.notify_admins_for_submission()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'hospital_applications' then
    insert into public.admin_notifications (notification_type, title, description, related_record_id, related_record_type)
    values ('new_application', 'New hospital application', new.hospital_name || ' submitted an application.', new.id, 'hospital_application');
  elsif tg_table_name = 'contact_inquiries' then
    insert into public.admin_notifications (notification_type, title, description, related_record_id, related_record_type)
    values ('new_inquiry', 'New website inquiry', new.subject || ' — ' || new.name, new.id, 'contact_inquiry');
  elsif tg_table_name = 'device_requests' then
    insert into public.device_request_history
      (device_request_id, previous_status, new_status, changed_by, reason)
    values (new.id, null, 'new', null, 'Submitted via website');
    insert into public.admin_notifications (notification_type, title, description, related_record_id, related_record_type)
    values (
      case when new.device_category = 'dashcam' then 'new_dashcam_request' else 'new_gps_request' end,
      case when new.device_category = 'dashcam' then 'New dashcam request' else 'New GPS / device request' end,
      new.request_number || ' was submitted.', new.id, 'device_request'
    );
  end if;
  return new;
end $$;

drop trigger if exists notify_new_application on public.hospital_applications;
create trigger notify_new_application after insert on public.hospital_applications
  for each row execute function public.notify_admins_for_submission();
drop trigger if exists notify_new_inquiry on public.contact_inquiries;
create trigger notify_new_inquiry after insert on public.contact_inquiries
  for each row execute function public.notify_admins_for_submission();
drop trigger if exists notify_new_device_request on public.device_requests;
create trigger notify_new_device_request after insert on public.device_requests
  for each row execute function public.notify_admins_for_submission();

create or replace function public.change_device_request_status(
  _id uuid, _new public.website_request_status, _reason text default null
)
returns public.device_requests language plpgsql security definer set search_path = public as $$
declare cur public.device_requests; res public.device_requests; ok boolean;
begin
  if not public.has_admin_permission('requests.write') then raise exception 'Forbidden'; end if;
  select * into cur from public.device_requests where id = _id for update;
  if not found then raise exception 'Device request not found'; end if;
  ok := case cur.status
    when 'new' then _new in ('pending','under_review','approved','rejected','cancelled')
    when 'pending' then _new in ('under_review','approved','rejected','cancelled')
    when 'under_review' then _new in ('pending','approved','rejected','in_progress','cancelled')
    when 'approved' then _new in ('in_progress','completed','cancelled')
    when 'in_progress' then _new in ('completed','cancelled')
    else false end;
  if not ok then raise exception 'Cannot change status from % to %', cur.status, _new; end if;
  if _new in ('rejected','cancelled') and coalesce(trim(_reason), '') = '' then
    raise exception 'A reason is required';
  end if;
  update public.device_requests set
    status = _new, reviewed_by = auth.uid(), reviewed_at = now(),
    completed_at = case when _new = 'completed' then now() else completed_at end
  where id = _id returning * into res;
  insert into public.device_request_history (device_request_id, previous_status, new_status, changed_by, reason)
    values (_id, cur.status, _new, auth.uid(), nullif(trim(_reason), ''));
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'device_request.status.' || _new, 'device_request', _id,
      jsonb_build_object('from', cur.status, 'to', _new, 'reason', _reason));
  insert into public.admin_notifications (notification_type, title, description, related_record_id, related_record_type)
    values (
      case when _new = 'completed' then 'request_completed' else 'request_status_changed' end,
      case when _new = 'completed' then 'Device request completed' else 'Device request status changed' end,
      res.request_number || ' is now ' || replace(_new::text, '_', ' ') || '.', _id, 'device_request'
    );
  return res;
end $$;

create or replace function public.change_inquiry_status(_id uuid, _new text)
returns public.contact_inquiries language plpgsql security definer set search_path = public as $$
declare cur public.contact_inquiries; res public.contact_inquiries;
begin
  if not public.has_admin_permission('requests.write') then raise exception 'Forbidden'; end if;
  if _new not in ('new','in_progress','resolved') then raise exception 'Invalid inquiry status'; end if;
  select * into cur from public.contact_inquiries where id = _id for update;
  if not found then raise exception 'Inquiry not found'; end if;
  update public.contact_inquiries set status = _new,
    resolved_at = case when _new = 'resolved' then now() else null end
  where id = _id returning * into res;
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'inquiry.status.' || _new, 'contact_inquiry', _id,
      jsonb_build_object('from', cur.status, 'to', _new));
  return res;
end $$;

-- Tighten existing website-admin and partner-account records to the new permission model.
drop policy if exists "admins read" on public.hospital_applications;
create policy "application staff read" on public.hospital_applications for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins update" on public.hospital_applications;
create policy "application staff update" on public.hospital_applications for update to authenticated
  using (public.has_admin_permission('applications.write'))
  with check (public.has_admin_permission('applications.write'));

drop policy if exists "admins read" on public.ambulances;
create policy "application staff read ambulances" on public.ambulances for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins update" on public.ambulances;
create policy "application staff update ambulances" on public.ambulances for update to authenticated
  using (public.has_admin_permission('applications.write'))
  with check (public.has_admin_permission('applications.write'));

drop policy if exists "admins read" on public.drivers;
create policy "application staff read drivers" on public.drivers for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins update" on public.drivers;
create policy "application staff update drivers" on public.drivers for update to authenticated
  using (public.has_admin_permission('applications.write'))
  with check (public.has_admin_permission('applications.write'));

drop policy if exists "admins read" on public.application_documents;
create policy "application staff read documents" on public.application_documents for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins read" on public.application_status_history;
create policy "application staff read history" on public.application_status_history for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins read notes" on public.application_notes;
create policy "application staff read notes" on public.application_notes for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins add notes" on public.application_notes;
create policy "application staff add notes" on public.application_notes for insert to authenticated
  with check (public.has_admin_permission('applications.write') and author_id = auth.uid());
drop policy if exists "admins read checklist" on public.application_checklist;
create policy "application staff read checklist" on public.application_checklist for select to authenticated
  using (public.has_admin_permission('applications.read'));
drop policy if exists "admins write checklist" on public.application_checklist;
create policy "application staff add checklist" on public.application_checklist for insert to authenticated
  with check (public.has_admin_permission('applications.write'));
drop policy if exists "admins update checklist" on public.application_checklist;
create policy "application staff update checklist" on public.application_checklist for update to authenticated
  using (public.has_admin_permission('applications.write'))
  with check (public.has_admin_permission('applications.write'));

drop policy if exists "admins read inquiries" on public.contact_inquiries;
create policy "request staff read inquiries" on public.contact_inquiries for select to authenticated
  using (public.has_admin_permission('requests.read'));
drop policy if exists "admins update inquiries" on public.contact_inquiries;
-- Inquiry changes are intentionally RPC-only so every change is audited.

drop policy if exists "admins read" on public.admin_audit_logs;
create policy "authorized staff read audit" on public.admin_audit_logs for select to authenticated
  using (public.has_admin_permission('audit.read'));

drop policy if exists "admins list profiles" on public.admin_profiles;
drop policy if exists "super admins read profiles" on public.admin_profiles;
create policy "super admins read profiles" on public.admin_profiles for select to authenticated
  using (public.has_admin_permission('users.write'));

drop policy if exists "admins read application documents" on storage.objects;
create policy "application staff read application documents" on storage.objects
  for select to authenticated using (
    bucket_id = 'application-documents'
    and public.has_admin_permission('applications.read')
  );

drop policy if exists "admins read partner accounts" on public.partner_accounts;
create policy "application staff read partner accounts" on public.partner_accounts
  for select to authenticated using (public.has_admin_permission('applications.read'));

create or replace function public.list_admin_directory()
returns table (user_id uuid, username text, display_name text)
language sql stable security definer set search_path = public as $$
  select p.user_id, p.username, p.display_name
  from public.admin_profiles p
  where public.has_role(auth.uid(), 'admin')
    and exists (
      select 1 from public.admin_profiles current_admin
      where current_admin.user_id = auth.uid() and current_admin.is_active
    )
  order by coalesce(p.display_name, p.username), p.username
$$;

create or replace function public.update_own_admin_profile(_display_name text)
returns public.admin_profiles language plpgsql security definer set search_path = public as $$
declare res public.admin_profiles;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'Forbidden'; end if;
  if char_length(coalesce(_display_name, '')) > 100 then
    raise exception 'Display name is too long';
  end if;
  update public.admin_profiles
    set display_name = nullif(trim(_display_name), ''), updated_at = now()
    where user_id = auth.uid() and is_active
    returning * into res;
  if not found then raise exception 'Active administrator profile not found'; end if;
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id)
    values (auth.uid(), 'admin.profile.updated', 'admin', auth.uid());
  return res;
end $$;

create or replace function public.set_admin_staff_role(
  _user_id uuid, _role public.admin_staff_role
)
returns public.admin_profiles language plpgsql security definer set search_path = public as $$
declare cur public.admin_profiles; res public.admin_profiles; super_count int;
begin
  if not public.has_admin_permission('users.write') then raise exception 'Forbidden'; end if;
  select * into cur from public.admin_profiles where user_id = _user_id for update;
  if not found then raise exception 'Administrator profile not found'; end if;
  if cur.staff_role = _role then return cur; end if;
  if cur.staff_role = 'super_admin' and _role <> 'super_admin' then
    select count(*) into super_count from public.admin_profiles
      where staff_role = 'super_admin' and is_active;
    if super_count <= 1 then raise exception 'At least one active super administrator is required'; end if;
  end if;
  update public.admin_profiles
    set staff_role = _role, updated_at = now()
    where user_id = _user_id returning * into res;
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'admin.role.changed', 'admin', _user_id,
      jsonb_build_object('from', cur.staff_role, 'to', _role));
  return res;
end $$;

create or replace function public.log_admin_action(
  _action text, _entity_type text, _entity_id uuid, _metadata jsonb default '{}'::jsonb
)
returns void language plpgsql security definer set search_path = public as $$
declare allowed boolean;
begin
  allowed := case
    when _entity_type in ('hospital_application', 'ambulance', 'driver')
      then public.has_admin_permission('applications.write')
    when _entity_type in ('device_request', 'contact_inquiry')
      then public.has_admin_permission('requests.write')
    when _entity_type = 'admin'
      then public.has_admin_permission('users.write')
    else false
  end;
  if not allowed then raise exception 'Forbidden'; end if;
  insert into public.admin_audit_logs
    (admin_user_id, action, entity_type, entity_id, metadata)
  values (auth.uid(), _action, _entity_type, _entity_id, coalesce(_metadata, '{}'::jsonb));
end $$;

create or replace function public.change_application_status(_id uuid, _new public.application_status, _reason text default null)
returns public.hospital_applications language plpgsql security definer set search_path = public as $$
declare cur public.hospital_applications; res public.hospital_applications; ok boolean; missing int;
begin
  if not public.has_admin_permission('applications.write') then raise exception 'Forbidden'; end if;
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
  if _new = 'approved' then
    select count(*) into missing from (values
      ('hospital_registration'), ('contact_details'), ('documents_reviewed'),
      ('gps_config'), ('fleet_details')
    ) as required(check_key)
    left join public.application_checklist c
      on c.hospital_application_id = _id and c.check_key = required.check_key and c.is_checked = true
    where c.check_key is null;
    if missing > 0 then raise exception 'Complete the verification checklist before approval (% missing)', missing; end if;
  end if;
  perform set_config('resq.workflow','on', true);
  update public.hospital_applications set
    status = _new, reviewed_at = now(), reviewed_by = auth.uid(),
    rejection_reason = case when _new = 'rejected' then _reason else rejection_reason end,
    review_notes = case when _new = 'changes_requested' then _reason else coalesce(nullif(trim(_reason),''), review_notes) end,
    approved_at = case when _new = 'approved' then now() else approved_at end,
    partnership_status = case when _new = 'approved' then 'active'::public.partnership_status else partnership_status end
  where id = _id returning * into res;
  perform set_config('resq.workflow','off', true);
  insert into public.application_status_history (hospital_application_id, previous_status, new_status, changed_by, reason)
    values (_id, cur.status, _new, auth.uid(), _reason);
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'application.status.' || _new, 'hospital_application', _id,
      jsonb_build_object('from', cur.status, 'to', _new, 'reason', _reason));
  insert into public.admin_notifications (notification_type, title, description, related_record_id, related_record_type)
    select case when _new = 'approved' then 'application_approved' else 'application_rejected' end,
      case when _new = 'approved' then 'Hospital application approved' else 'Hospital application rejected' end,
      res.application_reference || ' · ' || res.hospital_name, _id, 'hospital_application'
    where _new in ('approved','rejected');
  return res;
end $$;

create or replace function public.set_partnership_status(_id uuid, _status public.partnership_status, _reason text default null)
returns public.hospital_applications language plpgsql security definer set search_path = public as $$
declare cur public.hospital_applications; res public.hospital_applications;
begin
  if not public.has_admin_permission('applications.write') then raise exception 'Forbidden'; end if;
  select * into cur from public.hospital_applications where id = _id for update;
  if not found or cur.status <> 'approved' then raise exception 'Only approved hospitals can change partnership status'; end if;
  if cur.partnership_status = _status then raise exception 'Hospital is already %', _status; end if;
  perform set_config('resq.workflow','on', true);
  update public.hospital_applications set partnership_status = _status where id = _id returning * into res;
  perform set_config('resq.workflow','off', true);
  insert into public.admin_audit_logs (admin_user_id, action, entity_type, entity_id, metadata)
    values (auth.uid(), 'hospital.partnership.' || _status, 'hospital_application', _id,
      jsonb_build_object('reason', _reason));
  return res;
end $$;

revoke execute on function public.has_admin_permission, public.list_admin_directory,
  public.update_own_admin_profile, public.set_admin_staff_role,
  public.change_device_request_status, public.change_inquiry_status,
  public.change_application_status, public.set_partnership_status,
  public.log_admin_action from public, anon;
grant execute on function public.has_admin_permission, public.list_admin_directory,
  public.update_own_admin_profile, public.set_admin_staff_role,
  public.change_device_request_status, public.change_inquiry_status,
  public.change_application_status, public.set_partnership_status,
  public.log_admin_action to authenticated;

-- Add the two high-value admin tables to Supabase Realtime when the publication exists.
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'admin_notifications') then
      alter publication supabase_realtime add table public.admin_notifications;
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'device_requests') then
      alter publication supabase_realtime add table public.device_requests;
    end if;
  end if;
end $$;
