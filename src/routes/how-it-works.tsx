import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { AppSection, EmergencyMoment, Faq, HowItWorks, JoinSteps } from "@/components/sections";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — RESQ Nepal" },
      { name: "description", content: "Find participating ambulance services, send a request and follow trip updates with RESQ Nepal." },
      { property: "og:title", content: "How It Works — RESQ Nepal" },
      { property: "og:description", content: "Find. Request. Follow. A simpler way to connect with ambulance services." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="How it works" title="Find. Request. Follow." copy="Three simple steps to connect with participating ambulance services." />
      <HowItWorks />
      <EmergencyMoment />
      <AppSection />
      <JoinSteps />
      <Faq />
    </>
  ),
});
