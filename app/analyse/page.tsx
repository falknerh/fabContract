"use client";

import { useState } from "react";
import { Zap, TrendingUp, BarChart2, Save, ChevronRight, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

const HIST_DATA = [
  { q: "Q1 2023", einkauf: 2400000, verkauf: 2700000, marge: 300000 },
  { q: "Q2 2023", einkauf: 3100000, verkauf: 3450000, marge: 350000 },
  { q: "Q3 2023", einkauf: 4200000, verkauf: 4650000, marge: 450000 },
  { q: "Q4 2023", einkauf: 2900000, verkauf: 3250000, marge: 350000 },
  { q: "Q1 2024", einkauf: 2650000, verkauf: 2980000, marge: 330000 },
  { q: "Q2 2024", einkauf: 3350000, verkauf: 3750000, marge: 400000 },
  { q: "Q3 2024", einkauf: 4450000, verkauf: 4920000, marge: 470000 },
];

const FORECAST_DATA = [
  { q: "Q3 2024", ist: 4920000, fc_real: null,    fc_opt: null,    fc_pes: null },
  { q: "Q4 2024", ist: null,    fc_real: 3400000,  fc_opt: 3800000, fc_pes: 2900000 },
  { q: "Q1 2025", ist: null,    fc_real: 3100000,  fc_opt: 3600000, fc_pes: 2600000 },
  { q: "Q2 2025", ist: null,    fc_real: 3700000,  fc_opt: 4200000, fc_pes: 3100000 },
  { q: "Q3 2025", ist: null,    fc_real: 4800000,  fc_opt: 5500000, fc_pes: 4100000 },
];

const SZENARIEN = [
  { id: "sz_001", name: "Basisplanung 2024/25", typ: "REALISTISCH", erstellt: "2024-09-01", aktiv: true,  wert: 15200000 },
  { id: "sz_002", name: "Optimistisch – Rekordernte", typ: "OPTIMISTISCH", erstellt: "2024-09-01", aktiv: false, wert: 18500000 },
  { id: "sz_003", name: "Konservativ – Preisrückgang", typ: "PESSIMISTISCH", erstellt: "2024-09-01", aktiv: false, wert: 11800000 },
];

const TYP_COLORS: Record<string, string> = {
  OPTIMISTISCH:  "bg-emerald-50 text-emerald-700",
  REALISTISCH:   "bg-blue-50 text-blue-700",
  PESSIMISTISCH: "bg-amber-50 text-amber-700",
  CUSTOM:        "bg-violet-50 text-violet-700",
};

const TABS = ["Historisch", "KI-Forecast", "Szenarien"];

export default function AnalysePage() {
  const [tab, setTab] = useState("Historisch");

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Analyse & Forecast</h1>
            <p className="text-sm text-slate-500 mt-0.5">Historische Auswertungen und KI-gestützte Prognosen</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<BarChart2 className="w-3.5 h-3.5" />}>
              Bericht exportieren
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-0 mt-4 border-b border-slate-200 -mb-4">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "KI-Forecast" && <Zap className="w-3.5 h-3.5" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">

        {tab === "Historisch" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Ø Quartalsumsatz",  wert: 3778000, sub: "Verkaufsseite" },
                { label: "Ø Marge",            wert: 388000,  sub: "Absolute DB" },
                { label: "Ø Margenquote",      wert: "10,3", sub: "% vom Erlös", noFmt: true },
              ].map(k => (
                <Card key={k.label}>
                  <p className="text-xs text-slate-500">{k.label}</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    {k.noFmt ? `${k.wert} %` : formatCurrency(k.wert as number, "EUR")}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle subtitle="Quartalsweise — Einkauf, Verkauf, Marge">
                  Umsatzentwicklung 2023–2024
                </CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={HIST_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="q" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `€${(v/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v, "EUR")} />
                  <Bar dataKey="einkauf" fill="#93C5FD" name="Einkauf"  radius={[3,3,0,0]} />
                  <Bar dataKey="verkauf" fill="#2563EB" name="Verkauf"  radius={[3,3,0,0]} />
                  <Bar dataKey="marge"   fill="#10B981" name="Marge"    radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}

        {tab === "KI-Forecast" && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl p-4 text-sm text-violet-700">
              <Zap className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-semibold">KI-Prognose aktiv</p>
                <p className="text-xs mt-0.5">Basierend auf historischen Kontraktdaten, Saisonalität und Markttrends. Letzte Aktualisierung: heute 06:15</p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle subtitle="Verkaufsseite · Realistisches Szenario + Bandbreite">
                  Umsatz-Forecast Q4 2024 – Q3 2025
                </CardTitle>
              </CardHeader>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={FORECAST_DATA} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10B981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="q" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                    tickFormatter={v => `€${(v/1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v, "EUR")} />
                  <Area type="monotone" dataKey="fc_opt" stroke="#10B981" fill="url(#gradOpt)" strokeDasharray="4 2" name="Optimistisch" connectNulls />
                  <Area type="monotone" dataKey="fc_pes" stroke="#F59E0B" fill="#FFFFFF"       strokeDasharray="4 2" name="Pessimistisch" connectNulls />
                  <Line type="monotone" dataKey="ist"     stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB" }} name="Ist" />
                  <Line type="monotone" dataKey="fc_real" stroke="#8B5CF6" strokeWidth={2}   strokeDasharray="6 3" dot={{ r: 3, fill: "#8B5CF6" }} name="Forecast" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </div>
        )}

        {tab === "Szenarien" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">{SZENARIEN.length} Szenarien gespeichert</p>
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Neues Szenario
              </Button>
            </div>
            {SZENARIEN.map(s => (
              <Card key={s.id} hover>
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${TYP_COLORS[s.typ]}`}>
                    {s.typ}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                      {s.aktiv && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">AKTIV</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Erstellt: {s.erstellt}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800">{formatCurrency(s.wert, "EUR")}</p>
                    <p className="text-xs text-slate-400">Prognose Jahresumsatz</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" icon={<Star className="w-3.5 h-3.5" />} />
                    <Button variant="ghost" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
