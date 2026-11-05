export function toCsv(rows: Record<string, unknown>[]) {
  const head = [
    "reference",
    "hospital",
    "contact",
    "phone",
    "email",
    "address",
    "district",
    "ambulances",
    "categories",
    "types",
    "gps",
    "message",
    "status",
    "submitted",
    "updated",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
  return [head.join(","), ...rows.map((r) => head.map((h) => esc(r[h])).join(","))].join("\n");
}
