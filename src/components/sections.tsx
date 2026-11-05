import { Link } from "@tanstack/react-router";
import {
  Activity,
  Ambulance,
  ArrowRight,
  BarChart3,
  BadgeCheck,
  Camera,
  ClipboardList,
  FileCheck2,
  Gauge,
  HeartPulse,
  History,
  Lock,
  MapPinned,
  MonitorPlay,
  Radio,
  Route,
  Rocket,
  Send,
  ShieldCheck,
  Smartphone,
  Truck,
  UploadCloud,
  Users,
  Wifi,
} from "lucide-react";
import heroImg from "@/assets/hero-ambulance.jpg";
import hospitalImg from "@/assets/hospital.jpg";
import familyImg from "@/assets/family-phone.jpg";
import icuImg from "@/assets/icu-interior.jpg";
import { Button } from "./ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { PhoneFrame, RequestScreen, TrackScreen, TripScreen } from "./phones";
import { DashboardMockup, StatusPill } from "./dashboard-mockup";
import { MapGraphic } from "./map-graphic";
import { StoreBadges } from "./store-badges";
import { AppIcon } from "./brand";
import { PreviewTag, Reveal, SectionHeading } from "./reveal";
import { cn } from "@/lib/utils";

const wrap = "mx-auto max-w-7xl px-5";

/* ---------------- HERO ---------------- */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <img
        src={heroImg}
        alt="RESQ ambulance on a Kathmandu street at golden hour"
        width={1920}
        height={1088}
        className="absolute inset-0 h-full w-full object-cover object-[72%_center] opacity-50"
      />
      <div className="bg-fade-left absolute inset-0" />
      <div className="bg-fade-up absolute inset-x-0 bottom-0 h-1/3 lg:hidden" />
      <div
        className={cn(
          wrap,
          "relative grid min-h-[calc(100vh-72px)] grid-cols-[minmax(0,1fr)] items-center gap-12 py-16 lg:grid-cols-12 lg:py-20",
        )}
      >
        <div className="min-w-0 lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-3.5 py-1.5 text-xs font-semibold text-navy-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" /> Ambulance access and operations
          </span>
          <h1 className="display mt-6 text-5xl text-navy-foreground sm:text-6xl xl:text-[4.25rem]">
            Emergency Ambulance Services, <span className="text-primary">Made Simpler.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-foreground/80">
            Request ambulance services in the app and manage hospital fleets on one platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <a href="#hospital-platform">
                Explore Hospital Platform <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="glass" size="xl">
              <a href="#app">
                <Smartphone /> Download Mobile App
              </a>
            </Button>
          </div>
          <StoreBadges inverted className="mt-5" />
        </div>
        <div className="relative hidden h-[620px] overflow-hidden lg:col-span-6 lg:block">
          <div className="absolute left-0 top-5 w-[790px] origin-top-left scale-[0.68] xl:scale-[0.74]">
            <DashboardMockup />
          </div>
          <span className="absolute bottom-4 right-4 rounded-full border border-navy-foreground/20 bg-navy/90 px-3 py-1.5 text-[10px] font-bold text-navy-foreground">
            Public product preview · sample data
          </span>
        </div>
        {/* mobile visual */}
        <div className="flex min-w-0 justify-center lg:hidden">
          <div className="relative h-[640px] w-full overflow-hidden rounded-3xl border border-navy-foreground/15 bg-navy/80 p-2">
            <DashboardMockup />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-navy to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- EMERGENCY MOMENT ---------------- */
