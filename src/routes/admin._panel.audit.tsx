import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Pager,
  Panel,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDateTime } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/audit")({
  head: () => ({ meta: [{ title: "Admin Activity Logs — RESQ Admin" }] }),
  component: Audit,
});
const PAGE_SIZE = 20;
function Audit() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-audit", search, page],
    queryFn: async () => {
      let builder = supabase
        .from("admin_audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (search.trim())
        builder = builder.or(
          `action.ilike.%${search.trim()}%,entity_type.ilike.%${search.trim()}%`,
        );
      const [logs, profiles] = await Promise.all([builder, supabase.rpc("list_admin_directory")]);
      if (logs.error) throw logs.error;
      return { rows: logs.data ?? [], count: logs.count ?? 0, profiles: profiles.data ?? [] };
    },
  });
  return (
    <>
      <PageTitle
        title="Admin Activity Logs"
        copy="Read-only audit history for important administrative actions."
      />
      <Panel>
        <input
          aria-label="Search audit logs"
          className={`${inputCls} mb-5 max-w-md`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Action or entity type"
        />
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorNote onRetry={() => query.refetch()} />
        ) : !query.data?.rows.length ? (
          <EmptyState
            title="No audit records"
            copy="Administrative workflow actions will appear here."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="p-3">Time</th>
                    <th>Administrator</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Record</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.rows.map((item) => {
                    const profile = query.data!.profiles.find(
                      (entry) => entry.user_id === item.admin_user_id,
                    );
                    return (
                      <tr key={item.id} className="border-b border-border">
                        <td className="p-3">{fmtDateTime(item.created_at)}</td>
                        <td>{profile?.display_name ?? profile?.username ?? "System"}</td>
                        <td className="font-semibold text-navy">{item.action}</td>
                        <td>{item.entity_type}</td>
                        <td className="font-mono text-xs">{item.entity_id ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pager
              page={page}
              pages={Math.max(1, Math.ceil(query.data.count / PAGE_SIZE))}
              onPage={setPage}
            />
          </>
        )}
      </Panel>
    </>
  );
}
