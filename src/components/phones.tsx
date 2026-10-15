import { ArrowRight, Check, Clock, MapPin, Navigation, Phone as PhoneIcon, Truck } from "lucide-react";
import type { ReactNode } from "react";
import { AppIcon } from "./brand";
import { MapGraphic } from "./map-graphic";
import { cn } from "@/lib/utils";

export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative w-[270px] rounded-[44px] bg-navy p-[10px] shadow-float ring-1 ring-navy-soft", className)}>
      <div className="relative h-[560px] overflow-hidden rounded-[35px] bg-card">
        <div className="absolute left-1/2 top-2.5 z-20 h-6 w-24 -translate-x-1/2 rounded-full bg-navy" />
        <div className="flex items-center justify-between px-6 pt-3 text-[11px] font-semibold text-navy">
          <span>9:41</span>
          <span className="flex gap-1">
            <span className="h-2 w-3 rounded-sm bg-navy" />
            <span className="h-2 w-4 rounded-sm bg-navy" />
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Header({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6">
      <div className="flex items-center gap-2">
        <AppIcon className="h-7 w-7" />
        <span className="text-sm font-extrabold text-navy">{title}</span>
      </div>
      <span className="h-8 w-8 rounded-full bg-secondary" />
    </div>
  );
}

const categories = [
  { name: "Basic", note: "Standard transport" },
  { name: "Advanced", note: "Provider-equipped" },
  { name: "Ventilator", note: "Where available" },
];

export function RequestScreen() {
  return (
    <div className="flex h-full flex-col">
      <Header title="Request" />
      <div className="relative mx-4 mt-4 h-40 overflow-hidden rounded-2xl">
        <MapGraphic ambulances={[{ x: 200, y: 140 }, { x: 470, y: 260 }]} activeAmbulance={null} />
      </div>
      <div className="mx-4 mt-4 space-y-2 rounded-2xl border border-border p-3">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-navy" />
          <div className="text-[11px]">
            <p className="text-muted-foreground">Pickup</p>
            <p className="font-semibold text-navy">Baneshwor, Kathmandu</p>
          </div>
        </div>
        <div className="ml-1 h-3 border-l border-dashed border-border" />
        <div className="flex items-center gap-3">
          <MapPin className="h-3 w-3 text-primary" />
          <div className="text-[11px]">
            <p className="text-muted-foreground">Destination</p>
            <p className="font-semibold text-navy">Choose a hospital</p>
          </div>
        </div>
      </div>
      <p className="mx-5 mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Ambulance type</p>
      <div className="mx-4 mt-2 grid grid-cols-3 gap-2">
        {categories.map((c, i) => (
          <div key={c.name} className={cn("rounded-xl border p-2 text-center", i === 0 ? "border-primary bg-accent" : "border-border")}>
            <Truck className={cn("mx-auto h-4 w-4", i === 0 ? "text-primary" : "text-navy")} />
            <p className="mt-1 text-[11px] font-bold text-navy">{c.name}</p>
            <p className="text-[9px] text-muted-foreground">{c.note}</p>
          </div>
        ))}
      </div>
      <div className="mt-auto p-4">
        <div className="flex h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-primary-foreground">
          Send request <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function TrackScreen() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-0">
        <MapGraphic />
      </div>
      <div className="absolute inset-x-4 top-12 flex items-center gap-2 rounded-2xl bg-card/95 p-3 shadow-card backdrop-blur">
        <Navigation className="h-4 w-4 text-primary" />
        <p className="text-[11px] font-semibold text-navy">Route preview · sample trip</p>
      </div>
      <div className="absolute inset-x-3 bottom-3 rounded-3xl bg-card p-4 shadow-float">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-success">Ambulance assigned</p>
            <p className="mt-1 text-base font-extrabold text-navy">On the way to pickup</p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
            <PhoneIcon className="h-4 w-4 text-primary" />
          </span>
        </div>
        <div className="mt-3 flex gap-1">
          {[1, 1, 0, 0].map((on, i) => (
            <span key={i} className={cn("h-1.5 flex-1 rounded-full", on ? "bg-primary" : "bg-secondary")} />
          ))}
        </div>
        <div className="mt-3 flex items-center gap-3 rounded-2xl bg-muted p-2.5">
          <Truck className="h-5 w-5 text-navy" />
          <div className="text-[11px]">
            <p className="font-bold text-navy">Basic Ambulance</p>
            <p className="text-muted-foreground">Ba 1 Cha ••••</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TripScreen() {
  const steps = [
    { t: "Request received", done: true },
    { t: "Ambulance assigned", done: true },
    { t: "Arrived at pickup", done: true },
    { t: "Trip completed", done: false },
  ];
  return (
    <div className="flex h-full flex-col">
      <Header title="Trip details" />
      <div className="mx-4 mt-4 rounded-2xl bg-navy p-4 text-navy-foreground">
        <p className="text-[10px] font-bold uppercase tracking-wider text-navy-foreground/60">Request</p>
        <p className="mt-1 text-sm font-bold">RQ-SAMPLE-0421</p>
        <div className="mt-3 flex items-center justify-between text-[11px]">
          <span className="text-navy-foreground/70">Baneshwor</span>
          <ArrowRight className="h-3 w-3 text-primary" />
          <span className="text-navy-foreground/70">Partner hospital</span>
        </div>
      </div>
      <div className="mx-4 mt-4 space-y-3">
        {steps.map((s) => (
          <div key={s.t} className="flex items-center gap-3">
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full", s.done ? "bg-success" : "bg-secondary")}>
              {s.done ? <Check className="h-3 w-3 text-primary-foreground" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
            </span>
            <p className={cn("text-xs font-semibold", s.done ? "text-navy" : "text-muted-foreground")}>{s.t}</p>
          </div>
        ))}
      </div>
      <p className="mx-5 mt-5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Previous trips</p>
      <div className="mx-4 mt-2 space-y-2">
        {["Sample trip · Lalitpur", "Sample trip · Bhaktapur"].map((t) => (
          <div key={t} className="flex items-center justify-between rounded-xl border border-border p-2.5 text-[11px]">
            <span className="font-semibold text-navy">{t}</span>
            <span className="rounded-full bg-success/15 px-2 py-0.5 font-bold text-success">Completed</span>
          </div>
        ))}
      </div>
    </div>
  );
}
