import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppStatus = Database["public"]["Enums"]["application_status"];
export type Application = Database["public"]["Tables"]["hospital_applications"]["Row"];

export const usernameToEmail = (u: string) => {
  const v = u.trim().toLowerCase();
  return v.includes("@") ? v : `${v}@admin.resq.local`;
};

/** Verifies the session with the auth server and checks the admin role in the database. */
export async function getAdminSession() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: isAdmin } = await supabase.rpc("has_role", {
    _user_id: data.user.id,
    _role: "admin",
  });
  if (!isAdmin) return null;
  return data.user;
}

export const statusMeta: Record<AppStatus, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-warning/20 text-navy" },
  under_review: { label: "In Progress", cls: "bg-secondary text-navy" },
  changes_requested: { label: "Changes Requested", cls: "bg-warning/20 text-navy" },
  approved: { label: "Completed", cls: "bg-success/15 text-success" },
  rejected: { label: "Rejected", cls: "bg-accent text-primary" },
};

export const fmtDate = (d: string | null) =>
  d
    ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : "—";
export const fmtDateTime = (d: string | null) =>
  d ? new Date(d).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

export function friendlyError(e: unknown) {
  const m = ((e as { message?: string })?.message ?? "").trim();
  // Never mask the server's message: an admin must see exactly why a review
  // action failed (auth, transition rule, missing reason, network). Only fall
  // back when there is genuinely no message to show.
  if (!m) return "Something went wrong. Please try again.";
  return m.length > 300 ? `${m.slice(0, 300)}…` : m;
}
