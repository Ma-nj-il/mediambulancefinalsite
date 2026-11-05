import { useState } from "react";
import {
  Activity,
  Ambulance,
  Bell,
  CircleDot,
  Clock3,
  History,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Maximize2,
  Play,
  Route as RouteIcon,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  Truck,
  UserRound,
  Users,
  Video,
  WifiOff,
} from "lucide-react";
import { AppIcon } from "./brand";
import { MapGraphic } from "./map-graphic";
import { cn } from "@/lib/utils";

const vehicles = [
  {
    id: "AMB-01",
    driver: "Driver A",
    status: "Available",
    trip: "Standing by",
    marker: { x: 180, y: 120 },
  },
  {
    id: "AMB-02",
    driver: "Driver B",
    status: "On the Way",
    trip: "Sample request RQ-1042",
    marker: { x: 300, y: 250 },
  },
  {
    id: "AMB-03",
    driver: "Driver C",
    status: "At Hospital",
    trip: "Sample trip T-1041",
    marker: { x: 470, y: 90 },
  },
  {
    id: "AMB-04",
    driver: "Driver D",
    status: "Offline",
    trip: "No active trip",
    marker: { x: 560, y: 330 },
  },
] as const;

const requests = [
  {
    id: "RQ-1042",
    pickup: "Baneshwor",
    destination: "Sample Hospital",
    ambulance: "AMB-02",
    priority: "High",
    status: "Driver On the Way",
  },
  {
    id: "RQ-1043",
    pickup: "Patan",
    destination: "Sample Hospital",
    ambulance: "Unassigned",
    priority: "Medium",
    status: "Pending",
  },
  {
    id: "RQ-1041",
    pickup: "Kirtipur",
    destination: "Sample Hospital",
    ambulance: "AMB-03",
    priority: "Standard",
    status: "Arrived at Hospital",
  },
] as const;

const summary = [
  ["Total Ambulances", "4", Ambulance],
  ["Available", "1", CircleDot],
  ["On Trip", "2", RouteIcon],
  ["Offline", "1", WifiOff],
  ["Active Drivers", "3", Users],
  ["Patient Requests", "2", ListChecks],
  ["Completed Trips", "18", Activity],
  ["Active Emergencies", "1", Siren],
] as const;

