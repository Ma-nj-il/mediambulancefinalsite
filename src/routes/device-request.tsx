import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deviceRequestSchema, submitDeviceRequest } from "@/lib/device-requests.functions";

export const Route = createFileRoute("/device-request")({
  head: () => ({
    meta: [
      { title: "GPS & Device Request — RESQ Nepal" },
      {
        name: "description",
        content: "Submit a GPS or dashcam request linked to an existing hospital application.",
      },
    ],
  }),
  component: DeviceRequestPage,
});

function DeviceRequestPage() {
  const submit = useServerFn(submitDeviceRequest);
  const [form, setForm] = useState({
    applicationReference: "",
    phone: "",
    deviceCategory: "gps",
    gpsQuantity: "",
    dashcamQuantity: "",
    vehicleQuantity: "",
    description: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const change = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = deviceRequestSchema.safeParse({
      ...form,
      gpsQuantity: Number(form.gpsQuantity || 0),
      dashcamQuantity: Number(form.dashcamQuantity || 0),
      vehicleQuantity: form.vehicleQuantity === "" ? null : Number(form.vehicleQuantity),
    });
    if (!parsed.success)
      return setError(parsed.error.issues[0]?.message ?? "Review the request details.");
    setBusy(true);
    setError(null);
    try {
      const data = new FormData();
      data.set("payload", JSON.stringify(parsed.data));
      data.set("website", honeypot);
      const result = await submit({ data });
      if (result.ok) setReference(result.reference);
      else setError(result.error);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="bg-soft py-16">
      <div className="mx-auto max-w-3xl px-5">
        <form onSubmit={onSubmit} className="rounded-[28px] bg-card p-6 shadow-card sm:p-10">
          {reference ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <h1 className="mt-4 text-2xl font-extrabold text-navy">Device request received</h1>
              <p className="mt-2 text-muted-foreground">Your request number is</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{reference}</p>
              <Button asChild variant="soft" size="xl" className="mt-6">
                <Link to="/hospital-platform">Back to Hospital Platform</Link>
              </Button>
            </div>
          ) : (
            <>
              <input
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
              <p className="eyebrow">Existing applicants</p>
              <h1 className="mt-2 text-3xl font-extrabold text-navy">GPS & Device Request</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Use the reference and phone number from your approved, active hospital application.
                This is a request for review—not confirmation of supply or installation.
              </p>
              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <Label>Application reference</Label>
                  <Input
                    required
                    value={form.applicationReference}
                    onChange={(e) => change("applicationReference", e.target.value)}
                    placeholder="RQ-YYYY-XXXX"
                  />
                </label>
                <label className="space-y-2">
                  <Label>Application phone number</Label>
                  <Input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => change("phone", e.target.value)}
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <Label>Device category</Label>
                  <select
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={form.deviceCategory}
                    onChange={(e) => change("deviceCategory", e.target.value)}
                  >
                    <option value="gps">GPS devices</option>
                    <option value="dashcam">Dashcams</option>
                    <option value="gps_dashcam">GPS devices and dashcams</option>
                  </select>
                </label>
                {form.deviceCategory !== "dashcam" && (
                  <label className="space-y-2">
                    <Label>GPS quantity</Label>
                    <Input
                      required
                      type="number"
                      min={1}
                      max={10000}
                      value={form.gpsQuantity}
                      onChange={(e) => change("gpsQuantity", e.target.value)}
                    />
                  </label>
                )}
                {form.deviceCategory !== "gps" && (
                  <label className="space-y-2">
                    <Label>Dashcam quantity</Label>
                    <Input
                      required
                      type="number"
                      min={1}
                      max={10000}
                      value={form.dashcamQuantity}
                      onChange={(e) => change("dashcamQuantity", e.target.value)}
                    />
                  </label>
                )}
                <label className="space-y-2">
                  <Label>Vehicle quantity (optional)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10000}
                    value={form.vehicleQuantity}
                    onChange={(e) => change("vehicleQuantity", e.target.value)}
                  />
                </label>
                <label className="space-y-2 sm:col-span-2">
                  <Label>Request description (optional)</Label>
                  <Textarea
                    rows={4}
                    maxLength={2000}
                    value={form.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                </label>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
                >
                  {error}
                </p>
              )}
              <Button type="submit" variant="hero" size="xl" className="mt-7" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} Submit Device Request
              </Button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
