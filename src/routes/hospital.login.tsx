import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2 } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/hospital/login")({
  head: () => ({
    meta: [
      { title: "Hospital Sign In — RESQ Nepal" },
      { name: "description", content: "Hospital partner sign in for RESQ Nepal." },
    ],
  }),
  component: HospitalLogin,
});

function HospitalLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setNote("Enter your hospital email and password.");
    // Hospital authentication is not configured in this release — placeholder only.
    setNote(
      "Hospital sign-in is not yet available. Your hospital account will be activated after your registration is approved. No hospital passwords exist yet, and this page never grants admin access.",
    );
  };

  return (
    <div className="bg-navy-gradient flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo inverted />
        </div>
        <form onSubmit={onSubmit} className="rounded-[28px] bg-card p-8 shadow-float">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent">
            <Building2 className="h-5 w-5 text-primary" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-navy">Hospital sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            For approved hospital partners. Admins use{" "}
            <Link to="/admin" className="font-bold text-primary hover:underline">
              /admin
            </Link>{" "}
            instead.
          </p>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="h-email">Hospital email</Label>
              <Input
                id="h-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="h-password">Password</Label>
              <Input
                id="h-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
          </div>
          {note && (
            <p
              role="status"
              className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-navy"
            >
              {note}
            </p>
          )}
          <Button type="submit" variant="hero" size="xl" className="mt-6 w-full">
            Sign in
          </Button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Join as Hospital
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
