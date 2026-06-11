"use client";

export const runtime = 'edge';

import { useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend
} from "recharts";
import { ChevronRight, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Mock Abtragungsdaten per Kontrakt ───────────────────────────────────

const KONTRAKTE_ABTRAGUNG = [
  {
    id: "ktr_001",
    nummer: "EK-2024-0031",
    artikel: "Winterweizen Qualität A",
    partner: "Agrar Invest Österreich GmbH",
    gesamtmenge: 5000,
    einheit: "t",
    status: "TEILGELIEFERT",
    geliefert: 1501,
    daten: [
      { monat: "Jun 24", geplant: 5000, real: 5000 },
      { monat: "Jul 24", geplant: 4500, real: 4498 },
      { monat: "Aug 24", geplant: 4000, real: 4000 },
      { monat: "Sep 24", geplant: 3500, real: 3499 },
      { monat: "Okt 24", geplant: 3000, real: null },
      { monat: "Nov 24", geplant: 2500, real: null },
      { monat: "Dez 24", geplant: 2250, real: null },
      { monat: "Jan 25", geplant: 2000, real: null },
      { monat: "Feb 25", geplant: 1500, real: null },
      { monat: "Mär 25", geplant: 1000, real: null },
      { monat: "Apr 25", geplant: 500,  real: null },
      { monat: "Mai 25", geplant: 0,    real: null },
    ],
  },
  {
    id: "ktr_002",
    nummer: "EK-2024-0044",
    artikel: "Körnermais Klasse 1",
    partner: "Magyar Gabona Kft.",
    gesamtmenge: 10000,
    einheit: "t",
    status: "OFFEN",
    geliefert: 0,
    daten: [
      { monat: "Aug 24", geplant: 10000, real: 10000 },
      { monat: "Sep 24", geplant: 9000,  real: null },
      { monat: "Okt 24", geplant: 8000,  real: null },
      { monat: "Nov 24", geplant: 6500,  real: null },
      { monat: "Dez 24", geplant: 5000,  real: null },
      { monat: "Jan 25", geplant: 4000,  real: null },
      { monat: "Feb 25", geplant: 3000,  real: null },
      { monat: "Mär 25", geplant: 2000,  real: null },
      { monat: "Apr 25", geplant: 1000,  real: null },
      { monat: "Mai 25", geplant: 0,     real: null },
    ],
  },
  {
    id: "ktr_003",
    nummer: "VK-2024-0018",
    artikel: "Weizen + Gerste (Paket)",
    partner: "Bäckerei Gruppe Schmidt GmbH",
    gesamtmenge: 3500,
    einheit: "t",
    status: "TEILGELIEFERT",
    geliefert: 1200,
    daten: [
      { monat: "Mai 24", geplant: 3500, real: 3500 },
      { monat: "Jun 24", geplant: 3000, real: 2980 },
      { monat: "Jul 24", geplant: 2500, real: 2500 },
      { monat: "Aug 24", geplant: 2200, real: 2300 },
      { monat: "Sep 24", geplant: 2000, real: null },
      { monat: "Okt 24", geplant: 1700, real: null },
      { monat: "Nov 24", geplant: 1400, real: null },
      { monat: "Dez 24", geplant: 1100, real: null },
      { monat: "Jan 25", geplant: 800,  real: null },
      { monat: "Feb 25", geplant: 400,  real: null },
      { monat: "Mär 25", geplant: 0,    real: null },
    ],
  },
  {
    id: "ktr_005",
    nummer: "EK-2024-0068",
    artikel: "Winterweizen (Abruf #3)",
    partner: "Agrar Invest Österreich GmbH",
    gesamtmenge: 500,
    einheit: "t",
    status: "OFFEN",
    geliefert: 0,
    daten: [
      { monat: "Sep 24", geplant: 500, real: 500 },
      { monat: "Okt 24", geplant: 250, real: null },
      { monat: "Nov 24", geplant: 0,   real: null },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────

function completionPct(geliefert: number, gesamt: number) {
  return gesamt > 0 ? geliefert / gesamt : 0;
}

function AbtragungTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { color: string; name: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1.5">
          <span className="font-medium">{p.name}:</span>
          <strong>{formatNumber(p.value, 0)} t</strong>
        </p>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function AbtragungskurvenPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const anzeige = selected
    ? KONTRAKTE_ABTRAGUNG.filter(k => k.id === selected)
    : KONTRAKTE_ABTRAGUNG;

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Abtragungskurven</h1>
          <p className="text-sm text-slate-500 mt-0.5">Restmenge je Kontrakt — Geplant vs. Real</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelected(null)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border",
              selected === null
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            )}
          >
            Alle ({KONTRAKTE_ABTRAGUNG.length})
          </button>
          {KONTRAKTE_ABTRAGUNG.map(k => (
            <button
              key={k.id}
              onClick={() => setSelected(k.id)}
              className={cn(
                "px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border",
                selected === k.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              )}
            >
              {k.nummer}
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary strip ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {KONTRAKTE_ABTRAGUNG.map(k => {
          const pct = completionPct(k.geliefert, k.gesamtmenge);
          const restmenge = k.gesamtmenge - k.geliefert;
          const isLate = k.status === "TEILGELIEFERT" && pct < 0.4;
          return (
            <button
              key={k.id}
              onClick={() => setSelected(k.id === selected ? null : k.id)}
              className={cn(
                "text-left p-4 rounded-xl border transition-all",
                selected === k.id
                  ? "border-blue-500 bg-blue-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-semibold text-slate-700">{k.nummer}</p>
                {isLate
                  ? <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  : pct >= 0.9
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    : <TrendingDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                }
              </div>
              <p className="text-lg font-bold text-slate-900">{formatNumber(restmenge, 0)} t</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Restmenge von {formatNumber(k.gesamtmenge, 0)} t</p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", pct >= 0.9 ? "bg-emerald-500" : "bg-blue-500")}
                  style={{ width: `${Math.round(pct * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{Math.round(pct * 100)} % geliefert</p>
            </button>
          );
        })}
      </div>

      {/* ── Charts ── */}
      <div className={cn(
        "grid gap-4",
        anzeige.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {anzeige.map(k => {
          const pct = completionPct(k.geliefert, k.gesamtmenge);
          const restmenge = k.gesamtmenge - k.geliefert;
          return (
            <Card key={k.id} padding="none">
              <div className="p-5 pb-2 flex items-start justify-between gap-4">
                <div>
                  <CardHeader>
                    <CardTitle subtitle={`${k.partner} · ${formatNumber(k.gesamtmenge, 0)} ${k.einheit} gesamt`}>
                      {k.nummer} — {k.artikel}
                    </CardTitle>
                  </CardHeader>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900">{formatNumber(restmenge, 0)} t</p>
                  <p className="text-xs text-slate-400">Restmenge ({formatPercent(1 - pct)})</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={anzeige.length === 1 ? 320 : 220}>
                <LineChart data={k.daten} margin={{ top: 8, right: 20, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="monat"
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}t`}
                    domain={[0, k.gesamtmenge * 1.05]}
                  />
                  <Tooltip content={<AbtragungTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <ReferenceLine
                    y={0}
                    stroke="#10B981"
                    strokeDasharray="4 4"
                    label={{ value: "Vollständig", position: "insideBottomRight", fontSize: 9, fill: "#10B981" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="geplant"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                    name="Geplant"
                    connectNulls
                  />
                  <Line
                    type="monotone"
                    dataKey="real"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                    name="Real (Restmenge)"
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="px-5 pb-4 pt-1 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-blue-600 inline-block rounded" />
                    Real (Restmenge)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 border-t border-dashed border-slate-400 inline-block" />
                    Geplant
                  </span>
                </div>
                <Link
                  href={`/kontrakte/${k.id}`}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Kontrakt öffnen <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
