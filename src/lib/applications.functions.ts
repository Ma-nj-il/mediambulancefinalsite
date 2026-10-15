import { createServerFn } from "@tanstack/react-start";
import { AMBULANCE_TYPES, GPS_METHODS, registrationSchema } from "@/lib/registration";

export const DOC_TYPES = {
  hospital_registration: "Hospital registration document",
  vehicle: "Vehicle documents",
  insurance: "Insurance documents (if applicable)",
  driving_licence: "Driving licence documents",
} as const;

export const submitHospitalApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission");
    return data;
  })
  .handler(async ({ data }) => {
    // Spam honeypot: real users never fill this hidden field.
    if (String(data.get("website") ?? "") !== "")
      return { ok: true as const, reference: "RQ-RECEIVED" };

    let parsed: {
      hospitalName: string;
      address: string;
      contactName: string;
      phone: string;
      additionalMessage: string;
      gpsMethod: (typeof GPS_METHODS)[number]["value"];
      totalAmbulances: number;
      ambulanceTypes: (typeof AMBULANCE_TYPES)[number]["value"][];
    };
    try {
      parsed = registrationSchema.parse(JSON.parse(String(data.get("payload") ?? "{}")));
    } catch {
      return {
        ok: false as const,
        error: "Some details are missing or invalid. Please review the form.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Duplicate protection: one open application per phone number within 10 minutes.
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("hospital_applications")
      .select("id", { count: "exact", head: true })
      .eq("phone", parsed.phone)
      .gte("submitted_at", since);
    if ((count ?? 0) > 0) {
      return {
        ok: false as const,
        error:
          "An application from this phone number was just received. Please wait before submitting again.",
      };
    }

    const gpsLabel =
      GPS_METHODS.find((m) => m.value === parsed.gpsMethod)?.label ?? parsed.gpsMethod;
    const typeLabels = parsed.ambulanceTypes.map(
      (v) => AMBULANCE_TYPES.find((t) => t.value === v)?.label ?? v,
    );
    const message = parsed.additionalMessage.trim();

    const { data: app, error } = await supabaseAdmin
      .from("hospital_applications")
      .insert({
        hospital_name: parsed.hospitalName,
        hospital_address: parsed.address,
        contact_person: parsed.contactName,
        phone: parsed.phone,
        additional_message: message === "" ? null : message,
        preferred_gps_tracking_method: parsed.gpsMethod,
        ambulance_count: parsed.totalAmbulances,
        ambulance_types: [...parsed.ambulanceTypes],
        // Legacy mirrors keep older admin views and reports working.
        ambulance_categories: typeLabels.join(", "),
        gps_availability: gpsLabel,
      })
      .select("id, application_reference")
      .single();
    if (error || !app) {
      console.error("application insert failed", error?.message);
      return { ok: false as const, error: "We couldn't save your application. Please try again." };
    }

    const { error: histErr } = await supabaseAdmin.from("application_status_history").insert({
      hospital_application_id: app.id,
      new_status: "pending",
      reason: "Submitted via website",
    });
    if (histErr) {
      console.error("status history insert failed", histErr.message);
      await supabaseAdmin.from("hospital_applications").delete().eq("id", app.id);
      return { ok: false as const, error: "We couldn't save your application. Please try again." };
    }

    return { ok: true as const, reference: app.application_reference };
  });
