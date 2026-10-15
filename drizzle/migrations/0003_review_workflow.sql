-- RESQ Nepal review workflow: internal notes, follow-up dates, reviewer assignment.
-- Additive only: no existing tables altered beyond new nullable columns.

alter table public.hospital_applications
  add column if not exists follow_up_date timestamptz,
  add column if not exists assigned_reviewer uuid;

create table if not exists public.application_notes (
  id uuid primary key default gen_random_uuid(),
  hospital_application_id uuid not null references public.hospital_applications(id) on delete cascade,
  author_id uuid,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists application_notes_app_idx
  on public.application_notes (hospital_application_id, created_at desc);

grant select, insert on public.application_notes to authenticated;
grant all on public.application_notes to service_role;
alter table public.application_notes enable row level security;
drop policy if exists "admins read notes" on public.application_notes;
create policy "admins read notes" on public.application_notes for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins add notes" on public.application_notes;
create policy "admins add notes" on public.application_notes for insert to authenticated
  with check (public.has_role(auth.uid(), 'admin'));

-- Reviewers are picked from fellow admins, so admins need to list admin profiles.
drop policy if exists "admins list profiles" on public.admin_profiles;
create policy "admins list profiles" on public.admin_profiles for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
