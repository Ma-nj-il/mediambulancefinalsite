import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  PartnerBadge,
  inputCls,
} from "@/components/admin-ui";
import { fmtDateTime, friendlyError } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/hospitals/$id")({
  head: () => ({ meta: [{ title: "Hospital detail — RESQ Admin" }] }),
  component: HospitalDetail,
});

function HospitalDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    hospital_name: "",
    contact_person: "",
    phone: "",
    hospital_address: "",
    city_district: "",
  });
  const [confirm, setConfirm] = useState<null | "suspend" | "reactivate">(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin-hospital", id],
    queryFn: async () => {
      const [h, ambs, drvs] = await Promise.all([
        supabase
          .from("hospital_applications")
          .select("*")
          .eq("id", id)
          .eq("status", "approved")
          .single(),
        supabase
          .from("ambulances")
          .select("*")
          .eq("hospital_application_id", id)
          .order("created_at"),
        supabase.from("drivers").select("*").eq("hospital_application_id", id).order("created_at"),
      ]);
      if (h.error || !h.data) throw new Error("not found");
      if (ambs.error || drvs.error) throw new Error("load failed");
      return { h: h.data, ambulances: ambs.data, drivers: drvs.data };
    },
  });

  const startEdit = () => {
    if (!q.data) return;
    setForm({
      hospital_name: q.data.h.hospital_name,
      contact_person: q.data.h.contact_person,
      phone: q.data.h.phone,
      hospital_address: q.data.h.hospital_address,
      city_district: q.data.h.city_district ?? "",
    });
    setEditing(true);
  };

  const saveEdit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("hospital_applications")
        .update({
          hospital_name: form.hospital_name.trim(),
          contact_person: form.contact_person.trim(),
          phone: form.phone.trim(),
          hospital_address: form.hospital_address.trim(),
          city_district: form.city_district.trim() === "" ? null : form.city_district.trim(),
        })
        .eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: "hospital.profile.updated",
        _entity_type: "hospital_application",
        _entity_id: id,
        _metadata: { fields: Object.keys(form) },
      });
    },
    onSuccess: async () => {
      setMsg("Hospital information updated.");
      setEditing(false);
      await qc.invalidateQueries({ queryKey: ["admin-hospital", id] });
    },
    onError: (e) => setErr(friendlyError(e)),
  });

  const partnership = useMutation({
    mutationFn: async (status: "active" | "suspended") => {
      const { error } = reason.trim()
        ? await supabase.rpc("set_partnership_status", {
            _id: id,
            _status: status,
            _reason: reason.trim(),
          })
        : await supabase.rpc("set_partnership_status", { _id: id, _status: status });
      if (error) throw error;
    },
    onSuccess: async () => {
      setMsg("Partnership status updated. History preserved.");
      setConfirm(null);
      setReason("");
      await qc.invalidateQueries({ queryKey: ["admin-hospital", id] });
      await qc.invalidateQueries({ queryKey: ["admin-hospitals"] });
    },
    onError: (e) => setErr(friendlyError(e)),
  });

  if (q.isLoading) return <Loading />;
  if (q.error || !q.data) return <ErrorNote onRetry={() => q.refetch()} />;
  const { h, ambulances, drivers } = q.data;
  const suspended = h.partnership_status === "suspended";

  return (
    <>
      <PageTitle
        title={h.hospital_name}
        copy={`${h.application_reference} · approved ${fmtDateTime(h.approved_at)}`}
        actions={
          <Link to="/admin/hospitals" className="text-sm font-bold text-primary hover:underline">
            ← All hospitals
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
        <Panel
          title="Hospital information"
          className="xl:col-span-2"
          action={
            !editing && (
              <button
                onClick={startEdit}
                className="text-sm font-bold text-primary hover:underline"
              >
                Edit
              </button>
            )
          }
        >
          {!editing ? (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Contact person", h.contact_person],
                ["Phone", h.phone],
                ["Email", h.email ?? "—"],
                ["Address", h.hospital_address],
                ["City / district", h.city_district ?? "—"],
                ["Ambulances", String(h.ambulance_count)],
                ["Categories", h.ambulance_categories ?? "—"],
                ["GPS", h.gps_availability ?? "—"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-0.5 font-semibold text-navy">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {(Object.keys(form) as (keyof typeof form)[]).map((k) => (
                <label key={k} className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {k.replace("_", " ")}
                  </span>
                  <input
                    value={form[k]}
                    onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                    className={`${inputCls} w-full`}
                  />
                </label>
              ))}
              <div className="flex gap-2 sm:col-span-2">
                <button
                  disabled={saveEdit.isPending}
                  onClick={() => saveEdit.mutate()}
                  className="rounded-xl bg-navy px-4 py-2 text-sm font-bold text-navy-foreground disabled:opacity-50"
                >
                  {saveEdit.isPending ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Panel>
        <Panel title="Partnership">
          <p className="text-sm text-muted-foreground">Current status</p>
          <p className="mt-1">
            <PartnerBadge status={h.partnership_status} />
          </p>
          {!confirm ? (
            <button
              onClick={() => setConfirm(suspended ? "reactivate" : "suspend")}
              className={`mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold ${suspended ? "bg-success text-white" : "bg-primary text-primary-foreground"}`}
            >
              {suspended ? "Reactivate partnership" : "Suspend partnership"}
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-sm font-bold text-navy">
                Confirm {confirm}? Historical applications are preserved.
              </p>
              <textarea
                aria-label="Reason"
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional reason…"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="mt-2 flex gap-2">
                <button
                  disabled={partnership.isPending}
                  onClick={() => partnership.mutate(confirm === "suspend" ? "suspended" : "active")}
                  className="flex-1 rounded-xl bg-navy px-4 py-2 text-sm font-bold text-navy-foreground disabled:opacity-50"
                >
                  {partnership.isPending ? "Saving…" : "Confirm"}
                </button>
                <button
                  onClick={() => setConfirm(null)}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title={`Ambulances (${ambulances.length})`}>
          <ul className="divide-y divide-border text-sm">
            {ambulances.map((a) => (
              <li key={a.id} className="flex justify-between gap-2 py-2">
                <span className="font-bold text-navy">{a.registration_number}</span>
                <span className="text-muted-foreground">
                  {a.category ?? "—"} · {a.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={`Drivers (${drivers.length})`}>
          <ul className="divide-y divide-border text-sm">
            {drivers.map((d) => (
              <li key={d.id} className="flex justify-between gap-2 py-2">
                <span className="font-bold text-navy">{d.full_name}</span>
                <span className="text-muted-foreground">{d.phone}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
