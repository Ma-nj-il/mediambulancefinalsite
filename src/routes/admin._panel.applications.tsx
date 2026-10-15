import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  StatusBadge,
  Pager,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDate, statusMeta, type AppStatus } from "@/lib/admin";
import { gpsLabel, typeLabels } from "@/lib/registration";

export const Route = createFileRoute("/admin/_panel/applications")({
  head: () => ({ meta: [{ title: "Hospital Applications — RESQ Admin" }] }),
  component: Applications,
});

const filters = [
  "all",
  "pending",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
] as const;
const sorts = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "updated", label: "Last updated" },
] as const;
const PAGE_SIZE = 10;

export function toCsv(rows: Record<string, unknown>[]) {
  const head = [
    "reference",
    "hospital",
    "contact",
    "phone",
    "email",
    "address",
    "district",
    "ambulances",
    "categories",
    "types",
    "gps",
    "message",
    "status",
    "submitted",
    "updated",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}

function Applications() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<(typeof sorts)[number]["value"]>("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const reviewers = useQuery({
    queryKey: ["admin-reviewers"],
    queryFn: async () =>
      (await supabase.from("admin_profiles").select("user_id, username, display_name")).data ?? [],
  });
  const reviewerName = (uid: string | null) =>
    reviewers.data?.find((r) => r.user_id === uid)?.display_name ??
    reviewers.data?.find((r) => r.user_id === uid)?.username ??
    "—";

  const q = useQuery({
    queryKey: ["admin-applications", filter, search, sort, from, to, page],
    queryFn: async () => {
      const orderCol = sort === "updated" ? "updated_at" : "submitted_at";
      const ascending = sort === "oldest";
      let qb = supabase
        .from("hospital_applications")
        .select(
          "id, application_reference, hospital_name, contact_person, phone, city_district, status, submitted_at, updated_at, ambulance_count, assigned_reviewer, ambulance_categories, ambulance_types, gps_availability, preferred_gps_tracking_method",
          { count: "exact" },
        )
        .order(orderCol, { ascending })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (filter !== "all") qb = qb.eq("status", filter as AppStatus);
      if (from) qb = qb.gte("submitted_at", new Date(from).toISOString());
      if (to) qb = qb.lt("submitted_at", new Date(new Date(to).getTime() + 864e5).toISOString());
      const s = search.trim();
      if (s)
        qb = qb.or(
          `hospital_name.ilike.%${s}%,contact_person.ilike.%${s}%,application_reference.ilike.%${s}%,city_district.ilike.%${s}%`,
        );
      const { data, error, count } = await qb;
      if (error) throw error;
      return { rows: data, total: count ?? 0 };
    },
  });

  const pages = useMemo(() => Math.max(1, Math.ceil((q.data?.total ?? 0) / PAGE_SIZE)), [q.data]);

  const onExport = async () => {
    setExporting(true);
    setExportError(null);
    try {
      let qb = supabase
        .from("hospital_applications")
        .select(
          "application_reference, hospital_name, contact_person, phone, email, hospital_address, city_district, ambulance_count, ambulance_categories, ambulance_types, gps_availability, preferred_gps_tracking_method, additional_message, status, submitted_at, updated_at",
        )
        .order("submitted_at", { ascending: false })
        .limit(2000);
      if (filter !== "all") qb = qb.eq("status", filter as AppStatus);
      if (from) qb = qb.gte("submitted_at", new Date(from).toISOString());
      if (to) qb = qb.lt("submitted_at", new Date(new Date(to).getTime() + 864e5).toISOString());
      const s = search.trim();
      if (s)
        qb = qb.or(
          `hospital_name.ilike.%${s}%,contact_person.ilike.%${s}%,application_reference.ilike.%${s}%`,
        );
      const { data, error } = await qb;
      if (error) throw error;
      const rows = (data ?? []).map((r) => ({
        reference: r.application_reference,
        hospital: r.hospital_name,
        contact: r.contact_person,
        phone: r.phone,
        email: r.email,
        address: r.hospital_address,
        district: r.city_district,
        ambulances: r.ambulance_count,
        categories: r.ambulance_categories,
        types: (r.ambulance_types ?? []).join("; "),
        gps: r.preferred_gps_tracking_method ?? r.gps_availability,
        message: r.additional_message,
        status: statusMeta[r.status as AppStatus].label,
        submitted: r.submitted_at,
        updated: r.updated_at,
      }));
      const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resq-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const resetPage = () => setPage(1);

  return (
    <>
      <PageTitle
        title="Hospital Applications"
        copy="Every submission from the Join as Hospital form appears here."
        actions={
          <button
            onClick={onExport}
            disabled={exporting}
            className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-navy hover:border-primary disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        }
      />
      {exportError && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
        >
          {exportError}
        </p>
      )}
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            aria-label="Search applications"
            placeholder="Search hospital, contact, reference…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            className={`${inputCls} w-full sm:w-64`}
          />
          <select
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              resetPage();
            }}
            className={inputCls}
          >
            {filters.map((f) => (
              <option key={f} value={f}>
                {f === "all" ? "All applications" : statusMeta[f].label}
              </option>
            ))}
          </select>
          <select
            aria-label="Sort applications"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as typeof sort);
              resetPage();
            }}
            className={inputCls}
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Submitted from"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              resetPage();
            }}
            className={inputCls}
          />
          <input
            type="date"
            aria-label="Submitted to"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              resetPage();
            }}
            className={inputCls}
          />
        </div>
        {q.isLoading ? (
          <Loading />
        ) : q.error || !q.data ? (
          <ErrorNote onRetry={() => q.refetch()} />
        ) : q.data.rows.length === 0 ? (
          <EmptyState
            title="No applications found"
            copy="Try a different search or filter. New submissions from the public website will appear here."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="py-2 pr-3">ID</th>
                    <th className="pr-3">Hospital</th>
                    <th className="pr-3">Contact</th>
                    <th className="pr-3">District</th>
                    <th className="pr-3">Submitted</th>
                    <th className="pr-3">Updated</th>
                    <th className="pr-3">Amb.</th>
                    <th className="pr-3">Types</th>
                    <th className="pr-3">GPS</th>
                    <th className="pr-3">Reviewer</th>
                    <th className="pr-3">Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.rows.map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-secondary/60">
                      <td className="py-2.5 pr-3 font-bold text-primary">
                        {a.application_reference}
                      </td>
                      <td className="pr-3 font-semibold text-navy">{a.hospital_name}</td>
                      <td className="pr-3 text-muted-foreground">
                        {a.contact_person}
                        <br />
                        {a.phone}
                      </td>
                      <td className="pr-3 text-muted-foreground">{a.city_district ?? "—"}</td>
                      <td className="pr-3 text-muted-foreground">{fmtDate(a.submitted_at)}</td>
                      <td className="pr-3 text-muted-foreground">{fmtDate(a.updated_at)}</td>
                      <td className="pr-3 text-muted-foreground">{a.ambulance_count}</td>
                      <td className="pr-3 text-muted-foreground">
                        {typeLabels(
                          a.ambulance_types?.length
                            ? a.ambulance_types
                            : (a.ambulance_categories
                                ?.split(",")
                                .map((s) => s.trim())
                                .filter(Boolean) ?? []),
                        ).join(", ") || "—"}
                      </td>
                      <td className="pr-3 text-muted-foreground">
                        {gpsLabel(a.preferred_gps_tracking_method ?? a.gps_availability)}
                      </td>
                      <td className="pr-3 text-muted-foreground">
                        {reviewerName(a.assigned_reviewer)}
                      </td>
                      <td className="pr-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td>
                        <Link
                          to="/admin/applications/$id"
                          params={{ id: a.id }}
                          className="font-bold text-primary hover:underline"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </Panel>
    </>
  );
}
