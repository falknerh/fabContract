"use client";
export const runtime = 'edge';

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, SelectInput } from "@/components/ui/Input";
import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  BarChart2,
} from "lucide-react";

type SzenarioTyp = "BASIS" | "OPTIMISTISCH" | "PESSIMISTISCH" | "STRESS";

interface SzenarioImpact {
  bezeichnung: string;
  basiswert: number;
  szenariowert: number;
  einheit: string;
}

interface Szenario {
  id: string;
  name: string;
  typ: SzenarioTyp;
  erstellt: string;
  ersteller: string;
  beschreibung: string;
  annahmen: string[];
  impacts: SzenarioImpact[];
  aktiv: boolean;
}

const MOCK_SZENARIEN: Szenario[] = [
  {
    id: "SZ-001",
    name: "Basisplanung 2025",
    typ: "BASIS",
    erstellt: "2025-01-15",
    ersteller: "M. Huber",
    beschreibung:
      "Standardszenario für die Jahresplanung 2025 basierend auf aktuellen Markterwartungen und historischen Durchschnittswerten.",
    annahmen: [
      "Weizenpreis stabil bei Ø 215 EUR/t",
      "Körnermaispreis bei Ø 195 EUR/t",
      "Rapsöl bei Ø 425 EUR/t",
      "Frachtkosten +2% ggü. Vorjahr",
      "Normaler Ernteverlauf in Österreich und Ungarn",
    ],
    impacts: [
      { bezeichnung: "Deckungsbeitrag", basiswert: 1850000, szenariowert: 1850000, einheit: "EUR" },
      { bezeichnung: "Umsatz", basiswert: 12400000, szenariowert: 12400000, einheit: "EUR" },
      { bezeichnung: "Marge", basiswert: 0.149, szenariowert: 0.149, einheit: "%" },
      { bezeichnung: "Handelsvolumen", basiswert: 45000, szenariowert: 45000, einheit: "t" },
    ],
    aktiv: true,
  },
  {
    id: "SZ-002",
    name: "Optimistisches Marktumfeld Q3/Q4",
    typ: "OPTIMISTISCH",
    erstellt: "2025-02-03",
    ersteller: "S. Berger",
    beschreibung:
      "Szenario bei günstigen Marktbedingungen: hohe Nachfrage aus Exportmärkten, unterdurchschnittliche Ernte in Westeuropa führt zu steigenden Preisen.",
    annahmen: [
      "Weizenpreis steigt auf Ø 245 EUR/t (+14%)",
      "Exportnachfrage aus Nordafrika und Nahost erhöht",
      "Gute eigene Einkaufskonditionen durch Vorkontrakte",
      "Frachtkapazitäten ausreichend verfügbar",
      "EUR/USD stabil, kein Währungsrisiko",
    ],
    impacts: [
      { bezeichnung: "Deckungsbeitrag", basiswert: 1850000, szenariowert: 2310000, einheit: "EUR" },
      { bezeichnung: "Umsatz", basiswert: 12400000, szenariowert: 14800000, einheit: "EUR" },
      { bezeichnung: "Marge", basiswert: 0.149, szenariowert: 0.156, einheit: "%" },
      { bezeichnung: "Handelsvolumen", basiswert: 45000, szenariowert: 52000, einheit: "t" },
    ],
    aktiv: true,
  },
  {
    id: "SZ-003",
    name: "Preisrückgang Getreide",
    typ: "PESSIMISTISCH",
    erstellt: "2025-02-10",
    ersteller: "M. Huber",
    beschreibung:
      "Szenario bei Überangebot durch Rekordernte in Schwarzmeerregion und schwacher Exportnachfrage. Preisdruck auf gesamtes Sortiment.",
    annahmen: [
      "Weizenpreis fällt auf Ø 185 EUR/t (-14%)",
      "Rekordernte in Russland/Ukraine +15% ggü. Vorjahr",
      "Exportsubventionen in Konkurrenzländern erhöht",
      "Frachtkosten stabil, keine Entlastung",
      "Margencompression durch Kundenforderungen",
    ],
    impacts: [
      { bezeichnung: "Deckungsbeitrag", basiswert: 1850000, szenariowert: 1240000, einheit: "EUR" },
      { bezeichnung: "Umsatz", basiswert: 12400000, szenariowert: 10100000, einheit: "EUR" },
      { bezeichnung: "Marge", basiswert: 0.149, szenariowert: 0.123, einheit: "%" },
      { bezeichnung: "Handelsvolumen", basiswert: 45000, szenariowert: 41000, einheit: "t" },
    ],
    aktiv: true,
  },
  {
    id: "SZ-004",
    name: "Extremszenario Logistikkrise",
    typ: "STRESS",
    erstellt: "2025-03-01",
    ersteller: "T. Waldner",
    beschreibung:
      "Worst-Case-Szenario bei massiver Störung der Lieferketten durch Extremwetterereignisse, Bahnstreiks und Donausperrung. Prüfung der Widerstandsfähigkeit des Portfolios.",
    annahmen: [
      "Donauschifffahrt 4 Wochen gesperrt (Niedrigwasser)",
      "Bahnstreik Österreich 2 Wochen",
      "Frachtkosten +40% auf Spot-Markt",
      "Lieferverzögerungen im Durchschnitt +8 Tage",
      "Konventionalstrafen aus 3 Großkontrakten",
    ],
    impacts: [
      { bezeichnung: "Deckungsbeitrag", basiswert: 1850000, szenariowert: 920000, einheit: "EUR" },
      { bezeichnung: "Umsatz", basiswert: 12400000, szenariowert: 11200000, einheit: "EUR" },
      { bezeichnung: "Marge", basiswert: 0.149, szenariowert: 0.082, einheit: "%" },
      { bezeichnung: "Handelsvolumen", basiswert: 45000, szenariowert: 38000, einheit: "t" },
    ],
    aktiv: false,
  },
];

