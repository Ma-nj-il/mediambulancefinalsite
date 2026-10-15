import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import { PageHero } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AMBULANCE_TYPES, GPS_METHODS, registrationSchema } from "@/lib/registration";
import { submitHospitalApplication } from "@/lib/applications.functions";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Hospital Registration — RESQ Nepal" },
      {
        name: "description",
        content: "Apply to bring your hospital's ambulances into the RESQ Nepal network.",
      },
      { property: "og:title", content: "Hospital Registration — RESQ Nepal" },
      { property: "og:description", content: "Join the RESQ Network in three short sections." },
    ],
  }),
  component: Register,
});

function Required({ children }: { children: string }) {
  return (
    <span>
      {children}{" "}
      <span aria-hidden="true" className="text-primary">
        *
      </span>
      <span className="sr-only"> (required)</span>
    </span>
  );
}

function Register() {
  const submit = useServerFn(submitHospitalApplication);
  const [hospitalName, setHospitalName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [gps, setGps] = useState("");
  const [count, setCount] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const toggleType = (v: string) =>
    setTypes(types.includes(v) ? types.filter((t) => t !== v) : [...types, v]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = registrationSchema.safeParse({
      hospitalName,
      address,
      contactName,
      phone,
      additionalMessage: message,
      gpsMethod: gps === "" ? undefined : gps,
      totalAmbulances: count.trim() === "" ? undefined : Number(count),
      ambulanceTypes: types,
    });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? "form");
        if (!errs[key]) errs[key] = i.message;
      });
      setErrors(errs);
      setFormError("Some details need attention. Please review the highlighted fields.");
      return;
    }
    setErrors({});
    setFormError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.set("payload", JSON.stringify(parsed.data));
      fd.set("website", honeypot);
      const res = await submit({ data: fd });
      if (res.ok) setReference(res.reference);
      else setFormError(res.error);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) =>
    errors[k] ? <p className="text-xs font-semibold text-destructive">{errors[k]}</p> : null;

  return (
    <>
      <PageHero
        eyebrow="Hospital registration"
        title="Join the RESQ Network."
        copy="Three short sections. Our team reviews every application."
      />
      <section className="bg-soft py-16">
        <div className="mx-auto max-w-3xl px-5">
          <form onSubmit={onSubmit} className="rounded-[28px] bg-card p-6 shadow-card sm:p-10">
            {reference ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <h2 className="mt-4 text-2xl font-extrabold text-navy">Application received</h2>
                <p className="mt-2 text-muted-foreground">Your reference number is</p>
                <p className="mt-1 text-2xl font-extrabold tracking-wide text-primary">
                  {reference}
                </p>
                <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
                  Our team will review your details. Please keep this reference for any follow-up.
                </p>
                <Button asChild variant="soft" size="xl" className="mt-6">
                  <Link to="/">Back to home</Link>
                </Button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                  value={honeypot}
                  onChange={(ev) => setHoneypot(ev.target.value)}
                  name="website"
                />

                <h2 className="text-xl font-extrabold text-navy">Hospital Information</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="hospitalName">
                      <Required>Hospital Name</Required>
                    </Label>
                    <Input
                      id="hospitalName"
                      value={hospitalName}
                      onChange={(ev) => setHospitalName(ev.target.value)}
                      className="h-11"
                      placeholder="e.g. City General Hospital"
                    />
                    {err("hospitalName")}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">
                      <Required>Hospital Address</Required>
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(ev) => setAddress(ev.target.value)}
                      className="h-11"
                      placeholder="Street, ward, municipality"
                    />
                    {err("address")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactName">
                      <Required>Contact Person Name</Required>
                    </Label>
                    <Input
                      id="contactName"
                      value={contactName}
                      onChange={(ev) => setContactName(ev.target.value)}
                      className="h-11"
                      placeholder="Full name"
                    />
                    {err("contactName")}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Required>Phone Number</Required>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(ev) => setPhone(ev.target.value)}
                      className="h-11"
                      placeholder="+977-01-XXXXXXX"
                    />
                    {err("phone")}
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="message">
                      Additional Message{" "}
                      <span className="ml-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                        Optional
                      </span>
                    </Label>
                    <Textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(ev) => setMessage(ev.target.value)}
                      placeholder="Anything else we should know? (optional)"
                    />
                    {err("additionalMessage")}
                  </div>
                </div>

                <h2 className="mt-10 text-xl font-extrabold text-navy">
                  <Required>Preferred GPS Tracking Method</Required>
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your initial preference only — not confirmation that hardware is installed.
                </p>
                <div
                  role="radiogroup"
                  aria-label="Preferred GPS tracking method"
                  className="mt-4 grid gap-3 sm:grid-cols-2"
                >
                  {GPS_METHODS.map((m) => {
                    const active = gps === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setGps(m.value)}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                          active
                            ? "border-primary bg-accent shadow-card"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-navy">{m.label}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {m.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {err("gpsMethod")}

                <h2 className="mt-10 text-xl font-extrabold text-navy">Ambulance Details</h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="count">
                      <Required>Total Number of Ambulances</Required>
                    </Label>
                    <Input
                      id="count"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      value={count}
                      onChange={(ev) => setCount(ev.target.value)}
                      className="h-11"
                      placeholder="Enter total number of ambulances"
                    />
                    {err("totalAmbulances")}
                  </div>
                </div>
                <p className="mt-6 text-sm font-bold text-navy">
                  <Required>Ambulance Types Available</Required>
                </p>
                <p className="mt-1 text-sm text-muted-foreground">Select all that apply.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {AMBULANCE_TYPES.map((t) => {
                    const active = types.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        onClick={() => toggleType(t.value)}
                        className={cn(
                          "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                          active
                            ? "border-primary bg-accent shadow-card"
                            : "border-border hover:border-primary/50",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2",
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border",
                          )}
                        >
                          {active && <Check className="h-3 w-3" />}
                        </span>
                        <span>
                          <span className="block text-sm font-bold text-navy">{t.label}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {t.desc}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                {err("ambulanceTypes")}

                {formError && (
                  <p
                    role="alert"
                    className="mt-8 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
                  >
                    {formError}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="mt-8 w-full sm:w-auto"
                  disabled={busy}
                >
                  {busy && <Loader2 className="animate-spin" />} Submit Application
                </Button>
              </>
            )}
          </form>
        </div>
      </section>
    </>
  );
}
