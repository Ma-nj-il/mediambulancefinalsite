import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const syncApprovalDeviceRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ applicationId: z.string().uuid().optional() }))
  .handler(async ({ data, context }) => {
    const { data: allowed, error } = await context.supabase.rpc("has_admin_permission", {
      _permission: data.applicationId ? "applications.write" : "requests.write",
    });
    if (error) throw error;
    // Read-only staff can view existing requests without initiating a sync.
    if (!allowed) return { created: 0 };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { syncApprovedDeviceRequests } = await import("@/lib/approval-device-requests.server");
    return syncApprovedDeviceRequests(supabaseAdmin, data.applicationId);
  });
