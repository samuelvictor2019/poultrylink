export function formatNaira(amount: string | number) {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);
}

export function formatQuantity(qty: string | number, unit: string) {
  const n = typeof qty === "string" ? Number(qty) : qty;
  if (Number.isNaN(n)) return `— ${unit}`;
  return `${new Intl.NumberFormat("en-NG").format(n)} ${unit}`;
}

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["week", 7 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
];

/** "5 minutes ago", "yesterday" — falls back to "just now" under a minute. */
export function formatRelativeTime(value: string | Date, now: Date = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(seconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  for (const [unit, size] of RELATIVE_UNITS) {
    if (abs >= size) return rtf.format(Math.trunc(seconds / size), unit);
  }
  return "just now";
}