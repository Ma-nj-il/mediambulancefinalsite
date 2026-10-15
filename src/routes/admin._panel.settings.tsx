import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageTitle, Panel } from "@/components/admin-ui";

export const Route = createFileRoute("/admin/_panel/settings")({
  head: () => ({ meta: [{ title: "Settings — RESQ Admin" }] }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const logoutEverywhere = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut({ scope: "global" });
    navigate({ to: "/admin", replace: true });
  };

  return (
    <>
      <PageTitle title="Settings" copy="Session and environment information." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Sessions">
          <p className="text-sm text-muted-foreground">
            Sign out closes the current browser session. Use global sign-out if the account may be
            open on a shared device.
          </p>
          <button
            onClick={logoutEverywhere}
            className="mt-4 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-navy hover:border-primary"
          >
            Sign out everywhere
          </button>
        </Panel>
        <Panel title="Production checklist">
          <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Replace the temporary <code>ADMIN_SEED_USERNAME</code> /{" "}
              <code>ADMIN_SEED_PASSWORD</code> credentials and confirm{" "}
              <code>must_change_password</code> is cleared.
            </li>
            <li>
              Keep <code>SUPABASE_SERVICE_ROLE_KEY</code> server-only — never expose it with a{" "}
              <code>VITE_</code> prefix.
            </li>
            <li>
              Configure private <code>application-documents</code> storage; documents are served
              only to signed-in admins.
            </li>
            <li>Review Supabase Auth rate limits and enable MFA for administrator accounts.</li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
