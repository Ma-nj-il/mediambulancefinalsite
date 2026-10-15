import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { DashboardSection, JoinSteps, TrackingSection } from "@/components/sections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Preview — RESQ Nepal" },
      { name: "description", content: "Preview the RESQ Nepal partner dashboard for vehicles, drivers, requests and trip records. Sample data only." },
      { property: "og:title", content: "Dashboard Preview — RESQ Nepal" },
      { property: "og:description", content: "A clearer view of your ambulance operations." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Dashboard preview" title="See the partner dashboard." copy="Everything below uses illustrative sample data. It does not show real vehicles or live locations." />
      <DashboardSection />
      <TrackingSection />
      <JoinSteps />
    </>
  ),
});
