import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorNote, Loading, PageTitle, Panel, inputCls } from "@/components/admin-ui";
import { fmtDateTime } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/profile")({
  head: () => ({ meta: [{ title: "Admin Profile — RESQ Admin" }] }),
  component: Profile,
});

function Profile() {
  const qc = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const q = useQuery({
    queryKey: ["admin-own-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("no session");
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("*")
        .eq("user_id", u.user.id)
        .single();
      if (error) throw error;
      return { user: u.user, profile: data };
    },
  });

  const saveName = useMutation({
    mutationFn: async () => {
      if (!q.data) return;
      const { error } = await supabase
        .from("admin_profiles")
        .update({ display_name: displayName.trim() || null })
        .eq("user_id", q.data.user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      setMsg("Profile updated.");
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["admin-own-profile"] });
    },
    onError: () => setErr("Couldn't save the profile. Please try again."),
  });

  const changePw = useMutation({
    mutationFn: async () => {
      if (pw.length < 8) throw new Error("Password must be at least 8 characters.");
      if (pw !== pw2) throw new Error("Passwords do not match.");
      const { error } = await supabase.auth.updateUser({ password: pw });
      if (error) throw error;
      const { error: rpcErr } = await supabase.rpc("mark_admin_password_changed");
      if (rpcErr) throw rpcErr;
    },
    onSuccess: async () => {
      setMsg("Password changed successfully.");
      setPw("");
      setPw2("");
      await qc.invalidateQueries({ queryKey: ["admin-own-profile"] });
    },
    onError: (e) => setErr((e as Error).message || "Couldn't change the password."),
  });

  if (q.isLoading) return <Loading />;
  if (q.error || !q.data) return <ErrorNote onRetry={() => q.refetch()} />;
  const { user, profile } = q.data;

  return (
    <>
      <PageTitle title="Admin Profile" copy="Your administrator account." />
      {msg && (
        <p
          role="status"
          className="mb-4 rounded-xl bg-success/15 px-4 py-3 text-sm font-semibold text-success"
        >
          {msg}
        </p>
      )}
      {err && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
        >
          {err}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Account">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Username</dt>
              <dd className="font-bold text-navy">{profile.username}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-semibold text-navy">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last login</dt>
              <dd className="font-semibold text-navy">{fmtDateTime(profile.last_login_at)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Temporary password</dt>
              <dd className="font-semibold text-navy">
                {profile.must_change_password ? "Yes — change required" : "No"}
              </dd>
            </div>
          </dl>
          {!editing ? (
            <button
              onClick={() => {
                setDisplayName(profile.display_name ?? "");
                setEditing(true);
              }}
              className="mt-4 text-sm font-bold text-primary hover:underline"
            >
              Edit display name ({profile.display_name ?? "not set"})
            </button>
          ) : (
            <div className="mt-4 flex gap-2">
              <input
                aria-label="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={`${inputCls} flex-1`}
              />
              <button
                disabled={saveName.isPending}
                onClick={() => saveName.mutate()}
                className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-navy-foreground"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy"
              >
                Cancel
              </button>
            </div>
          )}
        </Panel>
        <Panel title="Change password">
          <div className="space-y-3">
            <label className="block space-y-1 text-sm font-semibold text-navy">
              New password
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                className={`${inputCls} w-full`}
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-navy">
              Confirm password
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                className={`${inputCls} w-full`}
              />
            </label>
            <button
              disabled={changePw.isPending}
              onClick={() => {
                setErr(null);
                setMsg(null);
                changePw.mutate();
              }}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
            >
              {changePw.isPending ? "Saving…" : "Change password"}
            </button>
            <p className="text-xs text-muted-foreground">
              Use at least 8 characters. Replacing the temporary development password is required
              before production.
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}
