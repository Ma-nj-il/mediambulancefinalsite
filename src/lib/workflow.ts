import type { AppStatus } from "./admin";

/** Mirrors the public.change_application_status transition rules in drizzle/migrations/0000_migration.sql */
const allowed: Record<AppStatus, AppStatus[]> = {
  pending: ["under_review", "changes_requested", "approved", "rejected"],
  under_review: ["changes_requested", "approved", "rejected"],
  changes_requested: ["under_review", "approved", "rejected"],
  approved: [],
  rejected: [],
};

export function canTransition(from: AppStatus, to: AppStatus): boolean {
  return allowed[from]?.includes(to) ?? false;
}

export function requiresReason(to: AppStatus): boolean {
  return to === "rejected" || to === "changes_requested";
}

export function validateTransition(
  from: AppStatus,
  to: AppStatus,
  reason?: string | null,
): string | null {
  if (!canTransition(from, to)) return `Cannot change status from ${from} to ${to}`;
  if (requiresReason(to) && !reason?.trim()) return "A reason is required";
  return null;
}

/** Verification checklist labels shown in the review screen. */
export const CHECKLIST_ITEMS = [
  { key: "hospital_registration", label: "Hospital registration verified", mandatory: true },
  { key: "contact_details", label: "Contact details verified", mandatory: true },
  { key: "documents_reviewed", label: "Required documents reviewed", mandatory: true },
  { key: "gps_config", label: "GPS configuration reviewed", mandatory: true },
  { key: "fleet_details", label: "Ambulance fleet details reviewed", mandatory: true },
  { key: "missing_info", label: "Missing information identified", mandatory: false },
  { key: "reviewer_comments", label: "Reviewer comments recorded", mandatory: false },
] as const;

export type ChecklistKey = (typeof CHECKLIST_ITEMS)[number]["key"];

export const MANDATORY_CHECKS: readonly string[] = CHECKLIST_ITEMS.filter((c) => c.mandatory).map(
  (c) => c.key,
);

/** Mirrors the server-side approval gate in 0004_verification_checklist.sql. */
export function missingMandatoryChecks(checked: readonly string[]): string[] {
  return MANDATORY_CHECKS.filter((k) => !checked.includes(k));
}

export function isApprovalReady(checked: readonly string[]): boolean {
  return missingMandatoryChecks(checked).length === 0;
}
