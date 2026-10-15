-- RESQ Nepal onboarding form: GPS preference, ambulance total + types, optional message.
-- Additive only: no tables dropped, existing registrations preserved.

alter table public.hospital_applications
  add column if not exists additional_message text,
  add column if not exists preferred_gps_tracking_method text,
  add column if not exists ambulance_types text[] not null default '{}';

-- The simplified form no longer collects these, so they become optional.
alter table public.hospital_applications
  alter column email drop not null,
  alter column city_district drop not null;

-- New submissions must use known GPS methods, known ambulance types, and a non-negative count.
alter table public.hospital_applications
  drop constraint if exists chk_gps_method,
  add constraint chk_gps_method check (
    preferred_gps_tracking_method is null or preferred_gps_tracking_method in
    ('gps_device', 'gps_device_dashcam', 'mobile_gps', 'undecided')
  );

alter table public.hospital_applications
  drop constraint if exists chk_ambulance_types,
  add constraint chk_ambulance_types check (
    ambulance_types <@ array['basic', 'emergency', 'ventilator']
  );

alter table public.hospital_applications
  drop constraint if exists chk_total_ambulances,
  add constraint chk_total_ambulances check (ambulance_count >= 0);
