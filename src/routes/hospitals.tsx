import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { Categories, FinalCta, HospitalsSection, JoinSteps, Trust } from "@/components/sections";

export const Route = createFileRoute("/hospitals")({
  head: () => ({
    meta: [
      { title: "Hospital Ambulance Platform — RESQ Nepal" },
      {
        name: "description",
        content:
          "Explore centralized ambulance fleet management, GPS-ready monitoring, authorized cameras, requests, trips, drivers, and reporting for hospitals.",
      },
      { property: "og:title", content: "For Hospitals — RESQ Nepal Partner Network" },
      { property: "og:description", content: "Your hospital. Your ambulances. One smart network." },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="For hospitals and healthcare providers"
        title="Centralize Your Ambulance Operations."
        copy="Bring fleet visibility, driver coordination, patient requests, trips, and authorized monitoring into one secure hospital platform."
      />
      <HospitalsSection />
      <Categories />
      <Trust />
      <JoinSteps />
      <FinalCta />
    </>
  ),
});
