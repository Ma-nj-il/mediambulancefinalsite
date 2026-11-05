import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { Route as adminPanel } from "@/routes/admin._panel";

const fixtures = vi.hoisted(() => {
  const application = {
    id: "application-1",
    application_reference: "RQ-TEST-1",
    hospital_name: "Navigation Test Hospital",
    hospital_address: "Test address",
    city_district: null,
    contact_person: "Test contact",
    phone: "9800000000",
    ambulance_count: 2,
    preferred_gps_tracking_method: "gps_device_dashcam",
    ambulance_types: [],
    status: "approved",
    partnership_status: "active",
    submitted_at: "2026-11-01T00:00:00Z",
    created_at: "2026-11-01T00:00:00Z",
    updated_at: "2026-11-01T00:00:00Z",
    approved_at: "2026-11-02T00:00:00Z",
  };
  const device = {
    id: "device-1",
    request_number: "DEV-TEST-1",
    hospital_application_id: application.id,
    hospital_applications: application,
    device_category: "gps_dashcam",
    gps_quantity: 2,
    dashcam_quantity: 2,
    vehicle_quantity: 2,
    status: "new",
    created_at: application.created_at,
    updated_at: application.updated_at,
  };
  return {
    application,
    device,
    getAdminSession: vi.fn().mockResolvedValue({ id: "test-admin" }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    syncRequests: vi.fn().mockResolvedValue({ created: 0 }),
    checks: [] as { check_key: string; is_checked: boolean }[],
  };
});

vi.mock("@/lib/admin", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/admin")>()),
  getAdminSession: fixtures.getAdminSession,
}));

vi.mock("@/lib/approval-device-requests.functions", () => ({
  syncApprovalDeviceRequests: fixtures.syncRequests,
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    rpc: fixtures.rpc,
    from: (table: string) => {
      const rows =
        table === "hospital_applications"
          ? [fixtures.application]
          : table === "device_requests"
            ? [fixtures.device]
            : table === "application_checklist"
              ? fixtures.checks
              : [];
      const result = { data: rows, error: null, count: rows.length };
      const builder = {
        select: () => builder,
        eq: () => builder,
        order: () => builder,
        range: () => builder,
        single: () => Promise.resolve({ ...result, data: rows[0] }),
        then: Promise.resolve(result).then.bind(Promise.resolve(result)),
      };
      return builder;
    },
  },
}));

const cases = [
  {
    list: "/admin/applications",
    detail: "/admin/applications/application-1",
    listHeading: "Hospital Applications",
    detailHeading: "Application details",
    link: "View application",
    back: /All applications/,
  },
  {
    list: "/admin/hospitals",
    detail: "/admin/hospitals/application-1",
    listHeading: "Approved Hospitals",
    detailHeading: fixtures.application.hospital_name,
    link: "Open",
    back: /All hospitals/,
  },
  {
    list: "/admin/device-requests",
    detail: "/admin/device-requests/device-1",
    listHeading: "GPS & Device Requests",
    detailHeading: fixtures.device.request_number,
    link: "Review",
    back: /All device requests/,
  },
];

