/** Midnight today, in the server's local time — a drive happening later today
 * still counts as "upcoming". */
export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
