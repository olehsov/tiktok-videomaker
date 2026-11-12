import { Pill } from "./Pill.mjs";

/** Green pill, top center: "✓ STEP N · NAME". `text` is the script's onScreen.stepPlate. */
export const StepBadge = (o) => Pill({ ...o, tone: "green" });
