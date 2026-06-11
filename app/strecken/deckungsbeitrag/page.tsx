"use client";

export const runtime = 'edge';

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, ArrowLeftRight, ChevronRight,
  Info, Filter
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine, Cell
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { cn } from "@/lib/utils";

// ─── Mock data ────────────────────────────────────────────────────────────

const DB_DATA = [
  {
    id: "str_001",
    bezeichnung: "Weizen AT → DE",
    kontrakte: "EK-2024-0031 / VK-2024-0018",
    partner: "Bäckerei Gruppe Schmidt GmbH",
    menge: 1500,
    erloes:           348000,
    wareneinsatz:     264000,
    frachtkosten:      28500,
    sonstigeKosten:     4200,
    db1:               84000,
    db2:               55500,
    db3:               51300,
    dbProzent:         14.74,
    status: "AKTIV",
  },
  {
    id: "str_002",
    bezeichnung: "Gerste AT → DE",
    kontrakte: "EK-2024-0031 / VK-2024-0022",
    partner: "AlpenMühle Vorarlberg AG",
    menge: 300,
    erloes:            63000,
    wareneinsatz:      52500,
    frachtkosten:       4800,
    sonstigeKosten:      600,
    db1:               10500,
    db2:                5700,
    db3:                5100,
    dbProzent:          8.09,
    status: "AKTIV",
  },
  {
    id: "str_003",
    bezeichnung: "Mais HU → AT",
    kontrakte: "EK-2024-0044 / VK-2024-0025",
    partner: "Magyar Gabona Kft.",
    menge: 2000,
    erloes:           440000,
    wareneinsatz:     376000,
    frachtkosten:      22000,
    sonstigeKosten:     3800,
    db1:               64000,
    db2:               42000,
    db3:               38200,
    dbProzent:          8.68,
    status: "AKTIV",
  },
  {
    id: "str_004",
    bezeichnung: "Raps RO → AT",
    kontrakte: "EK-2024-0052 / VK-2024-0031",
    partner: "Agro Invest Romania SRL",
    menge: 500,
    erloes:           218500,
    wareneinsatz:     191000,
    frachtkosten:       8500,
    sonstigeKosten:     1200,
    db1:               27500,
    db2:               19000,
    db3:               17800,
    dbProzent:          8.15,
    status: "ABGESCHLOSSEN",
  },
];

const GESAMT = DB_DATA.reduce(
  (acc, s) => ({
    erloes:       acc.erloes       + s.erloes,
    wareneinsatz: acc.wareneinsatz + s.wareneinsatz,
    frachtkosten: acc.frachtkosten + s.frachtkosten,
    sonstige:     acc.sonstige     + s.sonstigeKosten,
    db1:          acc.db1          + s.db1,
    db2:          acc.db2          + s.db2,
    db3:          acc.db3          + s.db3,
  }),
  { erloes: 0, wareneinsatz: 0, frachtkosten: 0, sonstige: 0, db1: 0, db2: 0, db3: 0 }
);

const CHART_DATA = DB_DATA.map(s => ({
  name: s.bezeichnung.split(" ").slice(0, 2).join(" "),
  "DB 1": s.db1,
  "DB 2": s.db2,
  "DB 3": s.db3,
  "DB %": s.dbProzent,
}));

const WATERFALL_DATA = [
  { name: "Erlös",           wert: GESAMT.erloes,        typ: "pos" },
  { name: "- Wareneinsatz",  wert: -GESAMT.wareneinsatz, typ: "neg" },
  { name: "= DB 1",          wert: GESAMT.db1,           typ: "sum" },
  { name: "- Fracht",        wert: -GESAMT.frachtkosten, typ: "neg" },
  { name: "- Sonstige",      wert: -GESAMT.sonstige,     typ: "neg" },
  { name: "= DB 2",          wert: GESAMT.db2,           typ: "sum" },
  { name: "= DB 3",          wert: GESAMT.db3,           typ: "sum" },
];

const BAR_COLOR: Record<string, string> = { pos: "#2563EB", neg: "#EF4444", sum: "#10B981" };

