/** Ringgit with no decimals when the amount is whole: RM 25, RM 12.50. */
export function formatRM(value: number): string {
  const whole = Number.isInteger(value);
  return `RM ${value.toLocaleString("en-MY", {
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(value: number, digits = 0): string {
  return value.toLocaleString("en-MY", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function timeAgo(date: Date | null, now: number = Date.now()): string {
  if (!date) return "just now";
  const s = Math.max(0, Math.round((now - date.getTime()) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} d ago`;
  return date.toLocaleDateString("en-MY", { day: "numeric", month: "short" });
}

/** "2 h 15 min left", "3 d left"; returns null once the time has passed. */
export function timeLeft(date: Date | null, now: number = Date.now()): string | null {
  if (!date) return null;
  const ms = date.getTime() - now;
  if (ms <= 0) return null;
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${Math.max(1, m)} min left`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ${m % 60} min left`;
  const d = Math.floor(h / 24);
  return `${d} d ${h % 24} h left`;
}

export function isExpired(expiresAt: Date | null, now: number = Date.now()): boolean {
  return !!expiresAt && expiresAt.getTime() <= now;
}

/** Value for <input type="datetime-local"> in the browser's local time. */
export function toDatetimeLocal(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
