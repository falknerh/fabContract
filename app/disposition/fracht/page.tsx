"use client";
export const runtime = 'edge';

import { useState, useMemo } from "react";
import { Truck, Plus, Search, ArrowRight, Package, CheckCircle, Clock, MapPin, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, SelectInput } from "@/components/ui/Input";
import { formatDate, formatNumber } from "@/lib/utils";

// ─── Mock data ─────────────────────────────────────────────────────────────

type FrachtStatus = "GEPLANT" | "UNTERWEGS" | "GELIEFERT";

interface Frachtauftrag {
  id: string;
  nummer: string;
  fahrer: string;
  spediteur: string;
  vonOrt: string;
  nachOrt: string;
  artikel: string;
  artikelKategorie: string;
  menge: number;
  einheit: string;
  datum: string;
  lieferzeit: string;
  kennzeichen: string;
  status: FrachtStatus;
  notiz?: string;
}

const MOCK_DATA: Frachtauftrag[] = [
  {
    id: "fa-001",
    nummer: "FA-2026-00142",
    fahrer: "Klaus Berger",
    spediteur: "Translogistik Müller GmbH",
    vonOrt: "Lager Wien-Süd",
    nachOrt: "Agrar Invest GmbH, Linz",
    artikel: "Winterweizen",
    artikelKategorie: "Getreide",
    menge: 25000,
    einheit: "kg",
    datum: "2026-06-12",
    lieferzeit: "08:00 – 10:00",
    kennzeichen: "W-TL 4821",
    status: "UNTERWEGS",
  },
  {
    id: "fa-002",
    nummer: "FA-2026-00143",
    fahrer: "Josef Huber",
    spediteur: "Huber Transporte KG",
    vonOrt: "Magyar Gabona Kft., Budapest",
    nachOrt: "Lager Wien-Nord",
    artikel: "Körnermais",
    artikelKategorie: "Getreide",
    menge: 32000,
    einheit: "kg",
    datum: "2026-06-13",
    lieferzeit: "13:00 – 15:00",
    kennzeichen: "BM-HU 7734",
    status: "GEPLANT",
    notiz: "Feuchtigkeitskontrolle bei Ankunft erforderlich",
  },
  {
    id: "fa-003",
    nummer: "FA-2026-00140",
    fahrer: "Peter Novak",
    spediteur: "Translogistik Müller GmbH",
    vonOrt: "Lager Graz-Ost",
    nachOrt: "Spar Handelsges.m.b.H., Wien",
    artikel: "Raps",
    artikelKategorie: "Ölsaaten",
    menge: 18500,
    einheit: "kg",
    datum: "2026-06-11",
    lieferzeit: "07:00 – 09:00",
    kennzeichen: "W-TL 3319",
    status: "GELIEFERT",
  },
  {
    id: "fa-004",
    nummer: "FA-2026-00144",
    fahrer: "Martin Schreiner",
    spediteur: "Alpine Logistik AG",
    vonOrt: "Lager Salzburg",
    nachOrt: "Bio Getreide Handel GmbH, Innsbruck",
    artikel: "Wintergerste",
    artikelKategorie: "Getreide",
    menge: 20000,
    einheit: "kg",
    datum: "2026-06-14",
    lieferzeit: "10:00 – 12:00",
    kennzeichen: "S-AL 5502",
    status: "GEPLANT",
  },
  {
    id: "fa-005",
    nummer: "FA-2026-00139",
    fahrer: "Franz Wimmer",
    spediteur: "Huber Transporte KG",
    vonOrt: "Donau Agrar GmbH, Tulln",
    nachOrt: "Lager Wien-Süd",
    artikel: "Sonnenblumenkerne",
    artikelKategorie: "Ölsaaten",
    menge: 15000,
    einheit: "kg",
    datum: "2026-06-10",
    lieferzeit: "14:00 – 16:00",
    kennzeichen: "TU-HU 1187",
    status: "GELIEFERT",
    notiz: "Lieferschein Nr. LS-2026-8821",
  },
];

// ─── Filter config ─────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "Alle",       value: "" },
  { label: "Geplant",    value: "GEPLANT" },
  { label: "Unterwegs",  value: "UNTERWEGS" },
  { label: "Geliefert",  value: "GELIEFERT" },
];

// ─── Helper: KPI summary data ───────────────────────────────────────────────

