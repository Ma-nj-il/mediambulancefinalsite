import { createFileRoute } from "@tanstack/react-router";
import {
  AppSection,
  Categories,
  DashboardSection,
  EmergencyMoment,
  Faq,
  FinalCta,
  ForHospitalsSection,
  Hero,
  HospitalsSection,
  HowItWorks,
  JoinSteps,
  ProvidersSection,
  Trust,
  WhyResq,
} from "@/components/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ Nepal — Ambulance Management & Emergency Response" },
      {
        name: "description",
        content:
          "RESQ Nepal connects patients, hospitals, and ambulance teams through mobile ambulance access and a centralized hospital operations platform.",
      },
      { property: "og:title", content: "RESQ Nepal — Smarter Ambulance Management" },
      {
        property: "og:description",
        content:
          "Integrated ambulance access, hospital fleet management, and emergency response operations.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <HospitalsSection />
      <ForHospitalsSection />
      <DashboardSection />
      <AppSection />
      <EmergencyMoment />
      <HowItWorks />
      <ProvidersSection />
      <Categories />
      <WhyResq />
      <Trust />
      <JoinSteps />
      <Faq />
      <FinalCta />
    </>
  );
}
