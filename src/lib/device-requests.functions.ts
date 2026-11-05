import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { parseFormPayload } from "@/lib/form-payload";

export const deviceRequestSchema = z
  .object({
    applicationReference: z
      .string()
      .trim()
      .toUpperCase()
      .max(40)
      .regex(/^RQ-\d{4}-\d+$/, "Enter a valid application reference."),
    phone: z
      .string()
      .trim()
      .min(7)
      .max(20)
      .regex(/^[+0-9\s-]+$/)
      .refine((value) => value.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
    deviceCategory: z.enum(["gps", "dashcam", "gps_dashcam"]),
    gpsQuantity: z.number().int().min(0).max(10000),
    dashcamQuantity: z.number().int().min(0).max(10000),
    vehicleQuantity: z.number().int().min(0).max(10000).nullable(),
    description: z.string().trim().max(2000),
  })
  .superRefine((value, ctx) => {
    if (
      (value.deviceCategory === "gps" || value.deviceCategory === "gps_dashcam") &&
      value.gpsQuantity < 1
    )
      ctx.addIssue({ code: "custom", path: ["gpsQuantity"], message: "Enter the GPS quantity." });
    if (
      (value.deviceCategory === "dashcam" || value.deviceCategory === "gps_dashcam") &&
      value.dashcamQuantity < 1
    )
      ctx.addIssue({
        code: "custom",
        path: ["dashcamQuantity"],
        message: "Enter the dashcam quantity.",
      });
  });

export const submitDeviceRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission");
    return data;
  })
  .handler(async ({ data }) => {
    if (String(data.get("website") ?? "") !== "")
      return { ok: true as const, reference: "DEV-RECEIVED" };

    let value: z.infer<typeof deviceRequestSchema>;
    try {
      value = deviceRequestSchema.parse(parseFormPayload(data));
    } catch {
      return {
        ok: false as const,
        error: "Some details are missing or invalid. Please review the form.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: application } = await supabaseAdmin
      .from("hospital_applications")
      .select("id, phone")
      .eq("application_reference", value.applicationReference)
      .eq("status", "approved")
      .eq("partnership_status", "active")
      .maybeSingle();

    const digits = (input: string) => input.replace(/\D/g, "");
    if (!application || digits(application.phone) !== digits(value.phone)) {
      return {
        ok: false as const,
        error: "We could not verify that application reference and phone number.",
      };
    }

    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count, error: duplicateError } = await supabaseAdmin
      .from("device_requests")
      .select("id", { count: "exact", head: true })
      .eq("hospital_application_id", application.id)
      .eq("device_category", value.deviceCategory)
      .gte("created_at", since);
    if (duplicateError)
      return { ok: false as const, error: "We couldn't verify recent requests. Please try again." };
    if ((count ?? 0) > 0)
      return {
        ok: false as const,
        error: "A similar request was just received. Please wait before trying again.",
      };

    const { data: request, error } = await supabaseAdmin
      .from("device_requests")
      .insert({
        hospital_application_id: application.id,
        device_category: value.deviceCategory,
        gps_quantity: value.deviceCategory === "dashcam" ? 0 : value.gpsQuantity,
        dashcam_quantity: value.deviceCategory === "gps" ? 0 : value.dashcamQuantity,
        vehicle_quantity: value.vehicleQuantity,
        request_description: value.description || null,
      })
      .select("id, request_number")
      .single();
    if (error || !request) {
      console.error("device request insert failed", error?.message);
      return { ok: false as const, error: "We couldn't save your request. Please try again." };
    }
    return { ok: true as const, reference: request.request_number };
  });
