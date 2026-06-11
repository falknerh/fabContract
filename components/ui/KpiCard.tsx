import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface KpiCardProps {
  titel: string;
  wert: number | string;
  einheit?: string;
  waehrung?: string;
  veraenderung?: number;
  untertitel?: string;
  status?: "OK" | "WARNING" | "CRITICAL";
  statusLabel?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function KpiCard({
  titel, wert, einheit, waehrung, veraenderung,
  untertitel, status, statusLabel, icon, onClick
}: KpiCardProps) {
  const trend = veraenderung !== undefined
    ? veraenderung > 0 ? "up" : veraenderung < 0 ? "down" : "flat"
    : null;

  const statusConfig = {
    OK:       { color: "text-emerald-600 bg-emerald-50",  Icon: CheckCircle,  label: statusLabel ?? "OK" },
    WARNING:  { color: "text-amber-600 bg-amber-50",      Icon: AlertTriangle,label: statusLabel ?? "Handlungsbedarf" },
    CRITICAL: { color: "text-red-600 bg-red-50",          Icon: AlertCircle,  label: statusLabel ?? "Kritisch" },
  };

  const sc = status ? statusConfig[status] : null;

  const displayValue = waehrung
    ? formatCurrency(Number(wert), waehrung)
    : typeof wert === "number"
      ? new Intl.NumberFormat("de-AT", { maximumFractionDigits: 2 }).format(wert)
      : wert;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl border border-slate-200 shadow-card p-5 flex flex-col gap-2",
        onClick && "cursor-pointer hover:shadow-card-hover hover:border-slate-300 transition-all"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-slate-100 text-slate-500">
          {icon}
        </div>
        {sc && (
          <span className={cn("flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full", sc.color)}>
            <sc.Icon className="w-3 h-3" />
            {sc.label}
          </span>
        )}
        {trend && !sc && (
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-medium",
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-slate-400"
          )}>
            {trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : trend === "down" ? <TrendingDown className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
            {veraenderung !== undefined && `${veraenderung > 0 ? "+" : ""}${veraenderung.toFixed(1)} %`}
          </span>
        )}
      </div>

      <div>
        <p className="text-2xl font-bold text-slate-900 leading-none mt-1">
          {displayValue}
          {einheit && <span className="text-base font-normal text-slate-500 ml-1">{einheit}</span>}
        </p>
        <p className="text-sm text-slate-500 mt-1.5">{titel}</p>
        {untertitel && <p className="text-xs text-slate-400 mt-0.5">{untertitel}</p>}
      </div>
    </div>
  );
}
