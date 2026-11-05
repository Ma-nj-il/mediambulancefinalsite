import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ErrorNote, Loading, PageTitle, Panel, inputCls, theadCls } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/_panel/reports")({
  head: () => ({ meta: [{ title: "Reports & Analytics — RESQ Admin" }] }),
  component: Reports,
});

function Reports() {
  const now = new Date();
  const [from, setFrom] = useState(
    new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString().slice(0, 10),
  );
  const [to, setTo] = useState(now.toISOString().slice(0, 10));
  const query = useQuery({
    queryKey: ["admin-reports", from, to],
    queryFn: async () => {
      const start = `${from}T00:00:00`;
      const end = `${to}T23:59:59`;
      const [applications, inquiries, devices] = await Promise.all([
        supabase
          .from("hospital_applications")
          .select("id, hospital_name, status, submitted_at")
          .gte("submitted_at", start)
          .lte("submitted_at", end)
          .order("submitted_at"),
        supabase
          .from("contact_inquiries")
          .select("id, status, submitted_at")
          .gte("submitted_at", start)
          .lte("submitted_at", end)
          .order("submitted_at"),
        supabase
          .from("device_requests")
          .select(
            "id, status, device_category, gps_quantity, dashcam_quantity, created_at, hospital_applications!inner(hospital_name)",
          )
          .gte("created_at", start)
          .lte("created_at", end)
          .order("created_at"),
      ]);
      if (applications.error) throw applications.error;
      if (inquiries.error) throw inquiries.error;
      if (devices.error) throw devices.error;
      return {
        applications: applications.data ?? [],
        inquiries: inquiries.data ?? [],
        devices: devices.data ?? [],
      };
    },
  });
  const report = useMemo(() => {
    if (!query.data) return null;
    const { applications, inquiries, devices } = query.data;
    const months = new Map<string, { month: string; applications: number; requests: number }>();
    const add = (date: string, field: "applications" | "requests") => {
      const month = date.slice(0, 7);
      const row = months.get(month) ?? { month, applications: 0, requests: 0 };
      row[field] += 1;
      months.set(month, row);
    };
    applications.forEach((item) => add(item.submitted_at, "applications"));
    inquiries.forEach((item) => add(item.submitted_at, "requests"));
    devices.forEach((item) => add(item.created_at, "requests"));
    const hospitals = new Map<
      string,
      { hospital: string; requests: number; gps: number; dashcams: number }
    >();
    devices.forEach((item) => {
      const hospital = item.hospital_applications.hospital_name;
      const row = hospitals.get(hospital) ?? { hospital, requests: 0, gps: 0, dashcams: 0 };
      row.requests += 1;
      row.gps += item.gps_quantity;
      row.dashcams += item.dashcam_quantity;
      hospitals.set(hospital, row);
    });
    return {
      applications,
      inquiries,
      devices,
      months: [...months.values()],
      hospitals: [...hospitals.values()],
      stats: {
        applied: applications.length,
        approved: applications.filter((item) => item.status === "approved").length,
        rejected: applications.filter((item) => item.status === "rejected").length,
        pending: applications.filter((item) =>
          ["pending", "under_review", "changes_requested"].includes(item.status),
        ).length,
        requests: inquiries.length + devices.length,
        completed:
          inquiries.filter((item) => item.status === "resolved").length +
          devices.filter((item) => item.status === "completed").length,
        gpsRequests: devices.filter((item) => item.gps_quantity > 0).length,
        gpsUnits: devices.reduce((sum, item) => sum + item.gps_quantity, 0),
        dashcamRequests: devices.filter((item) => item.dashcam_quantity > 0).length,
        dashcamUnits: devices.reduce((sum, item) => sum + item.dashcam_quantity, 0),
      },
    };
  }, [query.data]);
  const exportCsv = () => {
    if (!report) return;
    const rows = [
      "Hospital,Device Requests,GPS Units,Dashcam Units",
      ...report.hospitals.map((item) =>
        [item.hospital, item.requests, item.gps, item.dashcams]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ];
    const url = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `resq-report-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (query.isLoading) return <Loading />;
  if (query.error || !report) return <ErrorNote onRetry={() => query.refetch()} />;
  return (
    <div className="print:bg-white">
      <PageTitle
        title="Reports & Analytics"
        copy="Actual website administration records for the selected period."
        actions={
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-navy"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
            >
              <Download className="h-4 w-4" /> CSV
            </button>
          </div>
        }
      />
      <div className="mb-6 flex flex-wrap gap-3 print:hidden">
        <label className="text-xs font-bold text-navy">
          From
          <input
            type="date"
            className={`${inputCls} mt-1 block`}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-xs font-bold text-navy">
          To
          <input
            type="date"
            className={`${inputCls} mt-1 block`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(report.stats).map(([key, value]) => (
          <div key={key} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {key.replace(/([A-Z])/g, " $1")}
            </p>
            <p className="mt-2 text-3xl font-extrabold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Monthly submissions">
          {report.months.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.months}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="applications" fill="var(--primary)" />
                  <Bar dataKey="requests" fill="var(--navy)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No data in this period.</p>
          )}
        </Panel>
        <Panel title="Hospital-wise device requests">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className={theadCls}>
                <tr>
                  <th className="p-3">Hospital</th>
                  <th>Requests</th>
                  <th>GPS units</th>
                  <th>Dashcams</th>
                </tr>
              </thead>
              <tbody>
                {report.hospitals.map((item) => (
                  <tr key={item.hospital} className="border-b border-border">
                    <td className="p-3 font-bold text-navy">{item.hospital}</td>
                    <td>{item.requests}</td>
                    <td>{item.gps}</td>
                    <td>{item.dashcams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!report.hospitals.length && (
              <p className="p-4 text-sm text-muted-foreground">
                No device requests in this period.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
