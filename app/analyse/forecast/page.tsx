"use client";

export const runtime = 'edge';

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import { Zap, TrendingUp, TrendingDown, Info, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Mock forecast data ───────────────────────────────────────────────────

type Szenario = "BASIS" | "OPTIMISTISCH" | "PESSIMISTISCH";

const FORECAST: Record<Szenario, { monat: string; ist?: number; prog: number; lower: number; upper: number }[]> = {
  BASIS: [
    { monat: "Aug 24", ist: 1180000, prog: 1180000, lower: 1180000, upper: 1180000 },
    { monat: "Sep 24", ist: 1050000, prog: 1050000, lower: 1050000, upper: 1050000 },
    { monat: "Okt 24", ist: 980000,  prog: 1000000, lower:  950000, upper: 1050000 },
    { monat: "Nov 24",              prog: 1100000, lower: 1020000, upper: 1180000 },
    { monat: "Dez 24",              prog: 1250000, lower: 1150000, upper: 1350000 },
    { monat: "Jan 25",              prog:  960000, lower:  880000, upper: 1040000 },
    { monat: "Feb 25",              prog: 1050000, lower:  950000, upper: 1150000 },
  ],
  OPTIMISTISCH: [
    { monat: "Aug 24", ist: 1180000, prog: 1180000, lower: 1180000, upper: 1180000 },
    { monat: "Sep 24", ist: 1050000, prog: 1050000, lower: 1050000, upper: 1050000 },
    { monat: "Okt 24", ist: 980000,  prog: 1050000, lower: 1000000, upper: 1100000 },
    { monat: "Nov 24",              prog: 1220000, lower: 1150000, upper: 1290000 },
    { monat: "Dez 24",              prog: 1400000, lower: 1300000, upper: 1500000 },
    { monat: "Jan 25",              prog: 1100000, lower: 1020000, upper: 1180000 },
    { monat: "Feb 25",              prog: 1200000, lower: 1100000, upper: 1300000 },
  ],
  PESSIMISTISCH: [
    { monat: "Aug 24", ist: 1180000, prog: 1180000, lower: 1180000, upper: 1180000 },
    { monat: "Sep 24", ist: 1050000, prog: 1050000, lower: 1050000, upper: 1050000 },
    { monat: "Okt 24", ist: 980000,  prog:  940000, lower:  900000, upper:  980000 },
    { monat: "Nov 24",              prog:  980000, lower:  900000, upper: 1060000 },
    { monat: "Dez 24",              prog: 1100000, lower: 1000000, upper: 1200000 },
    { monat: "Jan 25",              prog:  820000, lower:  750000, upper:  890000 },
    { monat: "Feb 25",              prog:  900000, lower:  820000, upper:  980000 },
  ],
};

const PREISFORECAST = [
  { monat: "Okt 24", weizen: 178, mais: 187, raps: 437 },
  { monat: "Nov 24", weizen: 181, mais: 184, raps: 445 },
  { monat: "Dez 24", weizen: 185, mais: 180, raps: 452 },
  { monat: "Jan 25", weizen: 182, mais: 182, raps: 448 },
  { monat: "Feb 25", weizen: 179, mais: 185, raps: 441 },
  { monat: "Mär 25", weizen: 183, mais: 190, raps: 438 },
];

const ANNAHMEN: Record<Szenario, string[]> = {
  BASIS: [
    "Normaler Ernteverlauf 2024/25 in AT/HU/RO",
    "EUR/USD Kurs stabil bei ~1,09",
    "Frachtkosten unverändert",
    "Nachfrage Bäckereien saisonal konstant",
    "Keine außergewöhnlichen Wetterereignisse",
  ],
  OPTIMISTISCH: [
    "Unterdurchschnittliche Ernte in EU → höhere Nachfrage",
    "EUR/USD leichte Schwächung → Exportvorteil",
    "Neue Lieferverträge mit 2 Großabnehmern",
    "Frachtkosten -5% durch Langzeitverträge",
    "Gutes Qualitätsjahr → Premiumpreise",
  ],
  PESSIMISTISCH: [
    "Rekordernte Ukraine → Preisdruck",
    "Energie-/Frachtkosten +15%",
    "Schwache Nachfrage Q1 2025",
    "EUR/USD Aufwertung → Exportnachteil",
    "Qualitätsmängel → Preisnachlässe",
  ],
};

const SZN_COLOR: Record<Szenario, string> = {
  BASIS:         "#2563EB",
  OPTIMISTISCH:  "#10B981",
  PESSIMISTISCH: "#EF4444",
};

function FmtTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <p key={i} style={{ color: p.color }}>{p.name}: <strong>{formatCurrency(p.value, "EUR")}</strong></p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function ForecastPage() {
  const [szenario, setSzenario] = useState<Szenario>("BASIS");
  const data = FORECAST[szenario];
  const letzterProg = data[data.length - 1].prog;
  const basisProg   = FORECAST.BASIS[FORECAST.BASIS.length - 1].prog;
  const delta = letzterProg - basisProg;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            KI-Prognose
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Umsatzforecast · Wirtschaftsjahr 2024/2025 · Modell v3.1</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5">
            {(["BASIS","OPTIMISTISCH","PESSIMISTISCH"] as Szenario[]).map(s => (
              <button key={s} onClick={() => setSzenario(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  szenario === s
                    ? s === "OPTIMISTISCH" ? "bg-emerald-600 text-white shadow-sm"
                      : s === "PESSIMISTISCH" ? "bg-red-500 text-white shadow-sm"
                      : "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                )}>
                {s === "BASIS" ? "Basis" : s === "OPTIMISTISCH" ? "Optimistisch" : "Pessimistisch"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-3 gap-3">
        <Card padding="sm">
          <p className="text-xs text-slate-500">Prognose Feb 25 ({szenario})</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(letzterProg, "EUR")}</p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500">vs. Basis-Szenario</p>
          <p className={cn("text-xl font-bold mt-1 flex items-center gap-1", delta >= 0 ? "text-emerald-600" : "text-red-500")}>
            {delta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {delta >= 0 ? "+" : ""}{formatCurrency(delta, "EUR")}
          </p>
        </Card>
        <Card padding="sm">
          <p className="text-xs text-slate-500">KI-Konfidenz</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {szenario === "BASIS" ? "87 %" : szenario === "OPTIMISTISCH" ? "73 %" : "79 %"}
          </p>
        </Card>
      </div>

      {/* Umsatz Forecast Chart */}
      <Card padding="none">
        <div className="p-5 pb-2">
          <CardHeader>
            <CardTitle subtitle={`Szenario: ${szenario} · Konfidenzband (±)`}>Umsatzprognose mit Konfidenzband</CardTitle>
          </CardHeader>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SZN_COLOR[szenario]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={SZN_COLOR[szenario]} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<FmtTooltip />} />
            <ReferenceLine x="Okt 24" stroke="#CBD5E1" strokeDasharray="3 3"
              label={{ value: "Heute", fontSize: 9, fill: "#94A3B8" }} />
            <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#gradBand)" name="Obere Grenze" />
            <Area type="monotone" dataKey="lower" stroke="transparent" fill="white" name="Untere Grenze" />
            <Line type="monotone" dataKey="ist"  stroke="#64748B" strokeWidth={2} dot={{ r: 3, fill: "#64748B" }} name="Ist" connectNulls={false} />
            <Line type="monotone" dataKey="prog" stroke={SZN_COLOR[szenario]} strokeWidth={2.5} strokeDasharray="6 3" dot={false} name="Prognose" connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Preisforecast */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardHeader><CardTitle subtitle="Okt 24 – Mär 25">Preisforecast €/t</CardTitle></CardHeader>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PREISFORECAST} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${v}€`} />
              <Tooltip formatter={(v: number) => `${v.toFixed(0)} €/t`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="weizen" stroke="#2563EB" strokeWidth={2} dot={false} name="Weizen" />
              <Line type="monotone" dataKey="mais"   stroke="#10B981" strokeWidth={2} dot={false} name="Mais" />
              <Line type="monotone" dataKey="raps"   stroke="#F59E0B" strokeWidth={2} dot={false} name="Raps" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Annahmen */}
        <Card padding="sm">
          <CardHeader>
            <CardTitle subtitle={`Szenario ${szenario}`}>Modell-Annahmen</CardTitle>
          </CardHeader>
          <ul className="mt-3 space-y-2">
            {ANNAHMEN[szenario].map((a, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5",
                  szenario === "OPTIMISTISCH" ? "bg-emerald-100 text-emerald-700"
                  : szenario === "PESSIMISTISCH" ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-700"
                )}>{i + 1}</span>
                {a}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-start gap-2 bg-slate-50 rounded-lg p-3 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            KI-Modell basiert auf historischen Preis- und Mengendaten der letzten 36 Monate, saisonalen Mustern und Marktindizes.
          </div>
        </Card>
      </div>
    </div>
  );
}
