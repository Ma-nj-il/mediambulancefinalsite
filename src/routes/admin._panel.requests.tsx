import { createFileRoute, Link } from "@tanstack/react-router";
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
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDate } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/requests")({
  head: () => ({ meta: [{ title: "All Website Requests — RESQ Admin" }] }),
  component: Requests,
});

const PAGE_SIZE = 12;
const labels: Record<string, string> = {
  hospital_registration: "Hospital Registration",
  general_inquiry: "General Inquiry",
  gps_device: "GPS Device",
  dashcam: "Dashcam",
  gps_and_dashcam: "GPS + Dashcam",
};

function Requests() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-all-requests", search, status, category, from, to, page],
    queryFn: async () => {
      let builder = supabase
        .from("website_request_index")
        .select("*", { count: "exact" })
        .order("submitted_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (status !== "all") builder = builder.eq("status", status);
      if (category !== "all") builder = builder.eq("category", category);
      if (from) builder = builder.gte("submitted_at", `${from}T00:00:00`);
      if (to) builder = builder.lte("submitted_at", `${to}T23:59:59`);
      if (search.trim())
        builder = builder.or(
          `request_number.ilike.%${search.trim()}%,hospital_name.ilike.%${search.trim()}%,title.ilike.%${search.trim()}%`,
        );
      const { data, error, count } = await builder;
      if (error) throw error;
      return { rows: data ?? [], count: count ?? 0 };
    },
  });
  const destination = (source: string | null, id: string | null) =>
    source === "application"
      ? { to: "/admin/applications/$id" as const, params: { id: id! } }
      : source === "device_request"
        ? { to: "/admin/device-requests/$id" as const, params: { id: id! } }
        : { to: "/admin/inquiries" as const };
  const exportCsv = async () => {
    let builder = supabase
      .from("website_request_index")
      .select("*")
      .order("submitted_at", { ascending: false })
      .limit(5000);
    if (status !== "all") builder = builder.eq("status", status);
    if (category !== "all") builder = builder.eq("category", category);
    if (from) builder = builder.gte("submitted_at", `${from}T00:00:00`);
    if (to) builder = builder.lte("submitted_at", `${to}T23:59:59`);
    const { data } = await builder;
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      "Request,Hospital,Category,Title,Status,Submitted,Updated",
      ...(data ?? []).map((row) =>
        [
          row.request_number,
          row.hospital_name,
          labels[row.category ?? ""] ?? row.category,
          row.title,
          row.status,
          row.submitted_at,
          row.updated_at,
        ]
          .map(quote)
          .join(","),
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "resq-all-website-requests.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageTitle
        title="All Website Requests"
        copy="One index of actual hospital applications, website inquiries, and explicit device requests."
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
        <div className="mb-5 grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          <input
            aria-label="Global request search"
            className={inputCls}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="ID, hospital, subject"
          />
          <select
            className={inputCls}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {[
              "new",
              "pending",
              "under_review",
              "changes_requested",
              "approved",
              "rejected",
              "in_progress",
              "resolved",
              "completed",
              "cancelled",
            ].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            className={inputCls}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All categories</option>
            {Object.entries(labels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            aria-label="From date"
            type="date"
            className={inputCls}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
          <input
            aria-label="To date"
            type="date"
            className={inputCls}
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </div>
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorNote onRetry={() => query.refetch()} />
        ) : !query.data?.rows.length ? (
          <EmptyState
            title="No requests found"
            copy="Adjust the filters or wait for a website submission."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    {["Request", "Hospital", "Category", "Title", "Submitted", "Status", ""].map(
                      (item) => (
                        <th key={item} className="px-3 py-3">
                          {item}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {query.data.rows.map((row) => (
                    <tr key={`${row.source}-${row.id}`}>
                      <td className="px-3 py-4 font-bold text-navy">{row.request_number}</td>
                      <td className="px-3 py-4">{row.hospital_name ?? "Not linked"}</td>
                      <td className="px-3 py-4">{labels[row.category ?? ""] ?? row.category}</td>
                      <td className="px-3 py-4">{row.title}</td>
                      <td className="px-3 py-4">{fmtDate(row.submitted_at)}</td>
                      <td className="px-3 py-4">
                        <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold capitalize text-navy">
                          {row.status?.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <Link
                          {...destination(row.source, row.id)}
                          className="font-bold text-primary hover:underline"
                        >
                          Open
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
