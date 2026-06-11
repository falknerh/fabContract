"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Truck, Calendar, CheckCircle, Package, Filter, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate, formatNumber, formatCurrency } from "@/lib/utils";
import dispositionenData from "@/data/dispositionen.json";
import type { Disposition } from "@/lib/types";

const DATA = dispositionenData as Disposition[];

const FILTER_TABS = [
  { label: "Alle",      value: "" },
  { label: "Offen",     value: "FREIGEGEBEN" },
  { label: "Geplant",   value: "GEPLANT" },
  { label: "Unterwegs", value: "UNTERWEGS" },
  { label: "Geliefert", value: "GELIEFERT" },
];

export default function DispositionPage() {
  const [filter, setFilter] = useState("");

  const filtered = DATA.filter(d => !filter || d.status === filter);
  const geplantesMenge = DATA.filter(d => d.status === "GEPLANT" || d.status === "FREIGEGEBEN")
    .reduce((s, d) => s + d.positionen.reduce((ps, p) => ps + p.menge, 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Disposition</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} Dispositionen · {formatNumber(geplantesMenge, 0)} t offen
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neue Disposition
          </Button>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {FILTER_TABS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                filter === f.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Freigegeben",  count: DATA.filter(d => d.status === "FREIGEGEBEN").length,  color: "bg-blue-50 text-blue-700",    icon: CheckCircle },
            { label: "Geplant",      count: DATA.filter(d => d.status === "GEPLANT").length,       color: "bg-slate-100 text-slate-700", icon: Calendar },
            { label: "Geliefert",    count: DATA.filter(d => d.status === "GELIEFERT").length,     color: "bg-emerald-50 text-emerald-700", icon: CheckCircle },
            { label: "Gesamt t",     count: DATA.reduce((s, d) => s + d.positionen.reduce((ps, p) => ps + p.menge, 0), 0), color: "bg-amber-50 text-amber-700", icon: Package, isValue: true },
          ].map(item => (
            <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
              <p className="text-xs font-medium opacity-80">{item.label}</p>
              <p className="text-2xl font-bold mt-1">
                {item.isValue ? formatNumber(item.count, 0) : item.count}
                {item.isValue && <span className="text-sm font-normal ml-1">t</span>}
              </p>
            </div>
          ))}
        </div>

        {/* List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-x-auto">
          <div className="min-w-[580px]">
          <div className="grid grid-cols-[120px_1fr_100px_80px_100px_80px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            <div>Nummer</div>
            <div>Kontrakt / Artikel</div>
            <div>Lieferdatum</div>
            <div className="text-right">Menge</div>
            <div className="text-center">Status</div>
            <div />
          </div>

          {filtered.map(d => {
            const totalMenge = d.positionen.reduce((s, p) => s + p.menge, 0);
            const totalWert  = d.positionen.reduce((s, p) => s + p.nettoWert, 0);
            return (
              <div key={d.id}
                className="grid grid-cols-[120px_1fr_100px_80px_100px_80px] gap-3 px-5 py-3.5 items-center border-b border-slate-50 hover:bg-slate-50 transition-colors group">
                <div className="text-sm font-semibold text-blue-600">{d.nummer}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800">{d.kontraktNummer}</p>
                  {d.positionen[0] && (
                    <p className="text-xs text-slate-500 truncate">{d.positionen[0].bezeichnung}</p>
                  )}
                </div>
                <div className="text-sm text-slate-600">{formatDate(d.lieferDatum)}</div>
                <div className="text-sm font-semibold text-slate-800 text-right">
                  {formatNumber(totalMenge, 0)} t
                </div>
                <div className="flex justify-center">
                  <StatusBadge status={d.status} size="sm" />
                </div>
                <div className="opacity-0 group-hover:opacity-100">
                  <Button variant="ghost" size="sm" className="p-1.5">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
