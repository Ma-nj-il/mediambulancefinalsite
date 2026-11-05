import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import {
  DashboardSection,
  JoinSteps,
  PlatformModulesSection,
  TrackingSection,
} from "@/components/sections";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Hospital Control Center — RESQ Nepal" },
      {
        name: "description",
        content:
          "Explore the RESQ Nepal hospital platform for fleet management, GPS, authorized camera monitoring, requests, drivers, trips, devices, reports, and access management.",
      },
      { property: "og:title", content: "RESQ Nepal Hospital Control Center" },
      {
        property: "og:description",
        content: "Centralized ambulance operations for hospitals and healthcare providers.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="Hospital operations platform"
        title="RESQ Nepal Hospital Control Center"
        copy="Fleet management, tracking, authorized monitoring, requests, trips, reports, devices, and access controls in one platform. Public previews below use sample data only."
      />
      <DashboardSection />
      <PlatformModulesSection />
      <TrackingSection />
      <JoinSteps />
    </>
  ),
});
