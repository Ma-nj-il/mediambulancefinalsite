import { createFileRoute, redirect } from "@tanstack/react-router";
import { PartnerDashboard } from "@/components/partner-dashboard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/provider/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/provider/login" });
    const { data: authorized, error: roleError } = await supabase.rpc("has_partner_access", {
      _role: "provider",
    });
    if (roleError) throw roleError;
    if (!authorized) throw redirect({ to: "/provider/login" });
  },
  head: () => ({ meta: [{ title: "Provider Dashboard — RESQ Nepal" }] }),
  component: () => <PartnerDashboard role="provider" />,
});
