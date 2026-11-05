import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Activity, Ambulance, Bell, LogOut, MapPin, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PartnerRole = "hospital" | "provider";
type PartnerAccount = Database["public"]["Tables"]["partner_accounts"]["Row"];

const stateStyle: Record<string, string> = {
  available: "bg-success/15 text-success",
  busy: "bg-warning/20 text-navy",
  "on trip": "bg-primary/10 text-primary",
  offline: "bg-secondary text-muted-foreground",
  emergency: "bg-destructive/10 text-destructive",
};

export function PartnerDashboard({ role }: { role: PartnerRole }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const title = role === "hospital" ? "Hospital" : "Provider";

  const query = useQuery({
    queryKey: ["partner-dashboard", role],
    queryFn: async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) throw authError ?? new Error("Please sign in again.");
      const { data: account, error: accountError } = await supabase
        .from("partner_accounts")
        .select("*")
        .eq("user_id", authData.user.id)
        .eq("role", role)
        .single();
      if (accountError) throw accountError;

      if (account.must_change_password) {
        return { account, application: null, ambulances: [], drivers: [] };
      }

      if (role === "provider") {
        return { account, application: null, ambulances: [], drivers: [] };
      }

      if (!account.hospital_application_id) {
        throw new Error("No hospital has been linked to this account.");
      }
      const [application, ambulances, drivers] = await Promise.all([
        supabase
          .from("hospital_applications")
          .select("id, hospital_name, city_district, partnership_status")
          .eq("id", account.hospital_application_id)
          .single(),
        supabase
          .from("ambulances")
          .select("id, registration_number, category, status, gps_available")
          .eq("hospital_application_id", account.hospital_application_id)
          .order("registration_number"),
        supabase
          .from("drivers")
          .select("id, full_name, phone, ambulance_id")
          .eq("hospital_application_id", account.hospital_application_id)
          .order("full_name"),
      ]);
      if (application.error) throw application.error;
      if (ambulances.error) throw ambulances.error;
      if (drivers.error) throw drivers.error;
      return {
        account,
        application: application.data,
        ambulances: ambulances.data,
        drivers: drivers.data,
      };
    },
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.length < 12) throw new Error("Use at least 12 characters.");
      if (password !== confirmPassword) throw new Error("Passwords do not match.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      const { error: profileError } = await supabase.rpc("mark_partner_password_changed");
      if (profileError) throw profileError;
    },
    onSuccess: async () => {
      setPassword("");
      setConfirmPassword("");
      setPasswordError(null);
      setPasswordMessage("Password updated.");
      await queryClient.invalidateQueries({ queryKey: ["partner-dashboard", role] });
    },
    onError: (error) => {
      setPasswordMessage(null);
      setPasswordError(error instanceof Error ? error.message : "Couldn't update the password.");
    },
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    await queryClient.clear();
    if (role === "hospital") await navigate({ to: "/hospital/login", replace: true });
    else await navigate({ to: "/provider/login", replace: true });
  };

  if (query.isLoading)
    return <div className="p-8 text-sm text-muted-foreground">Loading your dashboard…</div>;
  if (query.error || !query.data) {
    return (
      <div
        role="alert"
        className="m-5 rounded-2xl border border-destructive/30 bg-card p-6 text-sm text-destructive"
      >
        We couldn&apos;t load your authorized account data. Check your connection or contact Medi
        Ambulance administration.
      </div>
    );
  }

  const { account, application, ambulances, drivers } = query.data;
  const countStatus = (status: string) =>
    ambulances.filter((ambulance) => ambulance.status.toLowerCase() === status).length;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              {title} portal
            </p>
            <h1 className="mt-1 text-xl font-extrabold text-navy">
              {application?.hospital_name ?? account.display_name}
            </h1>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-bold text-navy"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        {account.must_change_password && (
          <section className="rounded-2xl border border-warning/40 bg-warning/15 p-5">
            <h2 className="font-bold text-navy">Change your temporary password</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose a new password of at least 12 characters.
            </p>
            {passwordMessage && (
              <p role="status" className="mt-3 text-sm font-semibold text-success">
                {passwordMessage}
              </p>
            )}
            {passwordError && (
              <p role="alert" className="mt-3 text-sm font-semibold text-destructive">
                {passwordError}
              </p>
            )}
            <form
              className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                setPasswordMessage(null);
                setPasswordError(null);
                changePassword.mutate();
              }}
            >
              <input
                aria-label="New password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <input
                aria-label="Confirm new password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-xl border border-border bg-card px-3 text-sm"
              />
              <button
                disabled={changePassword.isPending}
                className="h-11 rounded-xl bg-navy px-5 text-sm font-bold text-navy-foreground disabled:opacity-60"
              >
                Update password
              </button>
            </form>
          </section>
        )}

        {account.must_change_password ? (
          <section className="rounded-2xl border border-warning/40 bg-warning/15 p-5 text-sm text-navy">
            Your account data remains locked until you set a new password.
          </section>
        ) : role === "hospital" && application ? (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Fleet vehicles", value: ambulances.length, icon: Ambulance },
                { label: "Drivers", value: drivers.length, icon: Users },
                { label: "Available", value: countStatus("available"), icon: Activity },
                { label: "Partnership", value: application.partnership_status ?? "—", icon: Bell },
              ].map(({ label, value, icon: Icon }) => (
                <article key={label} className="rounded-2xl border border-border bg-card p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-2xl font-extrabold capitalize text-navy">{value}</p>
                </article>
              ))}
            </section>
            <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <article className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-extrabold text-navy">Fleet monitoring</h2>
                </div>
                <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 p-6 text-center">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-3 font-bold text-navy">Live GPS is not connected</p>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    This account currently has no verified live location feed. Vehicle locations are
                    not simulated or shown as live.
                  </p>
                </div>
                <h3 className="mt-6 font-bold text-navy">Registered ambulances</h3>
                {ambulances.length ? (
                  <ul className="mt-3 divide-y divide-border">
                    {ambulances.map((vehicle) => (
                      <li
                        key={vehicle.id}
                        className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm"
                      >
                        <span className="font-semibold text-navy">
                          {vehicle.registration_number} · {vehicle.category ?? "Category not set"}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${stateStyle[vehicle.status.toLowerCase()] ?? stateStyle["offline"]}`}
                        >
                          {vehicle.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No ambulance records are linked to this hospital account yet.
                  </p>
                )}
              </article>
              <article className="rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-extrabold text-navy">Assigned drivers</h2>
                {drivers.length ? (
                  <ul className="mt-4 divide-y divide-border">
                    {drivers.map((driver) => (
                      <li key={driver.id} className="py-3">
                        <p className="font-semibold text-navy">{driver.full_name}</p>
                        <p className="text-sm text-muted-foreground">{driver.phone}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    No driver records are linked to this hospital account yet.
                  </p>
                )}
                <p className="mt-6 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                  Booking, trip history and real-time notifications are not configured in this
                  release.
                </p>
              </article>
            </section>
          </>
        ) : role === "provider" ? (
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-extrabold text-navy">Provider operations</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your provider account is authenticated. Provider fleet, driver, booking and trip
              records are not yet modeled in the connected database, so no operational data is shown
              here.
            </p>
            <p className="mt-4 rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">
              Live GPS integrations are not configured. This dashboard does not display simulated
              locations.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-warning/40 bg-warning/15 p-6 text-sm text-navy">
            This hospital partnership is not active. Contact Medi Ambulance administration.
          </section>
        )}
      </div>
    </main>
  );
}
