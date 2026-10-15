import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { toCsv } from "@/routes/admin._panel.applications";
import { isApprovalReady, MANDATORY_CHECKS, missingMandatoryChecks } from "@/lib/workflow";

const root = join(__dirname, "..", "..");

describe("review workflow additions", () => {
  it("exports CSV with quoted, escaped cells", () => {
    const csv = toCsv([
      { reference: "RQ-1", hospital: 'City "General", Hospital', status: "Pending" },
    ]);
    const lines = csv.split("\n");
    expect(lines[0]).toContain("reference,hospital");
    const cells = lines[1]!.split('","');
    expect(cells[0]).toBe('"RQ-1');
    expect(lines[1]).toContain('"City ""General"", Hospital"');
    expect(lines[1]).toContain('"Pending"');
  });

  it("migration adds notes, follow-ups and reviewer without dropping tables", () => {
    const sql = readFileSync(join(root, "drizzle/migrations/0003_review_workflow.sql"), "utf8");
    expect(sql).toContain("application_notes");
    expect(sql).toContain("follow_up_date");
    expect(sql).toContain("assigned_reviewer");
    expect(sql).not.toMatch(/drop table/i);
  });

  it("blocks approval until all mandatory checklist items are verified", () => {
    expect(MANDATORY_CHECKS.length).toBe(5);
    expect(isApprovalReady([])).toBe(false);
    expect(isApprovalReady(["hospital_registration", "contact_details"])).toBe(false);
    expect(missingMandatoryChecks(["hospital_registration"]).length).toBe(4);
    expect(isApprovalReady([...MANDATORY_CHECKS])).toBe(true);
    expect(isApprovalReady([...MANDATORY_CHECKS, "missing_info"])).toBe(true);
  });

  it("checklist migration gates approval server-side without dropping tables", () => {
    const sql = readFileSync(
      join(root, "drizzle/migrations/0004_verification_checklist.sql"),
      "utf8",
    );
    expect(sql).toContain("application_checklist");
    expect(sql).toContain("Complete the verification checklist before approval");
    expect(sql).not.toMatch(/drop table/i);
  });
});
