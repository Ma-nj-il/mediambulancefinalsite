// Real contact details are not yet supplied. Keep null until confirmed — the UI shows "To be announced".
export const site = {
  name: "RESQ Nepal",
  tagline: "A smarter way to connect with ambulance services in Nepal.",
  email: null as string | null,
  phone: null as string | null,
  address: null as string | null,
  social: [] as { label: string; href: string }[],
  appStoreUrl: null as string | null,
  playStoreUrl: null as string | null,
};

export const nav = [
  { to: "/", label: "Home" },
  { to: "/hospitals", label: "For Hospitals" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/dashboard", label: "Live Dashboard" },
  { to: "/contact", label: "Contact" },
] as const;
