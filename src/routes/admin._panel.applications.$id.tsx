import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  StatusBadge,
} from "@/components/admin-ui";
import { fmtDateTime, friendlyError, statusMeta, type AppStatus } from "@/lib/admin";
import {
  canTransition,
  CHECKLIST_ITEMS,
  isApprovalReady,
  missingMandatoryChecks,
} from "@/lib/workflow";
import { DOC_TYPES } from "@/lib/applications.functions";
import { gpsLabel, typeLabels } from "@/lib/registration";

export const Route = createFileRoute("/admin/_panel/applications/$id")({
  head: () => ({ meta: [{ title: "Application detail — RESQ Admin" }] }),
  component: Detail,
});

const nextActions: { value: AppStatus; label: string; needsReason: boolean }[] = [
  { value: "under_review", label: "Mark under review", needsReason: false },
  { value: "changes_requested", label: "Request corrections", needsReason: true },
  { value: "approved", label: "Approve", needsReason: false },
  { value: "rejected", label: "Reject", needsReason: true },
];

function Detail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [action, setAction] = useState<AppStatus | null>(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin-application", id],
    queryFn: async () => {
      const [app, ambs, drvs, docs, hist, notes, admins, checks] = await Promise.all([
        supabase.from("hospital_applications").select("*").eq("id", id).single(),
        supabase
          .from("ambulances")
          .select("*")
          .eq("hospital_application_id", id)
          .order("created_at"),
        supabase.from("drivers").select("*").eq("hospital_application_id", id).order("created_at"),
        supabase
          .from("application_documents")
          .select("*")
          .eq("hospital_application_id", id)
          .order("uploaded_at"),
        supabase
          .from("application_status_history")
          .select("*")
          .eq("hospital_application_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("application_notes")
          .select("id, body, created_at, author_id")
          .eq("hospital_application_id", id)
          .order("created_at", { ascending: false }),
        supabase.from("admin_profiles").select("user_id, username, display_name"),
        supabase
          .from("application_checklist")
          .select("check_key, is_checked")
          .eq("hospital_application_id", id),
      ]);
      if (app.error || !app.data) throw new Error("not found");
      if (ambs.error || drvs.error || docs.error || hist.error) throw new Error("load failed");
      // Notes/admins/checklist land in newer migrations — tolerate until applied.
      return {
        app: app.data,
        ambulances: ambs.data,
        drivers: drvs.data,
        docs: docs.data,
        history: hist.data,
        notes: notes.error ? [] : (notes.data ?? []),
        admins: admins.error ? [] : (admins.data ?? []),
        checks: checks.error ? [] : (checks.data ?? []),
      };
    },
  });

  const mut = useMutation({
    mutationFn: async ({ next, note }: { next: AppStatus; note: string | undefined }) => {
      const { error } =
        note === undefined
          ? await supabase.rpc("change_application_status", { _id: id, _new: next })
          : await supabase.rpc("change_application_status", { _id: id, _new: next, _reason: note });
      if (error) throw error;
    },
    onSuccess: async (_, v) => {
      setMsg(`Application ${statusMeta[v.next].label.toLowerCase()} successfully.`);
      setAction(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-application", id] });
      await qc.invalidateQueries({ queryKey: ["admin-applications"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    },
    onError: (e) => setErr(friendlyError(e)),
  });

  const [followUp, setFollowUp] = useState<string | null>(null);
  const [reviewer, setReviewer] = useState<string | null>(null);
  const [noteBody, setNoteBody] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const saveReviewMeta = async () => {
    setErr(null);
    setMsg(null);
    setSavingMeta(true);
    try {
      const { error } = await supabase
        .from("hospital_applications")
        .update({
          follow_up_date: followUp === "" ? null : (followUp ?? app?.follow_up_date ?? null),
          assigned_reviewer: reviewer === "" ? null : (reviewer ?? app?.assigned_reviewer ?? null),
        })
        .eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: "application.review.updated",
        _entity_type: "hospital_application",
        _entity_id: id,
        _metadata: { follow_up_date: followUp, assigned_reviewer: reviewer },
      });
      setMsg("Review details saved.");
      setFollowUp(null);
      setReviewer(null);
      await qc.invalidateQueries({ queryKey: ["admin-application", id] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setSavingMeta(false);
    }
  };

  const toggleCheck = async (key: string, next: boolean) => {
    setErr(null);
    setMsg(null);
    setSavingMeta(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("application_checklist").upsert(
        {
          hospital_application_id: id,
          check_key: key,
          is_checked: next,
          checked_by: next ? (u.user?.id ?? null) : null,
          checked_at: next ? new Date().toISOString() : null,
        },
        { onConflict: "hospital_application_id,check_key" },
      );
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: next ? "application.check.verified" : "application.check.unmarked",
        _entity_type: "hospital_application",
        _entity_id: id,
        _metadata: { check_key: key },
      });
      await qc.invalidateQueries({ queryKey: ["admin-application", id] });
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setSavingMeta(false);
    }
  };

  const addNote = async () => {
    const body = noteBody.trim();
    if (!body) {
      setErr("Write a note before adding it.");
      return;
    }
    if (body.length > 2000) {
      setErr("Notes must be under 2000 characters.");
      return;
    }
    setErr(null);
    setMsg(null);
    setSavingMeta(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("application_notes").insert({
        hospital_application_id: id,
        author_id: u.user?.id ?? null,
        body,
      });
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: "application.note.added",
        _entity_type: "hospital_application",
        _entity_id: id,
        _metadata: {},
      });
      setNoteBody("");
      setMsg("Internal note added.");
      await qc.invalidateQueries({ queryKey: ["admin-application", id] });
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setSavingMeta(false);
    }
  };

  const download = async (key: string, name: string) => {
    setDownloading(key);
    setErr(null);
    try {
      const { data, error } = await supabase.storage.from("application-documents").download(key);
      if (error || !data) throw new Error("download failed");
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setErr("Couldn't download that document. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  if (q.isLoading) return <Loading />;
  if (q.error || !q.data) return <ErrorNote onRetry={() => q.refetch()} />;
  const { app, ambulances, drivers, docs, history, notes, admins, checks } = q.data;
  const checkedKeys = checks.filter((c) => c.is_checked).map((c) => c.check_key);
  const approvalReady = isApprovalReady(checkedKeys);
  const missingChecks = missingMandatoryChecks(checkedKeys);

  return (
    <>
      <PageTitle
        title={app.hospital_name}
        copy={`${app.application_reference} · submitted ${fmtDateTime(app.submitted_at)}`}
        actions={
          <Link to="/admin/applications" className="text-sm font-bold text-primary hover:underline">
            ← All applications
          </Link>
        }
      />
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

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel title="Hospital profile">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Hospital name", app.hospital_name],
                ["Address", app.hospital_address],
                ["City / district", app.city_district ?? "—"],
                ["Contact person", app.contact_person],
                ["Phone", app.phone],
                ["Email", app.email ?? "—"],
                ["Ambulances declared", String(app.ambulance_count)],
                ["Categories", app.ambulance_categories ?? "—"],
                ["GPS availability", app.gps_availability ?? "—"],
                ["Status", null],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-0.5 font-semibold text-navy">
                    {k === "Status" ? <StatusBadge status={app.status} /> : (v as string)}
                  </dd>
                </div>
              ))}
            </dl>
            {app.review_notes && (
              <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">
                <span className="font-bold text-navy">Review notes: </span>
                {app.review_notes}
              </p>
            )}
            {app.rejection_reason && (
              <p className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm">
                <span className="font-bold text-primary">Rejection reason: </span>
                {app.rejection_reason}
              </p>
            )}
          </Panel>

          <Panel title="Onboarding details">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Preferred GPS tracking method
                </dt>
                <dd className="mt-0.5 font-semibold text-navy">
                  {gpsLabel(app.preferred_gps_tracking_method ?? app.gps_availability)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Total ambulances
                </dt>
                <dd className="mt-0.5 font-semibold text-navy">{app.ambulance_count}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Ambulance types
                </dt>
                <dd className="mt-1.5 flex flex-wrap gap-1.5">
                  {typeLabels(
                    app.ambulance_types?.length
                      ? app.ambulance_types
                      : (app.ambulance_categories
                          ?.split(",")
                          .map((s) => s.trim())
                          .filter(Boolean) ?? []),
                  ).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-navy"
                    >
                      {t}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
            {app.additional_message && (
              <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm">
                <span className="font-bold text-navy">Additional message: </span>
                {app.additional_message}
              </p>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              The GPS method is the hospital&apos;s initial preference, not installed hardware.
            </p>
          </Panel>

          <Panel title={`Ambulances (${ambulances.length})`}>
            {ambulances.length === 0 ? (
              <EmptyState title="No vehicle records" />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {ambulances.map((a) => (
                  <li key={a.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                    <span className="font-bold text-navy">{a.registration_number}</span>
                    <span className="text-muted-foreground">
                      {a.category ?? "—"} · GPS: {a.gps_available ?? "—"} · {a.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Drivers (${drivers.length})`}>
            {drivers.length === 0 ? (
              <EmptyState title="No driver records" />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {drivers.map((d) => (
                  <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2.5">
                    <span className="font-bold text-navy">{d.full_name}</span>
                    <span className="text-muted-foreground">
                      {d.phone} · Licence: {d.licence_number}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title={`Supporting documents (${docs.length})`}>
            {docs.length === 0 ? (
              <EmptyState title="No documents uploaded" />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {docs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      <span className="font-bold text-navy">
                        {DOC_TYPES[d.document_type as keyof typeof DOC_TYPES] ?? d.document_type}
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {d.original_filename} · {(d.file_size / 1024).toFixed(0)} KB
                      </span>
                    </span>
                    <button
                      disabled={downloading === d.private_storage_key}
                      onClick={() => download(d.private_storage_key, d.original_filename)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-navy hover:border-primary"
                    >
                      {downloading === d.private_storage_key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}{" "}
                      Download
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              Documents are stored privately and only accessible to signed-in administrators.
            </p>
          </Panel>

          <Panel title="Status history">
            {history.length === 0 ? (
              <EmptyState title="No history yet" />
            ) : (
              <ol className="space-y-3 border-l-2 border-border pl-4 text-sm">
                {history.map((h) => (
                  <li key={h.id}>
                    <span className="font-bold text-navy">
                      {h.previous_status ? statusMeta[h.previous_status].label : "—"} →{" "}
                      {statusMeta[h.new_status].label}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      · {fmtDateTime(h.created_at)}
                      {h.reason ? ` · ${h.reason}` : ""}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </Panel>

          <Panel title={`Internal notes (${notes.length})`}>
            {notes.length === 0 ? (
              <EmptyState title="No notes yet" copy="Notes are private to administrators." />
            ) : (
              <ol className="space-y-3 text-sm">
                {notes.map((n) => (
                  <li key={n.id} className="rounded-xl bg-secondary px-4 py-3">
                    <p className="whitespace-pre-line text-navy">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {admins.find((a) => a.user_id === n.author_id)?.display_name ??
                        admins.find((a) => a.user_id === n.author_id)?.username ??
                        "Administrator"}{" "}
                      · {fmtDateTime(n.created_at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-4">
              <label
                htmlFor="internal-note"
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Add internal note
              </label>
              <textarea
                id="internal-note"
                rows={3}
                value={noteBody}
                onChange={(e) => setNoteBody(e.target.value)}
                maxLength={2000}
                placeholder="Private to administrators…"
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                disabled={savingMeta}
                onClick={addNote}
                className="mt-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy hover:border-primary disabled:opacity-50"
              >
                {savingMeta ? "Adding…" : "Add Note"}
              </button>
            </div>
          </Panel>

          <Panel
            title="Verification checklist"
            action={
              approvalReady ? (
                <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                  Ready for approval
                </span>
              ) : (
                <span className="rounded-full bg-warning/20 px-2.5 py-0.5 text-xs font-semibold text-navy">
                  {missingChecks.length} mandatory left
                </span>
              )
            }
          >
            <p className="mb-3 text-xs text-muted-foreground">
              Only an authorized reviewer can mark items verified. Approval is blocked until all
              mandatory items are checked.
            </p>
            <ul className="space-y-2">
              {CHECKLIST_ITEMS.map((item) => {
                const done = checkedKeys.includes(item.key);
                return (
                  <li key={item.key}>
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2.5 text-sm hover:border-primary">
                      <input
                        type="checkbox"
                        checked={done}
                        disabled={savingMeta}
                        onChange={(e) => toggleCheck(item.key, e.target.checked)}
                        className="h-4 w-4 accent-red-700"
                        aria-label={item.label}
                      />
                      <span className="flex-1 font-semibold text-navy">{item.label}</span>
                      {!item.mandatory && (
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                          Optional
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Review actions">
            {!action ? (
              <div className="grid gap-2">
                {nextActions
                  .filter((a) => canTransition(app.status, a.value))
                  .map((a) => (
                    <button
                      key={a.value}
                      onClick={() => {
                        setErr(null);
                        setMsg(null);
                        setAction(a.value);
                      }}
                      className={`rounded-xl px-4 py-2.5 text-sm font-bold ${a.value === "approved" ? "bg-success text-white" : a.value === "rejected" ? "bg-primary text-primary-foreground" : "border border-border text-navy hover:border-primary"}`}
                    >
                      {a.label} ({statusMeta[a.value].label})
                    </button>
                  ))}
                {nextActions.every((a) => !canTransition(app.status, a.value)) && (
                  <p className="rounded-xl bg-secondary px-4 py-3 text-sm text-muted-foreground">
                    This application is {statusMeta[app.status].label.toLowerCase()} — a final
                    state. The record is kept for history; no further actions apply.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-navy">
                  Confirm: {action ? statusMeta[action].label : ""}
                </p>
                {nextActions.find((a) => a.value === action)?.needsReason && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    A reason is required and will be saved.
                  </p>
                )}
                {action === "approved" && !approvalReady && (
                  <p
                    role="alert"
                    className="mt-3 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
                  >
                    Complete the verification checklist first ({missingChecks.length} mandatory{" "}
                    {missingChecks.length === 1 ? "item" : "items"} remaining). Approval is also
                    blocked on the server until then.
                  </p>
                )}
                <textarea
                  aria-label="Reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={
                    action === "rejected"
                      ? "Rejection reason…"
                      : action === "changes_requested"
                        ? "What needs to be corrected?…"
                        : "Optional note…"
                  }
                  className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                />
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={mut.isPending || (action === "approved" && !approvalReady)}
                    onClick={() => mut.mutate({ next: action, note: reason.trim() || undefined })}
                    className="flex-1 rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-navy-foreground disabled:opacity-50"
                  >
                    {mut.isPending ? "Saving…" : "Confirm"}
                  </button>
                  <button
                    onClick={() => {
                      setAction(null);
                      setReason("");
                    }}
                    className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-navy"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </Panel>
          <Panel title="Record">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Submitted</dt>
                <dd className="font-semibold text-navy">{fmtDateTime(app.submitted_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Reviewed</dt>
                <dd className="font-semibold text-navy">{fmtDateTime(app.reviewed_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Approved</dt>
                <dd className="font-semibold text-navy">{fmtDateTime(app.approved_at)}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Review management">
            <div className="space-y-3 text-sm">
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Follow-up date
                </span>
                <input
                  type="date"
                  aria-label="Follow-up date"
                  value={followUp ?? app.follow_up_date?.slice(0, 10) ?? ""}
                  onChange={(e) => setFollowUp(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Assigned reviewer
                </span>
                <select
                  aria-label="Assigned reviewer"
                  value={reviewer ?? app.assigned_reviewer ?? ""}
                  onChange={(e) => setReviewer(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3"
                >
                  <option value="">Unassigned</option>
                  {admins.map((a) => (
                    <option key={a.user_id} value={a.user_id}>
                      {a.display_name ?? a.username}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={savingMeta}
                onClick={saveReviewMeta}
                className="w-full rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-navy-foreground disabled:opacity-50"
              >
                {savingMeta ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
