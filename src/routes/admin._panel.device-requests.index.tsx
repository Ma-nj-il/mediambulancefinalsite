import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Pager,
  Panel,
  RequestStatusBadge,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDate, friendlyError, type RequestStatus } from "@/lib/admin";
import { syncApprovalDeviceRequests } from "@/lib/approval-device-requests.functions";

export const Route = createFileRoute("/admin/_panel/device-requests/")({
  head: () => ({ meta: [{ title: "GPS & Device Requests — RESQ Admin" }] }),
  component: DeviceRequests,
});

const PAGE_SIZE = 10;
const categories: Record<string, string> = {
  gps: "GPS",
  dashcam: "Dashcam",
  gps_dashcam: "GPS + Dashcam",
};

async function findDeviceRequestIds(search: string) {
  const pattern = `%${search}%`;
  const [requestMatches, hospitalMatches] = await Promise.all([
    supabase.from("device_requests").select("id").ilike("request_number", pattern).limit(5000),
    supabase.from("hospital_applications").select("id").ilike("hospital_name", pattern).limit(5000),
  ]);
  if (requestMatches.error) throw requestMatches.error;
  if (hospitalMatches.error) throw hospitalMatches.error;

  const ids = new Set((requestMatches.data ?? []).map((row) => row.id));
  const hospitalIds = (hospitalMatches.data ?? []).map((row) => row.id);
  if (hospitalIds.length) {
    const hospitalRequests = await supabase
      .from("device_requests")
      .select("id")
      .in("hospital_application_id", hospitalIds)
      .limit(5000);
    if (hospitalRequests.error) throw hospitalRequests.error;
    for (const row of hospitalRequests.data ?? []) ids.add(row.id);
  }
  return [...ids];
}

function DeviceRequests() {
  const syncRequests = useServerFn(syncApprovalDeviceRequests);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-device-requests", search, status, category, page],
    queryFn: async () => {
      // Also recover requests for hospitals approved before automatic creation,
      // or when the follow-up request after an approval was interrupted.
      await syncRequests({ data: {} });
      let builder = supabase
        .from("device_requests")
        .select("*, hospital_applications!inner(hospital_name, contact_person, phone)", {
          count: "exact",
        })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (status !== "all") builder = builder.eq("status", status as RequestStatus);
      if (category !== "all") builder = builder.eq("device_category", category);
      const searchValue = search.trim();
      if (searchValue) {
        const ids = await findDeviceRequestIds(searchValue);
        if (!ids.length) return { rows: [], count: 0 };
        builder = builder.in("id", ids);
      }
      const { data, error, count } = await builder;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });

  const exportCsv = async () => {
    let builder = supabase
      .from("device_requests")
      .select(
        "request_number, device_category, gps_quantity, dashcam_quantity, vehicle_quantity, status, created_at, hospital_applications!inner(hospital_name)",
      )
      .order("created_at", { ascending: false })
      .limit(5000);
    if (status !== "all") builder = builder.eq("status", status as RequestStatus);
    if (category !== "all") builder = builder.eq("device_category", category);
    const { data, error } = await builder;
    if (error) return;
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const lines = [
      "Request,Hospital,Category,GPS Units,Dashcam Units,Vehicles,Status,Submitted",
      ...(data ?? []).map((row) =>
        [
          row.request_number,
          row.hospital_applications.hospital_name,
          categories[row.device_category],
          row.gps_quantity,
          row.dashcam_quantity,
          row.vehicle_quantity,
          row.status,
          row.created_at,
        ]
          .map(quote)
          .join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "resq-device-requests.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title="GPS & Device Requests"
        copy="Equipment requests from approved hospitals and the device request form."
        actions={
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-navy"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />
      <Panel>
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <input
            aria-label="Search device requests"
            className={inputCls}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Request or hospital"
          />
          <select
            aria-label="Filter by status"
            className={inputCls}
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {[
              "new",
              "pending",
              "under_review",
              "approved",
              "rejected",
              "in_progress",
              "completed",
              "cancelled",
            ].map((value) => (
              <option key={value} value={value}>
                {value.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <select
            aria-label="Filter by category"
            className={inputCls}
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All devices</option>
            {Object.entries(categories).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorNote message={friendlyError(query.error)} onRetry={() => query.refetch()} />
        ) : !query.data?.rows.length ? (
          <EmptyState
            title="No device requests found"
            copy={
              search.trim() || status !== "all" || category !== "all"
                ? "Try another search or clear the filters."
                : "Approving a hospital with GPS hardware selected creates a request with one unit per ambulance. GPS + Dash Camera creates one of each."
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    {[
                      "Request",
                      "Hospital",
                      "Category",
                      "GPS",
                      "Dashcam",
                      "Vehicles",
                      "Submitted",
                      "Status",
                      "",
                    ].map((heading) => (
                      <th key={heading} className="px-3 py-3">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {query.data.rows.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-4 font-bold text-navy">{row.request_number}</td>
                      <td className="px-3 py-4">
                        <span className="font-semibold text-navy">
                          {row.hospital_applications.hospital_name}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {row.hospital_applications.contact_person}
                        </span>
                      </td>
                      <td className="px-3 py-4">{categories[row.device_category]}</td>
                      <td className="px-3 py-4">{row.gps_quantity}</td>
                      <td className="px-3 py-4">{row.dashcam_quantity}</td>
                      <td className="px-3 py-4">{row.vehicle_quantity ?? "—"}</td>
                      <td className="px-3 py-4">{fmtDate(row.created_at)}</td>
                      <td className="px-3 py-4">
                        <RequestStatusBadge status={row.status} />
                      </td>
                      <td className="px-3 py-4">
                        <Link
                          to="/admin/device-requests/$id"
                          params={{ id: row.id }}
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
            <Pager
              page={page}
              pages={Math.max(1, Math.ceil(query.data.count / PAGE_SIZE))}
              onPage={setPage}
            />
          </>
        )}
      </Panel>
    </>
  );
}
