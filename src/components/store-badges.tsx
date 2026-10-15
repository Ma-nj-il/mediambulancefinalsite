import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

function AppleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
      <path d="M16.4 12.6c0-2.6 2.1-3.8 2.2-3.9-1.2-1.8-3.1-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.5 1.3-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-4.2ZM13.9 5c.7-.8 1.2-2 1-3.2-1 0-2.2.7-3 1.5-.6.7-1.2 1.9-1 3.1 1.1.1 2.3-.6 3-1.4Z" />
    </svg>
  );
}
function PlayGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path d="M4 2.5 13.5 12 4 21.5c-.3-.2-.5-.6-.5-1v-17c0-.4.2-.8.5-1Z" className="fill-success" />
      <path d="m16.6 8.9-3.1 3.1L4 2.5c.3-.2.8-.2 1.2 0l11.4 6.4Z" className="fill-warning" />
      <path d="m16.6 15.1-11.4 6.4c-.4.2-.9.2-1.2 0l9.5-9.5 3.1 3.1Z" className="fill-primary" />
      <path d="m20.2 13-3.6 2.1-3.1-3.1 3.1-3.1 3.6 2.1c.8.4.8 1.6 0 2Z" className="fill-chart-5" />
    </svg>
  );
}

export function StoreBadges({ className, inverted }: { className?: string; inverted?: boolean }) {
  const badges = [
    { label: "App Store", pre: "Download on the", glyph: <AppleGlyph />, href: site.appStoreUrl },
    { label: "Google Play", pre: "Get it on", glyph: <PlayGlyph />, href: site.playStoreUrl },
  ];
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {badges.map((b) => {
        const inner = (
          <>
            {b.glyph}
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[10px] opacity-70">{b.href ? b.pre : "Coming soon on"}</span>
              <span className="text-[15px] font-bold">{b.label}</span>
            </span>
          </>
        );
        const cls = cn(
          "inline-flex h-14 items-center gap-3 rounded-2xl px-5 transition-all",
          inverted ? "bg-navy-foreground text-navy" : "bg-navy text-navy-foreground",
          b.href ? "hover:-translate-y-0.5" : "cursor-default opacity-90",
        );
        return b.href ? (
          <a key={b.label} href={b.href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
        ) : (
          <span key={b.label} className={cls} aria-label={`${b.label} — coming soon`}>{inner}</span>
        );
      })}
    </div>
  );
}
