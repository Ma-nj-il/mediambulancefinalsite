-- RESQ Nepal verification checklist: persistent per-application review checks.
-- Approval is blocked server-side until the mandatory checks are complete.
-- Additive only: checklist table + policies; change_application_status replaced
-- with identical logic plus the approval gate (existing transitions preserved).

create table if not exists public.application_checklist (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  check_key text not null check (check_key in (
    'hospital_registration', 'contact_details', 'documents_reviewed',
    'gps_config', 'fleet_details', 'missing_info', 'reviewer_comments'
  )),
  is_checked boolean not null default false,
  checked_by uuid,
  checked_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (hospital_application_id, check_key)
);
create index if not exists application_checklist_app_idx
  on public.application_checklist (hospital_application_id);

grant select, insert, update on public.application_checklist to authenticated;
grant all on public.application_checklist to service_role;
alter table public.application_checklist enable row level security;
drop policy if exists "admins read checklist" on public.application_checklist;
create policy "admins read checklist" on public.application_checklist for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins write checklist" on public.application_checklist;
create policy "admins write checklist" on public.application_checklist for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update checklist" on public.application_checklist;
create policy "admins update checklist" on public.application_checklist for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists touch_checklist on public.application_checklist;
create trigger touch_checklist before update on public.application_checklist
  for each row execute function public.touch_updated_at();

create or replace function public.change_application_status(_id uuid, _new public.application_status, _reason text default null)
returns public.hospital_applications language plpgsql security definer set search_path = public as $$
declare cur public.hospital_applications; res public.hospital_applications; ok boolean; missing int;
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
  if _new = 'approved' then
    select count(*) into missing from (values
      ('hospital_registration'), ('contact_details'), ('documents_reviewed'),
      ('gps_config'), ('fleet_details')
    ) as required(check_key)
    left join public.application_checklist c
      on c.hospital_application_id = _id
      and c.check_key = required.check_key
      and c.is_checked = true
    where c.check_key is null;
    if missing > 0 then
      raise exception 'Complete the verification checklist before approval (% missing)', missing;
    end if;
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
