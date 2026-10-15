import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSession, usernameToEmail } from "@/lib/admin";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Sign In — RESQ Nepal" },
      { name: "description", content: "Restricted administrator access for RESQ Nepal." },
      { property: "og:title", content: "Admin Sign In — RESQ Nepal" },
      { property: "og:description", content: "Restricted administrator access." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getAdminSession().then((u) => u && navigate({ to: "/admin/dashboard", replace: true }));
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) return setError("Enter your username and password.");
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password });
    if (err) {
      setBusy(false);
      return setError(err.status === 429 ? "Too many attempts. Please wait a few minutes and try again." : "Invalid username or password.");
    }
    const admin = await getAdminSession();
    if (!admin) {
      await supabase.auth.signOut();
      setBusy(false);
      return setError("Invalid username or password.");
    }
    await supabase.rpc("record_admin_login");
    navigate({ to: "/admin/dashboard", replace: true });
  };

  return (
    <div className="bg-navy-gradient flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo inverted /></div>
        <form onSubmit={onSubmit} className="rounded-[28px] bg-card p-8 shadow-float">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent"><Lock className="h-5 w-5 text-primary" /></span>
          <h1 className="mt-5 text-2xl font-extrabold text-navy">Administrator sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Authorized RESQ Nepal staff only.</p>
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
            </div>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary">{error}</p>}
          <Button type="submit" variant="hero" size="xl" className="mt-6 w-full" disabled={busy}>{busy && <Loader2 className="animate-spin" />} Sign in</Button>
        </form>
      </div>
    </div>
  );
}
