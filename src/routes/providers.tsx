import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";
import { FinalCta, ProvidersSection } from "@/components/sections";

export const Route = createFileRoute("/providers")({
  head: () => ({
    meta: [
      { title: "For Ambulance Providers — Medi Ambulance" },
      {
        name: "description",
        content:
          "Explore the Medi Ambulance provider partnership and contact us about joining the network.",
      },
    ],
  }),
  component: () => (
    <>
      <PageHero
        eyebrow="For ambulance providers"
        title="Connect your service to a wider network."
        copy="Learn about the Medi Ambulance provider partnership. Provider account provisioning and operational tools are not yet available."
      />
      <ProvidersSection />
      <FinalCta />
    </>
  ),
});
