import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..");

describe("admin implementation completeness", () => {
  const routes = [
    "src/routes/admin.index.tsx",
    "src/routes/admin._panel.dashboard.tsx",
    "src/routes/admin._panel.applications.tsx",
    "src/routes/admin._panel.applications.$id.tsx",
    "src/routes/admin._panel.hospitals.tsx",
    "src/routes/admin._panel.hospitals.$id.tsx",
    "src/routes/admin._panel.inquiries.tsx",
    "src/routes/admin._panel.profile.tsx",
    "src/routes/admin._panel.settings.tsx",
    "src/routes/hospital.login.tsx",
  ];

  for (const r of routes) {
    it(`has route file ${r}`, () => {
      expect(existsSync(join(root, r))).toBe(true);
    });
  }

  it("public header keeps both hospital buttons; admin hides public chrome", () => {
    const chrome = readFileSync(join(root, "src/components/site-chrome.tsx"), "utf8");
    expect(chrome).toContain("Login as Hospital");
    expect(chrome).toContain("Join as Hospital");
    expect(chrome).toContain("/hospital/login");
    const shell = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
    expect(shell).toContain('"/admin"');
    expect(shell).toContain("!isAdmin && <SiteHeader />");
  });

  it("registration form collects GPS method, ambulance total and types", () => {
    const form = readFileSync(join(root, "src/routes/register.tsx"), "utf8");
    expect(form).toContain("Preferred GPS Tracking Method");
    expect(form).toContain("Total Number of Ambulances");
    expect(form).toContain("Ambulance Types Available");
    expect(form).toContain("Enter total number of ambulances");
  });

  it("migration adds new columns without dropping tables", () => {
    const sql = readFileSync(join(root, "drizzle/migrations/0001_hospital_onboarding.sql"), "utf8");
    expect(sql).toContain("preferred_gps_tracking_method");
    expect(sql).toContain("ambulance_types");
    expect(sql).toContain("additional_message");
    expect(sql).not.toMatch(/drop table/i);
  });

  it("detail pages use protected RPCs, never public document URLs", () => {
    const detail = readFileSync(join(root, "src/routes/admin._panel.applications.$id.tsx"), "utf8");
    expect(detail).toContain("change_application_status");
    expect(detail).not.toContain("publicUrl");
    expect(detail).toContain("storage.from");
  });
});
