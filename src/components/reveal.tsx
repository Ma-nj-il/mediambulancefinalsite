import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-shown={shown} className={cn("reveal", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
  align = "center",
  inverted,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  align?: "center" | "left";
  inverted?: boolean;
}) {
  return (
    <Reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className={cn("display text-4xl sm:text-5xl", inverted ? "text-navy-foreground" : "text-navy")}>{title}</h2>
      {copy && (
        <p className={cn("mt-5 text-lg leading-relaxed", inverted ? "text-navy-foreground/70" : "text-muted-foreground")}>{copy}</p>
      )}
    </Reveal>
  );
}

export function PreviewTag({ children = "Interface preview", className }: { children?: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1 text-[11px] font-semibold text-muted-foreground backdrop-blur", className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      {children}
    </span>
  );
}
