"use client";

import { useState } from "react";
import { ArrowLeftRight, Plus, TrendingUp, TrendingDown, Minus, ChevronRight, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const MOCK_STRECKEN = [
  {
    id: "str_001",
    bezeichnung: "Weizen AT → DE (Bäckerei Schmidt)",
    einkaufNummer: "EK-2024-0031",
    verkaufNummer: "VK-2024-0018",
    einkaufPartner: "Agrar Invest Österreich GmbH",
    verkaufPartner: "Bäckerei Gruppe Schmidt GmbH",
    menge: 1500,
    einheit: "t",
    erloes:      348000,
    wareneinsatz: 264000,
    frachtkosten:  28500,
    sonstigeKosten: 4200,
    db1:          84000,
    db2:          55500,
    db3:          51300,
    dbProzent:    14.74,
    status: "AKTIV",
  },
  {
    id: "str_002",
    bezeichnung: "Gerste AT → DE (Export)",
    einkaufNummer: "EK-2024-0031",
    verkaufNummer: "VK-2024-0022",
    einkaufPartner: "Agrar Invest Österreich GmbH",
    verkaufPartner: "AlpenMühle Vorarlberg AG",
    menge: 300,
    einheit: "t",
    erloes:       63000,
    wareneinsatz:  52500,
    frachtkosten:   4800,
    sonstigeKosten:  600,
    db1:           10500,
    db2:            5700,
    db3:            5100,
    dbProzent:      8.09,
    status: "AKTIV",
  },
];

const DB_VERGLEICH_DATA = [
  { name: "Weizen Strecke",  erloes: 348000, wareneinsatz: 264000, fracht: 28500, db2: 55500 },
  { name: "Gerste Strecke",  erloes: 63000,  wareneinsatz: 52500,  fracht: 4800,  db2: 5700  },
];

function DbBar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  );
}

export default function StreckenPage() {
  const [activeStrecke, setActiveStrecke] = useState<typeof MOCK_STRECKEN[0] | null>(null);

  const maxErloes = Math.max(...MOCK_STRECKEN.map(s => s.erloes));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Streckengeschäfte</h1>
            <p className="text-sm text-slate-500 mt-0.5">Einkauf-Verkauf Verknüpfungen & Deckungsbeitragsrechnung</p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neue Strecke
          </Button>
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-[1fr_380px] gap-5">
        {/* ─── Left ── */}
        <div className="space-y-5">
          {/* Strecken List */}
          {MOCK_STRECKEN.map(s => (
            <Card
              key={s.id}
              hover
              padding="none"
              onClick={() => setActiveStrecke(activeStrecke?.id === s.id ? null : s)}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{s.bezeichnung}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">{s.einkaufNummer}</span>
                      <ArrowLeftRight className="w-3 h-3 text-slate-400" />
                      <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">{s.verkaufNummer}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-slate-900">{s.dbProzent.toFixed(2)}%</p>
                    <p className="text-xs text-slate-500">DB II</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[
                    { label: "Erlös",          value: s.erloes,        color: "text-emerald-600" },
                    { label: "Wareneinsatz",   value: s.wareneinsatz,  color: "text-red-500" },
                    { label: "Frachtkosten",   value: s.frachtkosten,  color: "text-amber-600" },
                    { label: "DB II",          value: s.db2,           color: s.db2 > 0 ? "text-blue-600" : "text-red-600" },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className={`text-sm font-semibold ${item.color}`}>{formatCurrency(item.value, "EUR")}</p>
                    </div>
                  ))}
                </div>

                {/* DB Bar */}
                <div className="mt-3">
                  <DbBar value={s.db2} max={maxErloes} color="bg-blue-500" />
                </div>
              </div>

              {activeStrecke?.id === s.id && (
                <div className="border-t border-slate-100 p-5 bg-slate-50">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Deckungsbeitragsrechnung</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Umsatzerlöse</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(s.erloes, "EUR")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">./. Wareneinsatz</span>
                      <span className="text-red-500">− {formatCurrency(s.wareneinsatz, "EUR")}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
                      <span>Deckungsbeitrag I</span>
                      <span className="text-blue-600">{formatCurrency(s.db1, "EUR")}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>./. Frachtkosten</span>
                      <span className="text-amber-600">− {formatCurrency(s.frachtkosten, "EUR")}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t border-slate-200 pt-2">
                      <span>Deckungsbeitrag II</span>
                      <span className={s.db2 >= 0 ? "text-blue-700" : "text-red-600"}>{formatCurrency(s.db2, "EUR")} ({s.dbProzent.toFixed(2)}%)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>./. Sonstige Kosten</span>
                      <span className="text-slate-500">− {formatCurrency(s.sonstigeKosten, "EUR")}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t-2 border-slate-300 pt-2 text-base">
                      <span>Deckungsbeitrag III</span>
                      <span className={s.db3 >= 0 ? "text-emerald-700" : "text-red-600"}>{formatCurrency(s.db3, "EUR")}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* ─── Right: Chart ── */}
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle subtitle="Vergleich aktiver Strecken">
                DB-Vergleich
              </CardTitle>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={DB_VERGLEICH_DATA} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `€${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v, "EUR")} />
                <Bar dataKey="erloes"      fill="#10B981" name="Erlös"          radius={[3,3,0,0]} />
                <Bar dataKey="wareneinsatz" fill="#EF4444" name="Wareneinsatz" radius={[3,3,0,0]} />
                <Bar dataKey="fracht"      fill="#F59E0B" name="Frachtkosten"  radius={[3,3,0,0]} />
                <Bar dataKey="db2"         fill="#2563EB" name="DB II"          radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Frachtkosten zubuchen</CardTitle>
            </CardHeader>
            <p className="text-xs text-slate-500 mb-3">
              Frachtaufträge können direkt auf Strecken gebucht werden, um die Deckungsbeitragsrechnung zu vervollständigen.
            </p>
            <Button variant="secondary" size="sm" className="w-full" icon={<Truck className="w-3.5 h-3.5" />}>
              Frachtauftrag zuweisen
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
