export const BATCH_MODES = ["Offline", "Online"] as const;
export type BatchMode = (typeof BATCH_MODES)[number];

/** Anything that isn't clearly "online" is treated as Offline (the original, only mode). */
export function normalizeBatchMode(raw: unknown): BatchMode {
  return String(raw ?? "").trim().toLowerCase() === "online" ? "Online" : "Offline";
}
