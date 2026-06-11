"use client";
export const runtime = 'edge';

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Pencil,
  Save,
  X,
  Info,
  AlertTriangle,
  CheckCircle2,
  Percent,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface SteuerVorlage {
  id: string;
  code: string;
  bezeichnung: string;
  land: string;
  steuersatz: number;
  reverseCharge: boolean;
  aktiv: boolean;
  gueltigAb: string;
  beschreibung: string;
  anwendung: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const INITIAL_VORLAGEN: SteuerVorlage[] = [
  {
    id: "1",
    code: "AT20",
    bezeichnung: "AT-Standard 20 %",
    land: "AT",
    steuersatz: 20,
    reverseCharge: false,
    aktiv: true,
    gueltigAb: "2024-01-01",
    beschreibung: "Österreichische Umsatzsteuer Normalsatz",
    anwendung: "Standardlieferungen innerhalb Österreichs",
  },
  {
    id: "2",
    code: "AT0",
    bezeichnung: "AT-Nullsatz 0 %",
    land: "AT",
    steuersatz: 0,
    reverseCharge: false,
    aktiv: true,
    gueltigAb: "2024-01-01",
    beschreibung: "Steuerbefreite Umsätze gemäß § 6 UStG",
    anwendung: "Export in Drittländer, steuerfreie Leistungen",
  },
  {
    id: "3",
    code: "DE19",
    bezeichnung: "DE-Standard 19 %",
    land: "DE",
    steuersatz: 19,
    reverseCharge: false,
    aktiv: true,
    gueltigAb: "2024-01-01",
    beschreibung: "Deutsche Umsatzsteuer Regelsteuersatz",
    anwendung: "Lieferungen an deutsche Kunden ohne UID",
  },
  {
    id: "4",
    code: "EU-B2B",
    bezeichnung: "EU-B2B 0 % (Reverse Charge)",
    land: "EU",
    steuersatz: 0,
    reverseCharge: true,
    aktiv: true,
    gueltigAb: "2024-01-01",
    beschreibung: "Innergemeinschaftliche Lieferung (§ 6a UStG)",
    anwendung: "B2B-Lieferungen an EU-Unternehmen mit gültiger UID",
  },
  {
    id: "5",
    code: "HU27",
    bezeichnung: "HU-Standard 27 %",
    land: "HU",
    steuersatz: 27,
    reverseCharge: false,
    aktiv: true,
    gueltigAb: "2024-01-01",
    beschreibung: "Ungarische Mehrwertsteuer (ÁFA) Normalsatz",
    anwendung: "Lieferungen an ungarische Kunden ohne UID",
  },
  {
    id: "6",
    code: "SK20",
    bezeichnung: "SK-Standard 20 %",
    land: "SK",
    steuersatz: 20,
    reverseCharge: false,
    aktiv: false,
    gueltigAb: "2024-01-01",
    beschreibung: "Slowakische Mehrwertsteuer DPH Normalsatz",
    anwendung: "Lieferungen an slowakische Kunden ohne UID",
  },
];

const LAND_LABELS: Record<string, string> = {
  AT: "Österreich",
  DE: "Deutschland",
  HU: "Ungarn",
  SK: "Slowakei",
  EU: "EU (B2B)",
};

const LAND_BADGE_COLOR: Record<string, "blue" | "emerald" | "amber" | "violet" | "slate"> = {
  AT: "blue",
  DE: "slate",
  HU: "amber",
  SK: "violet",
  EU: "emerald",
};

// ─── Edit Form ───────────────────────────────────────────────────────────────

interface EditFormProps {
  vorlage: SteuerVorlage;
  onSave: (updated: SteuerVorlage) => void;
  onCancel: () => void;
}

function EditForm({ vorlage, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState<SteuerVorlage>({ ...vorlage });

  const handleChange = (field: keyof SteuerVorlage, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-100 pt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Code"
          value={form.code}
          onChange={e => handleChange("code", e.target.value)}
          required
        />
        <Input
          label="Bezeichnung"
          value={form.bezeichnung}
          onChange={e => handleChange("bezeichnung", e.target.value)}
          required
        />
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-600">Land</label>
          <select
            className="px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-colors"
            value={form.land}
            onChange={e => handleChange("land", e.target.value)}
          >
            {Object.entries(LAND_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>
        <Input
          label="Steuersatz (%)"
          type="number"
          min={0}
          max={100}
          step={0.01}
          suffix={<Percent className="w-3.5 h-3.5" />}
          value={form.steuersatz}
          onChange={e => handleChange("steuersatz", parseFloat(e.target.value) || 0)}
          required
        />
        <Input
          label="Gültig ab"
          type="date"
          value={form.gueltigAb}
          onChange={e => handleChange("gueltigAb", e.target.value)}
        />
        <Input
          label="Anwendung / Kurztext"
          value={form.anwendung}
          onChange={e => handleChange("anwendung", e.target.value)}
        />
        <div className="sm:col-span-2">
          <Input
            label="Beschreibung"
            value={form.beschreibung}
            onChange={e => handleChange("beschreibung", e.target.value)}
          />
        </div>

        {/* Checkboxen */}
        <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.reverseCharge}
              onChange={e => handleChange("reverseCharge", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
            />
            <span className="text-sm text-slate-700 font-medium">Reverse Charge</span>
            <span className="text-xs text-slate-400">(Steuerschuldnerschaft des Leistungsempfängers)</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.aktiv}
              onChange={e => handleChange("aktiv", e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 accent-blue-600"
            />
            <span className="text-sm text-slate-700 font-medium">Aktiv</span>
          </label>
        </div>
      </div>

      {form.reverseCharge && (
        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>
            Bei Reverse Charge muss der Steuersatz auf <strong>0 %</strong> gesetzt sein. Die Steuerschuld
            geht auf den Leistungsempfänger über (§ 19 Abs. 1 UStG / Art. 196 MwStSystRL).
          </span>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 mt-5">
        <Button type="button" variant="ghost" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
          Speichern
        </Button>
      </div>
    </form>
  );
}

// ─── New Vorlage Form ─────────────────────────────────────────────────────────

const EMPTY_VORLAGE: Omit<SteuerVorlage, "id"> = {
  code: "",
  bezeichnung: "",
  land: "AT",
  steuersatz: 20,
  reverseCharge: false,
  aktiv: true,
  gueltigAb: new Date().toISOString().slice(0, 10),
  beschreibung: "",
  anwendung: "",
};

function NewVorlageForm({ onSave, onCancel }: { onSave: (v: SteuerVorlage) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Omit<SteuerVorlage, "id">>({ ...EMPTY_VORLAGE });

  const handleChange = (field: keyof Omit<SteuerVorlage, "id">, value: string | number | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, id: Math.random().toString(36).slice(2, 9) });
  };

  return (
    <Card className="mt-4 border-blue-200">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          Neue Steuervorlage anlegen
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Code"
            placeholder="z. B. AT10"
            value={form.code}
            onChange={e => handleChange("code", e.target.value)}
            required
          />
          <Input
            label="Bezeichnung"
            placeholder="z. B. AT-Ermäßigter Satz 10 %"
            value={form.bezeichnung}
            onChange={e => handleChange("bezeichnung", e.target.value)}
            required
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-slate-600">Land</label>
            <select
              className="px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-colors"
              value={form.land}
              onChange={e => handleChange("land", e.target.value)}
            >
              {Object.entries(LAND_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
          <Input
            label="Steuersatz (%)"
            type="number"
            min={0}
            max={100}
            step={0.01}
            suffix={<Percent className="w-3.5 h-3.5" />}
            value={form.steuersatz}
            onChange={e => handleChange("steuersatz", parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Gültig ab"
            type="date"
            value={form.gueltigAb}
            onChange={e => handleChange("gueltigAb", e.target.value)}
          />
          <Input
            label="Anwendung / Kurztext"
            placeholder="Kurzbeschreibung der Anwendungsfälle"
            value={form.anwendung}
            onChange={e => handleChange("anwendung", e.target.value)}
          />
          <div className="sm:col-span-2">
            <Input
              label="Beschreibung"
              placeholder="Rechtliche Grundlage, gesetzliche Referenz, …"
              value={form.beschreibung}
              onChange={e => handleChange("beschreibung", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.reverseCharge}
                onChange={e => handleChange("reverseCharge", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700 font-medium">Reverse Charge</span>
              <span className="text-xs text-slate-400">(Steuerschuldnerschaft des Leistungsempfängers)</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.aktiv}
                onChange={e => handleChange("aktiv", e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-blue-600"
              />
              <span className="text-sm text-slate-700 font-medium">Aktiv</span>
            </label>
          </div>
        </div>

        {form.reverseCharge && (
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Bei Reverse Charge muss der Steuersatz auf <strong>0 %</strong> gesetzt sein.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-5">
          <Button type="button" variant="ghost" size="sm" icon={<X className="w-3.5 h-3.5" />} onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Vorlage anlegen
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  vorlage: SteuerVorlage;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updated: SteuerVorlage) => void;
  onCancel: () => void;
  onToggleAktiv: (id: string) => void;
}

function VorlageRow({ vorlage, isEditing, onEdit, onSave, onCancel, onToggleAktiv }: RowProps) {
  return (
    <div
      className={cn(
        "border rounded-xl transition-all",
        isEditing
          ? "border-blue-300 bg-blue-50/30 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300",
        !vorlage.aktiv && !isEditing && "opacity-60"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Steuersatz-Pill */}
          <div className="shrink-0 w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-slate-800 leading-none">
              {vorlage.steuersatz}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">%</span>
          </div>

          {/* Main info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5">
                {vorlage.code}
              </span>
              <span className="text-sm font-semibold text-slate-900">{vorlage.bezeichnung}</span>
              <Badge
                label={LAND_LABELS[vorlage.land] ?? vorlage.land}
                color={LAND_BADGE_COLOR[vorlage.land] ?? "slate"}
                size="sm"
              />
              {vorlage.reverseCharge && (
                <Badge label="Reverse Charge" color="amber" size="sm" />
              )}
              {!vorlage.aktiv && <Badge label="Inaktiv" color="red" size="sm" />}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">{vorlage.beschreibung}</p>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              {vorlage.anwendung}
            </p>
          </div>

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => onToggleAktiv(vorlage.id)}
              className={cn(
                "w-9 h-5 rounded-full relative transition-colors",
                vorlage.aktiv ? "bg-emerald-500" : "bg-slate-200"
              )}
              title={vorlage.aktiv ? "Deaktivieren" : "Aktivieren"}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                  vorlage.aktiv ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <Button
              variant={isEditing ? "outline" : "secondary"}
              size="sm"
              icon={<Pencil className="w-3 h-3" />}
              onClick={onEdit}
              disabled={isEditing}
            >
              Bearbeiten
            </Button>
          </div>
        </div>

        {isEditing && (
          <EditForm vorlage={vorlage} onSave={onSave} onCancel={onCancel} />
        )}
      </div>
    </div>
  );
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

function SummaryStats({ vorlagen }: { vorlagen: SteuerVorlage[] }) {
  const aktiv = vorlagen.filter(v => v.aktiv).length;
  const laender = new Set(vorlagen.map(v => v.land)).size;
  const rcCount = vorlagen.filter(v => v.reverseCharge).length;

  const stats = [
    { label: "Steuervorlagen gesamt", value: vorlagen.length, icon: <Percent className="w-4 h-4" />, color: "bg-blue-50 text-blue-600" },
    { label: "Aktive Vorlagen", value: aktiv, icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600" },
    { label: "Länder/Regionen", value: laender, icon: <Info className="w-4 h-4" />, color: "bg-violet-50 text-violet-600" },
    { label: "Reverse-Charge-Regeln", value: rcCount, icon: <AlertTriangle className="w-4 h-4" />, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      {stats.map(s => (
        <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.color)}>
            {s.icon}
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900 leading-none">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Info Banner ──────────────────────────────────────────────────────────────

function InfoBanner() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl mb-5 text-sm text-blue-700">
      <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
      <div>
        <span className="font-semibold">Hinweis:</span>{" "}
        Steuervorlagen werden bei der Kontrakt- und Belegerfassung automatisch anhand von Land und Partnertyp
        (B2B / B2C) vorgeschlagen. Änderungen an bestehenden Vorlagen wirken sich nur auf neue Belege aus.
        Bereits gebuchte Positionen bleiben unverändert.
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SteuernPage() {
  const [vorlagen, setVorlagen] = useState<SteuerVorlage[]>(INITIAL_VORLAGEN);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [filterLand, setFilterLand] = useState<string>("ALLE");
  const [filterAktiv, setFilterAktiv] = useState<string>("ALLE");
  const [savedId, setSavedId] = useState<string | null>(null);

  const landOptions = [
    { value: "ALLE", label: "Alle Länder" },
    ...Object.entries(LAND_LABELS).map(([val, label]) => ({ value: val, label })),
  ];

  const aktivOptions = [
    { value: "ALLE", label: "Alle Status" },
    { value: "AKTIV", label: "Nur aktive" },
    { value: "INAKTIV", label: "Nur inaktive" },
  ];

  const filtered = vorlagen.filter(v => {
    if (filterLand !== "ALLE" && v.land !== filterLand) return false;
    if (filterAktiv === "AKTIV" && !v.aktiv) return false;
    if (filterAktiv === "INAKTIV" && v.aktiv) return false;
    return true;
  });

  const handleSave = (updated: SteuerVorlage) => {
    setVorlagen(prev => prev.map(v => (v.id === updated.id ? updated : v)));
    setEditingId(null);
    setSavedId(updated.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleNewSave = (v: SteuerVorlage) => {
    setVorlagen(prev => [...prev, v]);
    setShowNewForm(false);
    setSavedId(v.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  const handleToggleAktiv = (id: string) => {
    setVorlagen(prev => prev.map(v => (v.id === id ? { ...v, aktiv: !v.aktiv } : v)));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/verwaltung">
              <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />}>
                Verwaltung
              </Button>
            </Link>
            <div className="w-px h-5 bg-slate-200" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">Steuereinstellungen</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                Steuervorlagen, Steuersätze und Reverse-Charge-Regeln
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setShowNewForm(true);
              setEditingId(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={showNewForm}
          >
            Neue Vorlage
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-5xl mx-auto">
        <SummaryStats vorlagen={vorlagen} />
        <InfoBanner />

        {/* New form (top) */}
        {showNewForm && (
          <NewVorlageForm
            onSave={handleNewSave}
            onCancel={() => setShowNewForm(false)}
          />
        )}

        {/* Filter bar */}
        <Card padding="sm" className="mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-1">Filter:</span>
            <div className="flex items-center gap-2">
              {landOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterLand(opt.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    filterLand === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-2">
              {aktivOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilterAktiv(opt.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                    filterAktiv === opt.value
                      ? "bg-slate-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="ml-auto text-xs text-slate-400">
              {filtered.length} von {vorlagen.length} Vorlagen
            </span>
          </div>
        </Card>

        {/* Vorlagen list */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-slate-400">
              Keine Steuervorlagen für den gewählten Filter gefunden.
            </div>
          )}
          {filtered.map(v => (
            <div key={v.id} className="relative">
              {savedId === v.id && (
                <div className="absolute -top-2 right-3 z-10 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full shadow">
                  <CheckCircle2 className="w-3 h-3" />
                  Gespeichert
                </div>
              )}
              <VorlageRow
                vorlage={v}
                isEditing={editingId === v.id}
                onEdit={() => setEditingId(editingId === v.id ? null : v.id)}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
                onToggleAktiv={handleToggleAktiv}
              />
            </div>
          ))}
        </div>

        {/* Rechtlicher Hinweis */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-start gap-2">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
          <span>
            <strong>Rechtlicher Hinweis:</strong> Steuerliche Einstellungen müssen mit dem steuerlichen Berater
            des Unternehmens abgestimmt sein. Die korrekte Anwendung der Steuervorlagen liegt in der
            Verantwortung des Benutzers. Insbesondere bei innergemeinschaftlichen Lieferungen (Reverse Charge,
            § 6a UStG / Art. 138 MwStSystRL) ist eine sorgfältige Prüfung der UID-Nummern erforderlich.
          </span>
        </div>
      </div>
    </div>
  );
}
