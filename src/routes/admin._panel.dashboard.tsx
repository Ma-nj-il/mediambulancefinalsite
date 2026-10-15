import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  Hourglass,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  StatusBadge,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDate, fmtDateTime, type AppStatus } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — RESQ Admin" },
      { name: "description", content: "RESQ Nepal website administration overview." },
    ],
  }),
  component: Overview,
});

const ranges = {
  "7": "Last 7 days",
  "30": "Last 30 days",
  "90": "Last 90 days",
  all: "All time",
} as const;

const RED = "#DC2626";
const NAVY = "#1E2A4B";
const GREEN = "#16A34A";
const AMBER = "#D97706";
const PURPLE = "#8B5CF6";
const GRAY = "#94A3B8";

const sliceColors: Record<string, string> = {
  pending: AMBER,
  under_review: NAVY,
  changes_requested: PURPLE,
  approved: GREEN,
  rejected: RED,
};

const sliceLabels: Record<string, string> = {
  pending: "Pending",
  under_review: "In Progress",
  changes_requested: "Changes Requested",
  approved: "Completed",
  rejected: "Rejected",
};

function bucketize(dates: string[], days: number | null) {
  const now = Date.now();
  const start =
    days === null ? Math.min(...dates.map((d) => new Date(d).getTime()), now) : now - days * 864e5;
  const spanDays = Math.max(1, Math.ceil((now - start) / 864e5));
  const buckets = Math.min(spanDays, 30);
  const size = (now - start) / buckets || 864e5;
  const pts = Array.from({ length: buckets }, (_, i) => ({
    t: start + size * (i + 1),
    label: new Date(start + size * (i + 1)).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    count: 0,
  }));
  for (const d of dates) {
    const t = new Date(d).getTime();
    if (t < start) continue;
    const idx = Math.min(buckets - 1, Math.floor((t - start) / size));
    const p = pts[idx];
    if (p) p.count += 1;
  }
  return pts;
}

