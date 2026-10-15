import { describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/contact.functions";

const valid = {
  name: "Ram Thapa",
  email: "ram@example.com",
  phone: "+977-98-1234567",
  subject: "Demo request",
  message: "We would like a live demo of the platform.",
};

describe("contact inquiry validation", () => {
  it("accepts a valid inquiry, phone optional", () => {
    expect(inquirySchema.safeParse(valid).success).toBe(true);
    expect(inquirySchema.safeParse({ ...valid, phone: "" }).success).toBe(true);
  });

  it("rejects missing name, bad email, short message", () => {
    expect(inquirySchema.safeParse({ ...valid, name: "" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, message: "Hi" }).success).toBe(false);
    expect(inquirySchema.safeParse({ ...valid, subject: "" }).success).toBe(false);
  });
});
