import { z } from "zod";

/** Preferred GPS tracking method — the hospital's initial preference, not installed hardware. */
export const GPS_METHODS = [
  {
    value: "gps_device",
    label: "GPS Tracking Device",
    desc: "Dedicated tracker fitted in each ambulance.",
  },
  {
    value: "gps_device_dashcam",
    label: "GPS Tracking Device with Dash Camera",
    desc: "Tracker plus dash camera for trip evidence.",
  },
  {
    value: "mobile_gps",
    label: "Mobile Phone GPS Tracking",
    desc: "Driver's phone shares location during trips.",
  },
  {
    value: "undecided",
    label: "Not Decided Yet",
    desc: "The RESQ team will help you choose later.",
  },
] as const;

export type GpsMethod = (typeof GPS_METHODS)[number]["value"];

/** Ambulance categories a hospital may operate. Multiple selections allowed. */
export const AMBULANCE_TYPES = [
  {
    value: "basic",
    label: "Basic Patient Transport Ambulance",
    desc: "Routine patient transportation and non-critical transfers.",
  },
  {
    value: "emergency",
    label: "Emergency Ambulance",
    desc: "Emergency response and urgent patient transport.",
  },
  {
    value: "ventilator",
    label: "Ventilator Ambulance",
    desc: "For patients requiring ventilator support during transportation.",
  },
] as const;

export type AmbulanceType = (typeof AMBULANCE_TYPES)[number]["value"];

const phone = z
  .string()
  .trim()
  .regex(/^[+0-9\s-]{7,20}$/, "Enter a valid phone number");

/** Single source of truth for Join as Hospital validation — used by the form and the server function. */
export const registrationSchema = z.object({
  hospitalName: z.string().trim().min(2, "Enter the hospital name").max(150),
  address: z.string().trim().min(3, "Enter the hospital address").max(200),
  contactName: z.string().trim().min(2, "Enter a contact person's name").max(100),
  phone,
  additionalMessage: z
    .string()
    .trim()
    .max(1000, "Message must be under 1000 characters.")
    .optional()
    .default(""),
  gpsMethod: z.enum(["gps_device", "gps_device_dashcam", "mobile_gps", "undecided"], {
    errorMap: () => ({ message: "Choose a preferred GPS tracking method." }),
  }),
  totalAmbulances: z
    .number({ invalid_type_error: "Enter the total number of ambulances." })
    .int("Enter a whole number — decimals are not allowed.")
    .min(1, "Enter at least 1 ambulance.")
    .max(500, "Enter 500 or fewer."),
  ambulanceTypes: z
    .array(z.enum(["basic", "emergency", "ventilator"]))
    .min(1, "Select at least one ambulance type."),
});

export type Registration = z.infer<typeof registrationSchema>;

export const gpsLabel = (v: string | null | undefined) =>
  GPS_METHODS.find((m) => m.value === v)?.label ?? v ?? "—";

export const typeLabels = (vs: string[] | null | undefined) =>
  (vs ?? []).map((v) => AMBULANCE_TYPES.find((t) => t.value === v)?.label ?? v);
