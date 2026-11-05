import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "..", "..");

describe("admin implementation completeness", () => {
  const routes = [
    "src/routes/admin.index.tsx",
    "src/routes/admin._panel.dashboard.tsx",
    "src/routes/admin._panel.applications.index.tsx",
    "src/routes/admin._panel.applications.$id.tsx",
    "src/routes/admin._panel.hospitals.index.tsx",
    "src/routes/admin._panel.hospitals.$id.tsx",
    "src/routes/admin._panel.inquiries.tsx",
    "src/routes/admin._panel.requests.tsx",
    "src/routes/admin._panel.device-requests.index.tsx",
    "src/routes/admin._panel.device-requests.$id.tsx",
    "src/routes/admin._panel.notifications.tsx",
    "src/routes/admin._panel.reports.tsx",
    "src/routes/admin._panel.audit.tsx",
    "src/routes/admin._panel.users.tsx",
    "src/routes/admin._panel.profile.tsx",
    "src/routes/admin._panel.settings.tsx",
    "src/routes/hospital.login.tsx",
    "src/routes/provider.login.tsx",
  ];

  for (const r of routes) {
    it(`has route file ${r}`, () => {
      expect(existsSync(join(root, r))).toBe(true);
    });
  }

  it("public header uses one hospital/provider sign-in; admin hides public chrome", () => {
    const chrome = readFileSync(join(root, "src/components/site-chrome.tsx"), "utf8");
    expect(chrome).toContain("Login as Hospital / Provider");
    expect(chrome).toContain("Join as Hospital");
    expect(chrome).toContain("/hospital/login");
    expect(chrome).not.toContain("/provider/login");
    const shell = readFileSync(join(root, "src/routes/__root.tsx"), "utf8");
    expect(shell).toContain('"/admin"');
    expect(shell).toContain("showPublicChrome && <SiteHeader />");
    expect(shell).toContain('pathname === "/hospital/login"');
  });

  it("keeps the partner login frontend-only and separate from admin authentication", () => {
    const login = readFileSync(join(root, "src/components/partner-login.tsx"), "utf8");
    expect(login).toContain("Hospital / Provider ID");
    expect(login).toContain("Password");
    expect(login).toContain("Forgot Password?");
    expect(login).toContain("showPassword");
    expect(login).toContain("Login");
    expect(login).not.toContain("supabase");
    expect(login).not.toContain("signInWithPassword");
    expect(login).not.toContain("/hospital/dashboard");
    expect(login).not.toContain("/provider/dashboard");
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

  it("adds the hospital platform without removing the approved homepage composition", () => {
    const homepage = readFileSync(join(root, "src/routes/index.tsx"), "utf8");
    for (const section of [
      "Hero",
      "HospitalsSection",
      "DashboardSection",
      "AppSection",
      "EmergencyMoment",
      "HowItWorks",
      "ProvidersSection",
      "Categories",
      "WhyResq",
      "Trust",
      "JoinSteps",
      "Faq",
      "FinalCta",
    ]) {
      expect(homepage).toContain(`<${section} />`);
    }
    expect(homepage).toContain("<ForHospitalsSection />");
    expect(existsSync(join(root, "src/routes/hospital-platform.tsx"))).toBe(true);
  });

  it("device request migration is additive, permissioned, audited, and realtime-ready", () => {
    const sql = readFileSync(
      join(root, "drizzle/migrations/0007_website_admin_requests.sql"),
      "utf8",
    );
    expect(sql).toContain("create table if not exists public.device_requests");
    expect(sql).toContain("create table if not exists public.admin_notifications");
    expect(sql).toContain("change_device_request_status");
    expect(sql).toContain("has_admin_permission");
    expect(sql).toContain("set_admin_staff_role");
    expect(sql).toContain("update_own_admin_profile");
    expect(sql).toContain("admin_notification_inbox");
    expect(sql).toContain("insert into public.device_request_history");
    expect(sql).toContain('drop policy if exists "admins list profiles"');
    expect(sql).toContain("supabase_realtime");
    expect(sql).not.toMatch(/^\s*(drop table|truncate)\b/im);
  });
});
