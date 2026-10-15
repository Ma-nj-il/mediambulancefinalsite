import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Building2, CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHero } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { site } from "@/lib/site";
import { inquirySchema, submitContactInquiry } from "@/lib/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact RESQ Nepal" },
      {
        name: "description",
        content: "Get in touch with RESQ Nepal about hospital partnerships and live demos.",
      },
      { property: "og:title", content: "Contact RESQ Nepal" },
      { property: "og:description", content: "Talk to us about partnerships and demos." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const rows = [
    { icon: Mail, l: "Email", v: site.email },
    { icon: Phone, l: "Phone", v: site.phone },
    { icon: MapPin, l: "Office", v: site.address },
  ];
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's talk."
        copy="Partnerships, live demos and general questions."
      />
      <section className="bg-soft py-20">
        <div className="mx-auto grid max-w-5xl gap-6 px-5 md:grid-cols-2">
          <div className="space-y-4">
            {rows.map((r) => (
              <div
                key={r.l}
                className="flex items-center gap-4 rounded-2xl bg-card p-5 shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <r.icon className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {r.l}
                  </p>
                  <p className="font-bold text-navy">{r.v ?? "To be announced"}</p>
                </div>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              In a life-threatening emergency, call your local emergency number. This page is not
              monitored for emergencies.
            </p>
          </div>
          <div className="bg-navy-gradient rounded-[28px] p-8 text-navy-foreground">
            <Building2 className="h-8 w-8 text-primary" />
            <h2 className="mt-5 text-3xl font-extrabold">Hospitals & demos</h2>
            <p className="mt-3 text-navy-foreground/70">
              Start your partner application and mention a demo request — our team will follow up
              after review.
            </p>
            <Button asChild variant="hero" size="xl" className="mt-8">
              <Link to="/register">Start Hospital Registration</Link>
            </Button>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-5xl px-5">
          <InquiryForm />
        </div>
      </section>
    </>
  );
}

function InquiryForm() {
  const submit = useServerFn(submitContactInquiry);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = inquirySchema.safeParse({ name, email, phone, subject, message });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        const key = String(i.path[0] ?? "form");
        if (!errs[key]) errs[key] = i.message;
      });
      setErrors(errs);
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
      if (res.ok) setSent(true);
      else setFormError(res.error);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const err = (k: string) =>
    errors[k] ? <p className="text-xs font-semibold text-destructive">{errors[k]}</p> : null;

  if (sent) {
    return (
      <div className="rounded-[28px] bg-card p-8 text-center shadow-card sm:p-10">
        <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
        <h2 className="mt-4 text-2xl font-extrabold text-navy">Message sent</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Thanks for reaching out — the RESQ Nepal team will get back to you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[28px] bg-card p-6 shadow-card sm:p-10">
      <h2 className="flex items-center gap-2 text-2xl font-extrabold text-navy">
        <Send className="h-5 w-5 text-primary" /> Send us a message
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        We reply to partnership and demo questions.
      </p>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        name="website"
      />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="c-name">Your name *</Label>
          <Input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
            placeholder="Full name"
          />
          {err("name")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-email">Email address *</Label>
          <Input
            id="c-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11"
            placeholder="you@example.com"
          />
          {err("email")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-phone">Phone (optional)</Label>
          <Input
            id="c-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11"
            placeholder="+977-…"
          />
          {err("phone")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-subject">Subject *</Label>
          <Input
            id="c-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-11"
            placeholder="How can we help?"
          />
          {err("subject")}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="c-message">Message *</Label>
          <Textarea
            id="c-message"
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message…"
          />
          {err("message")}
        </div>
      </div>
      {formError && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
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
        {busy && <Loader2 className="animate-spin" />} Send Message
      </Button>
    </form>
  );
}
