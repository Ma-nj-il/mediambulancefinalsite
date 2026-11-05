# Security audit — 2026-11-05

## Scope

Reviewed the website and Admin source, server functions, Supabase authentication,
permission checks, SQL migrations/RLS, document access, dependency tree, repository
secrets, and response handling. Read-only anonymous probes targeted the configured
development Supabase project. No production deployment or database migration was
performed for this audit.

## Findings and remediation

- **Dependencies:** npm initially reported 16 advisories (2 high, 14 moderate).
  Upgraded Vite, Zod, and Vitest and patched affected transitive dependencies.
  Updated the npm lockfile and removed the stale Bun lockfile. Final `npm audit`
  reports **0 vulnerabilities**.
- **Public device-request verification:** replaced case-insensitive wildcard
  matching with validated, uppercase, exact application-reference matching.
  Requests require an approved application with an active partnership and a
  matching phone number containing at least seven digits.
- **Public form handling:** registration, contact, and device-request forms reject
  malformed/non-string JSON and payloads above 16,384 characters before JSON
  parsing/schema validation. Duplicate-check failures now reject submissions
  instead of proceeding with a database write.
- **Response protections:** added MIME-sniffing protection, referrer policy,
  restricted frame ancestors, base-URI/object restrictions, and HSTS on HTTPS
  responses. Admin, authenticated, cookie-setting, and mutation responses use
  `private, no-store`; normal and error responses receive these headers.
- **Repository hygiene:** corrected log exclusions and excluded local Supabase
  CLI metadata. Private environment files remain ignored.
- **Automatic device requests:** the server requires authenticated Admin
  permissions before using its service-role client. Initial requests use the
  application UUID as a primary-key idempotency key, preserving existing review
  decisions when synchronization is retried.

## Verification

- **90 tests passed** across 11 suites, including Admin detail navigation,
  approval/device synchronization, review workflow, form validation, and security
  boundaries. TypeScript and the production build passed.
- ESLint passed for all 56 changed code files (excluding the generated route tree).
  Documentation formatting and `git diff --check` passed.
- Scanned 93 built frontend files against both configured server-secret values;
  neither value appeared in the public build output.
- Source/history credential-pattern scan covered 170 working files and 142
  historical blobs at the time of scanning, with no matching credentials found.
- Anonymous reads returned no rows from 14 protected tables: applications, device
  requests, documents, status history, notes, checklist, ambulances, drivers,
  inquiries, Admin profiles, audit logs, notifications, partner accounts, and roles.
  This verifies the observed anonymous results, not every authenticated role.
- A public URL probe for a nonexistent document returned HTTP 400. Private storage
  policies were reviewed in source; that probe alone does not prove existing
  documents are inaccessible.
- A development approval generated the expected per-ambulance GPS/dashcam request;
  retrying synchronization returned zero created requests.

## Remaining limits and follow-up

- Live authenticated role-matrix tests and deployed SQL-policy parity were not
  completed: no local Admin login, database-administration connection, or Supabase
  management token was configured for this audit.
- Temporary-password rotation currently uses a flag and UI prompt. Server-enforced
  rotation before privileged access has not been established.
- Public-form honeypots and time-window duplicate checks are not durable,
  distributed rate limiting; concurrent or varied submissions can evade them.
  Reference-plus-phone verification is not strong identity authentication.
- The JSON limit applies after framework request parsing. Deployment-level request
  body limits and abuse controls still require verification.
- The CSP added here restricts framing, base URLs, and objects; it is not a full
  script-source/nonce policy. Proxy/CDN handling of HTTPS headers, static assets,
  caching, and the live deployment configuration still needs verification.
- Hospital / Provider login remains frontend-only and separate from Website Admin.
  GPS, camera, trip, playback, and telemetry interfaces remain demonstrations or
  integration-pending.

These are the results of the scoped review and checks, not a production security
certification.
