"use client";
export const runtime = 'edge';

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Pencil,
  ChevronLeft,
  Package,
  X,
  Filter,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, SelectInput } from "@/components/ui/Input";
import { cn, formatCurrency } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type ArtikelStatus = "AKTIV" | "INAKTIV" | "GESPERRT";
type ArtikelKategorie = "GETREIDE" | "ÖLSAATEN" | "HÜLSENFRÜCHTE" | "DÜNGEMITTEL" | "FUTTERMITTEL";

interface Artikel {
  id: string;
  artikelNr: string;
  bezeichnung: string;
  kurzbezeichnung: string;
  einheit: string;
  kategorie: ArtikelKategorie;
  preisProEinheit: number;
  waehrung: string;
  mehrwertsteuersatz: number;
  status: ArtikelStatus;
  zolltarifNr?: string;
  mindestmenge?: number;
  lagerfahig: boolean;
  erstelltAm: string;
  geaendertAm: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ARTIKEL: Artikel[] = [
  {
    id: "ART-001",
    artikelNr: "GE-0001",
    bezeichnung: "Winterweizen A-Qualität",
    kurzbezeichnung: "Winterweizen A",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 218.50,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1001 9900",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2025-11-03",
  },
  {
    id: "ART-002",
    artikelNr: "GE-0002",
    bezeichnung: "Winterweizen B-Qualität",
    kurzbezeichnung: "Winterweizen B",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 205.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1001 9900",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2025-11-03",
  },
  {
    id: "ART-003",
    artikelNr: "GE-0010",
    bezeichnung: "Körnermais",
    kurzbezeichnung: "Körnermais",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 194.75,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1005 9000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2026-01-15",
  },
  {
    id: "ART-004",
    artikelNr: "GE-0011",
    bezeichnung: "Silomais (Feuchtmais)",
    kurzbezeichnung: "Silomais",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 42.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1005 9000",
    mindestmenge: 100,
    lagerfahig: false,
    erstelltAm: "2023-03-01",
    geaendertAm: "2025-08-20",
  },
  {
    id: "ART-005",
    artikelNr: "GE-0020",
    bezeichnung: "Wintergerste",
    kurzbezeichnung: "Wintergerste",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 188.25,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1003 9000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2026-02-10",
  },
  {
    id: "ART-006",
    artikelNr: "GE-0030",
    bezeichnung: "Hafer",
    kurzbezeichnung: "Hafer",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 172.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1004 9000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2025-09-12",
  },
  {
    id: "ART-007",
    artikelNr: "OE-0001",
    bezeichnung: "Winterraps",
    kurzbezeichnung: "Winterraps",
    einheit: "t",
    kategorie: "ÖLSAATEN",
    preisProEinheit: 448.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1205 1000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2026-03-05",
  },
  {
    id: "ART-008",
    artikelNr: "OE-0010",
    bezeichnung: "Sonnenblumenkerne",
    kurzbezeichnung: "Sonnenblume",
    einheit: "t",
    kategorie: "ÖLSAATEN",
    preisProEinheit: 395.50,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1206 0091",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-04-15",
    geaendertAm: "2025-10-22",
  },
  {
    id: "ART-009",
    artikelNr: "OE-0020",
    bezeichnung: "Sojabohnen (non-GVO)",
    kurzbezeichnung: "Soja non-GVO",
    einheit: "t",
    kategorie: "ÖLSAATEN",
    preisProEinheit: 415.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "1201 9000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-04-15",
    geaendertAm: "2026-01-08",
  },
  {
    id: "ART-010",
    artikelNr: "HL-0001",
    bezeichnung: "Speisebohnen (Weiß)",
    kurzbezeichnung: "Speisebohnen",
    einheit: "t",
    kategorie: "HÜLSENFRÜCHTE",
    preisProEinheit: 620.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 10,
    status: "AKTIV",
    zolltarifNr: "0708 2000",
    mindestmenge: 10,
    lagerfahig: true,
    erstelltAm: "2023-06-01",
    geaendertAm: "2025-07-30",
  },
  {
    id: "ART-011",
    artikelNr: "HL-0010",
    bezeichnung: "Erbsen (Futtererbsen)",
    kurzbezeichnung: "Futtererbsen",
    einheit: "t",
    kategorie: "HÜLSENFRÜCHTE",
    preisProEinheit: 245.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "0713 1000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-06-01",
    geaendertAm: "2025-11-18",
  },
  {
    id: "ART-012",
    artikelNr: "DU-0001",
    bezeichnung: "Ammonsulfatsalpeter (ASS 26%)",
    kurzbezeichnung: "ASS 26%",
    einheit: "t",
    kategorie: "DÜNGEMITTEL",
    preisProEinheit: 290.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 20,
    status: "AKTIV",
    zolltarifNr: "3102 2100",
    mindestmenge: 1,
    lagerfahig: true,
    erstelltAm: "2023-09-01",
    geaendertAm: "2026-02-28",
  },
  {
    id: "ART-013",
    artikelNr: "DU-0010",
    bezeichnung: "KAS (Kalkammonsalpeter 27%)",
    kurzbezeichnung: "KAS 27%",
    einheit: "t",
    kategorie: "DÜNGEMITTEL",
    preisProEinheit: 285.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 20,
    status: "AKTIV",
    zolltarifNr: "3102 6000",
    mindestmenge: 1,
    lagerfahig: true,
    erstelltAm: "2023-09-01",
    geaendertAm: "2026-03-01",
  },
  {
    id: "ART-014",
    artikelNr: "FU-0001",
    bezeichnung: "Weizenkleie",
    kurzbezeichnung: "Weizenkleie",
    einheit: "t",
    kategorie: "FUTTERMITTEL",
    preisProEinheit: 148.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "AKTIV",
    zolltarifNr: "2302 3000",
    mindestmenge: 10,
    lagerfahig: true,
    erstelltAm: "2024-01-15",
    geaendertAm: "2025-12-10",
  },
  {
    id: "ART-015",
    artikelNr: "GE-0040",
    bezeichnung: "Triticale",
    kurzbezeichnung: "Triticale",
    einheit: "t",
    kategorie: "GETREIDE",
    preisProEinheit: 182.50,
    waehrung: "EUR",
    mehrwertsteuersatz: 0,
    status: "INAKTIV",
    zolltarifNr: "1008 6000",
    mindestmenge: 25,
    lagerfahig: true,
    erstelltAm: "2023-01-10",
    geaendertAm: "2024-11-01",
  },
  {
    id: "ART-016",
    artikelNr: "OE-0030",
    bezeichnung: "Leinöl (roh)",
    kurzbezeichnung: "Leinöl roh",
    einheit: "t",
    kategorie: "ÖLSAATEN",
    preisProEinheit: 890.00,
    waehrung: "EUR",
    mehrwertsteuersatz: 10,
    status: "GESPERRT",
    zolltarifNr: "1515 1900",
    mindestmenge: 5,
    lagerfahig: true,
    erstelltAm: "2024-03-10",
    geaendertAm: "2025-06-15",
  },
];

// ─── Constants ──────────────────────────────────────────────────────────────

const KATEGORIE_LABELS: Record<ArtikelKategorie, string> = {
  GETREIDE: "Getreide",
  ÖLSAATEN: "Ölsaaten",
  HÜLSENFRÜCHTE: "Hülsenfrüchte",
  DÜNGEMITTEL: "Düngemittel",
  FUTTERMITTEL: "Futtermittel",
};

const KATEGORIE_COLORS: Record<ArtikelKategorie, "blue" | "amber" | "green" | "slate" | "violet"> = {
  GETREIDE: "blue",
  ÖLSAATEN: "amber",
  HÜLSENFRÜCHTE: "green",
  DÜNGEMITTEL: "violet",
  FUTTERMITTEL: "slate",
};

const STATUS_COLORS: Record<ArtikelStatus, "green" | "slate" | "red"> = {
  AKTIV: "green",
  INAKTIV: "slate",
  GESPERRT: "red",
};

const STATUS_LABELS: Record<ArtikelStatus, string> = {
  AKTIV: "Aktiv",
  INAKTIV: "Inaktiv",
  GESPERRT: "Gesperrt",
};

// ─── Edit Modal ──────────────────────────────────────────────────────────────

function EditModal({ artikel, onClose, onSave }: {
  artikel: Artikel;
  onClose: () => void;
  onSave: (updated: Artikel) => void;
}) {
  const [form, setForm] = useState<Artikel>({ ...artikel });

  function handleChange(field: keyof Artikel, value: string | number | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Artikel bearbeiten</h2>
            <p className="text-xs text-slate-500 mt-0.5">{form.artikelNr} — {form.bezeichnung}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Artikel-Nr."
              value={form.artikelNr}
              disabled
              hint="Wird automatisch vergeben"
            />
            <Input
              label="Kurzbezeichnung"
              value={form.kurzbezeichnung}
              onChange={e => handleChange("kurzbezeichnung", e.target.value)}
              maxLength={30}
            />
          </div>

          <Input
            label="Bezeichnung"
            value={form.bezeichnung}
            onChange={e => handleChange("bezeichnung", e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Einheit"
              value={form.einheit}
              onChange={e => handleChange("einheit", e.target.value)}
              options={[
                { value: "t", label: "Tonne (t)" },
                { value: "kg", label: "Kilogramm (kg)" },
                { value: "l", label: "Liter (l)" },
                { value: "Stk", label: "Stück (Stk)" },
                { value: "Sack", label: "Sack" },
              ]}
            />
            <SelectInput
              label="Kategorie"
              value={form.kategorie}
              onChange={e => handleChange("kategorie", e.target.value as ArtikelKategorie)}
              options={Object.entries(KATEGORIE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Preis / Einheit (EUR)"
              type="number"
              step="0.01"
              value={form.preisProEinheit}
              onChange={e => handleChange("preisProEinheit", parseFloat(e.target.value) || 0)}
              suffix="€"
            />
            <SelectInput
              label="Mehrwertsteuersatz"
              value={String(form.mehrwertsteuersatz)}
              onChange={e => handleChange("mehrwertsteuersatz", Number(e.target.value))}
              options={[
                { value: "0", label: "0 % (Nullsatz / Agrar)" },
                { value: "10", label: "10 % (ermäßigt)" },
                { value: "20", label: "20 % (Standard)" },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Zolltarif-Nr."
              value={form.zolltarifNr ?? ""}
              onChange={e => handleChange("zolltarifNr", e.target.value)}
              placeholder="z.B. 1001 9900"
            />
            <Input
              label="Mindestmenge (t)"
              type="number"
              value={form.mindestmenge ?? ""}
              onChange={e => handleChange("mindestmenge", parseFloat(e.target.value) || 0)}
              suffix="t"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Status"
              value={form.status}
              onChange={e => handleChange("status", e.target.value as ArtikelStatus)}
              options={Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <div className="flex flex-col gap-1 justify-end">
              <label className="text-xs font-medium text-slate-600">Optionen</label>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.lagerfahig}
                  onChange={e => handleChange("lagerfahig", e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                Lagerfähig
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose}>Abbrechen</Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave({ ...form, geaendertAm: new Date().toISOString().slice(0, 10) });
              onClose();
            }}
          >
            Änderungen speichern
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ArtikelStammdatenPage() {
  const [articles, setArticles] = useState<Artikel[]>(MOCK_ARTIKEL);
  const [search, setSearch] = useState("");
  const [filterKategorie, setFilterKategorie] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [editingArtikel, setEditingArtikel] = useState<Artikel | null>(null);

  // ── Derived / filtered list ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return articles.filter(a => {
      const matchSearch =
        !q ||
        a.artikelNr.toLowerCase().includes(q) ||
        a.bezeichnung.toLowerCase().includes(q) ||
        a.kurzbezeichnung.toLowerCase().includes(q) ||
        (a.zolltarifNr?.toLowerCase().includes(q) ?? false);
      const matchKategorie = !filterKategorie || a.kategorie === filterKategorie;
      const matchStatus = !filterStatus || a.status === filterStatus;
      return matchSearch && matchKategorie && matchStatus;
    });
  }, [articles, search, filterKategorie, filterStatus]);

  // ── Summary counts ───────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total: articles.length,
    aktiv: articles.filter(a => a.status === "AKTIV").length,
    inaktiv: articles.filter(a => a.status === "INAKTIV").length,
    gesperrt: articles.filter(a => a.status === "GESPERRT").length,
  }), [articles]);

  const hasActiveFilters = search || filterKategorie || filterStatus;

  function clearFilters() {
    setSearch("");
    setFilterKategorie("");
    setFilterStatus("");
  }

  function handleSave(updated: Artikel) {
    setArticles(prev => prev.map(a => a.id === updated.id ? updated : a));
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Link href="/verwaltung" className="hover:text-slate-600 transition-colors">
            Verwaltung
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Artikel-Stammdaten</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/verwaltung"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Artikel-Stammdaten</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {counts.total} Artikel · {counts.aktiv} aktiv · {counts.inaktiv} inaktiv · {counts.gesperrt} gesperrt
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Neuer Artikel
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* ── Summary KPIs ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Gesamt", value: counts.total, color: "text-slate-900" },
            { label: "Aktiv", value: counts.aktiv, color: "text-emerald-700" },
            { label: "Inaktiv", value: counts.inaktiv, color: "text-slate-500" },
            { label: "Gesperrt", value: counts.gesperrt, color: "text-red-600" },
          ].map(kpi => (
            <Card key={kpi.label} padding="sm">
              <p className="text-xs text-slate-500">{kpi.label}</p>
              <p className={cn("text-2xl font-bold mt-1", kpi.color)}>{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────────────── */}
        <Card padding="sm">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Suche nach Artikel-Nr., Bezeichnung, Zolltarif …"
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-48">
              <SelectInput
                value={filterKategorie}
                onChange={e => setFilterKategorie(e.target.value)}
                options={[
                  { value: "", label: "Alle Kategorien" },
                  ...Object.entries(KATEGORIE_LABELS).map(([v, l]) => ({ value: v, label: l })),
                ]}
              />
            </div>
            <div className="w-40">
              <SelectInput
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                options={[
                  { value: "", label: "Alle Status" },
                  ...Object.entries(STATUS_LABELS).map(([v, l]) => ({ value: v, label: l })),
                ]}
              />
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="md"
                icon={<X className="w-3.5 h-3.5" />}
                onClick={clearFilters}
              >
                Filter zurücksetzen
              </Button>
            )}
          </div>
          {hasActiveFilters && (
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <Filter className="w-3 h-3" />
              {filtered.length} von {articles.length} Artikeln angezeigt
            </p>
          )}
        </Card>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-tl-xl">
                    Artikel-Nr.
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Bezeichnung
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Einheit
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Kategorie
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Preis / Einheit
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    MwSt.
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">
                    Status
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3 rounded-tr-xl">
                    Aktion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">Keine Artikel gefunden</p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="text-xs text-blue-600 hover:underline mt-1"
                        >
                          Filter zurücksetzen
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filtered.map(artikel => (
                    <tr
                      key={artikel.id}
                      className={cn(
                        "hover:bg-slate-50/60 transition-colors",
                        artikel.status === "GESPERRT" && "bg-red-50/30",
                        artikel.status === "INAKTIV" && "opacity-60"
                      )}
                    >
                      {/* Artikel-Nr. */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {artikel.artikelNr}
                        </span>
                      </td>

                      {/* Bezeichnung */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 leading-snug">{artikel.bezeichnung}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {artikel.zolltarifNr && (
                            <span>KN: {artikel.zolltarifNr}</span>
                          )}
                          {artikel.mindestmenge && (
                            <span className="ml-2">· Min. {artikel.mindestmenge} {artikel.einheit}</span>
                          )}
                          {!artikel.lagerfahig && (
                            <span className="ml-2 text-amber-600">· nicht lagerfähig</span>
                          )}
                        </p>
                      </td>

                      {/* Einheit */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {artikel.einheit}
                        </span>
                      </td>

                      {/* Kategorie */}
                      <td className="px-4 py-3">
                        <Badge
                          label={KATEGORIE_LABELS[artikel.kategorie]}
                          color={KATEGORIE_COLORS[artikel.kategorie]}
                          size="sm"
                        />
                      </td>

                      {/* Preis */}
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(artikel.preisProEinheit)}
                        </span>
                        <span className="text-xs text-slate-400 ml-1">/{artikel.einheit}</span>
                      </td>

                      {/* MwSt. */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn(
                          "text-xs font-medium tabular-nums",
                          artikel.mehrwertsteuersatz === 0 ? "text-slate-400" : "text-slate-700"
                        )}>
                          {artikel.mehrwertsteuersatz} %
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        <Badge
                          label={STATUS_LABELS[artikel.status]}
                          color={STATUS_COLORS[artikel.status]}
                          size="sm"
                          dot
                        />
                      </td>

                      {/* Edit */}
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Pencil className="w-3.5 h-3.5" />}
                          onClick={() => setEditingArtikel(artikel)}
                          title="Bearbeiten"
                        >
                          Bearbeiten
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 rounded-b-xl">
              <p className="text-xs text-slate-400">
                {filtered.length} {filtered.length === 1 ? "Artikel" : "Artikel"} angezeigt
                {hasActiveFilters && ` (gefiltert aus ${articles.length})`}
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Edit Modal ────────────────────────────────────────────────────── */}
      {editingArtikel && (
        <EditModal
          artikel={editingArtikel}
          onClose={() => setEditingArtikel(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