export function EmergencyMoment() {
  const items = [
    {
      cap: "Find participating services.",
      visual: (
        <img
          src={familyImg}
          alt="A woman searching for an ambulance on her phone"
          loading="lazy"
          width={1200}
          height={1408}
          className="h-full w-full object-cover"
        />
      ),
    },
    {
      cap: "Send a booking request.",
      visual: (
        <div className="flex h-full items-center justify-center bg-secondary">
          <div className="w-64 space-y-2">
            {(
              [
                ["Basic Ambulance", "Available"],
                ["Advanced Ambulance", "Available"],
                ["Ventilator-Equipped", "Offline"],
              ] as const
            ).map(([n, s]) => (
              <div
                key={n}
                className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent">
                    <Truck className="h-4 w-4 text-primary" />
                  </span>
                  <span className="text-xs font-bold text-navy">{n}</span>
                </div>
                <StatusPill status={s} />
              </div>
            ))}
            <div className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              Send request
            </div>
          </div>
        </div>
      ),
    },
    { cap: "Follow trip updates when available.", visual: <MapGraphic /> },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="For individuals and families"
          title="Ambulance Help, a Tap Away."
          copy="Find participating services, request an ambulance, and follow available updates in the app."
        />
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-1/2 hidden h-px border-t-2 border-dashed border-primary/30 md:block" />
          {items.map((it, i) => (
            <Reveal key={it.cap} delay={i * 120}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-card">
                {it.visual}
              </div>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-navy-foreground">
                  {i + 1}
                </span>
                <p className="font-bold text-navy">{it.cap}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <PreviewTag>App preview · availability varies by provider</PreviewTag>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Availability and trip updates depend on participating providers. For life-threatening
            emergencies, call your local emergency number.
          </p>
          <Button asChild variant="soft" size="lg">
            <a href="#app">
              Get the mobile app <ArrowRight />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
export function HowItWorks() {
  const steps = [
    { n: "01", t: "Find", c: "Explore participating ambulance services.", s: <TrackScreen /> },
    {
      n: "02",
      t: "Request",
      c: "Send an ambulance request through the app.",
      s: <RequestScreen />,
    },
    {
      n: "03",
      t: "Follow",
      c: "View status and trip updates when available.",
      s: <TripScreen />,
    },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="How it works"
          title="Request an Ambulance in Three Steps."
          copy="Find a service, send a request, and follow available updates."
        />
        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150} className="flex flex-col items-center text-center">
              <div className="relative flex justify-center">
                <span className="display absolute -top-10 left-1/2 -translate-x-1/2 text-[140px] text-navy/5">
                  {s.n}
                </span>
                <PhoneFrame className="relative scale-[0.85]">{s.s}</PhoneFrame>
              </div>
              <p className="eyebrow mt-2">Step {s.n}</p>
              <h3 className="mt-2 text-3xl font-extrabold text-navy">{s.t}</h3>
              <p className="mt-2 max-w-xs text-muted-foreground">{s.c}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <PreviewTag>App preview · requests are completed in the mobile app</PreviewTag>
        </div>
      </div>
    </section>
  );
}

/* ---------------- APP ---------------- */
export function AppSection() {
  return (
    <section id="app" className="bg-navy-gradient relative overflow-hidden py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          inverted
          eyebrow="RESQ Nepal mobile app"
          title="Ambulance Access From Your Phone."
          copy="Find participating services, send a request, and follow available updates in the RESQ Nepal app."
        />
        <div className="mt-16 flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-end">
          <Reveal className="lg:translate-y-10">
            <PhoneFrame>
              <RequestScreen />
            </PhoneFrame>
            <p className="mt-5 text-center text-sm font-bold text-navy-foreground">
              Request an ambulance
            </p>
          </Reveal>
          <Reveal delay={120}>
            <PhoneFrame className="lg:scale-110">
              <TrackScreen />
            </PhoneFrame>
            <p className="mt-10 text-center text-sm font-bold text-navy-foreground">
              Track your trip
            </p>
          </Reveal>
          <Reveal delay={240} className="lg:translate-y-10">
            <PhoneFrame>
              <TripScreen />
            </PhoneFrame>
            <p className="mt-5 text-center text-sm font-bold text-navy-foreground">Trip details</p>
          </Reveal>
        </div>
        <div className="mx-auto mb-6 mt-10 flex justify-center">
          <PreviewTag>App preview · availability depends on participating services</PreviewTag>
        </div>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[32px] border border-navy-foreground/10 bg-navy-foreground/5 p-8 text-center lg:max-w-4xl lg:flex-row lg:text-left">
          <AppIcon className="h-16 w-16 shrink-0" />
          <div className="flex-1">
            <p className="text-xl font-extrabold text-navy-foreground">
              Get the RESQ Nepal mobile app.
            </p>
          </div>
          <StoreBadges inverted />
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOR HOSPITALS (HOMEPAGE EXPANSION) ---------------- */
export function ForHospitalsSection() {
  const capabilities = [
    [
      MapPinned,
      "24/7 Live GPS Tracking",
      "View locations, routes, and availability when GPS is connected.",
    ],
    [
      Camera,
      "Live Camera Monitoring",
      "View authorized driver, road, and supported camera channels.",
    ],
    [
      History,
      "Historical Video Playback",
      "Find available recordings by vehicle, channel, date, and time.",
    ],
    [
      ClipboardList,
      "Patient Request Management",
      "Manage requests, assignments, destinations, and status.",
    ],
    [Users, "Driver Management", "Organize drivers, assignments, availability, and activity."],
    [Ambulance, "Ambulance Fleet Management", "Review vehicles, availability, and fleet status."],
    [Route, "Live Trip Monitoring", "Follow supported trips from assignment to completion."],
    [
      BarChart3,
      "Hospital Analytics & Reports",
      "Review trips, utilization, driver activity, and request trends.",
    ],
    [
      Wifi,
      "Device Health Monitoring",
      "Review device connectivity, last contact, and supported alerts.",
    ],
  ] as const;

  return (
    <section className="bg-background py-24 sm:py-32" aria-labelledby="for-hospitals-title">
      <div className={wrap}>
        <SectionHeading
          eyebrow="For Hospitals"
          title="Smarter Ambulance Management for Hospitals."
          copy="Track fleets, manage requests, and monitor ambulance operations from one platform."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map(([Icon, title, copy], index) => (
            <Reveal key={title} delay={(index % 3) * 80}>
              <article className="h-full rounded-[24px] border border-border bg-soft p-6 transition-all hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-16">
          <div className="mb-8 text-center">
            <p className="eyebrow mb-3">Centralized hospital workspace</p>
            <h3 id="for-hospitals-title" className="display text-3xl text-navy sm:text-4xl">
              One Dashboard for Ambulance Operations.
            </h3>
          </div>
          <DashboardMockup />
        </Reveal>
        <div className="mt-8 flex flex-col items-center gap-5 text-center">
          <PreviewTag>
            Illustrative preview · sample data · integrations pending where labelled
          </PreviewTag>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/hospital-platform">
                Learn More <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/register">Join as Hospital</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOSPITAL PLATFORM PAGE ---------------- */
export function HospitalPlatformOverview() {
  return (
    <section className="bg-navy-gradient relative overflow-hidden py-20 sm:py-28">
      <div className={wrap}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="eyebrow mb-4">RESQ Nepal Hospital Platform</p>
            <h1 className="display text-5xl text-navy-foreground sm:text-6xl">
              Transform Your Hospital&apos;s Ambulance Operations
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy-foreground/75">
              A centralized platform designed to help hospitals monitor ambulances, coordinate
              drivers, oversee emergency requests, and manage fleet operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/register">
                  Join as Hospital <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/hospital/login">Hospital / Provider Login</Link>
              </Button>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-navy-foreground/55">
              Fleet and driver records are connected for approved accounts. GPS, camera, playback,
              request, trip, analytics, and device telemetry require future authorized integrations.
            </p>
          </Reveal>
          <Reveal delay={120} className="min-w-0">
            <div className="max-h-[700px] overflow-hidden rounded-[30px] border border-navy-foreground/15 bg-navy/50 p-2">
              <DashboardMockup />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function IntegrationLabel({ children }: { children: string }) {
  return (
    <span className="inline-flex rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-navy">
      {children}
    </span>
  );
}

export function HospitalPlatformDetails() {
  const requestStatuses = [
    "New",
    "Pending",
    "Accepted",
    "Assigned",
    "On the Way",
    "Patient Picked Up",
    "Arrived at Hospital",
    "Completed",
    "Cancelled",
  ];
  const journey = [
    "Request Received",
    "Ambulance Assigned",
    "Driver on the Way",
    "Patient Picked Up",
    "Arrived at Hospital",
    "Trip Completed",
  ];

  return (
    <>
      <section className="bg-navy py-24 text-navy-foreground sm:py-32">
        <div className={wrap}>
          <SectionHeading
            inverted
            eyebrow="Authorized camera monitoring"
            title="Complete Visibility Into Your Ambulance Fleet."
            copy="Authorized hospital staff can access available camera channels only when compatible vehicle hardware, consent, retention rules, and audited permissions are configured."
          />
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[28px] border border-navy-foreground/10 bg-navy-foreground/5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-extrabold">AMB-DEMO · Camera channels</p>
                  <p className="mt-1 text-xs text-navy-foreground/55">No stream source connected</p>
                </div>
                <span className="rounded-full bg-warning/15 px-3 py-1 text-[10px] font-bold text-warning">
                  DEMONSTRATION ONLY
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "Driver View",
                  "Front Road View",
                  "Rear Camera · if supported",
                  "Additional Channel · if supported",
                ].map((channel) => (
                  <div
                    key={channel}
                    className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-navy-foreground/10 bg-black/25 p-5 text-center"
                  >
                    <Camera className="h-8 w-8 text-navy-foreground/25" />
                    <p className="mt-3 text-sm font-bold">{channel}</p>
                    <p className="mt-1 text-[10px] text-navy-foreground/45">
                      Offline · integration pending
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs text-navy-foreground/55">
                <ShieldCheck className="h-4 w-4 text-success" /> Video and audio access must be
                permission-controlled and audited.
              </p>
            </div>
            <div className="rounded-[28px] bg-card p-6 text-foreground">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Historical playback</p>
                  <h3 className="mt-2 text-2xl font-extrabold text-navy">
                    Access Previous Recordings Whenever Needed.
                  </h3>
                </div>
                <History className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {["Select ambulance", "Select channel", "Choose date", "Choose time"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-border bg-muted p-3 text-xs font-semibold text-navy"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
              <div className="mt-4 flex min-h-44 items-center justify-center rounded-2xl bg-navy text-center">
                <div>
                  <MonitorPlay className="mx-auto h-8 w-8 text-navy-foreground/25" />
                  <p className="mt-3 text-xs text-navy-foreground/50">
                    No DVR playback API connected
                  </p>
                </div>
              </div>
              <div className="mt-4 h-2 rounded-full bg-secondary">
                <div className="h-full w-1/4 rounded-full bg-primary" />
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Available periods and retention will follow the connected DVR provider; indefinite
                recording availability is not promised.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32">
        <div className={wrap}>
          <SectionHeading
            eyebrow="Requests and dispatch visibility"
            title="Every Patient Request. Clearly Organized."
            copy="A protected workflow is planned for request time, pickup, destination, priority, assignment, and progress without exposing patient information publicly."
          />
          <div className="mt-14 overflow-hidden rounded-[28px] border border-border bg-card shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
              <div>
                <p className="font-extrabold text-navy">Patient request workflow preview</p>
                <p className="text-xs text-muted-foreground">
                  De-identified demonstration interface
                </p>
              </div>
              <IntegrationLabel>Pending request integration</IntegrationLabel>
            </div>
            <div className="overflow-x-auto">
              <div className="grid min-w-[920px] grid-cols-9 gap-2 p-5">
                {requestStatuses.map((status, index) => (
                  <div key={status} className="rounded-xl bg-muted p-3 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-navy-foreground">
                      {index + 1}
                    </span>
                    <p className="mt-2 text-[10px] font-bold text-navy">{status}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft py-24 sm:py-32">
        <div className={wrap}>
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <article className="h-full rounded-[28px] border border-border bg-card p-7 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Users />
                  </span>
                  <IntegrationLabel>Connected records</IntegrationLabel>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-navy">
                  Manage Your Ambulance Drivers Efficiently.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Protected driver profiles and vehicle assignments are available to approved
                  hospital accounts. Availability, location, trips, and activity await operational
                  integrations.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                  {[
                    "Driver profiles",
                    "Vehicle assignment",
                    "Availability status",
                    "Authorized location",
                    "Active trip",
                    "Activity history",
                  ].map((item) => (
                    <div key={item} className="rounded-xl bg-muted p-3 font-semibold text-navy">
                      {item}
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
            <Reveal delay={100}>
              <article className="h-full rounded-[28px] border border-border bg-card p-7 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Ambulance />
                  </span>
                  <IntegrationLabel>Connected records</IntegrationLabel>
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-navy">
                  Your Entire Ambulance Fleet. One Overview.
                </h2>
                <p className="mt-3 text-muted-foreground">
                  Hospital-scoped ambulance registration, vehicle information, and driver records
                  are supported. Live availability, current trips, and device connectivity remain
                  pending.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    "AMB-DEMO-01 · Basic · Registered",
                    "AMB-DEMO-02 · Advanced · Registered",
                    "AMB-DEMO-03 · ICU · Registered",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm font-bold text-navy"
                    >
                      <span>{item}</span>
                      <span className="text-[10px] text-muted-foreground">SAMPLE</span>
                    </div>
                  ))}
                </div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-background py-24 sm:py-32">
        <div className={wrap}>
          <SectionHeading
            eyebrow="Journey coordination"
            title="Monitor Every Journey From Start to Finish."
            copy="Follow a clear trip timeline with route, assignment, pickup, arrival, and completion information when a trip source is connected."
          />
          <div className="mt-14 grid gap-3 md:grid-cols-6">
            {journey.map((step, index) => (
              <Reveal key={step} delay={index * 60}>
                <div className="h-full rounded-2xl border border-border bg-card p-5 shadow-card">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="mt-4 text-sm font-extrabold text-navy">{step}</p>
                  <p className="mt-2 text-[10px] text-muted-foreground">Illustrative status</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <IntegrationLabel>Trip integration pending</IntegrationLabel>
          </div>
        </div>
      </section>

      <section className="bg-soft py-24 sm:py-32">
        <div className={wrap}>
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="rounded-[28px] border border-border bg-card p-7 shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Hospital analytics & reports</p>
                  <h2 className="mt-3 text-3xl font-extrabold text-navy">
                    Understand Your Hospital&apos;s Ambulance Operations.
                  </h2>
                </div>
                <IntegrationLabel>Demonstration data</IntegrationLabel>
              </div>
              <div className="mt-8 grid grid-cols-4 items-end gap-3 rounded-2xl bg-muted p-5">
                {[38, 62, 46, 78, 55, 88, 68, 80].map((height, index) => (
                  <div key={`${height}-${index}`} className="flex h-32 items-end">
                    <div
                      className="w-full rounded-t-lg bg-primary/80"
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {["Daily trips", "Fleet utilization", "Driver activity", "Request statistics"].map(
                  (item) => (
                    <p
                      key={item}
                      className="rounded-xl border border-border p-3 text-xs font-bold text-navy"
                    >
                      {item}
                    </p>
                  ),
                )}
              </div>
            </article>
            <article className="rounded-[28px] bg-navy p-7 text-navy-foreground shadow-card">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">
                    Device health monitoring
                  </p>
                  <h2 className="mt-3 text-3xl font-extrabold">
                    Know When Connected Hardware Needs Attention.
                  </h2>
                </div>
                <HeartPulse className="h-8 w-8 text-primary" />
              </div>
              <div className="mt-8 space-y-3">
                {[
                  ["GPS device", "No telemetry connected"],
                  ["Front camera", "No stream connected"],
                  ["Driver camera", "No stream connected"],
                  ["Last communication", "Unavailable"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-xl bg-navy-foreground/5 p-4 text-sm"
                  >
                    <span className="font-bold">{label}</span>
                    <span className="text-xs text-warning">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-navy-foreground/55">
                Actual online status, GPS signal, camera connectivity, last contact, and alerts will
                appear only after compatible telemetry is integrated.
              </p>
              <Button asChild variant="glass" size="lg" className="mt-6">
                <Link to="/device-request">Request GPS / Devices</Link>
              </Button>
            </article>
          </div>
          <div className="bg-navy-gradient mt-16 flex flex-col items-start justify-between gap-6 rounded-[32px] p-9 sm:p-12 lg:flex-row lg:items-center">
            <div>
              <h2 className="display text-3xl text-navy-foreground sm:text-4xl">
                Bring Your Hospital&apos;s Ambulance Operations Into RESQ Nepal.
              </h2>
              <p className="mt-3 text-navy-foreground/65">
                Connect your hospital to a smarter ambulance management and monitoring platform.
              </p>
            </div>
            <Button asChild variant="hero" size="xl" className="shrink-0">
              <Link to="/register">
                Join as Hospital <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

/* ---------------- HOSPITALS ---------------- */
export function HospitalsSection() {
  const benefits = [
    {
      icon: MapPinned,
      t: "Live GPS Fleet Tracking",
      c: "View vehicle locations when compatible GPS is connected.",
    },
    {
      icon: Radio,
      t: "24/7 Ambulance Monitoring",
      c: "See availability, assignments, and device status in one view.",
    },
    {
      icon: Camera,
      t: "Driver & Road Cameras",
      c: "View authorized channels on supported vehicle hardware.",
    },
    {
      icon: MonitorPlay,
      t: "Live Video Monitoring",
      c: "Bring permission-controlled video into operations.",
    },
    {
      icon: History,
      t: "Historical Video Playback",
      c: "Retrieve recordings when vendors and permissions support it.",
    },
    {
      icon: ClipboardList,
      t: "Patient Request Management",
      c: "Coordinate requests and assignments through clear statuses.",
    },
    {
      icon: Route,
      t: "Trip & Journey Monitoring",
      c: "Follow pickup, destination, route, and completion details.",
    },
    {
      icon: Users,
      t: "Ambulance & Driver Management",
      c: "Organize vehicle and driver records in one protected account.",
    },
    {
      icon: Gauge,
      t: "Operational Dashboard",
      c: "Review fleet, request, trip, and device summaries quickly.",
    },
    {
      icon: BarChart3,
      t: "Activity & Performance Reports",
      c: "Review activity when reporting data is connected.",
    },
  ];
  return (
    <section id="hospital-platform" className="scroll-mt-20 bg-background py-24 sm:py-32">
      <div className={wrap}>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">Hospital ambulance operations</p>
            <h2 className="display text-4xl text-navy sm:text-5xl">
              Smarter Ambulance Management for Hospitals.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Track fleets, manage requests, and monitor ambulance operations from one platform.
            </p>
            <p className="mt-4 rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-navy">
              <strong>Current connection status:</strong> approved accounts show linked ambulance
              and driver records. GPS, requests, trips, cameras, playback, and reports remain
              previews until integrations are connected.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/dashboard">Explore Hospital Platform</Link>
              </Button>
              <Button asChild variant="soft" size="xl">
                <Link to="/register">Register Your Hospital</Link>
              </Button>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative">
            <div className="relative overflow-hidden rounded-[32px] bg-navy p-3 shadow-float sm:p-5">
              <img
                src={hospitalImg}
                alt="Hospital entrance representing centralized ambulance operations"
                loading="lazy"
                className="aspect-[4/3] w-full rounded-[24px] object-cover opacity-70"
              />
              <div className="bg-fade-up absolute inset-3 rounded-[24px] sm:inset-5" />
              <div className="absolute inset-x-8 bottom-8 grid grid-cols-2 gap-2 sm:inset-x-10 sm:bottom-10">
                {[
                  ["Fleet visibility", "One control center"],
                  ["Driver visibility", "Authorized access"],
                  ["Camera-ready", "Vendor dependent"],
                  ["Secure onboarding", "Admin verified"],
                ].map(([title, copy]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-navy-foreground/15 bg-navy/85 p-3 text-navy-foreground backdrop-blur"
                  >
                    <p className="text-[11px] font-bold">{title}</p>
                    <p className="mt-1 text-[9px] text-navy-foreground/60">{copy}</p>
                  </div>
                ))}
              </div>
              <div className="absolute left-8 top-8 rounded-full border border-navy-foreground/20 bg-navy/85 px-3 py-1.5 text-[10px] font-bold text-navy-foreground backdrop-blur sm:left-10 sm:top-10">
                RESQ Nepal Hospital Control Center
              </div>
            </div>
          </Reveal>
        </div>
        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((b, i) => (
            <Reveal key={b.t} delay={(i % 5) * 70}>
              <div className="group h-full rounded-[24px] border border-border bg-soft p-6 transition-all hover:-translate-y-1 hover:shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <b.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-navy">{b.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.c}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <div className="bg-navy-gradient relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[32px] p-10 sm:p-14 lg:flex-row lg:items-center">
            <h3 className="display max-w-2xl text-3xl text-navy-foreground sm:text-4xl">
              Bring Ambulance Operations Into One Platform.
            </h3>
            <Button asChild variant="hero" size="xl">
              <Link to="/register">
                Register Your Hospital <ArrowRight />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- PROVIDERS ---------------- */
export function ProvidersSection() {
  const capabilities = [
    {
      icon: Truck,
      title: "Fleet records",
      copy: "Keep ambulance categories and vehicle details organized.",
    },
    {
      icon: Users,
      title: "Driver coordination",
      copy: "Connect driver information with operational vehicles.",
    },
    {
      icon: Activity,
      title: "Availability and trip visibility",
      copy: "Support clearer status and trip coordination as integrations become available.",
    },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="eyebrow mb-4">For ambulance providers</p>
            <h2 className="display text-4xl text-navy sm:text-5xl">
              Connect Your Ambulance Service.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
              Join a shared platform for ambulance discovery and hospital coordination. Provider
              onboarding and operations are not yet enabled.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl">
                <Link to="/contact">
                  Discuss Provider Partnership <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="soft" size="xl">
                <Link to="/provider/login">Provider sign in</Link>
              </Button>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-3">
            {capabilities.map(({ icon: Icon, title, copy }, index) => (
              <Reveal key={title} delay={index * 100}>
                <article className="h-full rounded-[28px] border border-border bg-card p-6 shadow-card">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </article>
              </Reveal>
            ))}
            <div className="sm:col-span-3">
              <PreviewTag>
                Provider accounts and operational tools are not yet available.
              </PreviewTag>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- DASHBOARD ---------------- */
export function DashboardSection() {
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="RESQ Nepal Hospital Control Center"
          title="See Every Operation in One Place."
          copy="Review fleets, requests, drivers, trips, and supported device data in one workspace."
        />
        <Reveal className="mt-14">
          <DashboardMockup />
        </Reveal>
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <PreviewTag>Demonstration preview · sample data only</PreviewTag>
          <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Approved accounts currently show ambulance and driver records. Live GPS, cameras,
            recordings, requests, trips, and reports require authorized integrations and controls.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="hero" size="xl">
              <Link to="/contact">Request a Demonstration</Link>
            </Button>
            <Button asChild variant="soft" size="xl">
              <Link to="/hospital/login">Hospital / Provider Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRACKING ---------------- */
export function TrackingSection() {
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="Platform modules"
          title="Built for End-to-End Ambulance Operations."
          copy="A modular control center designed for fleet, device, driver, request, trip, reporting, and role-based access workflows."
        />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[28px] border border-border">
              <MapGraphic />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 rounded-2xl bg-card/95 p-5 shadow-card backdrop-blur">
                <div>
                  <p className="flex items-center gap-2 text-lg font-extrabold text-navy">
                    <Radio className="h-5 w-5 text-primary" /> Live GPS tracking module
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Ready for compatible location providers; this map remains a demonstration.
                  </p>
                </div>
                <PreviewTag>Illustration</PreviewTag>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-5">
            <Reveal delay={100}>
              <div className="rounded-[28px] bg-navy p-6 text-navy-foreground">
                <p className="flex items-center gap-2 text-lg font-extrabold">
                  <Truck className="h-5 w-5 text-primary" /> Smart Fleet Management
                </p>
                <p className="mt-1 text-sm text-navy-foreground/60">
                  Keep fleet information organized in one place.
                </p>
                <div className="mt-5 space-y-2">
                  {(
                    [
                      ["AMB-01 · Basic", "Available"],
                      ["AMB-02 · Advanced", "On Trip"],
                      ["AMB-04 · Basic", "Offline"],
                    ] as const
                  ).map(([v, s]) => (
                    <div
                      key={v}
                      className="flex items-center justify-between rounded-xl bg-navy-foreground/5 px-3 py-2.5 text-xs"
                    >
                      <span className="font-semibold">{v}</span>
                      <StatusPill status={s} />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="rounded-[28px] border border-border bg-soft p-6">
                <p className="flex items-center gap-2 text-lg font-extrabold text-navy">
                  <History className="h-5 w-5 text-primary" /> Trip History
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Illustrative trip history only; operational trip records are not available yet.
                </p>
                <ol className="mt-5 space-y-3 border-l-2 border-border pl-4">
                  {[
                    ["Sample · 09:12", "6.4 km"],
                    ["Sample · 10:40", "3.1 km"],
                    ["Sample · 11:05", "8.9 km"],
                  ].map(([d, k]) => (
                    <li key={d} className="relative text-xs">
                      <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="font-bold text-navy">{d}</span>{" "}
                      <span className="text-muted-foreground">· {k} · Completed</span>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- PLATFORM MODULES ---------------- */
export function PlatformModulesSection() {
  const modules = [
    {
      icon: Truck,
      title: "Fleet Management",
      copy: "Hospital-scoped ambulance records and operating status.",
      status: "Connected records",
    },
    {
      icon: MapPinned,
      title: "Live GPS Tracking",
      copy: "Location, route, pickup, destination, and hospital map layers.",
      status: "Integration required",
    },
    {
      icon: Camera,
      title: "Live Camera Monitoring",
      copy: "Authorized road, driver, rear, and supported auxiliary channels.",
      status: "Integration required",
    },
    {
      icon: History,
      title: "Historical Video Playback",
      copy: "Date, time, channel, timeline, speed, and retention-aware retrieval.",
      status: "Vendor dependent",
    },
    {
      icon: Users,
      title: "Driver Management",
      copy: "Protected driver records and ambulance assignments.",
      status: "Connected records",
    },
    {
      icon: ClipboardList,
      title: "Patient Request Management",
      copy: "Priority, assignment, and end-to-end request status workflows.",
      status: "Integration required",
    },
    {
      icon: Route,
      title: "Trip Management",
      copy: "Pickup, destination, route progress, timing, and completion details.",
      status: "Integration required",
    },
    {
      icon: BarChart3,
      title: "Hospital Reports",
      copy: "Operational activity and performance reporting for authorized teams.",
      status: "Integration required",
    },
    {
      icon: Radio,
      title: "Device Status & Monitoring",
      copy: "GPS, camera channel, connectivity, and health visibility.",
      status: "Integration required",
    },
    {
      icon: ShieldCheck,
      title: "User & Access Management",
      copy: "Verified accounts, hospital scoping, roles, and protected access.",
      status: "Security foundation",
    },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="Control center modules"
          title="One Platform. Ten Connected Workflows."
          copy="RESQ Nepal brings the core building blocks of hospital ambulance operations into a consistent, role-controlled workspace."
        />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {modules.map(({ icon: Icon, title, copy, status }, index) => (
            <Reveal key={title} delay={(index % 5) * 70}>
              <article className="h-full rounded-[24px] border border-border bg-card p-6 shadow-card">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                <span className="mt-5 inline-flex rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                  {status}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CATEGORIES ---------------- */
export function Categories() {
  const cats = [
    {
      t: "Basic Ambulance",
      c: "Standard ambulance transportation from participating providers.",
      img: heroImg,
      pos: "object-[75%_center]",
    },
    {
      t: "Advanced / ICU Ambulance",
      c: "Equipment details come from participating providers.",
      img: icuImg,
      pos: "object-center",
    },
    {
      t: "Ventilator-Equipped",
      c: "Availability depends on each provider.",
      img: icuImg,
      pos: "object-left",
    },
    {
      t: "Other Passenger Transport",
      c: "Non-medical transport without ambulance equipment.",
      img: hospitalImg,
      pos: "object-[60%_center]",
      nonMedical: true,
    },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="Vehicle categories"
          title="Different Needs. Different Vehicles."
          copy="Explore vehicles offered by participating providers."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((c, i) => (
            <Reveal key={c.t} delay={i * 90}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[28px] shadow-card">
                <img
                  src={c.img}
                  alt={c.t}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-700 group-hover:scale-105",
                    c.pos,
                  )}
                />
                <div className="bg-fade-up absolute inset-0" />
                {c.nonMedical && (
                  <span className="absolute left-4 top-4 rounded-full bg-card px-3 py-1 text-[11px] font-bold text-navy">
                    Non-medical
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-extrabold text-navy-foreground">{c.t}</h3>
                  <p className="mt-1.5 text-sm text-navy-foreground/75">{c.c}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Equipment and availability vary by provider.
        </p>
      </div>
    </section>
  );
}

/* ---------------- WHY ---------------- */
export function WhyResq() {
  const pts = [
    {
      t: "Easier ambulance discovery",
      v: (
        <div className="h-full">
          <MapGraphic route={false} />
        </div>
      ),
    },
    {
      t: "Connected hospital participation",
      v: <img src={hospitalImg} alt="" loading="lazy" className="h-full w-full object-cover" />,
    },
    {
      t: "Organized fleet information",
      v: (
        <div className="flex h-full flex-col justify-center gap-2 bg-navy p-6">
          {["Available", "On Trip", "Offline"].map((s, i) => (
            <div
              key={s}
              className="flex items-center justify-between rounded-xl bg-navy-foreground/10 px-3 py-2 text-xs font-semibold text-navy-foreground"
            >
              AMB-0{i + 1}
              <StatusPill status={s} />
            </div>
          ))}
        </div>
      ),
    },
    {
      t: "Clearer trip coordination",
      v: (
        <div className="flex h-full items-center justify-center bg-accent">
          <div className="flex items-center gap-2">
            {["Received", "Assigned", "En route"].map((s, i) => (
              <span
                key={s}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-bold",
                  i < 2 ? "bg-primary text-primary-foreground" : "bg-card text-navy",
                )}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ),
    },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Why RESQ Nepal" title="One Platform. Better Connected Services." />
        <div className="mt-5 flex justify-center">
          <PreviewTag>Illustrative platform concepts · not operational data or live GPS</PreviewTag>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {pts.map((p, i) => (
            <Reveal key={p.t} delay={i * 90}>
              <div className="overflow-hidden rounded-[28px] border border-border bg-card">
                <div className="h-56 overflow-hidden">{p.v}</div>
                <p className="p-6 text-xl font-extrabold text-navy">{p.t}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRUST ---------------- */
export function Trust() {
  const items = [
    { icon: BadgeCheck, t: "Verified Partners", c: "Hospital participation requires review." },
    { icon: Lock, t: "Data Responsibility", c: "Protect personal and trip information." },
    {
      icon: MapPinned,
      t: "Clear Status Updates",
      c: "Show service status from available platform information.",
    },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={cn(wrap, "grid items-center gap-14 lg:grid-cols-2")}>
        <div>
          <SectionHeading align="left" eyebrow="Trust" title="Built for Trust and Transparency." />
          <div className="mt-10 space-y-4">
            {items.map((it, i) => (
              <Reveal key={it.t} delay={i * 100}>
                <div className="flex gap-5 rounded-2xl bg-card p-5 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
                    <it.icon className="h-5 w-5 text-primary" />
                  </span>
                  <div>
                    <p className="font-extrabold text-navy">{it.t}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{it.c}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <div className="bg-navy-gradient relative flex aspect-square items-center justify-center overflow-hidden rounded-[40px]">
            <div className="absolute h-[70%] w-[70%] rounded-full border border-navy-foreground/10" />
            <div className="absolute h-[48%] w-[48%] rounded-full border border-navy-foreground/15" />
            <div className="flex h-32 w-32 items-center justify-center rounded-[36px] bg-primary shadow-glow">
              <Lock className="h-14 w-14 text-primary-foreground" />
            </div>
            <span className="absolute left-[12%] top-[22%] rounded-full bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-card">
              Partner review
            </span>
            <span className="absolute bottom-[20%] right-[10%] rounded-full bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-card">
              Minimal data shown
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- JOIN ---------------- */
export function JoinSteps() {
  const steps = [
    { icon: Send, t: "Register", c: "Submit hospital, contact, and ambulance information." },
    {
      icon: FileCheck2,
      t: "Verification",
      c: "RESQ Nepal reviews the organization and submitted details.",
    },
    {
      icon: BadgeCheck,
      t: "Approval",
      c: "Only verified organizations proceed to protected account setup.",
    },
    { icon: Truck, t: "Add Ambulances", c: "Link approved fleet records to the hospital account." },
    {
      icon: Users,
      t: "Onboard Drivers",
      c: "Add authorized driver records and vehicle assignments.",
    },
    {
      icon: Camera,
      t: "Integrate Devices",
      c: "Connect supported GPS and camera hardware with consent controls.",
    },
    {
      icon: Lock,
      t: "Dashboard Access",
      c: "Issue role-controlled credentials to authorized hospital staff.",
    },
    {
      icon: Rocket,
      t: "Monitor Operations",
      c: "Use the connected modules enabled for the organization.",
    },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading
          eyebrow="Hospital onboarding"
          title="Bring Hospital Ambulance Operations Into One Platform."
          copy="Improve fleet visibility, coordination, and operational oversight."
        />
        <div className="relative mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal
              key={s.t}
              delay={i * 120}
              className="relative flex gap-5 sm:flex-col sm:items-center sm:text-center"
            >
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-navy-foreground ring-8 ring-background">
                <s.icon className="h-6 w-6" />
              </span>
              <div>
                <p className="eyebrow sm:mt-5">Step {String(i + 1).padStart(2, "0")}</p>
                <p className="mt-1 text-xl font-extrabold text-navy">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.c}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button asChild variant="hero" size="xl">
            <Link to="/register">
              <UploadCloud /> Start Hospital Registration
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const faqs = [
  [
    "What is RESQ Nepal?",
    "RESQ Nepal connects mobile ambulance access with hospital ambulance operations.",
  ],
  [
    "How can a hospital join the network?",
    "Submit the registration form. RESQ Nepal reviews every hospital before approval.",
  ],
  [
    "Which ambulance categories can participate?",
    "Basic, Advanced/ICU, and ventilator-equipped ambulances can register. Non-medical transport is listed separately.",
  ],
  [
    "What can a hospital see in the partner dashboard today?",
    "Approved accounts can view linked ambulance and driver records. Other operational modules remain previews until integrated.",
  ],
  [
    "Does RESQ Nepal provide live GPS tracking?",
    "The platform supports future GPS integration, but no GPS provider is connected. Public maps use demonstration data.",
  ],
  [
    "Is the mobile app available on Android and iPhone?",
    "The RESQ Nepal mobile application is available.",
  ],
  [
    "How is hospital and trip information protected?",
    "Public previews exclude personal and medical details. Only authorized reviewers can access hospital submissions.",
  ],
];
export function Faq() {
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Questions, Answered." />
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map(([q, a], i) => (
            <AccordionItem
              key={q}
              value={`q${i}`}
              className="rounded-2xl border border-border bg-card px-6 shadow-card"
            >
              <AccordionTrigger className="py-5 text-left text-base font-bold text-navy hover:no-underline">
                {q}
              </AccordionTrigger>
              <AccordionContent className="pb-5 text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

/* ---------------- FINAL CTA ---------------- */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-navy">
      <img
        src={heroImg}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 opacity-25 mix-blend-overlay">
        <MapGraphic ambulances={[]} activeAmbulance={null} />
      </div>
      <div className="bg-fade-left absolute inset-0" />
      <div className={cn(wrap, "relative py-28 sm:py-36")}>
        <Reveal className="max-w-2xl">
          <h2 className="display text-5xl text-navy-foreground sm:text-6xl">
            Better Ambulance Access Starts Here.
          </h2>
          <p className="mt-6 text-lg text-navy-foreground/75">
            Use the app or bring your hospital into the RESQ Nepal network.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl">
              <a href="/#app">
                <Smartphone /> Download Mobile App
              </a>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/register">Register Your Hospital</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