function getSummary(data: Frachtauftrag[]) {
  return {
    geplant:   data.filter(d => d.status === "GEPLANT").length,
    unterwegs: data.filter(d => d.status === "UNTERWEGS").length,
    geliefert: data.filter(d => d.status === "GELIEFERT").length,
    gesamtMenge: data.reduce((s, d) => s + d.menge, 0),
  };
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function FrachtPage() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [spediteurFilter, setSpediteurFilter] = useState("");

  const spediteure = useMemo(() => {
    const unique = Array.from(new Set(MOCK_DATA.map(d => d.spediteur)));
    return [{ value: "", label: "Alle Spediteure" }, ...unique.map(s => ({ value: s, label: s }))];
  }, []);

  const filtered = useMemo(() => {
    return MOCK_DATA.filter(d => {
      if (statusFilter && d.status !== statusFilter) return false;
      if (spediteurFilter && d.spediteur !== spediteurFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          d.nummer.toLowerCase().includes(q) ||
          d.fahrer.toLowerCase().includes(q) ||
          d.artikel.toLowerCase().includes(q) ||
          d.vonOrt.toLowerCase().includes(q) ||
          d.nachOrt.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [statusFilter, spediteurFilter, searchQuery]);

  const summary = getSummary(MOCK_DATA);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-900">Frachtaufträge</h1>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} von {MOCK_DATA.length} Frachtaufträgen
              {statusFilter ? ` · Status: ${statusFilter}` : ""}
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neuer Frachtauftrag
          </Button>
        </div>

        {/* Status-Tabs */}
        <div className="flex items-center gap-1 mt-4">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
              {tab.value && (
                <span className="ml-1.5 opacity-70">
                  ({MOCK_DATA.filter(d => d.status === tab.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <p className="text-xs font-medium text-slate-600">Geplant</p>
            </div>
            <p className="text-2xl font-bold text-slate-800">{summary.geplant}</p>
            <p className="text-xs text-slate-500 mt-0.5">Aufträge ausstehend</p>
          </div>

          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-3.5 h-3.5 text-amber-500" />
              <p className="text-xs font-medium text-amber-700">Unterwegs</p>
            </div>
            <p className="text-2xl font-bold text-amber-800">{summary.unterwegs}</p>
            <p className="text-xs text-amber-600 mt-0.5">Aktive Transporte</p>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
              <p className="text-xs font-medium text-emerald-700">Geliefert</p>
            </div>
            <p className="text-2xl font-bold text-emerald-800">{summary.geliefert}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Abgeschlossene Lieferungen</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <p className="text-xs font-medium text-blue-700">Gesamtmenge</p>
            </div>
            <p className="text-2xl font-bold text-blue-800">
              {formatNumber(summary.gesamtMenge / 1000, 1)}
              <span className="text-sm font-normal ml-1">t</span>
            </p>
            <p className="text-xs text-blue-600 mt-0.5">Alle Frachtaufträge</p>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex-1 min-w-[220px]">
            <Input
              placeholder="Suche nach Nr., Fahrer, Artikel, Ort…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              prefix={<Search className="w-3.5 h-3.5" />}
            />
          </div>
          <div className="w-56">
            <SelectInput
              options={spediteure}
              value={spediteurFilter}
              onChange={e => setSpediteurFilter(e.target.value)}
            />
          </div>
          {(searchQuery || spediteurFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchQuery(""); setSpediteurFilter(""); }}
            >
              Filter zurücksetzen
            </Button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-x-auto">
          <div className="min-w-[860px]">
          {/* Table Header */}
          <div className="grid grid-cols-[160px_1fr_1fr_100px_90px_110px_90px_36px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
            <div>Frachtauftrag-Nr.</div>
            <div>Fahrer / Spediteur</div>
            <div>Von → Nach</div>
            <div>Artikel</div>
            <div className="text-right">Menge</div>
            <div>Datum</div>
            <div className="text-center">Status</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Truck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-500">Keine Frachtaufträge gefunden</p>
              <p className="text-xs text-slate-400 mt-1">Passen Sie die Suchkriterien an.</p>
            </div>
          ) : (
            filtered.map(row => (
              <div
                key={row.id}
                className="grid grid-cols-[160px_1fr_1fr_100px_90px_110px_90px_36px] gap-3 px-5 py-3.5 items-center border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group"
              >
                {/* Nummer */}
                <div>
                  <p className="text-sm font-semibold text-blue-600">{row.nummer}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{row.kennzeichen}</p>
                </div>

                {/* Fahrer / Spediteur */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{row.fahrer}</p>
                  <p className="text-xs text-slate-500 truncate">{row.spediteur}</p>
                </div>

                {/* Von → Nach */}
                <div className="min-w-0">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600 truncate">{row.vonOrt}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <p className="text-xs text-slate-600 truncate">{row.nachOrt}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Artikel */}
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 truncate">{row.artikel}</p>
                  <p className="text-xs text-slate-400 truncate">{row.artikelKategorie}</p>
                </div>

                {/* Menge */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {formatNumber(row.menge / 1000, 1)} t
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {formatNumber(row.menge, 0)} kg
                  </p>
                </div>

                {/* Datum */}
                <div>
                  <p className="text-sm text-slate-700">{formatDate(row.datum)}</p>
                  <p className="text-[11px] text-slate-400">{row.lieferzeit}</p>
                </div>

                {/* Status */}
                <div className="flex justify-center">
                  <StatusBadge status={row.status} size="sm" />
                </div>

                {/* Action */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" className="p-1.5 h-7 w-7">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
          </div>
        </div>

        {/* ── Notizen hint ── */}
        {filtered.some(d => d.notiz) && (
          <Card padding="sm">
            <CardHeader>
              <CardTitle>Hinweise</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {filtered.filter(d => d.notiz).map(d => (
                <div key={d.id} className="flex items-start gap-2 text-sm">
                  <span className="text-xs font-semibold text-blue-600 shrink-0 mt-0.5">{d.nummer}</span>
                  <span className="text-slate-600">{d.notiz}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
