import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PartnerLogin() {
  const [partnerId, setPartnerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-5 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <form
          onSubmit={onSubmit}
          className="rounded-[28px] border border-border bg-white p-7 shadow-card sm:p-9"
        >
          <div className="h-1 w-12 rounded-full bg-primary" />
          <h1 className="mt-6 text-2xl font-extrabold text-navy sm:text-3xl">
            Hospital / Provider Login
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Sign in to access your hospital or provider account.
          </p>
          <div className="mt-7 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="partner-id">Hospital / Provider ID</Label>
              <Input
                id="partner-id"
                type="text"
                autoComplete="username"
                required
                value={partnerId}
                onChange={(event) => setPartnerId(event.target.value)}
                className="h-12 border-border bg-background px-4 focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="partner-password">Password</Label>
                <a
                  href="#forgot-password"
                  onClick={(event) => event.preventDefault()}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="partner-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 border-border bg-background px-4 pr-12 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-md text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          <Button type="submit" variant="hero" size="xl" className="mt-7 w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
