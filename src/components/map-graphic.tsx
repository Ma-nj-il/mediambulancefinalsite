import { cn } from "@/lib/utils";

type Marker = { x: number; y: number };

/** Illustrative, map-style artwork. Not live data. */
export function MapGraphic({
  className,
  route = true,
  ambulances = [
    { x: 180, y: 120 },
    { x: 470, y: 90 },
    { x: 560, y: 330 },
  ],
  activeAmbulance = { x: 300, y: 250 },
}: {
  className?: string;
  route?: boolean;
  ambulances?: Marker[];
  activeAmbulance?: Marker | null;
}) {
  return (
    <svg viewBox="0 0 640 440" preserveAspectRatio="xMidYMid slice" className={cn("h-full w-full", className)} aria-hidden="true">
      <rect width="640" height="440" className="fill-map" />
      {/* parks */}
      <rect x="380" y="180" width="120" height="80" rx="14" className="fill-map-park" />
      <circle cx="90" cy="360" r="60" className="fill-map-park" />
      {/* river */}
      <path d="M-10 300 C 120 260, 200 340, 320 320 S 520 400, 660 360" strokeWidth="22" fill="none" className="stroke-map-water" />
      {/* road grid */}
      <g className="stroke-map-road" strokeLinecap="round" fill="none">
        <path d="M0 70 H640 M0 190 H640 M0 410 H640 M60 0 V440 M250 0 V440 M440 0 V440 M590 0 V440" strokeWidth="9" />
        <path d="M0 130 H640 M0 250 H380 M150 0 V440 M340 0 V300 M520 0 V440" strokeWidth="5" />
        <path d="M0 0 L640 440 M640 30 L300 440" strokeWidth="12" />
      </g>
      {/* blocks noise */}
      <g className="fill-border" opacity="0.6">
        <rect x="80" y="85" width="50" height="30" rx="4" />
        <rect x="270" y="85" width="50" height="30" rx="4" />
        <rect x="460" y="140" width="40" height="34" rx="4" />
        <rect x="170" y="200" width="60" height="36" rx="4" />
        <rect x="540" y="200" width="36" height="40" rx="4" />
      </g>
      {route && (
        <>
          <path d="M120 380 L150 250 L250 250 L250 190 L440 190 L440 70 L540 70" fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary/20" />
          <path d="M120 380 L150 250 L250 250 L250 190 L440 190 L440 70 L540 70" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="stroke-primary animate-route" />
          {/* pickup */}
          <circle cx="120" cy="380" r="12" className="fill-navy" />
          <circle cx="120" cy="380" r="5" className="fill-navy-foreground" />
          {/* destination */}
          <g transform="translate(540 70)">
            <path d="M0 -30 C -12 -30 -18 -21 -18 -14 C -18 -2 0 10 0 10 C 0 10 18 -2 18 -14 C 18 -21 12 -30 0 -30 Z" className="fill-primary" />
            <path d="M-2.5 -21 h5 v4 h4 v5 h-4 v4 h-5 v-4 h-4 v-5 h4 Z" className="fill-primary-foreground" />
          </g>
        </>
      )}
      {ambulances.map((m, i) => (
        <g key={i} transform={`translate(${m.x} ${m.y})`}>
          <circle r="14" className="fill-card" />
          <circle r="14" fill="none" strokeWidth="2" className="stroke-border" />
          <rect x="-7" y="-4" width="14" height="8" rx="2" className="fill-navy" />
        </g>
      ))}
      {activeAmbulance && (
        <g transform={`translate(${activeAmbulance.x} ${activeAmbulance.y})`}>
          <circle r="16" className="fill-primary/30 animate-ping-soft" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          <circle r="16" className="fill-primary" />
          <rect x="-8" y="-4.5" width="16" height="9" rx="2" className="fill-primary-foreground" />
          <rect x="-1" y="-3" width="2" height="6" className="fill-primary" />
          <rect x="-3" y="-1" width="6" height="2" className="fill-primary" />
        </g>
      )}
    </svg>
  );
}
