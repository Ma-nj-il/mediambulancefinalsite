import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { Categories, DashboardSection, FinalCta, HospitalsSection, JoinSteps, Trust } from "@/components/sections";

export const Route = createFileRoute("/hospitals")({
  head: () => ({
    meta: [
      { title: "For Hospitals — RESQ Nepal Partner Network" },
      { name: "description", content: "Bring your hospital's ambulances into one connected network for fleet visibility, trip management and booking requests." },
      { property: "og:title", content: "For Hospitals — RESQ Nepal Partner Network" },
      { property: "og:description", content: "Your hospital. Your ambulances. One smart network." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="For hospitals" title="Partner with RESQ Nepal." copy="Organize your ambulance fleet, drivers and requests on one connected platform." />
      <HospitalsSection />
      <DashboardSection />
      <Categories />
      <Trust />
      <JoinSteps />
      <FinalCta />
    </>
  ),
});
