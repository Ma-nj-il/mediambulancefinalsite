import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — RESQ Nepal" },
      { name: "description", content: "How RESQ Nepal handles personal, hospital and trip information." },
      { property: "og:title", content: "Privacy Policy — RESQ Nepal" },
      { property: "og:description", content: "How RESQ Nepal handles your information." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" copy="The full policy will be published before launch." />
      <section className="mx-auto max-w-3xl space-y-4 px-5 py-16 text-muted-foreground">
        <p>We collect only the information needed to review hospital partnerships and to provide platform features.</p>
        <p>Public pages never display patient names, phone numbers, medical records or sensitive trip details.</p>
        <p>The complete, legally reviewed policy is pending and will replace this summary.</p>
      </section>
    </>
  ),
});
