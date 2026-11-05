/** Bound untrusted JSON before parsing or schema validation. */
export function parseFormPayload(data: FormData): unknown {
  const payload = data.get("payload");
  if (typeof payload !== "string" || payload.length > 16_384) {
    throw new Error("Invalid submission payload");
  }
  return JSON.parse(payload);
}
