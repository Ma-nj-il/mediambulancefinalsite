import type { ReactNode } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusMeta, type AppStatus } from "@/lib/admin";

export function StatusBadge({ status }: { status: AppStatus }) {
  const m = statusMeta[status];
  return (
    <span
      className={cn(
        "inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

export function PartnerBadge({ status }: { status: string | null }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        status === "suspended" ? "bg-accent text-primary" : "bg-success/15 text-success",
      )}
    >
      {status === "suspended" ? "Suspended" : "Active"}
    </span>
  );
}

export function PageTitle({
  title,
  copy,
  actions,
}: {
  title: string;
  copy?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold text-navy sm:text-3xl">{title}</h1>
        {copy && <p className="mt-1 text-sm text-muted-foreground">{copy}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Panel({
  children,
  className,
  title,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-card", className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-bold text-navy">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  copy,
  icon,
}: {
  title: string;
  copy?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
        {icon ?? <Inbox className="h-5 w-5" />}
      </span>
      <p className="mt-4 font-bold text-navy">{title}</p>
      {copy && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy}</p>}
    </div>
  );
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-12 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
    </div>
  );
}

export function ErrorNote({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-primary">
      Couldn't load data.{" "}
      {onRetry && (
        <button className="underline" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function Pager({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button
        className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className="text-muted-foreground">
        Page {page} of {pages}
      </span>
      <button
        className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export const inputCls = "h-10 rounded-lg border border-input bg-background px-3 text-sm";

/** Tinted table header + row hover, shared by admin data tables. */
export const theadCls = "bg-secondary text-left text-xs uppercase tracking-wider text-navy";
export const rowHoverCls = "hover:bg-secondary/60";
