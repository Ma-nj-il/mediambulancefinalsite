import { createFileRoute, redirect } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDateTime } from "@/lib/admin";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/admin/_panel/users")({
  beforeLoad: async () => {
    const { data, error } = await supabase.rpc("has_admin_permission", {
      _permission: "users.write",
    });
    if (error || !data) throw redirect({ to: "/admin/dashboard" });
  },
  head: () => ({ meta: [{ title: "Admin Users & Permissions — RESQ Admin" }] }),
  component: Users,
});
type StaffRole = Database["public"]["Enums"]["admin_staff_role"];
const roles: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  application_manager: "Application Manager",
  request_manager: "Request Manager",
  report_viewer: "Report Viewer",
};
function Users() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_profiles").select("*").order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const update = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: StaffRole }) => {
      const { error } = await supabase.rpc("set_admin_staff_role", {
        _user_id: id,
        _role: role,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return (
    <>
      <PageTitle
        title="Admin Users & Permissions"
        copy="Role assignments for existing administrator accounts. Account creation remains a server-side provisioning task."
      />
      <Panel>
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorNote onRetry={() => query.refetch()} />
        ) : !query.data?.length ? (
          <EmptyState
            title="No administrators found"
            copy="Provision administrators securely through the existing server-side process."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className={theadCls}>
                <tr>
                  <th className="p-3">Administrator</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((user) => (
                  <tr key={user.user_id} className="border-b border-border">
                    <td className="p-3 font-bold text-navy">{user.display_name ?? "Not set"}</td>
                    <td>{user.username}</td>
                    <td>
                      <select
                        aria-label={`Role for ${user.username}`}
                        className={inputCls}
                        value={user.staff_role}
                        disabled={update.isPending}
                        onChange={(event) =>
                          update.mutate({ id: user.user_id, role: event.target.value as StaffRole })
                        }
                      >
                        {Object.entries(roles).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.is_active ? "bg-success/15 text-success" : "bg-accent text-primary"}`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>{fmtDateTime(user.last_login_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
      <Panel title="Permission model" className="mt-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(roles).map(([role, label]) => (
            <div key={role} className="rounded-xl bg-muted p-4">
              <p className="font-bold text-navy">{label}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {role === "super_admin"
                  ? "Full website administration access."
                  : role === "application_manager"
                    ? "Hospital applications and records."
                    : role === "request_manager"
                      ? "Inquiries and device requests."
                      : "Read-only reports and audit access."}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
