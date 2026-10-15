import { Bell, Calendar, Filter, LayoutGrid, ListChecks, Route as RouteIcon, Search, Settings, Truck, Users } from "lucide-react";
import { AppIcon } from "./brand";
import { MapGraphic } from "./map-graphic";
import { cn } from "@/lib/utils";

const vehicles = [
  { id: "AMB-01", type: "Basic", driver: "Driver A", status: "Available" },
  { id: "AMB-02", type: "Advanced", driver: "Driver B", status: "On Trip" },
  { id: "AMB-03", type: "Ventilator", driver: "Driver C", status: "Available" },
  { id: "AMB-04", type: "Basic", driver: "Driver D", status: "Offline" },
];
const trips = [
  { id: "T-1042", date: "Sample · 09:12", km: "6.4 km", status: "Completed" },
  { id: "T-1043", date: "Sample · 10:40", km: "3.1 km", status: "On Trip" },
  { id: "T-1044", date: "Sample · 11:05", km: "8.9 km", status: "Completed" },
];
const bars = [40, 62, 48, 75, 55, 88, 66];

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold",
        status === "Available" || status === "Completed"
          ? "bg-success/15 text-success"
          : status === "On Trip"
            ? "bg-accent text-primary"
            : "bg-secondary text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function DashboardMockup({ className }: { className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-3xl border border-border bg-card shadow-float", className)}>
      {/* window bar */}
      <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-4 rounded-md bg-card px-3 py-0.5 text-[10px] text-muted-foreground">Dashboard Preview · illustrative sample data</span>
      </div>
      <div className="flex">
        <aside className="hidden w-48 shrink-0 flex-col gap-1 bg-navy p-4 text-navy-foreground md:flex">
          <div className="mb-5 flex items-center gap-2">
            <AppIcon className="h-7 w-7" />
            <span className="text-sm font-extrabold">RESQ Partner</span>
          </div>
          {[
            [LayoutGrid, "Overview", true],
            [Truck, "Fleet"],
            [Users, "Drivers"],
            [ListChecks, "Requests"],
            [RouteIcon, "Trips"],
            [Settings, "Settings"],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof Truck;
            return (
              <div key={label as string} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs", active ? "bg-primary font-bold" : "text-navy-foreground/70")}>
                <I className="h-3.5 w-3.5" />
                {label as string}
              </div>
            );
          })}
        </aside>
        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-muted-foreground">Sample Hospital</p>
              <p className="text-lg font-extrabold text-navy">Fleet overview</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground sm:flex">
                <Search className="h-3 w-3" /> Search vehicle
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-navy">
                <Filter className="h-3 w-3" /> Status: All
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-semibold text-navy">
                <Calendar className="h-3 w-3" /> Today
              </span>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["Available", "2", "text-success"],
              ["On Trip", "1", "text-primary"],
              ["Offline", "1", "text-muted-foreground"],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-2xl border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground">{l}</p>
                <p className={cn("mt-1 text-2xl font-extrabold", c)}>{v}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="relative h-56 overflow-hidden rounded-2xl border border-border lg:col-span-3">
              <MapGraphic />
              <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-navy shadow-card">
                Map preview · not live
              </span>
            </div>
            <div className="rounded-2xl border border-border p-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-navy">Vehicles</p>
                <p className="text-[10px] text-muted-foreground">4 registered</p>
              </div>
              <div className="mt-2 space-y-1.5">
                {vehicles.map((v) => (
                  <div key={v.id} className="flex items-center justify-between rounded-xl bg-muted px-2.5 py-2">
                    <div className="text-[11px]">
                      <p className="font-bold text-navy">{v.id} · {v.type}</p>
                      <p className="text-muted-foreground">{v.driver}</p>
                    </div>
                    <StatusPill status={v.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-5">
            <div className="rounded-2xl border border-border p-3 lg:col-span-3">
              <p className="text-xs font-bold text-navy">Recent trips</p>
              <table className="mt-2 w-full text-left text-[11px]">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="py-1 font-semibold">Trip</th>
                    <th className="py-1 font-semibold">Time</th>
                    <th className="py-1 font-semibold">Distance</th>
                    <th className="py-1 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="py-1.5 font-bold text-navy">{t.id}</td>
                      <td className="py-1.5 text-muted-foreground">{t.date}</td>
                      <td className="py-1.5 text-navy">{t.km}</td>
                      <td className="py-1.5"><StatusPill status={t.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-2xl border border-border p-3 lg:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-navy">Trip activity</p>
                <p className="text-[10px] text-muted-foreground">7 days · sample</p>
              </div>
              <div className="mt-3 flex h-20 items-end gap-1.5">
                {bars.map((b, i) => (
                  <div key={i} className={cn("flex-1 rounded-t-md", i === 5 ? "bg-primary" : "bg-secondary")} style={{ height: `${b}%` }} />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between rounded-xl bg-accent px-2.5 py-2 text-[11px]">
                <span className="font-bold text-primary">1 new request</span>
                <span className="rounded-full bg-primary px-2 py-0.5 font-bold text-primary-foreground">Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
