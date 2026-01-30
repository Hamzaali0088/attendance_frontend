/** YYYY-MM-DD for comparison (timezone-safe using local date). */
export function toDateKey(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const todayKey = () => toDateKey(new Date());

/** Format milliseconds as H:MM:SS (e.g. "2:05:30"). */
export function formatElapsed(ms) {
  if (ms < 0) return '0:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((x) => String(x).padStart(2, '0')).join(':');
}

/** Format decimal hours as "Xh Ym Zs" (e.g. 8.5 → "8h 30m 0s", -0.45 → "-0h 27m 0s"). */
export function formatHoursToHMS(decimalHours) {
  if (decimalHours == null || typeof decimalHours !== 'number') return '—';
  const totalSeconds = Math.round(Math.abs(decimalHours) * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const sign = decimalHours < 0 ? '-' : '';
  return `${sign}${h}h ${m}m ${s}s`;
}
