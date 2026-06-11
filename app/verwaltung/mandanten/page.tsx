"use client";
export const runtime = 'edge';

import { useState } from "react";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Plus,
  X,
  Check,
  Globe,
  Hash,
  MapPin,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Mandant {
  id: string;
  mandantNr: string;
  name: string;
  kurzbezeichnung: string;
  rechtsform: string;
  uid: string;
  steuerId: string;
  finanzamt: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  telefon: string;
  email: string;
  waehrung: string;
  sprache: string;
  aktiv: boolean;
  erstelltAm: string;
  geaendertAm: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const INITIAL_MANDANTEN: Mandant[] = [
  {
    id: "m-001",
    mandantNr: "001",
    name: "Agrar Handel Österreich GmbH",
    kurzbezeichnung: "AHÖ",
    rechtsform: "GmbH",
    uid: "ATU12345678",
    steuerId: "12-345/6789",
    finanzamt: "FA Wien 1/23",
    strasse: "Lassallestraße 5",
    plz: "1020",
    ort: "Wien",
    land: "AT",
    telefon: "+43 1 234 56 78",
    email: "office@agrar-handel.at",
    waehrung: "EUR",
    sprache: "de-AT",
    aktiv: true,
    erstelltAm: "2022-01-15",
    geaendertAm: "2025-03-10",
  },
  {
    id: "m-002",
    mandantNr: "002",
    name: "Demo Mandant",
    kurzbezeichnung: "DEMO",
    rechtsform: "GmbH",
    uid: "ATU99887766",
    steuerId: "99-111/2222",
    finanzamt: "FA Linz",
    strasse: "Teststraße 1",
    plz: "4020",
    ort: "Linz",
    land: "AT",
    telefon: "+43 732 000 000",
    email: "demo@demo.at",
    waehrung: "EUR",
    sprache: "de-AT",
    aktiv: false,
    erstelltAm: "2023-06-01",
    geaendertAm: "2024-11-20",
  },
];

const LAND_LABELS: Record<string, string> = {
  AT: "Österreich",
  DE: "Deutschland",
  HU: "Ungarn",
  CZ: "Tschechien",
  SK: "Slowakei",
};

const SPRACHE_LABELS: Record<string, string> = {
  "de-AT": "Deutsch (Österreich)",
  "de-DE": "Deutsch (Deutschland)",
  "hu-HU": "Ungarisch",
  "en-GB": "Englisch",
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  mandant,
  onSave,
  onClose,
}: {
  mandant: Mandant;
  onSave: (updated: Mandant) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Mandant>({ ...mandant });

  function set(field: keyof Mandant, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Mandant bearbeiten</h2>
            <p className="text-xs text-slate-500 mt-0.5">Nr. {form.mandantNr} – {form.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Firmenname & Kurzbezeichnung */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Firmendaten
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Firmenname"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  required
                />
              </div>
              <Input
                label="Kurzbezeichnung"
                value={form.kurzbezeichnung}
                onChange={(e) => set("kurzbezeichnung", e.target.value)}
              />
              <Input
                label="Rechtsform"
                value={form.rechtsform}
                onChange={(e) => set("rechtsform", e.target.value)}
              />
            </div>
          </section>

          {/* Steuer */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Steuer &amp; UID
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="UID-Nummer"
                value={form.uid}
                onChange={(e) => set("uid", e.target.value)}
              />
              <Input
                label="Steuer-ID"
                value={form.steuerId}
                onChange={(e) => set("steuerId", e.target.value)}
              />
              <div className="col-span-2">
                <Input
                  label="Finanzamt"
                  value={form.finanzamt}
                  onChange={(e) => set("finanzamt", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Adresse */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Adresse
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Input
                  label="Straße & Hausnummer"
                  value={form.strasse}
                  onChange={(e) => set("strasse", e.target.value)}
                />
              </div>
              <Input
                label="PLZ"
                value={form.plz}
                onChange={(e) => set("plz", e.target.value)}
              />
              <Input
                label="Ort"
                value={form.ort}
                onChange={(e) => set("ort", e.target.value)}
              />
              <div className="col-span-2">
                <label className="text-xs font-medium text-slate-600 block mb-1">Land</label>
                <select
                  value={form.land}
                  onChange={(e) => set("land", e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                >
                  {Object.entries(LAND_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl} ({val})</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Kontakt */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Kontakt
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Telefon"
                value={form.telefon}
                onChange={(e) => set("telefon", e.target.value)}
              />
              <Input
                label="E-Mail"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
              />
            </div>
          </section>

          {/* Einstellungen */}
          <section>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Einstellungen
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Währung</label>
                <select
                  value={form.waehrung}
                  onChange={(e) => set("waehrung", e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                >
                  <option value="EUR">EUR – Euro</option>
                  <option value="HUF">HUF – Forint</option>
                  <option value="CZK">CZK – Tschech. Krone</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Sprache</label>
                <select
                  value={form.sprache}
                  onChange={(e) => set("sprache", e.target.value)}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                >
                  {Object.entries(SPRACHE_LABELS).map(([val, lbl]) => (
                    <option key={val} value={val}>{lbl}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Check className="w-3.5 h-3.5" />}
            onClick={() => onSave({ ...form, geaendertAm: new Date().toISOString().slice(0, 10) })}
          >
            Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── New Mandant Modal ────────────────────────────────────────────────────────

function NewMandantModal({
  onSave,
  onClose,
  nextNr,
}: {
  onSave: (m: Mandant) => void;
  onClose: () => void;
  nextNr: string;
}) {
  const blank: Mandant = {
    id: `m-${Date.now()}`,
    mandantNr: nextNr,
    name: "",
    kurzbezeichnung: "",
    rechtsform: "GmbH",
    uid: "",
    steuerId: "",
    finanzamt: "",
    strasse: "",
    plz: "",
    ort: "",
    land: "AT",
    telefon: "",
    email: "",
    waehrung: "EUR",
    sprache: "de-AT",
    aktiv: true,
    erstelltAm: new Date().toISOString().slice(0, 10),
    geaendertAm: new Date().toISOString().slice(0, 10),
  };
  return <EditModal mandant={blank} onSave={onSave} onClose={onClose} />;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
        checked ? "bg-emerald-500" : "bg-slate-300"
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 py-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="text-sm text-slate-800">{value}</p>
      </div>
    </div>
  );
}

// ─── Mandant Card ─────────────────────────────────────────────────────────────

function MandantCard({
  mandant,
  onEdit,
  onToggleAktiv,
}: {
  mandant: Mandant;
  onEdit: () => void;
  onToggleAktiv: (aktiv: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Icon */}
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          mandant.aktiv ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
        )}>
          <Building2 className="w-5 h-5" />
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{mandant.name}</span>
            <Badge label={mandant.kurzbezeichnung} color="slate" size="sm" />
            <Badge
              label={mandant.aktiv ? "Aktiv" : "Inaktiv"}
              color={mandant.aktiv ? "green" : "slate"}
              size="sm"
              dot
            />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandant Nr. {mandant.mandantNr} · {mandant.rechtsform} · {LAND_LABELS[mandant.land] ?? mandant.land}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active toggle */}
          <div className="flex items-center gap-2 mr-2">
            <span className="text-xs text-slate-500 hidden sm:block">
              {mandant.aktiv ? "Aktiv" : "Inaktiv"}
            </span>
            <Toggle checked={mandant.aktiv} onChange={onToggleAktiv} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={onEdit}
          >
            Bearbeiten
          </Button>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title={expanded ? "Zuklappen" : "Details anzeigen"}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0 divide-y divide-slate-100 sm:divide-y-0">
            {/* Column 1: Identifikation */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 pt-2 sm:pt-0">
                Identifikation
              </p>
              <DetailRow icon={Hash} label="UID-Nummer" value={mandant.uid || "–"} />
              <DetailRow icon={FileText} label="Steuer-ID" value={mandant.steuerId || "–"} />
              <DetailRow icon={Building2} label="Finanzamt" value={mandant.finanzamt || "–"} />
            </div>

            {/* Column 2: Adresse */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 pt-2 sm:pt-0">
                Adresse
              </p>
              <DetailRow icon={MapPin} label="Straße" value={mandant.strasse || "–"} />
              <DetailRow icon={MapPin} label="PLZ / Ort" value={`${mandant.plz} ${mandant.ort}`} />
              <DetailRow icon={Globe} label="Land" value={`${LAND_LABELS[mandant.land] ?? mandant.land} (${mandant.land})`} />
            </div>

            {/* Column 3: Kontakt & System */}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1 pt-2 sm:pt-0">
                Kontakt &amp; System
              </p>
              <DetailRow icon={Phone} label="Telefon" value={mandant.telefon || "–"} />
              <DetailRow icon={Mail} label="E-Mail" value={mandant.email || "–"} />
              <DetailRow icon={Globe} label="Währung / Sprache" value={`${mandant.waehrung} · ${SPRACHE_LABELS[mandant.sprache] ?? mandant.sprache}`} />
            </div>
          </div>

          {/* Footer meta */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-[11px] text-slate-400">
            <span>Angelegt: {mandant.erstelltAm}</span>
            <span>Zuletzt geändert: {mandant.geaendertAm}</span>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MandantenPage() {
  const [mandanten, setMandanten] = useState<Mandant[]>(INITIAL_MANDANTEN);
  const [editTarget, setEditTarget] = useState<Mandant | null>(null);
  const [showNew, setShowNew] = useState(false);

  const aktivCount = mandanten.filter((m) => m.aktiv).length;

  function handleSave(updated: Mandant) {
    setMandanten((prev) =>
      prev.some((m) => m.id === updated.id)
        ? prev.map((m) => (m.id === updated.id ? updated : m))
        : [...prev, updated]
    );
    setEditTarget(null);
    setShowNew(false);
  }

  function handleToggleAktiv(id: string, aktiv: boolean) {
    setMandanten((prev) =>
      prev.map((m) => (m.id === id ? { ...m, aktiv, geaendertAm: new Date().toISOString().slice(0, 10) } : m))
    );
  }

  const nextNr = String(mandanten.length + 1).padStart(3, "0");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mandanten</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Rechtliche Einheiten, Firmendetails und Steuerangaben verwalten
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowNew(true)}
          >
            Neuer Mandant
          </Button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-3 flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-900">{mandanten.length}</span>
            <span className="text-slate-500 text-xs leading-tight">Mandanten<br/>gesamt</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-emerald-600">{aktivCount}</span>
            <span className="text-slate-500 text-xs leading-tight">Mandanten<br/>aktiv</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-400">{mandanten.length - aktivCount}</span>
            <span className="text-slate-500 text-xs leading-tight">Mandanten<br/>inaktiv</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4 max-w-5xl">
        {mandanten.map((m) => (
          <MandantCard
            key={m.id}
            mandant={m}
            onEdit={() => setEditTarget(m)}
            onToggleAktiv={(aktiv) => handleToggleAktiv(m.id, aktiv)}
          />
        ))}

        {mandanten.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">Keine Mandanten vorhanden</p>
            <p className="text-xs mt-1">Legen Sie den ersten Mandanten an.</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          mandant={editTarget}
          onSave={handleSave}
          onClose={() => setEditTarget(null)}
        />
      )}

      {/* New Mandant Modal */}
      {showNew && (
        <NewMandantModal
          nextNr={nextNr}
          onSave={handleSave}
          onClose={() => setShowNew(false)}
        />
      )}
    </div>
  );
}
