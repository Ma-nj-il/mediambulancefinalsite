# site for medi ambulance

Implement exactly the screenshot and nothing else

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/382a9e7a-ab52-4e31-90bb-2105596e0632).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## RESQ Admin + database setup

Database is managed Supabase Postgres. Schema, RLS and later additions live in
`drizzle/migrations/`; apply each file in the Supabase SQL editor, in order.
Frontend types are in `src/integrations/supabase/types.ts`.

```sh
cp .env.example .env   # fill in Supabase URL + keys (service key stays server-only)
npm i
npx vitest run         # routing, workflow, registration + inquiry validation
npx tsc --noEmit       # typecheck
```

Seed the initial admin once (development only):

```sh
ADMIN_SEED_USERNAME=admin ADMIN_SEED_PASSWORD=admin123 bun scripts/seed-admin.ts
```

Apply migrations in the Supabase SQL editor, in order:
`drizzle/migrations/0000_migration.sql` (core schema), then
`0001_hospital_onboarding.sql` (new onboarding fields),
`0002_contact_inquiries.sql` (contact form inbox), then
`0003_review_workflow.sql` (internal notes, follow-up dates, reviewer assignment).

Workflows: public `/register` → `submitHospitalApplication` server function →
`hospital_applications` table → `/admin` login → `/admin/dashboard`
(Overview), `/admin/applications`, `/admin/hospitals` (Approved Hospitals),
`/admin/inquiries` (contact form inbox), `/admin/settings`. The contact page
form posts through `submitContactInquiry` into `contact_inquiries`.
`hospital_applications` table → `/admin` login → `/admin/dashboard`,
`/admin/applications`, `/admin/hospitals`, `/admin/fleet`, `/admin/drivers`.
Status changes go through the `change_application_status` RPC (valid
transitions enforced in Postgres); partnership suspend/reactivate uses
`set_partnership_status`. Documents stay in private
`application-documents` storage, downloadable only by signed-in admins.
`/hospital/login` is a placeholder until hospital auth is configured.
