import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  Pager,
  inputCls,
} from "@/components/admin-ui";
import { fmtDateTime, friendlyError } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel/inquiries")({
  head: () => ({ meta: [{ title: "Contact Inquiries — RESQ Admin" }] }),
  component: Inquiries,
});

const statuses = ["all", "new", "in_progress", "resolved"] as const;
const PAGE_SIZE = 10;

const statusCls: Record<string, string> = {
  new: "bg-warning/20 text-navy",
  in_progress: "bg-secondary text-navy",
  resolved: "bg-success/15 text-success",
};

const statusLabel: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  resolved: "Resolved",
};

function Inquiries() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["admin-inquiries", filter, search, page],
    queryFn: async () => {
      let qb = supabase
        .from("contact_inquiries")
        .select("*", { count: "exact" })
        .order("submitted_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (filter !== "all") qb = qb.eq("status", filter);
      const s = search.trim();
      if (s) qb = qb.or(`name.ilike.%${s}%,email.ilike.%${s}%,subject.ilike.%${s}%`);
      const { data, error, count } = await qb;
      if (error) throw error;
      return { rows: data, total: count ?? 0 };
    },
  });
  const pages = useMemo(() => Math.max(1, Math.ceil((q.data?.total ?? 0) / PAGE_SIZE)), [q.data]);

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } =
        status === "resolved"
          ? await supabase
              .from("contact_inquiries")
              .update({ status, resolved_at: new Date().toISOString() })
              .eq("id", id)
          : await supabase.from("contact_inquiries").update({ status }).eq("id", id);
      if (error) throw error;
      await supabase.rpc("log_admin_action", {
        _action: `inquiry.status.${status}`,
        _entity_type: "contact_inquiry",
        _entity_id: id,
        _metadata: {},
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin-inquiries"] });
      await qc.invalidateQueries({ queryKey: ["admin-overview"] });
      await qc.invalidateQueries({ queryKey: ["admin-alerts"] });
    },
    onError: (e) => setErr(friendlyError(e)),
  });

  return (
    <>
      <PageTitle
        title="Contact Inquiries"
        copy="Messages submitted through the website contact form."
      />
      {err && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary"
        >
          {err}
        </p>
      )}
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            aria-label="Search inquiries"
            placeholder="Search name, email, subject…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${inputCls} w-full sm:w-72`}
          />
          <select
            aria-label="Filter by status"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as typeof filter);
              setPage(1);
            }}
            className={inputCls}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All inquiries" : statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
        {q.isLoading ? (
          <Loading />
        ) : q.error || !q.data ? (
          <ErrorNote onRetry={() => q.refetch()} />
        ) : q.data.rows.length === 0 ? (
          <EmptyState
            title="No inquiries found"
            copy="Messages from the contact form will appear here."
          />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {q.data.rows.map((inq) => {
                const open = openId === inq.id;
                return (
                  <li key={inq.id} className="py-3">
                    <button
                      onClick={() => setOpenId(open ? null : inq.id)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span>
                        <span className="font-bold text-navy">{inq.subject}</span>
                        <span className="block text-xs text-muted-foreground">
                          {inq.name} · {inq.email} · {fmtDateTime(inq.submitted_at)}
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-bold",
                            statusCls[inq.status] ?? "",
                          )}
                        >
                          {statusLabel[inq.status] ?? inq.status}
                        </span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            open && "rotate-180",
                          )}
                        />
                      </span>
                    </button>
                    {open && (
                      <div className="mt-3 rounded-xl bg-soft p-4 text-sm">
                        <p className="whitespace-pre-line text-navy">{inq.message}</p>
                        {inq.phone && (
                          <p className="mt-2 text-muted-foreground">Phone: {inq.phone}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["new", "in_progress", "resolved"] as const).map((s) => (
                            <button
                              key={s}
                              disabled={setStatus.isPending || inq.status === s}
                              onClick={() => setStatus.mutate({ id: inq.id, status: s })}
                              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-bold text-navy disabled:opacity-40 hover:border-primary"
                            >
                              Mark {(statusLabel[s] ?? s).toLowerCase()}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Pager page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </Panel>
    </>
  );
}
