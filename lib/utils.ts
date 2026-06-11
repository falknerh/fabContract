import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, differenceInDays, isAfter, isBefore } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Formatting ────────────────────────────────────────────────────────────

export function formatCurrency(
  value: number,
  currency = "EUR",
  locale = "de-AT"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(
  value: number,
  decimals = 2,
  locale = "de-AT"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(dateStr: string, fmt = "dd.MM.yyyy"): string {
  try {
    return format(parseISO(dateStr), fmt, { locale: de });
  } catch {
    return dateStr;
  }
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr, "dd.MM.yyyy HH:mm");
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)} %`;
}

// ─── Status helpers ────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  ENTWURF:         "Entwurf",
  OFFEN:           "Offen",
  TEILGELIEFERT:   "Teilgeliefert",
  ABGESCHLOSSEN:   "Abgeschlossen",
  STORNIERT:       "Storniert",
  GEPLANT:         "Geplant",
  FREIGEGEBEN:     "Freigegeben",
  ZUGEWIESEN:      "Zugewiesen",
  UNTERWEGS:       "Unterwegs",
  GELIEFERT:       "Geliefert",
};

export const STATUS_COLORS: Record<string, string> = {
  ENTWURF:         "bg-slate-100 text-slate-700",
  OFFEN:           "bg-blue-50 text-blue-700",
  TEILGELIEFERT:   "bg-amber-50 text-amber-700",
  ABGESCHLOSSEN:   "bg-emerald-50 text-emerald-700",
  STORNIERT:       "bg-red-50 text-red-600",
  GEPLANT:         "bg-slate-100 text-slate-600",
  FREIGEGEBEN:     "bg-blue-50 text-blue-700",
  ZUGEWIESEN:      "bg-violet-50 text-violet-700",
  UNTERWEGS:       "bg-amber-50 text-amber-700",
  GELIEFERT:       "bg-emerald-50 text-emerald-700",
};

export const BELEGART_LABELS: Record<string, string> = {
  EINKAUF:  "Einkauf",
  VERKAUF:  "Verkauf",
};

export const BELEGVARIANTE_LABELS: Record<string, string> = {
  RAHMEN: "Rahmenkontrakt",
  EINZEL: "Einzelbeleg",
  ABRUF:  "Abruf",
};

// ─── Calculation helpers ───────────────────────────────────────────────────

export function calcPositionWert(
  menge: number,
  preis: number,
  rabattProzent = 0
): { netto: number; rabatt: number } {
  const brutto = menge * preis;
  const rabatt = brutto * (rabattProzent / 100);
  return { netto: brutto - rabatt, rabatt };
}

export function calcSteuer(netto: number, steuersatz: number): number {
  return netto * (steuersatz / 100);
}

// ─── Misc ──────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function isExpiringSoon(dateStr: string, days = 30): boolean {
  try {
    const d = parseISO(dateStr);
    const now = new Date();
    const diff = differenceInDays(d, now);
    return diff >= 0 && diff <= days;
  } catch {
    return false;
  }
}

export function isExpired(dateStr: string): boolean {
  try {
    return isBefore(parseISO(dateStr), new Date());
  } catch {
    return false;
  }
}

export function completionPercent(total: number, done: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((done / total) * 100));
}

export function shortName(name: string, maxLen = 28): string {
  return name.length > maxLen ? name.slice(0, maxLen - 1) + "…" : name;
}

export const KEYBOARD_SHORTCUTS = {
  SAVE:        { key: "s",     meta: true,  label: "⌘S" },
  NEW_ROW:     { key: "Enter", meta: false, label: "Enter" },
  DELETE_ROW:  { key: "Delete",meta: false, label: "Del" },
  SEARCH:      { key: "k",     meta: true,  label: "⌘K" },
  ESCAPE:      { key: "Escape",meta: false, label: "Esc" },
  F4_LOOKUP:   { key: "F4",    meta: false, label: "F4" },
};
