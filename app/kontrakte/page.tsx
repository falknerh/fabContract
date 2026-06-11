"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Plus, Filter, SortAsc, Download, ChevronRight,
  FileText, Package, Calendar, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatNumber } from "@/lib/utils";
import kontrakteData from "@/data/kontrakte.json";
import type { Kontrakt } from "@/lib/types";

const DATA = kontrakteData as Kontrakt[];

const ART_STYLES: Record<string, string> = {
  EINKAUF: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  VERKAUF: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
};
const VARIANT_LABEL: Record<string, string> = {
  RAHMEN: "Rahmenkontrakt",
  EINZEL: "Einzelbeleg",
  ABRUF:  "Abruf",
};

const FILTERS = [
  { label: "Alle",       value: "" },
  { label: "Einkauf",    value: "EINKAUF" },
  { label: "Verkauf",    value: "VERKAUF" },
  { label: "Rahmen",     value: "RAHMEN" },
  { label: "Einzelbelege", value: "EINZEL" },
];

export default function KontraktePage() {
  const [search,     setSearch]     = useState("");
  const [artFilter,  setArtFilter]  = useState("");
  const [sortField,  setSortField]  = useState<"datum" | "wert">("datum");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("desc");

  const toggleSort = (field: "datum" | "wert") => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const filtered = useMemo(() => {
    let rows = [...DATA];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(k =>
        k.nummer.toLowerCase().includes(q) ||
        k.partner.name.toLowerCase().includes(q) ||
        k.beschreibung?.toLowerCase().includes(q)
      );
    }
    if (artFilter) {
      rows = rows.filter(k => k.belegart === artFilter || k.belegvariante === artFilter);
    }
    rows.sort((a, b) => {
      const va = sortField === "datum" ? a.datum : a.summeNetto;
      const vb = sortField === "datum" ? b.datum : b.summeNetto;
      return sortDir === "asc" ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return rows;
  }, [search, artFilter, sortField, sortDir]);

  const totalNetto = filtered.reduce((s, k) => s + k.summeNetto, 0);
  const offene     = filtered.filter(k => k.status === "OFFEN" || k.status === "TEILGELIEFERT").length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Kontrakte</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} Belege · {offene} offen · Volumen {formatCurrency(totalNetto, "EUR")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Button>
            <Link href="/kontrakte/neu">
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Neuer Kontrakt
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          {/* Search */}
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 min-w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nummer, Partner, Beschreibung..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1">
            {FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setArtFilter(f.value)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  artFilter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Table ── */}
      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-x-auto">
          <div className="min-w-[780px]">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_160px_120px_120px_100px_80px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div>Art</div>
            <div>Kontrakt / Partner</div>
            <button onClick={() => toggleSort("datum")} className="flex items-center gap-1 hover:text-slate-700">
              Datum <ArrowUpDown className="w-3 h-3" />
            </button>
            <div>Menge / Pos.</div>
            <button onClick={() => toggleSort("wert")} className="flex items-center gap-1 hover:text-slate-700 justify-end">
              Wert netto <ArrowUpDown className="w-3 h-3" />
            </button>
            <div className="text-center">Status</div>
            <div />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Keine Kontrakte gefunden</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(k => {
                const posCount = k.positionen.filter(p => p.typ === "ARTIKEL").length;
                const dispoPercent = k.gesamtMenge ? Math.round(((k.gelieferteMenge ?? 0) / k.gesamtMenge) * 100) : null;

                return (
                  <div key={k.id}
                    className="grid grid-cols-[60px_1fr_160px_120px_120px_100px_80px] gap-3 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors group">
                    {/* Art Badge */}
                    <div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${ART_STYLES[k.belegart]}`}>
                        {k.belegart.slice(0, 3)}
                      </span>
                    </div>

                    {/* Kontrakt Info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/kontrakte/${k.id}`}
                          className="text-sm font-semibold text-blue-600 hover:underline">
                          {k.nummer}
                        </Link>
                        <span className="text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {VARIANT_LABEL[k.belegvariante]}
                        </span>
                        {k.rahmenKontraktId && (
                          <span className="text-xs text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">
                            Abruf #{k.abrufNummer}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 truncate">{k.partner.name}</p>
                      {k.beschreibung && (
                        <p className="text-xs text-slate-400 truncate hidden lg:block">{k.beschreibung}</p>
                      )}
                    </div>

                    {/* Datum */}
                    <div className="text-sm text-slate-600">
                      <p>{formatDate(k.datum)}</p>
                      {k.gueltigBis && (
                        <p className="text-xs text-slate-400">bis {formatDate(k.gueltigBis)}</p>
                      )}
                    </div>

                    {/* Menge */}
                    <div className="text-sm text-slate-700">
                      {k.gesamtMenge ? (
                        <>
                          <p className="font-medium">{formatNumber(k.gesamtMenge, 0)} t</p>
                          {dispoPercent !== null && (
                            <div className="mt-1">
                              <div className="w-full bg-slate-100 rounded-full h-1.5">
                                <div
                                  className="bg-blue-500 h-1.5 rounded-full"
                                  style={{ width: `${Math.min(100, dispoPercent)}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">{dispoPercent}% geliefert</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p>{posCount} Positionen</p>
                      )}
                    </div>

                    {/* Wert */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatCurrency(k.summeNetto, k.waehrung)}</p>
                      {k.waehrung !== "EUR" && (
                        <p className="text-xs text-slate-400">{k.waehrung}</p>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex justify-center">
                      <StatusBadge status={k.status} size="sm" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/kontrakte/${k.id}`}>
                        <Button variant="ghost" size="sm" className="p-1.5">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer totals */}
          {filtered.length > 0 && (
            <div className="grid grid-cols-[60px_1fr_160px_120px_120px_100px_80px] gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <div />
              <div>{filtered.length} Kontrakte</div>
              <div />
              <div />
              <div className="text-right text-slate-800">{formatCurrency(totalNetto, "EUR")}</div>
              <div />
              <div />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