function Overview() {
  const [range, setRange] = useState<keyof typeof ranges>("30");

  const q = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [apps, inquiries, activity, reviews, followups] = await Promise.all([
        supabase
          .from("hospital_applications")
          .select(
            "id, application_reference, hospital_name, contact_person, email, city_district, status, submitted_at, updated_at, reviewed_at, follow_up_date, assigned_reviewer",
          )
          .order("submitted_at", { ascending: false })
          .limit(1000),
        supabase
          .from("contact_inquiries")
          .select("id, status, submitted_at")
          .order("submitted_at", { ascending: false })
          .limit(500),
        supabase
          .from("admin_audit_logs")
          .select("id, action, created_at, metadata")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("application_status_history")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("hospital_applications")
          .select("id, hospital_name, status, follow_up_date")
          .not("follow_up_date", "is", null)
          .in("status", ["pending", "under_review", "changes_requested"])
          .order("follow_up_date")
          .limit(20),
      ]);
      if (apps.error || activity.error) throw new Error("load failed");
      // Newer migrations land separately — tolerate until applied.
      const inquiryRows = inquiries.error ? [] : (inquiries.data ?? []);
      const reviewRows = reviews.error ? [] : (reviews.data ?? []);
      const followupRows = followups.error ? [] : (followups.data ?? []);
      return {
        apps: apps.data,
        inquiries: inquiryRows,
        activity: activity.data,
        reviews: reviewRows,
        followups: followupRows,
      };
    },
  });

  const since = range === "all" ? null : Date.now() - Number(range) * 864e5;

  const fmtDuration = (ms: number) => {
    const h = ms / 36e5;
    if (h < 24) return `${Math.max(1, Math.round(h))}h avg`;
    return `${(h / 24).toFixed(1)}d avg`;
  };

  const stats = useMemo(() => {
    if (!q.data) return null;
    const { apps, inquiries, reviews, followups } = q.data;
    const count = (s: AppStatus) => apps.filter((x) => x.status === s).length;
    const total = apps.length;
    const decided = count("approved") + count("rejected");
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(dayStart.getFullYear(), dayStart.getMonth(), 1);
    const reviewed = apps.filter((a) => a.reviewed_at);
    const avgReview =
      reviewed.length === 0
        ? null
        : reviewed.reduce(
            (sum, a) =>
              sum + (new Date(a.reviewed_at!).getTime() - new Date(a.submitted_at).getTime()),
            0,
          ) / reviewed.length;
    const now = Date.now();
    const todayStart = dayStart.getTime();
    return {
      total,
      pending: count("pending"),
      underReview: count("under_review") + count("changes_requested"),
      approved: count("approved"),
      rejected: count("rejected"),
      newInquiries: inquiries.filter((i) => i.status === "new").length,
      approvalRate: decided === 0 ? null : Math.round((count("approved") / decided) * 100),
      today: apps.filter((a) => new Date(a.submitted_at).getTime() >= todayStart).length,
      month: apps.filter((a) => new Date(a.submitted_at) >= monthStart).length,
      avgReview: avgReview === null ? null : fmtDuration(avgReview),
      followDue: followups.filter((f) => new Date(f.follow_up_date!).getTime() <= now).length,
      unassigned: apps.filter(
        (a) =>
          !a.assigned_reviewer &&
          ["pending", "under_review", "changes_requested"].includes(a.status),
      ).length,
      byStatus: (Object.keys(sliceLabels) as AppStatus[]).map((s) => ({
        name: sliceLabels[s],
        value: count(s),
      })),
      series: bucketize(
        apps.map((a) => a.submitted_at),
        range === "all" ? null : Number(range),
      ),
      reviewSeries: bucketize(
        reviews.map((r) => r.created_at),
        range === "all" ? null : Number(range),
      ),
      inquiryMonths: bucketize(
        inquiries.map((i) => i.submitted_at),
        180,
      ).slice(-6),
      followups,
    };
  }, [q.data, range]);

  if (q.isLoading) return <Loading />;
  if (q.error || !q.data || !stats) return <ErrorNote onRetry={() => q.refetch()} />;
  const { apps, activity } = q.data;

  const cards = [
    {
      l: "Total applications",
      v: stats.total,
      icon: ClipboardList,
      c: "text-navy",
      sub: `${stats.today} today · ${stats.month} this month`,
    },
    { l: "Pending", v: stats.pending, icon: Clock, c: "text-warning", sub: "Awaiting review" },
    {
      l: "In Progress",
      v: stats.underReview,
      icon: Hourglass,
      c: "text-navy",
      sub: "Being reviewed",
    },
    {
      l: "Completed",
      v: stats.approved,
      icon: CheckCircle2,
      c: "text-success",
      sub:
        stats.approvalRate !== null ? `${stats.approvalRate}% approval rate` : "No decisions yet",
    },
    { l: "Rejected", v: stats.rejected, icon: XCircle, c: "text-primary", sub: "Record retained" },
    {
      l: "Follow-ups due",
      v: stats.followDue,
      icon: CalendarClock,
      c: "text-primary",
      sub: stats.avgReview ? `${stats.avgReview} review time` : "No reviews timed yet",
    },
  ];

  return (
    <>
      <PageTitle
        title="Overview"
        copy="Live website figures — applications, inquiries and admin activity."
        actions={
          <select
            aria-label="Date range"
            className={inputCls}
            value={range}
            onChange={(e) => setRange(e.target.value as keyof typeof ranges)}
          >
            {Object.entries(ranges).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.l} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <c.icon className={`h-5 w-5 ${c.c}`} />
            <p className="mt-3 text-3xl font-extrabold text-navy">{c.v}</p>
            <p className="text-xs font-semibold text-muted-foreground">{c.l}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link
          to="/admin/applications"
          className="rounded-full border border-border bg-card px-4 py-1.5 font-bold text-navy hover:border-primary"
        >
          {stats.pending} pending review
        </Link>
        <span className="rounded-full border border-border bg-card px-4 py-1.5 font-bold text-navy">
          {stats.unassigned} awaiting assignment
        </span>
        <span className="rounded-full border border-border bg-card px-4 py-1.5 font-bold text-navy">
          {stats.followDue} follow-ups due
        </span>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Applications over time"
          className="xl:col-span-2"
          action={
            since ? (
              <span className="text-xs font-semibold text-muted-foreground">
                {ranges[range]} ·{" "}
                {apps.filter((a) => new Date(a.submitted_at).getTime() >= since).length} submissions
              </span>
            ) : undefined
          }
        >
          {apps.length === 0 ? (
            <EmptyState
              title="No submissions yet"
              copy="Applications from the Join as Hospital form will chart here."
            />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.series} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="appsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={RED} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={RED} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={24} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke={RED}
                    fill="url(#appsFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
        <Panel
          title="Status distribution"
          action={
            stats.approvalRate !== null ? (
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold text-success">
                {stats.approvalRate}% approval
              </span>
            ) : undefined
          }
        >
          {stats.total === 0 ? (
            <EmptyState title="No data yet" />
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byStatus}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={78}
                      paddingAngle={2}
                    >
                      {stats.byStatus.map((s) => (
                        <Cell
                          key={s.name}
                          fill={
                            sliceColors[
                              Object.keys(sliceLabels).find((k) => sliceLabels[k] === s.name)!
                            ] ?? GRAY
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 space-y-1.5 text-xs font-semibold">
                {stats.byStatus.map((s) => (
                  <li key={s.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-navy">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          background:
                            sliceColors[
                              Object.keys(sliceLabels).find((k) => sliceLabels[k] === s.name)!
                            ],
                        }}
                      />
                      {s.name}
                    </span>
                    <span className="text-muted-foreground">{s.value}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Panel
          title="Recent applications"
          className="xl:col-span-2"
          action={
            <Link to="/admin/applications" className="text-sm font-bold text-primary">
              View all applications
            </Link>
          }
        >
          {apps.length === 0 ? (
            <EmptyState
              title="No applications yet"
              copy="Applications submitted through the Join as Hospital form will appear here."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="py-2 pr-3">Hospital</th>
                    <th className="pr-3">Contact</th>
                    <th className="pr-3">District</th>
                    <th className="pr-3">Submitted</th>
                    <th className="pr-3">Updated</th>
                    <th className="pr-3">Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {apps.slice(0, 6).map((a) => (
                    <tr key={a.id} className="border-t border-border hover:bg-secondary/60">
                      <td className="py-2.5 pr-3 font-semibold text-navy">
                        {a.hospital_name}
                        <br />
                        <span className="text-xs font-normal text-muted-foreground">
                          {a.email ?? "—"}
                        </span>
                      </td>
                      <td className="pr-3 text-muted-foreground">{a.contact_person}</td>
                      <td className="pr-3 text-muted-foreground">{a.city_district ?? "—"}</td>
                      <td className="pr-3 text-muted-foreground">{fmtDate(a.submitted_at)}</td>
                      <td className="pr-3 text-muted-foreground">{fmtDate(a.updated_at)}</td>
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
          )}
        </Panel>
        <div className="space-y-6">
          <Panel
            title="Monthly inquiries"
            action={
              stats.newInquiries > 0 ? (
                <Link to="/admin/inquiries" className="text-sm font-bold text-primary">
                  {stats.newInquiries} new
                </Link>
              ) : undefined
            }
          >
            {q.data.inquiries.length === 0 ? (
              <EmptyState
                title="No inquiries yet"
                copy="Messages from the contact form will chart here."
              />
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.inquiryMonths}
                    margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={16} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" name="Inquiries" fill={NAVY} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
          <Panel title="Follow-up overview">
            {stats.followups.length === 0 ? (
              <EmptyState
                title="No follow-ups scheduled"
                copy="Set a follow-up date on any open application to track it here."
              />
            ) : (
              <ul className="space-y-2 text-sm">
                {stats.followups.slice(0, 6).map((f) => {
                  const overdue = new Date(f.follow_up_date!).getTime() <= Date.now();
                  return (
                    <li key={f.id} className="flex items-center justify-between gap-2">
                      <Link
                        to="/admin/applications/$id"
                        params={{ id: f.id }}
                        className="truncate font-semibold text-navy hover:underline"
                      >
                        {f.hospital_name}
                      </Link>
                      <span
                        className={
                          overdue
                            ? "shrink-0 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-primary"
                            : "shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-navy"
                        }
                      >
                        {overdue ? "Overdue · " : ""}
                        {fmtDate(f.follow_up_date)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel title="Review activity" className="mt-6">
        {stats.reviewSeries.every((p) => p.count === 0) ? (
          <EmptyState
            title="No reviews yet"
            copy="Status changes on applications will chart here."
          />
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.reviewSeries}
                margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickMargin={8} minTickGap={24} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Status changes" fill={RED} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <Panel title="Recent activity" className="mt-6">
        {activity.length === 0 ? (
          <EmptyState
            title="No admin activity yet"
            copy="Submissions and status changes will appear here."
          />
        ) : (
          <ol className="space-y-3 border-l-2 border-border pl-4">
            {activity.map((x) => (
              <li key={x.id} className="relative text-sm">
                <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="font-semibold text-navy">{x.action.replaceAll(".", " · ")}</span>
                <span className="text-muted-foreground"> — {fmtDateTime(x.created_at)}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </>
  );
}