describe("Admin list-to-detail navigation", () => {
  const rootOptions = { ...routeTree.options };
  const panelOptions = { ...adminPanel.options };
  let client: QueryClient;

  beforeAll(() => {
    // Keep the real generated routes, auth guard, and page components. Omit only
    // chrome and document assets that jsdom cannot load.
    Object.assign(routeTree.options, {
      component: Outlet,
      shellComponent: ({ children }: { children: ReactNode }) => <>{children}</>,
      head: () => ({}),
    });
    adminPanel.update({ component: Outlet });
  });

  afterEach(() => {
    cleanup();
    client?.clear();
    vi.clearAllMocks();
    fixtures.getAdminSession.mockResolvedValue({ id: "test-admin" });
    fixtures.syncRequests.mockReset().mockResolvedValue({ created: 0 });
    fixtures.rpc.mockReset().mockResolvedValue({ data: [], error: null });
    fixtures.application.status = "approved";
    fixtures.checks = [];
  });

  afterAll(() => {
    Object.assign(routeTree.options, rootOptions);
    adminPanel.update(panelOptions);
  });

  async function openPage(path: string) {
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: [path] }),
      context: { queryClient: client },
      defaultPendingMinMs: 0,
    });
    await act(async () => {
      render(
        <QueryClientProvider client={client}>
          <RouterProvider router={router} />
        </QueryClientProvider>,
      );
      await router.load();
    });
    return router;
  }

  it.each(cases)("opens and returns from $list", async (page) => {
    const router = await openPage(page.list);
    expect(await screen.findByRole("heading", { name: page.listHeading })).toBeVisible();
    fireEvent.click(await screen.findByRole("link", { name: page.link }));
    expect(await screen.findByRole("heading", { name: page.detailHeading })).toBeVisible();
    expect(screen.queryByRole("heading", { name: page.listHeading })).not.toBeInTheDocument();
    expect(router.state.location.pathname).toBe(page.detail);
    fireEvent.click(screen.getByRole("link", { name: page.back }));
    expect(await screen.findByRole("heading", { name: page.listHeading })).toBeVisible();
    expect(fixtures.getAdminSession).toHaveBeenCalled();
    expect(fixtures.rpc.mock.calls.some(([name]) => name === "change_application_status")).toBe(
      false,
    );
  });

  it.each(cases)("renders a direct visit to $detail", async (page) => {
    await openPage(page.detail);
    expect(await screen.findByRole("heading", { name: page.detailHeading })).toBeVisible();
    expect(screen.queryByRole("heading", { name: page.listHeading })).not.toBeInTheDocument();
    expect(fixtures.getAdminSession).toHaveBeenCalled();
  });

  async function approveHospital() {
    fixtures.application.status = "pending";
    fixtures.checks = [
      "hospital_registration",
      "contact_details",
      "documents_reviewed",
      "gps_config",
      "fleet_details",
    ].map((check_key) => ({ check_key, is_checked: true }));
    await openPage("/admin/applications/application-1");
    fireEvent.change(await screen.findByRole("combobox", { name: "Review decision" }), {
      target: { value: "approved" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
  }

  it("creates equipment requests after the audited approval succeeds", async () => {
    fixtures.syncRequests.mockResolvedValue({ created: 1 });
    await approveHospital();
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Hospital approved. Its GPS / device request is ready for review.",
    );
    expect(fixtures.rpc).toHaveBeenCalledWith("change_application_status", {
      _id: "application-1",
      _new: "approved",
    });
    expect(fixtures.syncRequests).toHaveBeenCalledWith({
      data: { applicationId: "application-1" },
    });
  });

  it("does not create equipment when approval fails", async () => {
    fixtures.rpc.mockImplementation(async (name: string) => ({
      data: [],
      error: name === "change_application_status" ? { message: "Approval denied" } : null,
    }));
    await approveHospital();
    expect(await screen.findByRole("alert")).toHaveTextContent("Approval denied");
    expect(fixtures.syncRequests).not.toHaveBeenCalled();
  });

  it("reports an equipment sync failure without claiming approval failed", async () => {
    fixtures.syncRequests.mockRejectedValue(new Error("Connection lost"));
    await approveHospital();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Hospital approved, but its equipment request could not be created.",
    );
  });

  it("syncs earlier approvals before displaying GPS and dashcam quantities", async () => {
    await openPage("/admin/device-requests");
    expect(await screen.findByRole("link", { name: "Review" })).toBeVisible();
    expect(fixtures.syncRequests).toHaveBeenCalledWith({ data: {} });
    expect(screen.getAllByRole("cell", { name: "2" })).toHaveLength(3);
  });

  it("offers retry when syncing earlier approvals fails", async () => {
    fixtures.syncRequests.mockRejectedValueOnce(new Error("Sync unavailable"));
    await openPage("/admin/device-requests");
    expect(await screen.findByText("Sync unavailable")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    await waitFor(() => expect(screen.getByRole("link", { name: "Review" })).toBeVisible());
  });
});
