"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";
import {
  FileText, TrendingUp, Package, Truck, RefreshCw, Download,
  ArrowUpRight, ArrowDownRight, ChevronRight, BarChart2, Activity,
  Clock, AlertTriangle, CheckCircle2, Zap
} from "lucide-react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { KpiCard } from "@/components/ui/KpiCard";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";

// ─── Mockup chart data ────────────────────────────────────────────────────

const umsatzDaten = [
  { monat: "Jan", einkauf: 820000, verkauf: 920000 },
  { monat: "Feb", einkauf: 750000, verkauf: 880000 },
  { monat: "Mär", einkauf: 940000, verkauf: 1050000 },
  { monat: "Apr", einkauf: 880000, verkauf: 980000 },
  { monat: "Mai", einkauf: 1100000, verkauf: 1200000 },
  { monat: "Jun", einkauf: 960000, verkauf: 1080000 },
  { monat: "Jul", einkauf: 1250000, verkauf: 1380000 },
  { monat: "Aug", einkauf: 1180000, verkauf: 1290000 },
  { monat: "Sep", einkauf: 1050000, verkauf: 1160000 },
  { monat: "Okt", einkauf: 980000, verkauf: null },
  { monat: "Nov", einkauf: null, verkauf: null },
  { monat: "Dez", einkauf: null, verkauf: null },
];

// KI Forecast
const forecastDaten = [
  { monat: "Jul", ist: 1250000, forecast: null, lower: null, upper: null },
  { monat: "Aug", ist: 1180000, forecast: null, lower: null, upper: null },
  { monat: "Sep", ist: 1050000, forecast: null, lower: null, upper: null },
  { monat: "Okt", ist: 980000,  forecast: 980000, lower: 930000, upper: 1030000 },
  { monat: "Nov", ist: null,    forecast: 1100000, lower: 1020000, upper: 1180000 },
  { monat: "Dez", ist: null,    forecast: 1250000, lower: 1150000, upper: 1350000 },
  { monat: "Jan", ist: null,    forecast: 960000,  lower: 880000,  upper: 1040000 },
];

// Abtragungskurve: remaining quantity (Restmenge), starting at 5000t and decreasing to 0
const abtragungsDaten = [
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
];

const RECENT_KONTRAKTE = [
  { id: "ktr_001", nummer: "EK-2024-0031", partner: "Agrar Invest Österreich GmbH", art: "EINKAUF",  variant: "RAHMEN", status: "TEILGELIEFERT", wert: 892000, menge: "5.000 t",   datum: "2024-06-15" },
  { id: "ktr_002", nummer: "EK-2024-0044", partner: "Magyar Gabona Kft.",           art: "EINKAUF",  variant: "RAHMEN", status: "OFFEN",         wert: 1867500,menge: "10.000 t", datum: "2024-07-20" },
  { id: "ktr_003", nummer: "VK-2024-0018", partner: "Bäckerei Gruppe Schmidt GmbH", art: "VERKAUF",  variant: "RAHMEN", status: "TEILGELIEFERT", wert: 786120, menge: "3.500 t",   datum: "2024-05-10" },
  { id: "ktr_004", nummer: "EK-2024-0067", partner: "FrischePack GmbH",             art: "EINKAUF",  variant: "EINZEL", status: "OFFEN",         wert: 6608,   menge: "32 Pos.",    datum: "2024-10-03" },
  { id: "ktr_005", nummer: "EK-2024-0068", partner: "Agrar Invest Österreich GmbH", art: "EINKAUF",  variant: "ABRUF",  status: "OFFEN",         wert: 109250, menge: "500 t",      datum: "2024-09-10" },
];

const OPEN_DISPOSITIONS = [
  { id: "dsp_004", nummer: "DSP-2024-0122", kontrakt: "EK-2024-0031", artikel: "Winterweizen Qualität A", menge: 500, einheit: "t", datum: "2024-10-15", status: "FREIGEGEBEN" },
  { id: "dsp_005", nummer: "DSP-2024-0130", kontrakt: "EK-2024-0031", artikel: "Winterweizen Qualität A", menge: 500, einheit: "t", datum: "2024-11-15", status: "GEPLANT" },
  { id: "dsp_006", nummer: "DSP-2024-0138", kontrakt: "EK-2024-0031", artikel: "Winterweizen Qualität A", menge: 250, einheit: "t", datum: "2024-12-15", status: "GEPLANT" },
];

const ART_COLORS: Record<string, string> = {
  EINKAUF: "text-blue-600 bg-blue-50",
  VERKAUF: "text-emerald-600 bg-emerald-50",
};

const VARIANT_LABELS: Record<string, string> = {
  RAHMEN: "Rahmen",
  EINZEL: "Einzel",
  ABRUF:  "Abruf",
};

