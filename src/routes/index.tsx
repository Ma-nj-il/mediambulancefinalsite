import { createFileRoute } from "@tanstack/react-router";
import { AppSection, Categories, DashboardSection, EmergencyMoment, Faq, FinalCta, Hero, HospitalsSection, HowItWorks, JoinSteps, TrackingSection, Trust, WhyResq } from "@/components/sections";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RESQ Nepal — Emergency Help, Just a Tap Away" },
      { name: "description", content: "Find and request ambulance services through RESQ Nepal, a connected network of participating hospitals and ambulance providers." },
      { property: "og:title", content: "RESQ Nepal — Emergency Help, Just a Tap Away" },
      { property: "og:description", content: "A smarter way to connect with ambulance services in Nepal." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <EmergencyMoment />
      <HowItWorks />
      <AppSection />
      <HospitalsSection />
      <DashboardSection />
      <TrackingSection />
      <Categories />
      <WhyResq />
      <Trust />
      <JoinSteps />
      <Faq />
      <FinalCta />
    </>
  );
}
