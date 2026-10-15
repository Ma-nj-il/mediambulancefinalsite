import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site-chrome";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — RESQ Nepal" },
      { name: "description", content: "Terms for using the RESQ Nepal website and partner platform." },
      { property: "og:title", content: "Terms and Conditions — RESQ Nepal" },
      { property: "og:description", content: "Terms for using RESQ Nepal." },
    ],
  }),
  component: () => (
    <>
      <PageHero eyebrow="Legal" title="Terms and Conditions" copy="The full terms will be published before launch." />
      <section className="mx-auto max-w-3xl space-y-4 px-5 py-16 text-muted-foreground">
        <p>RESQ Nepal connects users with participating providers and does not replace official emergency services.</p>
        <p>Ambulance availability, categories and equipment depend on each participating provider.</p>
        <p>The complete, legally reviewed terms are pending and will replace this summary.</p>
      </section>
    </>
  ),
});
