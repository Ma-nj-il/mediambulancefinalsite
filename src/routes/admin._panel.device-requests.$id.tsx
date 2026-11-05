import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  RequestStatusBadge,
  inputCls,
} from "@/components/admin-ui";
import { fmtDateTime, friendlyError, requestStatusMeta, type RequestStatus } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/device-requests/$id")({
  head: () => ({ meta: [{ title: "Device Request Detail — RESQ Admin" }] }),
  component: DeviceRequestDetail,
});

const actions: RequestStatus[] = [
  "pending",
  "under_review",
  "approved",
  "rejected",
  "in_progress",
  "completed",
  "cancelled",
];

function DeviceRequestDetail() {
  const { id } = Route.useParams();
  const client = useQueryClient();
  const [next, setNext] = useState<RequestStatus | "">("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const query = useQuery({
    queryKey: ["admin-device-request", id],
    queryFn: async () => {
      const [request, history, notes, profiles] = await Promise.all([
        supabase
          .from("device_requests")
          .select("*, hospital_applications!inner(*)")
          .eq("id", id)
          .single(),
        supabase
          .from("device_request_history")
          .select("*")
          .eq("device_request_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("device_request_notes")
          .select("*")
          .eq("device_request_id", id)
          .order("created_at", { ascending: false }),
        supabase.rpc("list_admin_directory"),
      ]);
      if (request.error) throw request.error;
      if (history.error) throw history.error;
      if (notes.error) throw notes.error;
      return {
        request: request.data,
        history: history.data ?? [],
        notes: notes.data ?? [],
        profiles: profiles.data ?? [],
      };
    },
  });
  const statusMutation = useMutation({
    mutationFn: async () => {
      if (!next) throw new Error("Choose a status.");
      const { error } = await supabase.rpc("change_device_request_status", {
        _id: id,
        _new: next,
        ...(reason.trim() ? { _reason: reason.trim() } : {}),
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      setMessage("Request status updated.");
      setNext("");
      setReason("");
      await client.invalidateQueries({ queryKey: ["admin-device-request", id] });
      await client.invalidateQueries({ queryKey: ["admin-device-requests"] });
    },
    onError: (error) => setMessage(friendlyError(error)),
  });
  const noteMutation = useMutation({
    mutationFn: async () => {
      if (!note.trim()) throw new Error("Enter a note.");
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Session expired.");
      const { error } = await supabase
        .from("device_request_notes")
        .insert({ device_request_id: id, author_id: data.user.id, body: note.trim() });
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: "device_request.note.added",
        _entity_type: "device_request",
        _entity_id: id,
      });
    },
    onSuccess: async () => {
      setNote("");
      setMessage("Internal note added.");
      await client.invalidateQueries({ queryKey: ["admin-device-request", id] });
    },
    onError: (error) => setMessage(friendlyError(error)),
  });

  if (query.isLoading) return <Loading />;
  if (query.error || !query.data) return <ErrorNote onRetry={() => query.refetch()} />;
  const { request, history, notes, profiles } = query.data;
  const profileName = (userId: string | null) =>
    profiles.find((profile) => profile.user_id === userId)?.display_name ??
    profiles.find((profile) => profile.user_id === userId)?.username ??
    "System";

  return (
    <>
      <PageTitle
        title={request.request_number}
        copy={`${request.hospital_applications.hospital_name} · submitted ${fmtDateTime(request.created_at)}`}
        actions={
          <Link to="/admin/device-requests" className="text-sm font-bold text-primary">
            ← All device requests
          </Link>
        }
      />
      {message && (
        <p
          role="status"
          className="mb-5 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-navy"
        >
          {message}
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <Panel title="Request details">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Hospital", request.hospital_applications.hospital_name],
                ["Contact", request.hospital_applications.contact_person],
                ["Phone", request.hospital_applications.phone],
                ["Application", request.hospital_applications.application_reference],
                ["Device category", request.device_category.replaceAll("_", " + ")],
                ["GPS units", request.gps_quantity],
                ["Dashcam units", request.dashcam_quantity],
                ["Vehicle quantity", request.vehicle_quantity ?? "—"],
                ["Current status", <RequestStatusBadge status={request.status} />],
                ["Last updated", fmtDateTime(request.updated_at)],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </dt>
                  <dd className="mt-1 font-semibold text-navy">{value}</dd>
                </div>
              ))}
            </dl>
            {request.request_description && (
              <div className="mt-5 rounded-xl bg-muted p-4">
                <p className="text-xs font-bold uppercase text-muted-foreground">Description</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-navy">
                  {request.request_description}
                </p>
              </div>
            )}
          </Panel>
          <Panel title="Status history">
            {history.length ? (
              <ol className="space-y-4">
                {history.map((item) => (
                  <li key={item.id} className="border-l-2 border-primary pl-4">
                    <p className="text-sm font-bold text-navy">
                      {item.previous_status
                        ? requestStatusMeta[item.previous_status].label
                        : "Submitted"}{" "}
                      → {requestStatusMeta[item.new_status].label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fmtDateTime(item.created_at)} · {profileName(item.changed_by)}
                    </p>
                    {item.reason && <p className="mt-2 text-sm">{item.reason}</p>}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">No history recorded.</p>
            )}
          </Panel>
          <Panel title="Internal notes">
            <div className="flex gap-2">
              <textarea
                aria-label="Internal note"
                className={`${inputCls} min-h-24 flex-1`}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={2000}
              />
              <button
                disabled={noteMutation.isPending}
                onClick={() => noteMutation.mutate()}
                className="self-end rounded-xl bg-navy px-4 py-2.5 text-sm font-bold text-navy-foreground"
              >
                Add note
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {notes.map((item) => (
                <div key={item.id} className="rounded-xl bg-muted p-4">
                  <p className="whitespace-pre-wrap text-sm text-navy">{item.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {profileName(item.author_id)} · {fmtDateTime(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Panel title="Review action" className="h-fit">
          <label className="text-sm font-bold text-navy">
            New status
            <select
              className={`${inputCls} mt-2 w-full`}
              value={next}
              onChange={(event) => setNext(event.target.value as RequestStatus)}
            >
              <option value="">Choose status</option>
              {actions
                .filter((item) => item !== request.status)
                .map((item) => (
                  <option key={item} value={item}>
                    {requestStatusMeta[item].label}
                  </option>
                ))}
            </select>
          </label>
          <label className="mt-4 block text-sm font-bold text-navy">
            Reason / review note
            <textarea
              className={`${inputCls} mt-2 min-h-28 w-full`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={2000}
            />
          </label>
          <p className="mt-2 text-xs text-muted-foreground">
            A reason is required for rejection and cancellation. Every change is timestamped and
            audited.
          </p>
          <button
            disabled={!next || statusMutation.isPending}
            onClick={() => statusMutation.mutate()}
            className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {statusMutation.isPending ? "Saving…" : "Update status"}
          </button>
        </Panel>
      </div>
    </>
  );
}
