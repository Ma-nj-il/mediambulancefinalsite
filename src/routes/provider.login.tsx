import { createFileRoute } from "@tanstack/react-router";
import { PartnerLogin } from "@/components/partner-login";

export const Route = createFileRoute("/provider/login")({
  head: () => ({
    meta: [
      { title: "Hospital / Provider Login — RESQ Nepal" },
      { name: "description", content: "Hospital and ambulance provider login for RESQ Nepal." },
    ],
  }),
  component: () => <PartnerLogin />,
});