export function StatusPill({ status }: { status: string }) {
  const positive = ["Available", "Completed", "At Hospital", "Connected"].includes(status);
  const active = ["On Trip", "On the Way", "Driver On the Way", "Patient Onboard"].includes(status);
  const alert = ["High", "Emergency"].includes(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap",
        positive
          ? "bg-success/15 text-success"
          : active || alert
            ? "bg-primary/10 text-primary"
            : "bg-secondary text-muted-foreground",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function CameraPane({ title, channel }: { title: string; channel: string }) {
  return (
    <div className="relative flex min-h-36 flex-col items-center justify-center overflow-hidden rounded-xl bg-navy p-4 text-center text-navy-foreground">
      <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-navy-foreground/5 px-3 py-2 text-[9px]">
        <span>{channel}</span>
        <span className="flex items-center gap-1 text-warning">
          <WifiOff className="h-3 w-3" /> Not connected
        </span>
      </div>
      <Video className="mt-6 h-7 w-7 text-navy-foreground/35" />
      <p className="mt-2 text-xs font-bold">{title}</p>
      <p className="mt-1 text-[9px] text-navy-foreground/50">Preview only · no video stream</p>
      <span className="absolute bottom-2 right-2">
        <Maximize2 className="h-3.5 w-3.5 text-navy-foreground/50" />
      </span>
    </div>
  );
}

/** Public product preview. Every value and location shown here is explicitly sample data. */
export function DashboardMockup({ className }: { className?: string }) {
  const [selectedVehicle, setSelectedVehicle] = useState(1);
  const [cameraLayout, setCameraLayout] = useState<"multi" | "front" | "driver">("multi");
  const vehicle = vehicles[selectedVehicle] ?? vehicles[1];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-border bg-card shadow-float",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </div>
        <span className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[10px] font-bold text-navy">
          Demonstration preview · sample data · no live feeds
        </span>
      </div>

      <div className="flex">
        <aside className="hidden w-48 shrink-0 flex-col bg-navy p-4 text-navy-foreground md:flex">
          <div className="mb-5 flex items-center gap-2">
            <AppIcon className="h-7 w-7" />
            <span className="text-sm font-extrabold">RESQ Control</span>
          </div>
          {[
            [LayoutDashboard, "Overview", true],
            [MapPin, "Live tracking"],
            [Video, "Cameras"],
            [History, "Playback"],
            [ListChecks, "Requests"],
            [RouteIcon, "Trips"],
            [Users, "Drivers"],
            [Settings, "Settings"],
          ].map(([Icon, label, active]) => {
            const I = Icon as typeof Truck;
            return (
              <div
                key={label as string}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs",
                  active ? "bg-primary font-bold" : "text-navy-foreground/65",
                )}
              >
                <I className="h-3.5 w-3.5" /> {label as string}
              </div>
            );
          })}
          <div className="mt-auto rounded-xl border border-navy-foreground/10 bg-navy-foreground/5 p-3 text-[10px] text-navy-foreground/60">
            <ShieldCheck className="mb-2 h-4 w-4 text-success" /> Authorized access and monitoring
            logs required for operational use.
          </div>
        </aside>

        <div className="min-w-0 flex-1 bg-soft/60 p-3 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Sample hospital · illustrative
              </p>
              <p className="text-lg font-extrabold text-navy">Ambulance operations overview</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground sm:flex">
                <Search className="h-3 w-3" /> Search operations
              </span>
              <span className="rounded-lg border border-border bg-card p-2">
                <Bell className="h-3.5 w-3.5 text-navy" />
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
            {summary.map(([label, value, Icon]) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3">
                <Icon className="h-3.5 w-3.5 text-primary" />
                <p className="mt-2 text-[9px] leading-tight text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-extrabold text-navy">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-[1.55fr_0.75fr]">
            <section className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div>
                  <p className="text-xs font-extrabold text-navy">GPS fleet tracking</p>
                  <p className="text-[9px] text-muted-foreground">
                    Map illustration — not actual vehicle positions
                  </p>
                </div>
                <span className="rounded-full bg-warning/15 px-2 py-1 text-[9px] font-bold text-navy">
                  DEMO MAP
                </span>
              </div>
              <div className="relative h-72 min-w-0 overflow-hidden">
                <MapGraphic
                  ambulances={vehicles
                    .filter((_, index) => index !== selectedVehicle)
                    .map((item) => item.marker)}
                  activeAmbulance={vehicle.marker}
                />
                <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-border bg-card/95 p-3 shadow-card backdrop-blur">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-extrabold text-navy">
                        {vehicle.id} · {vehicle.driver}
                      </p>
                      <p className="mt-0.5 text-[9px] text-muted-foreground">
                        {vehicle.trip} · route preview
                      </p>
                    </div>
                    <StatusPill status={vehicle.status} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-navy">Fleet status</p>
                <p className="text-[9px] text-muted-foreground">Select a vehicle</p>
              </div>
              <div className="mt-3 space-y-2">
                {vehicles.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedVehicle(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-xl border p-2.5 text-left transition-colors",
                      selectedVehicle === index
                        ? "border-primary bg-accent"
                        : "border-border bg-muted/60 hover:border-primary/40",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-[11px] font-bold text-navy">{item.id}</span>
                      <span className="block truncate text-[9px] text-muted-foreground">
                        {item.driver} · {item.trip}
                      </span>
                    </span>
                    <StatusPill status={item.status} />
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="mt-3 grid gap-3 xl:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-extrabold text-navy">Camera monitoring</p>
                  <p className="text-[9px] text-muted-foreground">
                    AMB-02 · channels depend on installed hardware
                  </p>
                </div>
                <div className="flex rounded-lg bg-muted p-1">
                  {(["multi", "front", "driver"] as const).map((layout) => (
                    <button
                      key={layout}
                      type="button"
                      onClick={() => setCameraLayout(layout)}
                      className={cn(
                        "rounded-md px-2 py-1 text-[9px] font-bold capitalize",
                        cameraLayout === layout
                          ? "bg-card text-primary shadow-card"
                          : "text-muted-foreground",
                      )}
                    >
                      {layout}
                    </button>
                  ))}
                </div>
              </div>
              <div className={cn("mt-3 grid gap-2", cameraLayout === "multi" && "sm:grid-cols-2")}>
                {(cameraLayout === "multi" || cameraLayout === "front") && (
                  <CameraPane title="Front road camera" channel="Channel 01" />
                )}
                {(cameraLayout === "multi" || cameraLayout === "driver") && (
                  <CameraPane title="Driver-facing camera" channel="Channel 02" />
                )}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-success" /> Operational video requires
                authorization, consent, role controls, and access logging.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-navy">Historical playback</p>
                  <p className="text-[9px] text-muted-foreground">
                    Interface preview · recording retrieval not integrated
                  </p>
                </div>
                <History className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {["AMB-02", "Front road", "Sample date", "09:00 – 09:30"].map((value) => (
                  <div
                    key={value}
                    className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-[10px] font-semibold text-navy"
                  >
                    {value}
                  </div>
                ))}
              </div>
              <div className="mt-3 flex min-h-24 items-center justify-center rounded-xl bg-navy text-navy-foreground">
                <div className="text-center">
                  <Play className="mx-auto h-6 w-6 text-navy-foreground/35" />
                  <p className="mt-2 text-[9px] text-navy-foreground/50">
                    No recording source connected
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="relative h-1.5 rounded-full bg-secondary">
                  <span className="absolute left-[24%] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-primary" />
                  <span className="block h-full w-[24%] rounded-full bg-primary" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>09:00</span>
                  <span>1× playback</span>
                  <span>09:30</span>
                </div>
              </div>
            </section>
          </div>

          <section className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div>
                <p className="text-xs font-extrabold text-navy">Patient request management</p>
                <p className="text-[9px] text-muted-foreground">
                  De-identified sample records for presentation only
                </p>
              </div>
              <span className="rounded-lg bg-primary px-2.5 py-1.5 text-[9px] font-bold text-primary-foreground">
                2 active samples
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-[10px]">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    {["Request", "Pickup", "Destination", "Assignment", "Priority", "Status"].map(
                      (heading) => (
                        <th key={heading} className="px-4 py-2 font-semibold">
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-3 font-bold text-navy">{request.id}</td>
                      <td className="px-4 py-3">{request.pickup}</td>
                      <td className="px-4 py-3">{request.destination}</td>
                      <td className="px-4 py-3">{request.ambulance}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={request.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-primary" />
                <p className="text-xs font-extrabold text-navy">Driver monitoring</p>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                {[
                  "Driver B · DR-002",
                  "AMB-02 assigned",
                  "On the Way",
                  "2 camera channels",
                  "Location: demo only",
                  "Recent: accepted RQ-1042",
                ].map((item) => (
                  <p key={item} className="rounded-lg bg-muted/70 p-2.5 text-navy">
                    {item}
                  </p>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <RouteIcon className="h-4 w-4 text-primary" />
                <p className="text-xs font-extrabold text-navy">Trip monitoring</p>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-muted/70 p-3">
                <div>
                  <p className="text-[11px] font-bold text-navy">
                    T-1042 · Baneshwor → Sample Hospital
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    AMB-02 · Driver B · sample start 09:12
                  </p>
                </div>
                <StatusPill status="On the Way" />
              </div>
              <div className="mt-3 flex items-center gap-2 text-[9px] text-muted-foreground">
                <Clock3 className="h-3 w-3" />
                <span>Sample route progress</span>
                <div className="h-1.5 flex-1 rounded-full bg-secondary">
                  <div className="h-full w-2/3 rounded-full bg-primary" />
                </div>
                <span>67%</span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