function KpiTile({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <Card padding="sm">
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={cn("text-xl font-bold", positive === true ? "text-emerald-600" : positive === false ? "text-red-500" : "text-slate-900")}>
        {value}
      </p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function DeckungsbeitragPage() {
  const [filter, setFilter] = useState<"ALLE" | "AKTIV" | "ABGESCHLOSSEN">("ALLE");

  const filtered = filter === "ALLE" ? DB_DATA : DB_DATA.filter(s => s.status === filter);

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Deckungsbeitragsrechnung</h1>
          <p className="text-sm text-slate-500 mt-0.5">Streckengeschäfte · Wirtschaftsjahr 2024/2025</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5 text-xs">
            {(["ALLE", "AKTIV", "ABGESCHLOSSEN"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md font-medium transition-colors",
                  filter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f === "ALLE" ? "Alle" : f === "AKTIV" ? "Aktiv" : "Abgeschlossen"}
              </button>
            ))}
          </div>
          <Link href="/strecken">
            <Button variant="secondary" size="sm">
              <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
              Streckenübersicht
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <KpiTile label="Gesamterlös"     value={formatCurrency(GESAMT.erloes, "EUR")} />
        <KpiTile label="Wareneinsatz"    value={formatCurrency(GESAMT.wareneinsatz, "EUR")} positive={false} />
        <KpiTile label="DB 1"            value={formatCurrency(GESAMT.db1, "EUR")} positive={true} sub={formatPercent(GESAMT.db1 / GESAMT.erloes)} />
        <KpiTile label="Frachtkosten"    value={formatCurrency(GESAMT.frachtkosten, "EUR")} positive={false} />
        <KpiTile label="Sonstige Kosten" value={formatCurrency(GESAMT.sonstige, "EUR")} positive={false} />
        <KpiTile label="DB 2"            value={formatCurrency(GESAMT.db2, "EUR")} positive={true} sub={formatPercent(GESAMT.db2 / GESAMT.erloes)} />
        <KpiTile label="DB 3 (Netto)"    value={formatCurrency(GESAMT.db3, "EUR")} positive={true} sub={formatPercent(GESAMT.db3 / GESAMT.erloes)} />
      </div>

      {/* ── Charts ── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Waterfall */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardHeader>
              <CardTitle subtitle="Gesamt alle Strecken">Kostenstruktur (Wasserfall)</CardTitle>
            </CardHeader>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={WATERFALL_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(Math.abs(v), "EUR")} />
              <ReferenceLine y={0} stroke="#E2E8F0" />
              <Bar dataKey="wert" radius={[4, 4, 0, 0]}>
                {WATERFALL_DATA.map((entry, i) => (
                  <Cell key={i} fill={BAR_COLOR[entry.typ]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* DB per Strecke */}
        <Card padding="none">
          <div className="p-5 pb-2">
            <CardHeader>
              <CardTitle subtitle="DB 1 / DB 2 / DB 3 je Strecke">Deckungsbeiträge Vergleich</CardTitle>
            </CardHeader>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={CHART_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v, "EUR")} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="DB 1" fill="#93C5FD" radius={[2, 2, 0, 0]} />
              <Bar dataKey="DB 2" fill="#2563EB" radius={[2, 2, 0, 0]} />
              <Bar dataKey="DB 3" fill="#1E40AF" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* ── Detail table ── */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Strecken-Detail</p>
          <span className="text-xs text-slate-400">{filtered.length} Strecken</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["Strecke", "Partner", "Menge", "Erlös", "Wareneinsatz", "Fracht", "DB 1", "DB 2", "DB 3", "DB %", ""].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => {
                const isPositive = s.dbProzent >= 10;
                return (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 whitespace-nowrap">{s.bezeichnung}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.kontrakte}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{s.partner}</td>
                    <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">{formatNumber(s.menge, 0)} t</td>
                    <td className="px-4 py-3 text-right text-slate-700 whitespace-nowrap">{formatCurrency(s.erloes, "EUR")}</td>
                    <td className="px-4 py-3 text-right text-red-500 whitespace-nowrap">{formatCurrency(s.wareneinsatz, "EUR")}</td>
                    <td className="px-4 py-3 text-right text-slate-500 whitespace-nowrap">{formatCurrency(s.frachtkosten, "EUR")}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 whitespace-nowrap">{formatCurrency(s.db1, "EUR")}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-800 whitespace-nowrap">{formatCurrency(s.db2, "EUR")}</td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 whitespace-nowrap">{formatCurrency(s.db3, "EUR")}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                        isPositive ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
                      )}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {s.dbProzent.toFixed(2)} %
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/strecken" className="text-blue-600 hover:text-blue-700">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals row */}
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-800" colSpan={2}>Gesamt</td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {formatNumber(filtered.reduce((s, x) => s + x.menge, 0), 0)} t
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">
                  {formatCurrency(filtered.reduce((s, x) => s + x.erloes, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-medium text-red-500">
                  {formatCurrency(filtered.reduce((s, x) => s + x.wareneinsatz, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-500">
                  {formatCurrency(filtered.reduce((s, x) => s + x.frachtkosten, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(filtered.reduce((s, x) => s + x.db1, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-800">
                  {formatCurrency(filtered.reduce((s, x) => s + x.db2, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600">
                  {formatCurrency(filtered.reduce((s, x) => s + x.db3, 0), "EUR")}
                </td>
                <td className="px-4 py-3 text-right font-bold text-emerald-700" colSpan={2}>
                  {formatPercent(filtered.reduce((s, x) => s + x.db3, 0) / filtered.reduce((s, x) => s + x.erloes, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Info box */}
      <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>DB 1</strong> = Erlös − Wareneinsatz &nbsp;|&nbsp;
          <strong>DB 2</strong> = DB 1 − Frachtkosten &nbsp;|&nbsp;
          <strong>DB 3</strong> = DB 2 − Sonstige Kosten (Lager, Handling, Versicherung)
        </div>
      </div>
    </div>
  );
}
