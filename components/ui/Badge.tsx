import { cn } from "@/lib/utils";

export interface BadgeProps {
  label: string;
  color?: "blue" | "green" | "amber" | "red" | "slate" | "violet" | "emerald";
  size?: "sm" | "md";
  dot?: boolean;
}

const COLORS = {
  blue:    "bg-blue-50    text-blue-700    ring-blue-200",
  green:   "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber:   "bg-amber-50   text-amber-700   ring-amber-200",
  red:     "bg-red-50     text-red-600     ring-red-200",
  slate:   "bg-slate-100  text-slate-600   ring-slate-200",
  violet:  "bg-violet-50  text-violet-700  ring-violet-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const DOT_COLORS = {
  blue:    "bg-blue-500",
  green:   "bg-emerald-500",
  amber:   "bg-amber-500",
  red:     "bg-red-500",
  slate:   "bg-slate-400",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
};

export function Badge({ label, color = "slate", size = "md", dot = false }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset",
      COLORS[color],
      size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_COLORS[color])} />}
      {label}
    </span>
  );
}

// Status-aware badge
import { STATUS_LABELS } from "@/lib/utils";

const STATUS_BADGE_MAP: Record<string, BadgeProps["color"]> = {
  ENTWURF:       "slate",
  OFFEN:         "blue",
  TEILGELIEFERT: "amber",
  ABGESCHLOSSEN: "green",
  STORNIERT:     "red",
  GEPLANT:       "slate",
  FREIGEGEBEN:   "blue",
  ZUGEWIESEN:    "violet",
  UNTERWEGS:     "amber",
  GELIEFERT:     "green",
};

export function StatusBadge({ status, size }: { status: string; size?: "sm" | "md" }) {
  return (
    <Badge
      label={STATUS_LABELS[status] ?? status}
      color={STATUS_BADGE_MAP[status] ?? "slate"}
      size={size}
      dot
    />
  );
}
