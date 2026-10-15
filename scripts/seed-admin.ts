/**
 * Seeds the initial administrator. Run once: `bun scripts/seed-admin.ts`
 * Reads ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD (defaults: admin / admin123 for development only).
 * The seeded admin is flagged must_change_password and is prompted to replace it after first sign-in.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env["SUPABASE_URL"];
const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");

const username = (process.env["ADMIN_SEED_USERNAME"] ?? "admin").toLowerCase();
const password = process.env["ADMIN_SEED_PASSWORD"] ?? "admin123";
const email = `${username}@admin.resq.local`;

const db = createClient(url, key, { auth: { persistSession: false } });

const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
let user = list?.users.find((u) => u.email === email);
if (!user) {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) throw error;
  user = data.user;
  console.log("Created admin user", username);
} else {
  console.log("Admin user already exists", username);
}
await db.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });
await db.from("admin_profiles").upsert({ user_id: user.id, username, display_name: "Administrator" }, { onConflict: "user_id", ignoreDuplicates: true });
console.log("Seed complete");
