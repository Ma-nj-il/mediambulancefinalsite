import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Client = SupabaseClient<Database>;

/** Only call after an Admin permission check, or from a trusted maintenance script. */
export async function syncApprovedDeviceRequests(db: Client, applicationId?: string) {
  let created = 0;
  const pageSize = 100;
  for (let offset = 0; ; offset += pageSize) {
    let query = db
      .from("hospital_applications")
      .select("id, application_reference, ambulance_count, preferred_gps_tracking_method")
      .eq("status", "approved")
      .in("preferred_gps_tracking_method", ["gps_device", "gps_device_dashcam"])
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (applicationId) query = query.eq("id", applicationId);
    const { data: applications, error } = await query;
    if (error) throw error;

    for (const application of applications ?? []) {
      const quantity = application.ambulance_count;
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) continue;

      // An existing equipment request means its workflow has already started.
      // Preserve manual requests and previous decisions, including cancellations.
      const { data: existing, error: lookupError } = await db
        .from("device_requests")
        .select("id")
        .eq("hospital_application_id", application.id)
        .limit(1);
      if (lookupError) throw lookupError;
      if (existing?.length) continue;

      const withDashcam = application.preferred_gps_tracking_method === "gps_device_dashcam";
      const { data: inserted, error: insertError } = await db
        .from("device_requests")
        .upsert(
          {
            // Reserve the application UUID for its initial equipment request.
            // The primary key makes concurrent syncs/retries insert at most once;
            // ignoreDuplicates never overwrites a request that is being reviewed.
            id: application.id,
            hospital_application_id: application.id,
            device_category: withDashcam ? "gps_dashcam" : "gps",
            gps_quantity: quantity,
            dashcam_quantity: withDashcam ? quantity : 0,
            vehicle_quantity: quantity,
            request_description:
              `Created automatically from approved application ${application.application_reference}. ` +
              `One GPS device${withDashcam ? " and one dashcam" : ""} per ambulance. ` +
              "Supply and installation are pending.",
          },
          { onConflict: "id", ignoreDuplicates: true },
        )
        .select("id");
      if (insertError) throw insertError;
      created += inserted?.length ?? 0;
    }

    if ((applications?.length ?? 0) < pageSize) break;
  }
  return { created };
}
