import { Pill } from "./Pill.mjs";

/** Red pill, top center: "⚠ NAME". Appears together with the failure ghost. */
export const ThreatBadge = (o) => Pill({ ...o, tone: "red" });
