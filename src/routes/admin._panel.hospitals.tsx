import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  EmptyState,
  ErrorNote,
  Loading,
  PageTitle,
  Panel,
  PartnerBadge,
  Pager,
  inputCls,
  theadCls,
} from "@/components/admin-ui";
import { fmtDate } from "@/lib/admin";

export const Route = createFileRoute("/admin/_panel/hospitals")({
  head: () => ({ meta: [{ title: "Registered Hospitals — RESQ Admin" }] }),
  component: Hospitals,
});

const PAGE_SIZE = 10;

function Hospitals() {
  const [search, setSearch] = useState("");
  const [partnership, setPartnership] = useState("all");
  const [page, setPage] = useState(1);

  const q = useQuery({
    queryKey: ["admin-hospitals", search, partnership, page],
    queryFn: async () => {
      let qb = supabase
        .from("hospital_applications")
        .select(
          "id, application_reference, hospital_name, contact_person, phone, hospital_address, city_district, ambulance_count, approved_at, partnership_status",
          { count: "exact" },
        )
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
      if (partnership !== "all")
        qb = qb.eq("partnership_status", partnership as "active" | "suspended");
      const s = search.trim();
      if (s)
        qb = qb.or(
          `hospital_name.ilike.%${s}%,contact_person.ilike.%${s}%,city_district.ilike.%${s}%`,
        );
      const { data, error, count } = await qb;
      if (error) throw error;
      return { rows: data, total: count ?? 0 };
    },
  });
  const pages = useMemo(() => Math.max(1, Math.ceil((q.data?.total ?? 0) / PAGE_SIZE)), [q.data]);

  return (
    <>
      <PageTitle
        title="Approved Hospitals"
        copy="Hospitals whose applications have been approved."
      />
      <Panel>
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            aria-label="Search hospitals"
            placeholder="Search hospital, contact, district…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${inputCls} w-full sm:w-72`}
          />
          <select
            aria-label="Partnership filter"
            value={partnership}
            onChange={(e) => {
              setPartnership(e.target.value);
              setPage(1);
            }}
            className={inputCls}
          >
            <option value="all">All partnerships</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {q.isLoading ? (
          <Loading />
        ) : q.error || !q.data ? (
          <ErrorNote onRetry={() => q.refetch()} />
        ) : q.data.rows.length === 0 ? (
          <EmptyState
            title="No registered hospitals yet"
            copy="Approved applications will appear here as registered partners."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className={theadCls}>
                  <tr>
                    <th className="py-2 pr-3">Hospital</th>
                    <th className="pr-3">Contact</th>
                    <th className="pr-3">District</th>
                    <th className="pr-3">Amb.</th>
                    <th className="pr-3">Approved</th>
                    <th className="pr-3">Partnership</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {q.data.rows.map((h) => (
                    <tr key={h.id} className="border-t border-border hover:bg-secondary/60">
                      <td className="py-2.5 pr-3 font-semibold text-navy">
                        {h.hospital_name}
                        <br />
                        <span className="text-xs font-normal text-muted-foreground">
                          {h.application_reference}
                        </span>
                      </td>
                      <td className="pr-3 text-muted-foreground">
                        {h.contact_person}
                        <br />
                        {h.phone}
                      </td>
                      <td className="pr-3 text-muted-foreground">{h.city_district ?? "—"}</td>
                      <td className="pr-3 text-muted-foreground">{h.ambulance_count}</td>
                      <td className="pr-3 text-muted-foreground">{fmtDate(h.approved_at)}</td>
                      <td className="pr-3">
                        <PartnerBadge status={h.partnership_status} />
                      </td>
                      <td>
                        <Link
                          to="/admin/hospitals/$id"
                          params={{ id: h.id }}
                          className="font-bold text-primary hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager page={page} pages={pages} onPage={setPage} />
          </>
        )}
      </Panel>
    </>
  );
}
