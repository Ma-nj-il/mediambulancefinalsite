import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Single source of truth for contact-inquiry validation — form and server agree. */
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address.").max(255),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+0-9\s-]*$/, "Enter a valid phone number.")
    .optional()
    .default(""),
  subject: z.string().trim().min(3, "Enter a subject.").max(150),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters).").max(2000),
});

export type InquiryStatus = "new" | "in_progress" | "resolved";

export const submitContactInquiry = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) throw new Error("Invalid submission");
    return data;
  })
  .handler(async ({ data }) => {
    if (String(data.get("website") ?? "") !== "") return { ok: true as const };

    let parsed: z.infer<typeof inquirySchema>;
    try {
      parsed = inquirySchema.parse(JSON.parse(String(data.get("payload") ?? "{}")));
    } catch {
      return {
        ok: false as const,
        error: "Some details are missing or invalid. Please review the form.",
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Duplicate protection: same email + message within 10 minutes.
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .ilike("email", parsed.email)
      .eq("message", parsed.message)
      .gte("submitted_at", since);
    if ((count ?? 0) > 0) {
      return {
        ok: false as const,
        error: "This message was just received. Please wait before sending again.",
      };
    }

    const { error } = await supabaseAdmin.from("contact_inquiries").insert({
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      phone: parsed.phone.trim() === "" ? null : parsed.phone.trim(),
      subject: parsed.subject,
      message: parsed.message,
    });
    if (error) {
      console.error("inquiry insert failed", error.message);
      return { ok: false as const, error: "We couldn't send your message. Please try again." };
    }
    return { ok: true as const };
  });
