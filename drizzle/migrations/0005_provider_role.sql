-- Add the provider role separately so later migrations can safely use it.
alter type public.app_role add value if not exists 'provider';
