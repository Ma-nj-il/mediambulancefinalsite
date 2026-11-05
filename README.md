# site for medi ambulance

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/382a9e7a-ab52-4e31-90bb-2105596e0632).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js 22.18+ and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).
Use npm with the committed `package-lock.json` for reproducible installs.

```sh
git clone <this-repository-url>
cd <repository-name>
npm ci
npm run dev
```

## RESQ Admin + database setup

Database is managed Supabase Postgres. Schema, RLS and later additions live in
`drizzle/migrations/`; apply each file in the Supabase SQL editor, in order.
Frontend types are in `src/integrations/supabase/types.ts`.

```sh
cp .env.example .env   # fill in Supabase URL + keys (service key stays server-only)
npm ci
npx vitest run         # routing, workflow, registration + inquiry validation
npx tsc --noEmit       # typecheck
```

Seed the initial admin once (development only):

```sh
# Set ADMIN_SEED_USERNAME and ADMIN_SEED_PASSWORD in your private .env first.
npm run seed:admin
```

Apply migrations in the Supabase SQL editor, in order:
`drizzle/migrations/0000_migration.sql` (core schema), then
`0001_hospital_onboarding.sql` (new onboarding fields),
`0002_contact_inquiries.sql` (contact form inbox), then
`0003_review_workflow.sql` (internal notes, follow-up dates, reviewer assignment),
`0004_verification_checklist.sql`, `0005_provider_role.sql`, and
`0006_partner_access.sql`, then `0007_website_admin_requests.sql`. Apply
`0005_provider_role.sql` separately and let it
finish before applying `0006_partner_access.sql`; the latter uses the new enum
value. Migration `0007` is additive and introduces explicit device requests,
persistent notifications, request history/notes, role permissions, a unified
request index, and Realtime publication entries. Test it in a non-production
Supabase project before production approval; it is not applied by the build.

Workflows: public `/register` → `submitHospitalApplication` server function →
`hospital_applications` table → `/admin` login → `/admin/dashboard`
(Overview), `/admin/applications`, `/admin/hospitals` (Approved Hospitals),
`/admin/inquiries` (contact form inbox), `/admin/settings`. The contact page
form posts through `submitContactInquiry` into `contact_inquiries`.
Approving a hospital with **GPS Tracking Device** selected creates an equipment
request with one GPS unit per ambulance. **GPS + Dash Camera** creates one of
each per ambulance; mobile GPS and undecided preferences create no hardware
request. New requests start at **New**, with supply and installation pending.
The authenticated Admin workflow performs this sync after approval, and opening
`/admin/device-requests` recovers older approvals or interrupted syncs for staff
with request-write permission. Existing requests and review decisions are preserved;
the initial request uses the application UUID as an idempotency key, so repeated
syncs cannot create duplicates. This uses the existing schema from migration `0007`.

Approved, active hospitals can also submit additional GPS/dashcam requests at
`/device-request`; the server matches the exact application reference and phone
before writing a request. These details are an intake check, not account authentication.
`/hospital/login` is the shared, frontend-only Hospital / Provider login;
`/provider/login` renders the same form. Submitting it does not authenticate, send
credentials, or create a session. Website Admin authentication is separate at `/admin`.
The additive `0005`/`0006` migrations and guarded partner dashboard routes retain
partner role checks and hospital-scoped read policies for future integration.
The Admin Panel does not currently provision Hospital or Provider accounts.
Booking, operational trips, GPS telemetry, camera streams, DVR playback, and
installed-device health remain demonstration/integration-pending features.
Partner dashboard components show linked ambulance and driver records only;
locations are explicitly marked unavailable rather than simulated.

`hospital_applications` table → `/admin` login → `/admin/dashboard`,
`/admin/applications`, `/admin/hospitals`, `/admin/inquiries`, `/admin/settings`.
Status changes go through the `change_application_status` RPC (valid
transitions enforced in Postgres); partnership suspend/reactivate uses
`set_partnership_status`. Documents stay in private
`application-documents` storage, downloadable only by signed-in admins.
Future authenticated partner access requires Supabase Auth users and matching
`partner_accounts` / `user_roles` records provisioned through an authorized process.
Never insert temporary passwords or service-role credentials into client code
or this repository.

Website Admin routes added by `0007`: `/admin/requests`,
`/admin/device-requests`, `/admin/notifications`, `/admin/reports`,
`/admin/audit`, and `/admin/users`. Privileged mutations use RLS and
security-definer RPCs; status changes and permission changes are audited.
Supabase Realtime is used for notification inserts, with normal query refresh
as the reconnection fallback. Email delivery is intentionally not attempted
until a verified provider is configured.

## Security audit

See [the security audit](docs/security-audit-2026-11-05.md) for findings, fixes,
verification results, and remaining deployment/authentication checks.