const TYP_CONFIG: Record<SzenarioTyp, { label: string; color: string; icon: React.ReactNode; bg: string; border: string }> = {
  BASIS: {
    label: "BASIS",
    color: "text-blue-700",
    icon: <Minus className="w-3.5 h-3.5" />,
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  OPTIMISTISCH: {
    label: "OPTIMISTISCH",
    color: "text-emerald-700",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  PESSIMISTISCH: {
    label: "PESSIMISTISCH",
    color: "text-amber-700",
    icon: <TrendingDown className="w-3.5 h-3.5" />,
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  STRESS: {
    label: "STRESS",
    color: "text-red-700",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    bg: "bg-red-50",
    border: "border-red-200",
  },
};

function ImpactRow({ impact }: { impact: SzenarioImpact }) {
  const diff = impact.szenariowert - impact.basiswert;
  const diffPct = impact.basiswert !== 0 ? diff / impact.basiswert : 0;
  const isPositive = diff > 0;
  const isNeutral = diff === 0;

  const formatValue = (val: number, einheit: string) => {
    if (einheit === "EUR") return formatCurrency(val);
    if (einheit === "%") return formatPercent(val);
    return `${val.toLocaleString("de-AT")} ${einheit}`;
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-600 w-40">{impact.bezeichnung}</span>
      <span className="text-sm text-slate-500 w-32 text-right">{formatValue(impact.basiswert, impact.einheit)}</span>
      <span
        className={cn(
          "text-sm font-medium w-32 text-right",
          isNeutral ? "text-slate-700" : isPositive ? "text-emerald-700" : "text-red-700"
        )}
      >
        {formatValue(impact.szenariowert, impact.einheit)}
      </span>
      <div
        className={cn(
          "flex items-center gap-1 w-24 justify-end text-xs font-medium",
          isNeutral ? "text-slate-500" : isPositive ? "text-emerald-600" : "text-red-600"
        )}
      >
        {!isNeutral && (isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
        {isNeutral ? "—" : `${isPositive ? "+" : ""}${formatPercent(diffPct)}`}
      </div>
    </div>
  );
}

function SzenarioCard({ szenario }: { szenario: Szenario }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYP_CONFIG[szenario.typ];

  return (
    <div
      className={cn(
        "rounded-xl border bg-white shadow-sm overflow-hidden transition-all duration-200",
        cfg.border,
        !szenario.aktiv && "opacity-60"
      )}
    >
      {/* Header */}
      <div
        className={cn("px-5 py-4 flex items-start justify-between cursor-pointer hover:bg-slate-50/60 transition-colors", cfg.bg)}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start gap-3 flex-1">
          <div className={cn("mt-0.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.bg, cfg.color, "border", cfg.border)}>
            {cfg.icon}
            {cfg.label}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold text-slate-800">{szenario.name}</h3>
              <span className="text-xs text-slate-400 font-mono">{szenario.id}</span>
              {!szenario.aktiv && (
                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Inaktiv</span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{szenario.beschreibung}</p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
              <span>Erstellt: {szenario.erstellt}</span>
              <span>·</span>
              <span>{szenario.ersteller}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {/* Quick DB impact pill */}
          {(() => {
            const db = szenario.impacts.find((i) => i.bezeichnung === "Deckungsbeitrag");
            if (!db) return null;
            const diff = db.szenariowert - db.basiswert;
            const isPos = diff >= 0;
            const isNeutral = diff === 0;
            return (
              <div
                className={cn(
                  "text-xs font-semibold px-2.5 py-1 rounded-full",
                  isNeutral
                    ? "bg-blue-100 text-blue-700"
                    : isPos
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                DB {isNeutral ? "=" : isPos ? "+" : ""}{formatCurrency(diff)}
              </div>
            );
          })()}
          <div className="text-slate-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-5 py-4 border-t border-slate-100 space-y-5 bg-white">
          {/* Description */}
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{szenario.beschreibung}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Annahmen */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Szenario-Annahmen</h4>
              <ul className="space-y-1.5">
                {szenario.annahmen.map((annahme, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    {annahme}
                  </li>
                ))}
              </ul>
            </div>

            {/* Impact Tabelle */}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Auswirkungen vs. Basis</h4>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-slate-100 mb-1">
                <span className="w-40">Kennzahl</span>
                <span className="w-32 text-right">Basis</span>
                <span className="w-32 text-right">Szenario</span>
                <span className="w-24 text-right">Abw.</span>
              </div>
              {szenario.impacts.map((impact, idx) => (
                <ImpactRow key={idx} impact={impact} />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="outline" size="sm">
              Bearbeiten
            </Button>
            <Button variant="outline" size="sm">
              <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
              Im Forecast anzeigen
            </Button>
            <Button size="sm">
              Als Basis übernehmen
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

interface NeuesSzenarioForm {
  name: string;
  typ: SzenarioTyp;
  beschreibung: string;
}

function NeuesSzenarioModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<NeuesSzenarioForm>({
    name: "",
    typ: "BASIS",
    beschreibung: "",
  });
  const [annahmen, setAnnahmen] = useState<string[]>([""]);

  const addAnnahme = () => setAnnahmen((prev) => [...prev, ""]);
  const updateAnnahme = (idx: number, val: string) =>
    setAnnahmen((prev) => prev.map((a, i) => (i === idx ? val : a)));
  const removeAnnahme = (idx: number) =>
    setAnnahmen((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-800">Neues Szenario erstellen</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Szenario-Bezeichnung *</label>
            <Input
              placeholder="z.B. Optimistisches Q2-Szenario"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Typ *</label>
            <select
              value={form.typ}
              onChange={(e) => setForm((f) => ({ ...f, typ: e.target.value as SzenarioTyp }))}
            >
              <option value="BASIS">BASIS</option>
              <option value="OPTIMISTISCH">OPTIMISTISCH</option>
              <option value="PESSIMISTISCH">PESSIMISTISCH</option>
              <option value="STRESS">STRESS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">Beschreibung</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Kurze Beschreibung des Szenarios und seiner Rahmenbedingungen..."
              value={form.beschreibung}
              onChange={(e) => setForm((f) => ({ ...f, beschreibung: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-600">Szenario-Annahmen</label>
              <button
                onClick={addAnnahme}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Annahme hinzufügen
              </button>
            </div>
            <div className="space-y-2">
              {annahmen.map((a, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={`Annahme ${idx + 1}...`}
                    value={a}
                    onChange={(e) => updateAnnahme(idx, e.target.value)}
                    className="flex-1"
                  />
                  {annahmen.length > 1 && (
                    <button
                      onClick={() => removeAnnahme(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            disabled={!form.name.trim()}
            onClick={onClose}
          >
            Szenario erstellen
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SzenarienPage() {
  const [szenarien] = useState<Szenario[]>(MOCK_SZENARIEN);
  const [filterTyp, setFilterTyp] = useState<SzenarioTyp | "ALLE">("ALLE");
  const [showModal, setShowModal] = useState(false);

  const filtered = szenarien.filter((s) => filterTyp === "ALLE" || s.typ === filterTyp);

  const summary = {
    gesamt: szenarien.length,
    aktiv: szenarien.filter((s) => s.aktiv).length,
    optimistisch: szenarien.filter((s) => s.typ === "OPTIMISTISCH").length,
    pessimistisch: szenarien.filter((s) => s.typ === "PESSIMISTISCH").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {showModal && <NeuesSzenarioModal onClose={() => setShowModal(false)} />}

      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Szenarien-Analyse</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Planungsszenarien verwalten und Auswirkungen auf Deckungsbeitrag und Umsatz analysieren
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Neues Szenario
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Szenarien gesamt</p>
            <p className="text-2xl font-bold text-slate-800">{summary.gesamt}</p>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Aktiv</p>
            <p className="text-2xl font-bold text-blue-700">{summary.aktiv}</p>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Optimistisch</p>
            <p className="text-2xl font-bold text-emerald-700">{summary.optimistisch}</p>
          </div>
        </Card>
        <Card>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Pessimistisch</p>
            <p className="text-2xl font-bold text-amber-700">{summary.pessimistisch}</p>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {(["ALLE", "BASIS", "OPTIMISTISCH", "PESSIMISTISCH", "STRESS"] as const).map((typ) => {
          const isActive = filterTyp === typ;
          let activeClass = "bg-blue-600 text-white border-blue-600";
          if (isActive && typ === "OPTIMISTISCH") activeClass = "bg-emerald-600 text-white border-emerald-600";
          if (isActive && typ === "PESSIMISTISCH") activeClass = "bg-amber-500 text-white border-amber-500";
          if (isActive && typ === "STRESS") activeClass = "bg-red-600 text-white border-red-600";
          return (
            <button
              key={typ}
              onClick={() => setFilterTyp(typ)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all",
                isActive
                  ? activeClass
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {typ === "ALLE" ? "Alle" : typ}
              {typ !== "ALLE" && (
                <span
                  className={cn(
                    "ml-1.5 text-xs px-1.5 py-0.5 rounded-full",
                    isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
                  )}
                >
                  {szenarien.filter((s) => s.typ === typ).length}
                </span>
              )}
            </button>
          );
        })}
        <span className="ml-auto text-xs text-slate-400">
          {filtered.length} von {szenarien.length} Szenarien
        </span>
      </div>

      {/* Szenarien List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">Keine Szenarien für den gewählten Filter</p>
          </div>
        ) : (
          filtered.map((szenario) => <SzenarioCard key={szenario.id} szenario={szenario} />)
        )}
      </div>

      {/* Footer Note */}
      <p className="text-xs text-slate-400 mt-6 text-center">
        Alle Werte sind Planungsgrößen und dienen ausschließlich internen Analysezwecken.
        Basis-Szenario: Jahresplanung 2025 · Letzte Aktualisierung: 01.03.2025
      </p>
    </div>
  );
}
