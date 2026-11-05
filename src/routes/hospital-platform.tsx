import { createFileRoute } from "@tanstack/react-router";
import {
  DashboardSection,
  HospitalPlatformDetails,
  HospitalPlatformOverview,
  PlatformModulesSection,
  TrackingSection,
} from "@/components/sections";

export const Route = createFileRoute("/hospital-platform")({
  head: () => ({
    meta: [
      { title: "RESQ Nepal Hospital Platform" },
      {
        name: "description",
        content:
          "A centralized platform for hospital ambulance fleet visibility, driver coordination, emergency requests, trips, devices, and reporting.",
      },
      { property: "og:title", content: "RESQ Nepal Hospital Platform" },
    ],
  }),
  component: HospitalPlatformPage,
});

function HospitalPlatformPage() {
  return (
    <>
      <HospitalPlatformOverview />
      <TrackingSection />
      <HospitalPlatformDetails />
      <DashboardSection />
      <PlatformModulesSection />
    </>
  );
}
