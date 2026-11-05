import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  ClipboardList,
  FileBarChart,
  HardDrive,
  Inbox,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  ScrollText,
  User,
  UsersRound,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand";
import { getAdminSession } from "@/lib/admin";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/_panel")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getAdminSession();
    if (!user) throw redirect({ to: "/admin" });
    return { adminUser: user };
  },
  component: PanelLayout,
});

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutGrid },
  {
    to: "/admin/applications",
    label: "Hospital Applications",
    icon: ClipboardList,
    roles: ["super_admin", "application_manager", "report_viewer"],
  },
  {
    to: "/admin/hospitals",
    label: "Approved Hospitals",
    icon: Building2,
    roles: ["super_admin", "application_manager", "report_viewer"],
  },
  {
    to: "/admin/requests",
    label: "All Requests",
    icon: Inbox,
    roles: ["super_admin", "report_viewer"],
  },
  {
    to: "/admin/device-requests",
    label: "GPS & Device Requests",
    icon: HardDrive,
    roles: ["super_admin", "request_manager", "report_viewer"],
  },
  {
    to: "/admin/inquiries",
    label: "Contact Inquiries",
    icon: Inbox,
    roles: ["super_admin", "request_manager", "report_viewer"],
  },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  {
    to: "/admin/reports",
    label: "Reports & Analytics",
    icon: FileBarChart,
    roles: ["super_admin", "report_viewer"],
  },
  {
    to: "/admin/audit",
    label: "Activity Logs",
    icon: ScrollText,
    roles: ["super_admin", "report_viewer"],
  },
  { to: "/admin/users", label: "Admin Users", icon: UsersRound, roles: ["super_admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings },
] as const;

function useCloseOnOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [ref, onClose]);
}

function PanelLayout() {
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { adminUser } = Route.useRouteContext();
  const bellRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useCloseOnOutside(bellRef, () => setBellOpen(false));
  useCloseOnOutside(menuRef, () => setMenuOpen(false));

  const { data: profile } = useQuery({
    queryKey: ["admin-profile", adminUser.id],
    queryFn: async () =>
      (await supabase.from("admin_profiles").select("*").eq("user_id", adminUser.id).maybeSingle())
        .data,
  });

  const { data: alerts } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const [notifications, unread] = await Promise.all([
        supabase
          .from("admin_notification_inbox")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("admin_notification_inbox")
          .select("id", { count: "exact", head: true })
          .is("read_at", null),
      ]);
      if (notifications.error) throw notifications.error;
      if (unread.error) throw unread.error;
      return {
        rows: notifications.data ?? [],
        unreadCount: unread.count ?? 0,
      };
    },
  });
  const totalAlerts = alerts?.unreadCount ?? 0;

  useEffect(() => {
    const channel = supabase
      .channel("admin-shell-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "admin_notifications" },
        () => {
          void qc.invalidateQueries({ queryKey: ["admin-alerts"] });
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [qc]);

  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  };

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Admin">
      {items
        .filter(
          (it) =>
            !("roles" in it) ||
            !profile ||
            (it.roles as readonly string[]).includes(profile.staff_role),
        )
        .map((it) => (
          <Link
            key={it.to}
            to={it.to}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-secondary"
            activeProps={{
              className:
                "bg-gradient-to-br from-primary to-primary-deep font-semibold text-primary-foreground shadow-glow hover:bg-gradient-to-br",
            }}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </Link>
        ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="border-t border-border p-3">
      <button
        onClick={logout}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
      >
        <LogOut className="h-4 w-4" /> Logout
      </button>
    </div>
  );

  const brandBlock = (
    <div className="flex h-16 items-center gap-2 border-b border-border px-5">
      <Link to="/admin/dashboard" aria-label="Admin overview">
        <Logo />
      </Link>
      <p className="ml-1 text-[11px] font-bold text-primary">Website Admin</p>
    </div>
  );

  const initial = (profile?.username ?? "A").slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-soft">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        {brandBlock}
        {nav}
        {sidebarFooter}
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card">
            <div className="flex h-16 items-center justify-between border-b border-border pl-5 pr-3">
              <Link
                to="/admin/dashboard"
                aria-label="Admin overview"
                onClick={() => setOpen(false)}
              >
                <Logo />
              </Link>
              <button
                aria-label="Close menu"
                className="rounded-full p-2 text-navy hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            {nav}
            {sidebarFooter}
          </aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/90 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
              <Menu className="h-6 w-6 text-navy" />
            </button>
            <p className="hidden text-sm text-muted-foreground sm:block">
              <span className="font-semibold text-navy">RESQ Nepal</span> · Website Admin
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={bellRef}>
              <button
                aria-label="Notifications"
                aria-expanded={bellOpen}
                onClick={() => {
                  setBellOpen(!bellOpen);
                  setMenuOpen(false);
                }}
                className="relative rounded-full p-2 text-navy hover:bg-secondary"
              >
                <Bell className="h-5 w-5" />
                {totalAlerts > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                    {totalAlerts > 9 ? "9+" : totalAlerts}
                  </span>
                )}
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-card p-3 shadow-float">
                  <p className="px-2 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Needs attention
                  </p>
                  {totalAlerts === 0 ? (
                    <p className="px-2 py-4 text-sm text-muted-foreground">
                      Nothing pending — all caught up.
                    </p>
                  ) : (
                    <div className="max-h-72 space-y-1 overflow-y-auto">
                      {(alerts?.rows ?? []).slice(0, 8).map((alert) => (
                        <Link
                          key={alert.id}
                          to="/admin/notifications"
                          onClick={() => setBellOpen(false)}
                          className="block rounded-xl px-2 py-2 text-sm hover:bg-secondary"
                        >
                          <span className="font-bold text-navy">{alert.title}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {alert.description}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    to="/admin/notifications"
                    onClick={() => setBellOpen(false)}
                    className="mt-1 block rounded-xl bg-secondary px-2 py-2 text-center text-sm font-bold text-navy"
                  >
                    View all notifications
                  </Link>
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setBellOpen(false);
                }}
                aria-expanded={menuOpen}
                aria-label="Administrator menu"
                className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 text-sm text-navy hover:bg-secondary"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary-deep font-bold uppercase text-primary-foreground">
                  {initial}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold">
                    {profile?.username ?? "admin"}
                  </span>
                  <span className="block text-xs text-muted-foreground">Administrator</span>
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-border bg-card p-1.5 shadow-float">
                  <Link
                    to="/admin/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-navy hover:bg-secondary"
                  >
                    <User className="h-4 w-4" /> Admin Profile
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-navy hover:bg-secondary"
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </Link>
                  <button
                    onClick={logout}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-navy hover:bg-secondary",
                    )}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {profile?.must_change_password && (
          <div className="border-b border-warning/40 bg-warning/15 px-5 py-3 text-sm text-navy">
            You&apos;re using a temporary password.{" "}
            <Link to="/admin/profile" className="font-bold underline">
              Change it now
            </Link>{" "}
            before going live.
          </div>
        )}
        <main className="mx-auto max-w-7xl p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
