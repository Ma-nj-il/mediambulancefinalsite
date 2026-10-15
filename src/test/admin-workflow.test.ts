import { describe, expect, it } from "vitest";
import { canTransition, requiresReason, validateTransition } from "@/lib/workflow";
import { friendlyError, usernameToEmail } from "@/lib/admin";

describe("application workflow transitions", () => {
  it("allows pending to move into review, correction, approval or rejection", () => {
    for (const to of ["under_review", "changes_requested", "approved", "rejected"] as const) {
      expect(canTransition("pending", to)).toBe(true);
    }
  });

  it("blocks duplicate approvals and terminal transitions", () => {
    expect(canTransition("approved", "approved")).toBe(false);
    expect(canTransition("approved", "rejected")).toBe(false);
    expect(canTransition("rejected", "approved")).toBe(false);
  });

  it("requires a reason for rejection and correction requests", () => {
    expect(requiresReason("rejected")).toBe(true);
    expect(requiresReason("changes_requested")).toBe(true);
    expect(requiresReason("approved")).toBe(false);
    expect(validateTransition("pending", "rejected", "")).toBe("A reason is required");
    expect(validateTransition("pending", "rejected", "Incomplete licence")).toBeNull();
  });

  it("maps plain usernames to admin emails without inventing hospital passwords", () => {
    expect(usernameToEmail("admin")).toBe("admin@admin.resq.local");
    expect(usernameToEmail("Admin@Example.com")).toBe("admin@example.com");
  });

  it("never masks server error messages from review actions", () => {
    expect(friendlyError(new Error("Forbidden"))).toBe("Forbidden");
    expect(friendlyError(new Error("Cannot change status from approved to approved"))).toContain(
      "Cannot change status",
    );
    expect(friendlyError(new Error())).toBe("Something went wrong. Please try again.");
    expect(friendlyError(null)).toBe("Something went wrong. Please try again.");
  });
});
