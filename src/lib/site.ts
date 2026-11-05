// Real contact details are not yet supplied. Keep null until confirmed — the UI shows "To be announced".
export const site = {
  name: "RESQ Nepal",
  tagline: "Integrated ambulance access, fleet management, and hospital operations for Nepal.",
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
  social: [] as { label: string; href: string }[],
  appStoreUrl: null as string | null,
  playStoreUrl: null as string | null,
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/hospitals", label: "Hospital Platform" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/contact", label: "Contact" },
] as const;
