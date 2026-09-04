/**
 * Compact relative time, e.g. "just now", "5m ago", "3h ago", "2d ago".
 *
 * Note: `src/features/blueprint/2026` carries its own `getTimeAgo` with
 * slightly different wording ("Just now", "Yesterday", a locale date past a
 * week). Converging on one of the two changes visible copy in whichever
 * feature loses, so they are deliberately left separate for now.
 */
export function formatTimeAgo(input: string | number | Date): string {
  const then = new Date(input).getTime();
  if (Number.isNaN(then)) return "";

  const minutes = Math.floor((Date.now() - then) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}