const currFmt = (v: number) => formatCurrency(v, "EUR");

// Custom tooltip
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{currFmt(p.value)}</strong>
        </p>
      ))}
    </div>
  );
}

function AbtragungTooltip({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card p-3 text-xs">
      <p className="font-semibold text-slate-800 mb-2">{label}</p>
      {payload.map((p, i) => p.value != null && (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <strong>{formatNumber(p.value, 0)} t</strong>
        </p>
      ))}
    </div>
  );
}

const TABS = ["Übersicht", "Offene Dispositionen", "Strecken", "Forecasts"];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("Übersicht");
  const [lastUpdate] = useState("2024-10-03, 08:42");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kontraktdashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Agrar Handel Österreich GmbH · Wirtschaftsjahr 2024/2025 · Stand: {lastUpdate}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}>
              Aktualisieren
            </Button>
            <Button variant="primary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Bericht exportieren
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 mt-4 border-b border-slate-200 -mb-4 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "Übersicht" && <BarChart2 className="w-3.5 h-3.5" />}
              {tab === "Offene Dispositionen" && <Truck className="w-3.5 h-3.5" />}
              {tab === "Strecken" && <Activity className="w-3.5 h-3.5" />}
              {tab === "Forecasts" && <Zap className="w-3.5 h-3.5" />}
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === "Übersicht" && (
          <>
            {/* ─── KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                titel="Aktive Kontrakte"
                wert={14}
                einheit="Stück"
                veraenderung={7.7}
                untertitel="5 Einkauf · 9 Verkauf"
                status="OK"
                statusLabel="+2 diese Woche"
                icon={<FileText className="w-4 h-4" />}
              />
              <KpiCard
                titel="Offenes Kontraktvolumen"
                wert={4250000}
                waehrung="EUR"
                veraenderung={12.3}
                untertitel="Aktive Rahmenkontrakte"
                status="OK"
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <KpiCard
                titel="Offene Dispositionsmenge"
                wert={5750}
                einheit="t"
                untertitel="3 Kontrakte betroffen"
                status="WARNING"
                statusLabel="Handlungsbedarf"
                icon={<Package className="w-4 h-4" />}
              />
              <KpiCard
                titel="Ø Liefertreue"
                wert="96,8"
                einheit="%"
                veraenderung={-0.4}
                untertitel="Letzte 30 Tage"
                status="OK"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
            </div>

            {/* ─── Charts Row ── */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Umsatzentwicklung */}
              <Card className="lg:col-span-2" padding="none">
                <div className="p-5 pb-2">
                  <CardHeader>
                    <CardTitle subtitle="Monatliche Übersicht Einkauf & Verkauf">
                      Kontraktumsatz 2024
                    </CardTitle>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" />Einkauf</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />Verkauf</span>
                    </div>
                  </CardHeader>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={umsatzDaten} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradEinkauf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradVerkauf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="monat" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                      tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="einkauf" stroke="#3B82F6" fill="url(#gradEinkauf)" strokeWidth={2} name="Einkauf" connectNulls={false} />
                    <Area type="monotone" dataKey="verkauf" stroke="#10B981" fill="url(#gradVerkauf)" strokeWidth={2} name="Verkauf" connectNulls={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Abtragung EK-2024-0031 */}
              <Card padding="none">
                <div className="p-5 pb-2">
                  <CardHeader>
                    <CardTitle subtitle="EK-2024-0031 · 5.000 t Weizen">
                      Abtragungskurve
                    </CardTitle>
                  </CardHeader>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={abtragungsDaten} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="monat" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${v}t`} domain={[0, 5200]} label={{ value: "Restmenge (t)", angle: -90, position: "insideLeft", offset: 12, style: { fontSize: 9, fill: "#CBD5E1" } }} />
                    <Tooltip content={<AbtragungTooltip />} />
                    <ReferenceLine y={0} stroke="#10B981" strokeDasharray="4 4" label={{ value: "Vollständig", position: "insideBottomRight", fontSize: 9, fill: "#10B981" }} />
                    <Line type="monotone" dataKey="geplant" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5 3" dot={false} name="Geplant" connectNulls />
                    <Line type="monotone" dataKey="real"    stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }} name="Real" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="px-5 pb-4 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-600 inline-block rounded" />Real (Restmenge)</span>
                  <span className="flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-slate-400 inline-block" />Geplant</span>
                </div>
              </Card>
            </div>

            {/* ─── Recent Kontrakte + Open Dispositions ── */}
            <div className="grid lg:grid-cols-5 gap-4">
              {/* Letzte Kontrakte */}
              <Card className="lg:col-span-3" padding="none">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Aktive Kontrakte</p>
                    <p className="text-xs text-slate-500 mt-0.5">Aktuell offene Belege</p>
                  </div>
                  <Link href="/kontrakte">
                    <Button variant="ghost" size="sm" iconRight={<ChevronRight className="w-3.5 h-3.5" />}>
                      Alle
                    </Button>
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {RECENT_KONTRAKTE.map(k => (
                    <Link key={k.id} href={`/kontrakte/${k.id}`}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors group">
                      <div className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${ART_COLORS[k.art]}`}>
                        {k.art.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-slate-800">{k.nummer}</span>
                          <span className="text-xs text-slate-400">{VARIANT_LABELS[k.variant]}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{k.partner}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-800">{currFmt(k.wert)}</p>
                        <p className="text-xs text-slate-400">{k.menge}</p>
                      </div>
                      <StatusBadge status={k.status} size="sm" />
                    </Link>
                  ))}
                </div>
              </Card>

              {/* Offene Dispositionen */}
              <Card className="lg:col-span-2" padding="none">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Offene Dispositionen</p>
                    <p className="text-xs text-slate-500 mt-0.5">Zu bestätigen / zu planen</p>
                  </div>
                  <Link href="/disposition">
                    <Button variant="ghost" size="sm" iconRight={<ChevronRight className="w-3.5 h-3.5" />}>
                      Alle
                    </Button>
                  </Link>
                </div>
                <div className="divide-y divide-slate-50">
                  {OPEN_DISPOSITIONS.map(d => (
                    <div key={d.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{d.nummer}</p>
                          <p className="text-xs text-slate-500 mt-0.5 truncate">{d.artikel}</p>
                        </div>
                        <StatusBadge status={d.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(d.datum)}
                        </span>
                        <span className="font-medium text-slate-700">
                          {formatNumber(d.menge, 0)} {d.einheit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-slate-100 bg-amber-50">
                  <div className="flex items-center gap-2 text-xs text-amber-700">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>1.250 t in den nächsten 14 Tagen fällig</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* ─── Quick Access ── */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-3">Analyse & Planung</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: "Abweichungsanalyse", sub: "Ist vs. Plan", icon: BarChart2, href: "/analyse", color: "text-blue-600 bg-blue-50" },
                  { label: "KI-Prognose",         sub: "Smart Forecast", icon: Zap,      href: "/analyse/forecast", color: "text-violet-600 bg-violet-50" },
                  { label: "Szenarien",            sub: "Verwalten",  icon: Activity, href: "/analyse/szenarien", color: "text-emerald-600 bg-emerald-50" },
                  { label: "Strecken",             sub: "Deckungsbeitrag", icon: ArrowUpRight, href: "/strecken", color: "text-amber-600 bg-amber-50" },
                  { label: "Disposition",          sub: "Übersicht",  icon: Truck,    href: "/disposition", color: "text-slate-600 bg-slate-100" },
                  { label: "Verwaltung",           sub: "Einstellungen", icon: FileText, href: "/verwaltung", color: "text-slate-600 bg-slate-100" },
                ].map(item => (
                  <Link key={item.href} href={item.href}>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-card-hover hover:border-slate-300 transition-all cursor-pointer">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2.5 ${item.color}`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-tight">{item.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "Offene Dispositionen" && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Truck className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Dispositionsübersicht — detaillierte Ansicht folgt</p>
            <Link href="/disposition" className="mt-3">
              <Button variant="secondary" size="sm">Zur Disposition →</Button>
            </Link>
          </div>
        )}

        {activeTab === "Strecken" && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Activity className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Streckenübersicht — Deckungsbeitragsrechnung</p>
            <Link href="/strecken" className="mt-3">
              <Button variant="secondary" size="sm">Zu den Strecken →</Button>
            </Link>
          </div>
        )}

        {activeTab === "Forecasts" && (
          <Card>
            <CardHeader>
              <CardTitle subtitle="KI-gestützte Prognose — Umsatz nächste 3 Monate">
                Forecast Umsatz
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full">
                <Zap className="w-3 h-3" />
                KI-Prognose aktiv
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={forecastDaten} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <defs>
                  <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="monat" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="upper"    stroke="none"    fill="url(#gradForecast)" name="Oberes Band" />
                <Area type="monotone" dataKey="lower"    stroke="none"    fill="#FFFFFF"             name="Unteres Band" />
                <Line type="monotone" dataKey="ist"      stroke="#2563EB" strokeWidth={2.5} dot={{ r: 4, fill: "#2563EB", strokeWidth: 0 }} name="Ist" />
                <Line type="monotone" dataKey="forecast" stroke="#8B5CF6" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3, fill: "#8B5CF6", strokeWidth: 0 }} name="Forecast" connectNulls />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </div>
  );
}
