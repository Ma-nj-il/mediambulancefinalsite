import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import type { Database } from "@/integrations/supabase/types";
import { syncApprovedDeviceRequests } from "@/lib/approval-device-requests.server";

type Application = Pick<
  Database["public"]["Tables"]["hospital_applications"]["Row"],
  "id" | "application_reference" | "status" | "ambulance_count" | "preferred_gps_tracking_method"
>;
type Device = Database["public"]["Tables"]["device_requests"]["Insert"] & { id: string };

const application = (overrides: Partial<Application> = {}): Application => ({
  id: "00000000-0000-4000-8000-000000000001",
  application_reference: "RQ-TEST-1",
  status: "approved",
  ambulance_count: 2,
  preferred_gps_tracking_method: "gps_device_dashcam",
  ...overrides,
});

// Exercise the real Supabase query builder against an isolated HTTP double.
// It enforces the primary key / ignore-duplicates behavior used during retries.
function database(applications: Application[], devices: Device[] = []) {
  const state = { devices, failInsert: false, failLookup: false };
  const json = (value: unknown, status = 200) =>
    new Response(JSON.stringify(value), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  const db = createClient<Database>("https://database.test", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: crypto.randomUUID() },
    global: {
      fetch: async (input, init) => {
        const url = new URL(String(input));
        const params = url.searchParams;
        if (url.pathname.endsWith("/hospital_applications")) {
          const offset = Number(params.get("offset") ?? 0);
          const limit = Number(params.get("limit") ?? 1000);
          return json(
            applications
              .filter(
                (row) =>
                  `eq.${row.status}` === params.get("status") &&
                  ["gps_device", "gps_device_dashcam"].includes(
                    row.preferred_gps_tracking_method ?? "",
                  ) &&
                  (!params.has("id") || params.get("id") === `eq.${row.id}`),
              )
              .slice(offset, offset + limit),
          );
        }
        if (url.pathname.endsWith("/device_requests")) {
          if (init?.method === "POST") {
            if (state.failInsert) return json({ message: "Insert unavailable" }, 503);
            const row = JSON.parse(String(init.body)) as Device;
            const exists = state.devices.some((item) => item.id === row.id);
            if (exists) {
              expect(new Headers(init.headers).get("Prefer")).toContain(
                "resolution=ignore-duplicates",
              );
              expect(params.get("on_conflict")).toBe("id");
              return json([]);
            }
            state.devices.push({ ...row, status: "new" });
            return json([{ id: row.id }]);
          }
          if (state.failLookup) return json({ message: "Lookup unavailable" }, 403);
          return json(
            state.devices
              .filter(
                (row) =>
                  `eq.${row.hospital_application_id}` === params.get("hospital_application_id"),
              )
              .slice(0, 1),
          );
        }
        throw new Error(`Unexpected test request: ${url.pathname}`);
      },
    },
  });
  return { db, state };
}

describe("Equipment requests from approved hospitals", () => {
  it("creates two GPS and two dashcams for an approved two-ambulance hospital", async () => {
    const { db, state } = database([application()]);
    expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 1 });
    expect(state.devices).toEqual([
      expect.objectContaining({
        hospital_application_id: application().id,
        device_category: "gps_dashcam",
        gps_quantity: 2,
        dashcam_quantity: 2,
        vehicle_quantity: 2,
        status: "new",
        request_description: expect.stringContaining("Supply and installation are pending"),
      }),
    ]);
  });

  it("creates GPS only for a GPS-only preference", async () => {
    const { db, state } = database([
      application({ preferred_gps_tracking_method: "gps_device", ambulance_count: 3 }),
    ]);
    await syncApprovedDeviceRequests(db);
    expect(state.devices[0]).toMatchObject({
      device_category: "gps",
      gps_quantity: 3,
      dashcam_quantity: 0,
    });
  });

  it.each([
    { status: "pending" as const },
    { status: "rejected" as const },
    { preferred_gps_tracking_method: "mobile_gps" },
    { preferred_gps_tracking_method: "undecided" },
    { preferred_gps_tracking_method: null },
    { ambulance_count: 0 },
    { ambulance_count: 1.5 },
  ])(
    "does not create equipment for $status / $preferred_gps_tracking_method / $ambulance_count",
    async (overrides) => {
      const { db, state } = database([application(overrides)]);
      expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 0 });
      expect(state.devices).toHaveLength(0);
    },
  );

  it("limits an approval sync to the selected hospital", async () => {
    const selected = application();
    const other = application({ id: "00000000-0000-4000-8000-000000000002" });
    const { db, state } = database([selected, other]);
    await syncApprovedDeviceRequests(db, selected.id);
    expect(state.devices.map((row) => row.hospital_application_id)).toEqual([selected.id]);
  });

  it("deduplicates concurrent syncs and preserves subsequent review decisions", async () => {
    const { db, state } = database([application()]);
    const results = await Promise.all([
      syncApprovedDeviceRequests(db),
      syncApprovedDeviceRequests(db),
    ]);
    expect(results.reduce((total, result) => total + result.created, 0)).toBe(1);
    expect(state.devices).toHaveLength(1);
    state.devices[0]!.status = "completed";
    expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 0 });
    expect(state.devices[0]!.status).toBe("completed");
  });

  it.each(["new", "cancelled", "rejected"] as const)(
    "preserves an existing %s manual request",
    async (status) => {
      const manual: Device = {
        id: "manual-request",
        hospital_application_id: application().id,
        device_category: "gps_dashcam",
        gps_quantity: 2,
        dashcam_quantity: 2,
        status,
      };
      const { db, state } = database([application()], [manual]);
      expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 0 });
      expect(state.devices).toEqual([manual]);
    },
  );

  it("surfaces insert errors and recovers safely on retry", async () => {
    const { db, state } = database([application()]);
    state.failInsert = true;
    await expect(syncApprovedDeviceRequests(db)).rejects.toMatchObject({
      message: "Insert unavailable",
    });
    expect(state.devices).toHaveLength(0);
    state.failInsert = false;
    expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 1 });
  });

  it("does not insert when existing requests cannot be checked", async () => {
    const { db, state } = database([application()]);
    state.failLookup = true;
    await expect(syncApprovedDeviceRequests(db)).rejects.toMatchObject({
      message: "Lookup unavailable",
    });
    expect(state.devices).toHaveLength(0);
  });

  it("recovers older approvals across multiple database pages", async () => {
    const { db, state } = database(
      Array.from({ length: 101 }, (_, index) => application({ id: `hospital-${index}` })),
    );
    expect(await syncApprovedDeviceRequests(db)).toEqual({ created: 101 });
    expect(state.devices).toHaveLength(101);
  });
});
