import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./brand";
import { Button } from "./ui/button";
import { nav, site } from "@/lib/site";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:h-[72px]">
        <Link to="/" aria-label="RESQ Nepal home">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-navy"
              activeProps={{ className: "text-navy bg-secondary" }}
              activeOptions={{ exact: true }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="soft" size="lg" className="hidden sm:inline-flex">
            <Link to="/hospital/login">Login as Hospital</Link>
          </Button>
          <Button asChild variant="hero" size="lg" className="hidden sm:inline-flex">
            <Link to="/register">Join as Hospital</Link>
          </Button>
          <button
            className="rounded-full p-2 text-navy lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="block border-b border-border py-3.5 text-base font-semibold text-navy"
            >
              {n.label}
            </Link>
          ))}
          <Button asChild variant="soft" size="xl" className="mt-5 w-full">
            <Link to="/hospital/login" onClick={() => setOpen(false)}>
              Login as Hospital
            </Link>
          </Button>
          <Button asChild variant="hero" size="xl" className="mt-3 w-full">
            <Link to="/register" onClick={() => setOpen(false)}>
              Join as Hospital
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo inverted />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-navy-foreground/65">
            {site.tagline}
          </p>
          <Link
            to="/register"
            className="mt-6 inline-flex text-sm font-bold text-primary hover:underline"
          >
            Become a hospital partner →
          </Link>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-navy-foreground/50">
            Explore
          </p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-navy-foreground/80 hover:text-navy-foreground">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-navy-foreground/50">
            Contact
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-foreground/80">
            <li>Email: {site.email ?? "To be announced"}</li>
            <li>Phone: {site.phone ?? "To be announced"}</li>
            <li>{site.address ?? "Kathmandu, Nepal"}</li>
          </ul>
          <ul className="mt-6 space-y-2.5 text-sm">
            <li>
              <Link to="/privacy" className="text-navy-foreground/80 hover:text-navy-foreground">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-navy-foreground/80 hover:text-navy-foreground">
                Terms and Conditions
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-5 py-6 text-xs text-navy-foreground/50">
          <p>© {new Date().getFullYear()} RESQ Nepal</p>
          <p>In a life-threatening emergency, always call your local emergency number.</p>
        </div>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="bg-navy-gradient relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:py-28">
        <p className="eyebrow mb-4">{eyebrow}</p>
        <h1 className="display max-w-3xl text-5xl text-navy-foreground sm:text-6xl">{title}</h1>
        <p className="mt-6 max-w-xl text-lg text-navy-foreground/70">{copy}</p>
      </div>
    </section>
  );
}
