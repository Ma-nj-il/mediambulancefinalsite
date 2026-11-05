import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Pager,
  Panel,
  inputCls,
} from "@/components/admin-ui";
import { fmtDateTime } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/notifications")({
  head: () => ({ meta: [{ title: "Notifications — RESQ Admin" }] }),
  component: Notifications,
});

const PAGE_SIZE = 15;

function Notifications() {
  const client = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["admin-notifications", filter, page],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Session expired");
      let builder = supabase
        .from("admin_notification_inbox")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (filter === "unread") builder = builder.is("read_at", null);
      const { data, error, count } = await builder;
      if (error) throw error;
      return {
        rows: data ?? [],
        count: count ?? 0,
        userId: user.user.id,
      };
    },
  });
  useEffect(() => {
    const channel = supabase
      .channel("admin-notifications-ui")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        () => {
          void client.invalidateQueries({ queryKey: ["admin-notifications"] });
          void client.invalidateQueries({ queryKey: ["admin-alerts"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [client]);
  const mark = useMutation({
    mutationFn: async (ids: string[]) => {
      if (!query.data) return;
      const { error } = await supabase.from("admin_notification_reads").upsert(
        ids.map((notificationId) => ({
          notification_id: notificationId,
          admin_user_id: query.data!.userId,
        })),
        { onConflict: "notification_id,admin_user_id" },
      );
      if (error) throw error;
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["admin-notifications"] });
      await client.invalidateQueries({ queryKey: ["admin-alerts"] });
    },
  });
  const target = (type: string, id: string | null) =>
    type === "hospital_application" && id
      ? { to: "/admin/applications/$id" as const, params: { id } }
      : type === "device_request" && id
        ? { to: "/admin/device-requests/$id" as const, params: { id } }
        : { to: "/admin/inquiries" as const };

  return (
    <>
      <PageTitle
        title="Notifications"
        copy="Persistent website submission and workflow alerts."
        actions={
          <button
            disabled={!query.data?.rows.some((item) => !item.read_at)}
            onClick={() =>
              mark.mutate(
                query.data?.rows.filter((item) => !item.read_at).map((item) => item.id) ?? [],
              )
            }
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-bold text-navy disabled:opacity-50"
          >
            <CheckCheck className="h-4 w-4" /> Mark page read
          </button>
        }
      />
      <Panel>
        <div className="mb-5 max-w-xs">
          <select
            className={inputCls}
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">All notifications</option>
            <option value="unread">Unread only</option>
          </select>
        </div>
        {query.isLoading ? (
          <Loading />
        ) : query.error ? (
          <ErrorNote onRetry={() => query.refetch()} />
        ) : !query.data?.rows.length ? (
          <EmptyState
            title="No notifications"
            copy="New website submissions and workflow events will appear here."
          />
        ) : (
          <>
            <div className="space-y-2">
              {query.data.rows.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-4 rounded-2xl border p-4 ${item.read_at ? "border-border bg-card" : "border-primary/30 bg-accent/40"}`}
                >
                  <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                    <Bell className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <Link
                      {...target(item.related_record_type, item.related_record_id)}
                      onClick={() => !item.read_at && mark.mutate([item.id])}
                      className="font-extrabold text-navy hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {fmtDateTime(item.created_at)}
                    </p>
                  </div>
                  {!item.read_at && (
                    <button
                      onClick={() => mark.mutate([item.id])}
                      className="text-xs font-bold text-primary"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              ))}
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
