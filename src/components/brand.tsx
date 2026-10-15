import { cn } from "@/lib/utils";

export function AppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-9 w-9", className)} aria-hidden="true">
      <rect width="48" height="48" rx="13" className="fill-primary" />
      <path
        d="M24 9c-6.6 0-12 5.2-12 11.7C12 29.5 24 39 24 39s12-9.5 12-18.3C36 14.2 30.6 9 24 9Z"
        className="fill-primary-foreground"
      />
      <path d="M22 15h4v4.5h4.5v4H26V28h-4v-4.5h-4.5v-4H22Z" className="fill-primary" />
    </svg>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <AppIcon />
      <span className="flex flex-col leading-none">
        <span className={cn("text-[19px] font-extrabold tracking-tight", inverted ? "text-navy-foreground" : "text-navy")}>
          RESQ<span className="text-primary">.</span>
        </span>
        <span className={cn("mt-0.5 text-[10px] font-bold tracking-[0.32em]", inverted ? "text-navy-foreground/60" : "text-muted-foreground")}>
          NEPAL
        </span>
      </span>
    </span>
  );
}
