import { describe, expect, it } from "vitest";
import { AMBULANCE_TYPES, GPS_METHODS, registrationSchema } from "@/lib/registration";

const valid = {
  hospitalName: "City General Hospital",
  address: "Ward 5, Kathmandu",
  contactName: "Sita Sharma",
  phone: "+977-01-5551234",
  additionalMessage: "",
  gpsMethod: "mobile_gps",
  totalAmbulances: 3,
  ambulanceTypes: ["basic", "emergency"],
};

describe("hospital registration validation", () => {
  it("accepts a valid registration", () => {
    expect(registrationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts each GPS tracking option", () => {
    for (const m of GPS_METHODS) {
      const r = registrationSchema.safeParse({ ...valid, gpsMethod: m.value });
      expect(r.success).toBe(true);
    }
  });

  it("accepts a single ambulance type and all three", () => {
    expect(registrationSchema.safeParse({ ...valid, ambulanceTypes: ["ventilator"] }).success).toBe(
      true,
    );
    expect(
      registrationSchema.safeParse({
        ...valid,
        ambulanceTypes: AMBULANCE_TYPES.map((t) => t.value),
      }).success,
    ).toBe(true);
  });

  it("rejects zero, negative, and decimal ambulance counts", () => {
    for (const n of [0, -2, 2.5]) {
      const r = registrationSchema.safeParse({ ...valid, totalAmbulances: n });
      expect(r.success).toBe(false);
    }
  });

  it("rejects an empty ambulance-type selection", () => {
    const r = registrationSchema.safeParse({ ...valid, ambulanceTypes: [] });
    expect(r.success).toBe(false);
  });

  it("rejects missing required fields but allows an empty message", () => {
    for (const key of ["hospitalName", "contactName", "phone"] as const) {
      const r = registrationSchema.safeParse({ ...valid, [key]: "" });
      expect(r.success).toBe(false);
    }
    expect(registrationSchema.safeParse({ ...valid, additionalMessage: "Hello" }).success).toBe(
      true,
    );
  });
});
