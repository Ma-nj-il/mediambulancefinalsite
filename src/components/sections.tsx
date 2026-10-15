import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, CheckCircle2, ClipboardList, Eye, FileCheck2, History, Lock, MapPinned, Network, Radio, Rocket, Send, Smartphone, Truck, UploadCloud } from "lucide-react";
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
      <img src={heroImg} alt="RESQ ambulance on a Kathmandu street at golden hour" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
      <div className="bg-fade-left absolute inset-0" />
      <div className="bg-fade-up absolute inset-x-0 bottom-0 h-1/3 lg:hidden" />
      <div className={cn(wrap, "relative grid min-h-[calc(100vh-72px)] items-center gap-10 py-16 lg:grid-cols-12 lg:py-20")}>
        <div className="lg:col-span-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/10 px-3.5 py-1.5 text-xs font-semibold text-navy-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-primary" /> Ambulance network for Nepal
          </span>
          <h1 className="display mt-6 text-5xl text-navy-foreground sm:text-6xl xl:text-7xl">
            Emergency Help,<br /> Just a <span className="text-primary">Tap</span> Away.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-foreground/80">
            Find and request ambulance services through RESQ Nepal — a smarter way to connect with emergency transportation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl"><a href="#app"><Smartphone /> Download the App</a></Button>
            <Button asChild variant="glass" size="xl"><Link to="/register">Join as Hospital <ArrowRight /></Link></Button>
          </div>
          <p className="mt-6 text-sm text-navy-foreground/60">Built to help people connect with ambulance services when every moment matters.</p>
        </div>
        <div className="relative hidden h-[600px] lg:col-span-6 lg:block">
          {/* map card */}
          <div className="animate-float-slow absolute bottom-6 left-0 h-56 w-80 overflow-hidden rounded-3xl border border-navy-foreground/20 shadow-float">
            <MapGraphic />
            <span className="absolute left-3 top-3 rounded-full bg-card/95 px-2.5 py-1 text-[10px] font-bold text-navy">Route preview</span>
          </div>
          {/* phone */}
          <div className="animate-float absolute right-4 top-4">
            <PhoneFrame><TrackScreen /></PhoneFrame>
          </div>
          {/* booking card */}
          <div className="animate-float-slow absolute left-14 top-16 w-64 rounded-2xl bg-card p-4 shadow-float">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Sample request</p>
              <span className="flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success"><CheckCircle2 className="h-3 w-3" />Request received</span>
            </div>
            <p className="mt-2 text-sm font-extrabold text-navy">Basic Ambulance</p>
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
              <p>● Baneshwor, Kathmandu</p>
              <p className="text-primary">● Partner hospital</p>
            </div>
          </div>
        </div>
        {/* mobile visual */}
        <div className="flex justify-center lg:hidden">
          <PhoneFrame className="scale-90"><TrackScreen /></PhoneFrame>
        </div>
      </div>
    </section>
  );
}

