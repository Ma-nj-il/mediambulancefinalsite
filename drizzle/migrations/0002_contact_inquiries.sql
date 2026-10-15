-- RESQ Nepal contact inquiries: messages submitted through the public contact form.
-- Additive only: no existing tables touched.

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists contact_inquiries_status_idx on public.contact_inquiries (status, submitted_at desc);
create index if not exists contact_inquiries_email_idx on public.contact_inquiries (lower(email));

grant select, update on public.contact_inquiries to authenticated;
grant all on public.contact_inquiries to service_role;
alter table public.contact_inquiries enable row level security;
drop policy if exists "admins read inquiries" on public.contact_inquiries;
create policy "admins read inquiries" on public.contact_inquiries for select to authenticated
  using (public.has_role(auth.uid(), 'admin'));
drop policy if exists "admins update inquiries" on public.contact_inquiries;
create policy "admins update inquiries" on public.contact_inquiries for update to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

drop trigger if exists touch_inquiry on public.contact_inquiries;
create trigger touch_inquiry before update on public.contact_inquiries
  for each row execute function public.touch_updated_at();
