import { describe, expect, it } from "vitest";
import { deviceRequestSchema } from "@/lib/device-requests.functions";

describe("device request validation", () => {
  it("accepts an explicit GPS and dashcam request", () => {
    const result = deviceRequestSchema.safeParse({
      applicationReference: "RQ-2026-1001",
      phone: "+977 9800000000",
      deviceCategory: "gps_dashcam",
      gpsQuantity: 3,
      dashcamQuantity: 3,
      vehicleQuantity: 3,
      description: "Please contact our fleet coordinator.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero units for the selected category", () => {
    const result = deviceRequestSchema.safeParse({
      applicationReference: "RQ-2026-1001",
      phone: "+977 9800000000",
      deviceCategory: "gps",
      gpsQuantity: 0,
      dashcamQuantity: 0,
      vehicleQuantity: null,
      description: "",
    });
    expect(result.success).toBe(false);
  });
});