/* ---------------- EMERGENCY MOMENT ---------------- */
export function EmergencyMoment() {
  const items = [
    { cap: "Find participating services.", visual: <img src={familyImg} alt="A woman searching for an ambulance on her phone" loading="lazy" width={1200} height={1408} className="h-full w-full object-cover" /> },
    {
      cap: "Send a booking request.",
      visual: (
        <div className="flex h-full items-center justify-center bg-secondary">
          <div className="w-64 space-y-2">
            {([["Basic Ambulance", "Available"], ["Advanced Ambulance", "Available"], ["Ventilator-Equipped", "Offline"]] as const).map(([n, s]) => (
              <div key={n} className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
                <div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent"><Truck className="h-4 w-4 text-primary" /></span><span className="text-xs font-bold text-navy">{n}</span></div>
                <StatusPill status={s} />
              </div>
            ))}
            <div className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">Send request</div>
          </div>
        </div>
      ),
    },
    { cap: "Follow trip updates when available.", visual: <MapGraphic /> },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Why it matters" title="In an Emergency, Clarity Matters." copy="Knowing where to start can make a stressful moment easier to navigate. RESQ Nepal aims to make ambulance discovery and requests simpler through one connected platform." />
        <div className="relative mt-16 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-1/2 hidden h-px border-t-2 border-dashed border-primary/30 md:block" />
          {items.map((it, i) => (
            <Reveal key={it.cap} delay={i * 120}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] shadow-card">{it.visual}</div>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-extrabold text-navy-foreground">{i + 1}</span>
                <p className="font-bold text-navy">{it.cap}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">RESQ Nepal does not replace official emergency call services. Availability depends on participating providers.</p>
      </div>
    </section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
export function HowItWorks() {
  const steps = [
    { n: "01", t: "Find", c: "Explore participating ambulance services.", s: <TrackScreen /> },
    { n: "02", t: "Request", c: "Submit your transportation request through the platform.", s: <RequestScreen /> },
    { n: "03", t: "Follow", c: "View request status and trip updates when supported.", s: <TripScreen /> },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="How it works" title="A Simpler Way to Connect." />
        <div className="mt-16 grid gap-10 lg:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150} className="flex flex-col items-center text-center">
              <div className="relative flex justify-center">
                <span className="display absolute -top-10 left-1/2 -translate-x-1/2 text-[140px] text-navy/5">{s.n}</span>
                <PhoneFrame className="relative scale-[0.85]">{s.s}</PhoneFrame>
              </div>
              <p className="eyebrow mt-2">Step {s.n}</p>
              <h3 className="mt-2 text-3xl font-extrabold text-navy">{s.t}</h3>
              <p className="mt-2 max-w-xs text-muted-foreground">{s.c}</p>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center"><PreviewTag>Screens shown are proposed interface previews</PreviewTag></div>
      </div>
    </section>
  );
}

/* ---------------- APP ---------------- */
export function AppSection() {
  return (
    <section id="app" className="bg-navy-gradient relative overflow-hidden py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading inverted eyebrow="The RESQ app" title="Be Ready When Every Second Matters." copy="Keep ambulance discovery and trip information within reach." />
        <div className="mt-16 flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-end">
          <Reveal className="lg:translate-y-10"><PhoneFrame><RequestScreen /></PhoneFrame><p className="mt-5 text-center text-sm font-bold text-navy-foreground">Request an ambulance</p></Reveal>
          <Reveal delay={120}><PhoneFrame className="lg:scale-110"><TrackScreen /></PhoneFrame><p className="mt-10 text-center text-sm font-bold text-navy-foreground">Track your trip</p></Reveal>
          <Reveal delay={240} className="lg:translate-y-10"><PhoneFrame><TripScreen /></PhoneFrame><p className="mt-5 text-center text-sm font-bold text-navy-foreground">Trip details</p></Reveal>
        </div>
        <div className="mx-auto mt-20 flex max-w-3xl flex-col items-center gap-6 rounded-[32px] border border-navy-foreground/10 bg-navy-foreground/5 p-8 text-center lg:max-w-4xl lg:flex-row lg:text-left">
          <AppIcon className="h-16 w-16 shrink-0" />
          <div className="flex-1">
            <p className="text-xl font-extrabold text-navy-foreground">The RESQ Nepal app is coming soon.</p>
            <p className="mt-1 text-sm text-navy-foreground/60">Android and iPhone launch details will be shared here.</p>
          </div>
          <StoreBadges inverted />
        </div>
      </div>
    </section>
  );
}

/* ---------------- HOSPITALS ---------------- */
export function HospitalsSection() {
  const benefits = [
    { n: "01", icon: Eye, t: "Fleet Visibility", c: "View registered ambulances and their status." },
    { n: "02", icon: ClipboardList, t: "Trip Management", c: "Keep trip and driver information organized." },
    { n: "03", icon: Network, t: "Connected Requests", c: "Manage platform booking requests through a centralized workflow." },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow mb-4">For hospitals</p>
            <h2 className="display text-4xl text-navy sm:text-5xl">Your Hospital. Your Ambulances. One Smart Network.</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Bring your ambulance operations into a connected digital platform designed for visibility, coordination, and better fleet management.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/register">Join as Hospital</Link></Button>
              <Button asChild variant="soft" size="xl"><Link to="/contact">Request a Live Demo</Link></Button>
            </div>
          </Reveal>
          <Reveal delay={150} className="relative pb-16">
            <img src={hospitalImg} alt="Hospital entrance with ambulance parked" loading="lazy" width={1600} height={1088} className="aspect-[4/3] w-full rounded-[32px] object-cover shadow-card" />
            <div className="animate-float-slow absolute -bottom-2 left-4 w-72 rounded-2xl bg-card p-4 shadow-float sm:-left-8">
              <div className="flex items-center justify-between"><p className="text-xs font-bold text-navy">Fleet overview</p><PreviewTag>Sample</PreviewTag></div>
              <div className="mt-3 space-y-1.5">
                {([["AMB-01 · Basic", "Available"], ["AMB-02 · Advanced", "On Trip"], ["AMB-03 · Ventilator", "Available"]] as const).map(([v, st]) => (
                  <div key={v} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-[11px] font-semibold text-navy">{v}<StatusPill status={st} /></div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
        <div className="mt-24 grid gap-5 md:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.n} delay={i * 100}>
              <div className="group h-full rounded-[28px] border border-border bg-soft p-8 transition-all hover:-translate-y-1 hover:shadow-float">
                <div className="flex items-center justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow"><b.icon className="h-6 w-6" /></span>
                  <span className="display text-5xl text-navy/10">{b.n}</span>
                </div>
                <h3 className="mt-8 text-2xl font-extrabold text-navy">{b.t}</h3>
                <p className="mt-2 text-muted-foreground">{b.c}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10">
          <div className="bg-navy-gradient relative flex flex-col items-start justify-between gap-6 overflow-hidden rounded-[32px] p-10 sm:p-14 lg:flex-row lg:items-center">
            <h3 className="display max-w-2xl text-3xl text-navy-foreground sm:text-4xl">Bring Your Ambulance Service Into One Connected Network.</h3>
            <Button asChild variant="hero" size="xl"><Link to="/register">Join RESQ Network <ArrowRight /></Link></Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- DASHBOARD ---------------- */
export function DashboardSection() {
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Partner dashboard" title="A Clearer View of Your Ambulance Operations." copy="Designed to help participating hospitals organize vehicles, drivers, requests, and trip records in one place." />
        <Reveal className="mt-14"><DashboardMockup /></Reveal>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Button asChild variant="hero" size="xl"><Link to="/contact">Request a Live Demo</Link></Button>
          <PreviewTag>Dashboard Preview · illustrative sample data, not live tracking</PreviewTag>
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
        <SectionHeading eyebrow="Fleet tools" title="Know More. Coordinate Better." copy="Bring ambulance locations, trip activity, and vehicle information into a more organized workflow." />
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="relative h-full min-h-[420px] overflow-hidden rounded-[28px] border border-border">
              <MapGraphic />
              <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 rounded-2xl bg-card/95 p-5 shadow-card backdrop-blur">
                <div>
                  <p className="flex items-center gap-2 text-lg font-extrabold text-navy"><Radio className="h-5 w-5 text-primary" /> Live Tracking</p>
                  <p className="mt-1 text-sm text-muted-foreground">View location updates when GPS integration is active.</p>
                </div>
                <PreviewTag>Illustration</PreviewTag>
              </div>
            </div>
          </Reveal>
          <div className="grid gap-5">
            <Reveal delay={100}>
              <div className="rounded-[28px] bg-navy p-6 text-navy-foreground">
                <p className="flex items-center gap-2 text-lg font-extrabold"><Truck className="h-5 w-5 text-primary" /> Smart Fleet Management</p>
                <p className="mt-1 text-sm text-navy-foreground/60">Keep fleet information organized in one place.</p>
                <div className="mt-5 space-y-2">
                  {([["AMB-01 · Basic", "Available"], ["AMB-02 · Advanced", "On Trip"], ["AMB-04 · Basic", "Offline"]] as const).map(([v, s]) => (
                    <div key={v} className="flex items-center justify-between rounded-xl bg-navy-foreground/5 px-3 py-2.5 text-xs">
                      <span className="font-semibold">{v}</span><StatusPill status={s} />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="rounded-[28px] border border-border bg-soft p-6">
                <p className="flex items-center gap-2 text-lg font-extrabold text-navy"><History className="h-5 w-5 text-primary" /> Trip History</p>
                <p className="mt-1 text-sm text-muted-foreground">Review trip records and journey information.</p>
                <ol className="mt-5 space-y-3 border-l-2 border-border pl-4">
                  {[["Sample · 09:12", "6.4 km"], ["Sample · 10:40", "3.1 km"], ["Sample · 11:05", "8.9 km"]].map(([d, k]) => (
                    <li key={d} className="relative text-xs">
                      <span className="absolute -left-[22px] top-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <span className="font-bold text-navy">{d}</span> <span className="text-muted-foreground">· {k} · Completed</span>
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

/* ---------------- CATEGORIES ---------------- */
export function Categories() {
  const cats = [
    { t: "Basic Ambulance", c: "Standard ambulance transportation from participating providers.", img: heroImg, pos: "object-[75%_center]" },
    { t: "Advanced / ICU Ambulance", c: "Equipment listed only as declared by each participating vehicle.", img: icuImg, pos: "object-center" },
    { t: "Ventilator-Equipped", c: "Availability depends on the participating provider.", img: icuImg, pos: "object-left" },
    { t: "Other Passenger Transport", c: "Non-medical transportation. Not an ambulance and not medically equipped.", img: hospitalImg, pos: "object-[60%_center]", nonMedical: true },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Vehicle categories" title="Different Needs. Different Vehicles." copy="Explore ambulance and transportation categories offered by participating providers." />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((c, i) => (
            <Reveal key={c.t} delay={i * 90}>
              <div className="group relative aspect-[3/4] overflow-hidden rounded-[28px] shadow-card">
                <img src={c.img} alt={c.t} loading="lazy" className={cn("h-full w-full object-cover transition-transform duration-700 group-hover:scale-105", c.pos)} />
                <div className="bg-fade-up absolute inset-0" />
                {c.nonMedical && <span className="absolute left-4 top-4 rounded-full bg-card px-3 py-1 text-[11px] font-bold text-navy">Non-medical</span>}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-xl font-extrabold text-navy-foreground">{c.t}</h3>
                  <p className="mt-1.5 text-sm text-navy-foreground/75">{c.c}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-muted-foreground">Vehicle types, medical equipment, and availability vary by participating provider.</p>
      </div>
    </section>
  );
}

/* ---------------- WHY ---------------- */
export function WhyResq() {
  const pts = [
    { t: "Easier ambulance discovery", v: <div className="h-full"><MapGraphic route={false} /></div> },
    { t: "Connected hospital participation", v: <img src={hospitalImg} alt="" loading="lazy" className="h-full w-full object-cover" /> },
    { t: "Organized fleet information", v: <div className="flex h-full flex-col justify-center gap-2 bg-navy p-6">{["Available", "On Trip", "Offline"].map((s, i) => <div key={s} className="flex items-center justify-between rounded-xl bg-navy-foreground/10 px-3 py-2 text-xs font-semibold text-navy-foreground">AMB-0{i + 1}<StatusPill status={s} /></div>)}</div> },
    { t: "Clearer trip coordination", v: <div className="flex h-full items-center justify-center bg-accent"><div className="flex items-center gap-2">{["Received", "Assigned", "En route"].map((s, i) => <span key={s} className={cn("rounded-full px-3 py-1.5 text-xs font-bold", i < 2 ? "bg-primary text-primary-foreground" : "bg-card text-navy")}>{s}</span>)}</div></div> },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Why RESQ Nepal" title="One Platform. Better Connected Services." />
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
    { icon: BadgeCheck, t: "Verified Partners", c: "Hospital participation is subject to review." },
    { icon: Lock, t: "Responsible Information", c: "Protect personal and trip information." },
    { icon: MapPinned, t: "Clear Status Updates", c: "Display the actual status provided by the platform." },
  ];
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className={cn(wrap, "grid items-center gap-14 lg:grid-cols-2")}>
        <div>
          <SectionHeading align="left" eyebrow="Trust" title="Designed Around Trust and Transparency." />
          <div className="mt-10 space-y-4">
            {items.map((it, i) => (
              <Reveal key={it.t} delay={i * 100}>
                <div className="flex gap-5 rounded-2xl bg-card p-5 shadow-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent"><it.icon className="h-5 w-5 text-primary" /></span>
                  <div><p className="font-extrabold text-navy">{it.t}</p><p className="mt-1 text-sm text-muted-foreground">{it.c}</p></div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <div className="bg-navy-gradient relative flex aspect-square items-center justify-center overflow-hidden rounded-[40px]">
            <div className="absolute h-[70%] w-[70%] rounded-full border border-navy-foreground/10" />
            <div className="absolute h-[48%] w-[48%] rounded-full border border-navy-foreground/15" />
            <div className="flex h-32 w-32 items-center justify-center rounded-[36px] bg-primary shadow-glow"><Lock className="h-14 w-14 text-primary-foreground" /></div>
            <span className="absolute left-[12%] top-[22%] rounded-full bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-card">Partner review</span>
            <span className="absolute bottom-[20%] right-[10%] rounded-full bg-card px-3 py-1.5 text-xs font-bold text-navy shadow-card">Minimal data shown</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- JOIN ---------------- */
export function JoinSteps() {
  const steps = [
    { icon: Send, t: "Apply", c: "Submit hospital and contact information." },
    { icon: Truck, t: "Add Vehicles", c: "Provide ambulance categories and relevant vehicle information." },
    { icon: FileCheck2, t: "Verification", c: "The RESQ Nepal team reviews the submitted details." },
    { icon: Rocket, t: "Get Started", c: "Approved partners can begin using the available platform features." },
  ];
  return (
    <section className="bg-background py-24 sm:py-32">
      <div className={wrap}>
        <SectionHeading eyebrow="Onboarding" title="Join the RESQ Network." />
        <div className="relative mt-16 grid gap-8 md:grid-cols-4">
          <div className="absolute left-[12%] right-[12%] top-7 hidden h-0.5 bg-gradient-to-r from-primary via-primary/40 to-border md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 120} className="relative flex gap-5 md:flex-col md:items-center md:text-center">
              <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-navy-foreground ring-8 ring-background"><s.icon className="h-6 w-6" /></span>
              <div>
                <p className="eyebrow md:mt-5">Step 0{i + 1}</p>
                <p className="mt-1 text-xl font-extrabold text-navy">{s.t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.c}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <Button asChild variant="hero" size="xl"><Link to="/register"><UploadCloud /> Start Hospital Registration</Link></Button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const faqs = [
  ["What is RESQ Nepal?", "RESQ Nepal is a digital platform that helps people discover and request ambulance services from participating hospitals and providers in Nepal. It does not replace official emergency call services."],
  ["How can a hospital join the network?", "Complete the hospital registration form with your hospital, vehicle and driver details. The RESQ Nepal team reviews each application before approval."],
  ["Which ambulance categories can participate?", "Basic, Advanced/ICU and ventilator-equipped ambulances can be registered. Non-medical passenger transport is listed separately and clearly marked."],
  ["Can hospitals manage their drivers and vehicles?", "The partner dashboard is designed for managing vehicles, drivers, requests and trip records. The dashboard shown on this site is a preview with sample data."],
  ["Does RESQ Nepal support GPS tracking?", "Location updates depend on GPS integration being active for a vehicle. Maps on this website are illustrations, not live tracking."],
  ["Is the mobile app available on Android and iPhone?", "Not yet. The app is coming soon, and store links will be published here once it is available."],
  ["How is hospital and trip information protected?", "Public previews never show patient names, phone numbers or medical details. Hospital submissions are only accessible to authorized RESQ Nepal reviewers."],
];
export function Faq() {
  return (
    <section className="bg-soft py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5">
        <SectionHeading eyebrow="FAQ" title="Questions, Answered." />
        <Accordion type="single" collapsible className="mt-12 space-y-3">
          {faqs.map(([q, a], i) => (
            <AccordionItem key={q} value={`q${i}`} className="rounded-2xl border border-border bg-card px-6 shadow-card">
              <AccordionTrigger className="py-5 text-left text-base font-bold text-navy hover:no-underline">{q}</AccordionTrigger>
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
      <img src={heroImg} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 opacity-25 mix-blend-overlay"><MapGraphic ambulances={[]} activeAmbulance={null} /></div>
      <div className="bg-fade-left absolute inset-0" />
      <div className={cn(wrap, "relative py-28 sm:py-36")}>
        <Reveal className="max-w-2xl">
          <h2 className="display text-5xl text-navy-foreground sm:text-6xl">Every Second Matters. Better Connections Matter Too.</h2>
          <p className="mt-6 text-lg text-navy-foreground/75">Discover RESQ Nepal or bring your hospital into the network.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="xl"><a href="/#app"><Smartphone /> Download the App</a></Button>
            <Button asChild variant="glass" size="xl"><Link to="/register">Register Your Hospital</Link></Button>
          </div>
          <p className="mt-5 text-sm text-navy-foreground/55">App store availability: coming soon.</p>
        </Reveal>
      </div>
    </section>
  );
}
