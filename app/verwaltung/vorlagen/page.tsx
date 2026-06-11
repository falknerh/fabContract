"use client";
export const runtime = 'edge';

import { useState, useMemo } from "react";
import {
  FileText, Plus, Search, Pencil, Copy, Trash2, X,
  ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Tag,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, SelectInput } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type BelegTyp = "EINKAUF" | "VERKAUF" | "STRECKE" | "LAGER";
type VorlagenStatus = "AKTIV" | "INAKTIV" | "ENTWURF";

interface KonditionenSet {
  zahlungsziel: number;
  skonto: number;
  skontofrist: number;
  lieferbedingung: string;
  incotermsOrt?: string;
}

interface Vorlage {
  id: string;
  nummer: string;
  bezeichnung: string;
  belegTyp: BelegTyp;
  status: VorlagenStatus;
  mandant: string;
  konditionenSet: KonditionenSet;
  kopftext?: string;
  fusstext?: string;
  internalNote?: string;
  artikelFilter?: string[];
  partnerFilter?: string[];
  erstelltAm: string;
  geaendertAm: string;
  verwendungen: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_VORLAGEN: Vorlage[] = [
  {
    id: "v001",
    nummer: "VOR-001",
    bezeichnung: "Standard Einkauf AT",
    belegTyp: "EINKAUF",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 30, skonto: 2.0, skontofrist: 10, lieferbedingung: "EXW", incotermsOrt: "Werk Lieferant" },
    kopftext: "Wir bestellen hiermit zu den nachfolgenden Konditionen. Mengen- und Qualitätsunterschiede sind unverzüglich schriftlich zu melden.",
    fusstext: "Es gelten unsere Allgemeinen Einkaufsbedingungen in der jeweils gültigen Fassung. Gerichtsstand: Wien.",
    internalNote: "Standard-Vorlage für inländische Lieferanten (AT). Gilt für alle Getreidekäufe.",
    artikelFilter: ["Getreide", "Ölsaaten"],
    partnerFilter: ["LIEFERANT"],
    erstelltAm: "2024-01-15",
    geaendertAm: "2025-03-10",
    verwendungen: 47,
  },
  {
    id: "v002",
    nummer: "VOR-002",
    bezeichnung: "Standard Verkauf AT",
    belegTyp: "VERKAUF",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 14, skonto: 1.5, skontofrist: 7, lieferbedingung: "DAP", incotermsOrt: "Ort Käufer" },
    kopftext: "Wir bestätigen Ihren Auftrag zu den nachfolgenden Bedingungen. Lieferung erfolgt gemäß vereinbarter INCOTERMS.",
    fusstext: "Es gelten unsere Allgemeinen Verkaufsbedingungen. Eigentumsübergang erst nach vollständiger Bezahlung. Gerichtsstand: Wien.",
    internalNote: "Standard-Vorlage für inländische Kunden (AT). Kürzeres Zahlungsziel wegen Frischeware.",
    artikelFilter: ["Getreide", "Ölsaaten", "Hülsenfrüchte"],
    partnerFilter: ["KUNDE"],
    erstelltAm: "2024-01-15",
    geaendertAm: "2025-04-02",
    verwendungen: 63,
  },
  {
    id: "v003",
    nummer: "VOR-003",
    bezeichnung: "Export Verkauf DE/EU",
    belegTyp: "VERKAUF",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 21, skonto: 2.0, skontofrist: 10, lieferbedingung: "DAP", incotermsOrt: "Bestimmungsort" },
    kopftext: "Exportlieferung gemäß nachfolgender Vereinbarung. Bei Grenzübertritt gelten die Zollvorschriften des Ziellandes.",
    fusstext: "Maßgeblich ist das österreichische Recht. Erfüllungsort und Gerichtsstand Wien. Liefermenge ± 5% zulässig.",
    internalNote: "Für Export DE, HU, CZ, SK. Reverse-Charge prüfen!",
    artikelFilter: ["Getreide"],
    partnerFilter: ["KUNDE"],
    erstelltAm: "2024-02-20",
    geaendertAm: "2025-02-14",
    verwendungen: 28,
  },
  {
    id: "v004",
    nummer: "VOR-004",
    bezeichnung: "Streckengeschäft Basis",
    belegTyp: "STRECKE",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 30, skonto: 0, skontofrist: 0, lieferbedingung: "EXW", incotermsOrt: "Lager Lieferant" },
    kopftext: "Streckengeschäft: Ware wird direkt vom Lieferanten an den Endabnehmer geliefert. Wir agieren als Zwischenhändler.",
    fusstext: "Streckengeschäftsbedingungen gemäß separater Vereinbarung. Haftungsausschluss für Transportschäden.",
    internalNote: "Für Streckengeschäfte ohne physischen Wareneingang. Kein Skonto.",
    artikelFilter: [],
    partnerFilter: ["LIEFERANT", "KUNDE"],
    erstelltAm: "2024-03-05",
    geaendertAm: "2024-11-20",
    verwendungen: 15,
  },
  {
    id: "v005",
    nummer: "VOR-005",
    bezeichnung: "Lagerbewegung Intern",
    belegTyp: "LAGER",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 0, skonto: 0, skontofrist: 0, lieferbedingung: "EXW" },
    kopftext: "Interne Lagerbewegung. Keine externe Rechnungsstellung.",
    fusstext: "",
    internalNote: "Nur für interne Umbuchungen zwischen Lagerorten.",
    artikelFilter: [],
    partnerFilter: [],
    erstelltAm: "2024-03-10",
    geaendertAm: "2024-03-10",
    verwendungen: 112,
  },
  {
    id: "v006",
    nummer: "VOR-006",
    bezeichnung: "Einkauf HU/SK Import",
    belegTyp: "EINKAUF",
    status: "AKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 45, skonto: 3.0, skontofrist: 14, lieferbedingung: "DDP", incotermsOrt: "Lager Wien" },
    kopftext: "Importkauf gemäß nachfolgender Vereinbarung. Zoll- und Steuerabwicklung durch uns.",
    fusstext: "Ursprungszeugnis und Phytosanitärzertifikat sind Pflichtbeilagen. Österreichisches Recht, Gerichtsstand Wien.",
    internalNote: "Für Importe aus Ungarn und Slowakei. DDP Wien inkl. Zoll.",
    artikelFilter: ["Getreide", "Mais"],
    partnerFilter: ["LIEFERANT"],
    erstelltAm: "2024-04-01",
    geaendertAm: "2025-01-08",
    verwendungen: 19,
  },
  {
    id: "v007",
    nummer: "VOR-007",
    bezeichnung: "Saisonvorlage Ernte 2025",
    belegTyp: "EINKAUF",
    status: "INAKTIV",
    mandant: "Agrar Handel Österreich GmbH",
    konditionenSet: { zahlungsziel: 30, skonto: 2.5, skontofrist: 10, lieferbedingung: "EXW", incotermsOrt: "Werk Lieferant" },
    kopftext: "Erntekauf 2025. Konditionen gültig für Ernte 2025/2026.",
    fusstext: "Erntemengen ± 10% zulässig. Qualitätsprüfung bei Übernahme. Natürlicher Schwund trägt Lieferant.",
    internalNote: "Saisonale Vorlage – wird nach Erntekampagne deaktiviert.",
    artikelFilter: ["Getreide", "Raps"],
    partnerFilter: ["LIEFERANT"],
    erstelltAm: "2025-04-15",
    geaendertAm: "2025-04-15",
    verwendungen: 8,
  },
  {
    id: "v008",
    nummer: "VOR-008",
    bezeichnung: "Demo Vorlage (Entwurf)",
    belegTyp: "VERKAUF",
    status: "ENTWURF",
    mandant: "Demo Mandant",
    konditionenSet: { zahlungsziel: 14, skonto: 0, skontofrist: 0, lieferbedingung: "EXW" },
    kopftext: "",
    fusstext: "",
    internalNote: "Testvorlage für Demo-Mandant. Noch nicht freigegeben.",
    artikelFilter: [],
    partnerFilter: [],
    erstelltAm: "2025-05-20",
    geaendertAm: "2025-05-20",
    verwendungen: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const BELEG_TYP_COLORS: Record<BelegTyp, string> = {
  EINKAUF: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  VERKAUF: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  STRECKE: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  LAGER:   "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

const STATUS_CONFIG: Record<VorlagenStatus, { label: string; color: "green" | "slate" | "amber" }> = {
  AKTIV:   { label: "Aktiv",    color: "green" },
  INAKTIV: { label: "Inaktiv", color: "slate" },
  ENTWURF: { label: "Entwurf", color: "amber" },
};

function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}`;
}

// ─── Inline Edit/Create Modal ─────────────────────────────────────────────────

interface ModalVorlage {
  id?: string;
  nummer: string;
  bezeichnung: string;
  belegTyp: BelegTyp;
  status: VorlagenStatus;
  mandant: string;
  zahlungsziel: number;
  skonto: number;
  skontofrist: number;
  lieferbedingung: string;
  incotermsOrt: string;
  kopftext: string;
  fusstext: string;
  internalNote: string;
}

const EMPTY_MODAL: ModalVorlage = {
  nummer: "",
  bezeichnung: "",
  belegTyp: "EINKAUF",
  status: "ENTWURF",
  mandant: "Agrar Handel Österreich GmbH",
  zahlungsziel: 30,
  skonto: 2.0,
  skontofrist: 10,
  lieferbedingung: "EXW",
  incotermsOrt: "",
  kopftext: "",
  fusstext: "",
  internalNote: "",
};

interface EditModalProps {
  initial: ModalVorlage;
  onSave: (v: ModalVorlage) => void;
  onClose: () => void;
}

function EditModal({ initial, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<ModalVorlage>(initial);
  const set = (k: keyof ModalVorlage, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const isNew = !initial.id;
  const canSave = form.bezeichnung.trim() !== "" && (isNew ? form.nummer.trim() !== "" : true);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-12 px-4 pb-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isNew ? "Neue Belegvorlage" : `Vorlage bearbeiten: ${initial.nummer}`}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Konditionenset, Texte und Gültigkeit</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Stammdaten</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Vorlagennummer" value={form.nummer} onChange={e => set("nummer", e.target.value)} placeholder="z.B. VOR-009" disabled={!isNew} required />
              <Input label="Bezeichnung" value={form.bezeichnung} onChange={e => set("bezeichnung", e.target.value)} placeholder="z.B. Standard Einkauf AT" required />
              <SelectInput label="Belegtyp" value={form.belegTyp} onChange={e => set("belegTyp", e.target.value as BelegTyp)} options={[
                { value: "EINKAUF", label: "Einkauf" },
                { value: "VERKAUF", label: "Verkauf" },
                { value: "STRECKE", label: "Streckengeschäft" },
                { value: "LAGER",   label: "Lagerbewegung" },
              ]} />
              <SelectInput label="Status" value={form.status} onChange={e => set("status", e.target.value as VorlagenStatus)} options={[
                { value: "ENTWURF",  label: "Entwurf" },
                { value: "AKTIV",    label: "Aktiv" },
                { value: "INAKTIV",  label: "Inaktiv" },
              ]} />
              <div className="col-span-2">
                <SelectInput label="Mandant" value={form.mandant} onChange={e => set("mandant", e.target.value)} options={[
                  { value: "Agrar Handel Österreich GmbH", label: "Agrar Handel Österreich GmbH" },
                  { value: "Demo Mandant",                  label: "Demo Mandant" },
                ]} />
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Konditionenset</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Zahlungsziel (Tage)" type="number" value={form.zahlungsziel} onChange={e => set("zahlungsziel", Number(e.target.value))} suffix="Tage" />
              <Input label="Skontofrist (Tage)" type="number" value={form.skontofrist} onChange={e => set("skontofrist", Number(e.target.value))} suffix="Tage" />
              <Input label="Skonto (%)" type="number" value={form.skonto} onChange={e => set("skonto", Number(e.target.value))} suffix="%" />
              <SelectInput label="Lieferbedingung (INCOTERMS)" value={form.lieferbedingung} onChange={e => set("lieferbedingung", e.target.value)} options={[
                { value: "EXW", label: "EXW – Ab Werk" },
                { value: "FCA", label: "FCA – Frei Frachtführer" },
                { value: "CPT", label: "CPT – Frachtfrei" },
                { value: "CIP", label: "CIP – Frachtfrei versichert" },
                { value: "DAP", label: "DAP – Geliefert benannter Ort" },
                { value: "DPU", label: "DPU – Geliefert entladen" },
                { value: "DDP", label: "DDP – Geliefert verzollt" },
              ]} />
              <div className="col-span-2">
                <Input label="INCOTERMS-Ort" value={form.incotermsOrt} onChange={e => set("incotermsOrt", e.target.value)} placeholder="z.B. Lager Wien, Werk Lieferant..." />
              </div>
            </div>
          </section>

          <section>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Belegtexte</p>
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Kopftext</label>
                <textarea value={form.kopftext} onChange={e => set("kopftext", e.target.value)} rows={3} placeholder="Erscheint am Beginn des Belegs..." className="px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none transition-colors placeholder-slate-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Fußtext</label>
                <textarea value={form.fusstext} onChange={e => set("fusstext", e.target.value)} rows={3} placeholder="Erscheint am Ende des Belegs (AGB-Verweis, Gerichtsstand...)..." className="px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none transition-colors placeholder-slate-400" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-600">Interne Notiz</label>
                <textarea value={form.internalNote} onChange={e => set("internalNote", e.target.value)} rows={2} placeholder="Wird nicht auf dem Beleg gedruckt..." className="px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 resize-none transition-colors placeholder-slate-400" />
              </div>
            </div>
          </section>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <Button variant="ghost" size="sm" onClick={onClose}>Abbrechen</Button>
          <Button variant="primary" size="sm" disabled={!canSave} onClick={() => onSave(form)} icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            {isNew ? "Vorlage erstellen" : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Expandable Row Detail ────────────────────────────────────────────────────

function VorlageDetail({ vorlage }: { vorlage: Vorlage }) {
  return (
    <div className="px-5 pb-5 pt-3 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-6">
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Konditionenset</p>
        <dl className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <dt className="text-slate-500">Zahlungsziel</dt>
            <dd className="font-medium text-slate-800">{vorlage.konditionenSet.zahlungsziel} Tage</dd>
          </div>
          {vorlage.konditionenSet.skonto > 0 && (
            <div className="flex justify-between text-xs">
              <dt className="text-slate-500">Skonto</dt>
              <dd className="font-medium text-slate-800">{vorlage.konditionenSet.skonto.toFixed(1)}% bei {vorlage.konditionenSet.skontofrist} Tagen</dd>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <dt className="text-slate-500">Lieferbedingung</dt>
            <dd className="font-medium text-slate-800">
              {vorlage.konditionenSet.lieferbedingung}
              {vorlage.konditionenSet.incotermsOrt ? ` – ${vorlage.konditionenSet.incotermsOrt}` : ""}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Belegtexte</p>
        {vorlage.kopftext ? (
          <div className="mb-2">
            <p className="text-[10px] text-slate-400 font-medium mb-0.5">Kopftext</p>
            <p className="text-xs text-slate-600 line-clamp-2">{vorlage.kopftext}</p>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Kein Kopftext definiert</p>
        )}
        {vorlage.fusstext && (
          <div className="mt-1">
            <p className="text-[10px] text-slate-400 font-medium mb-0.5">Fußtext</p>
            <p className="text-xs text-slate-600 line-clamp-2">{vorlage.fusstext}</p>
          </div>
        )}
      </div>

      {((vorlage.artikelFilter && vorlage.artikelFilter.length > 0) ||
        (vorlage.partnerFilter && vorlage.partnerFilter.length > 0)) && (
        <div className="col-span-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">Anwendungsbereich</p>
          <div className="flex items-center gap-3 flex-wrap">
            {vorlage.artikelFilter && vorlage.artikelFilter.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">Artikel:</span>
                {vorlage.artikelFilter.map(a => (
                  <span key={a} className="text-xs bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-2 py-0.5 rounded-full">{a}</span>
                ))}
              </div>
            )}
            {vorlage.partnerFilter && vorlage.partnerFilter.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500">Partner:</span>
                {vorlage.partnerFilter.map(p => (
                  <span key={p} className="text-xs bg-slate-100 text-slate-600 ring-1 ring-slate-200 px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {vorlage.internalNote && (
        <div className="col-span-2 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800">{vorlage.internalNote}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const FILTER_TYP = [
  { label: "Alle Typen", value: "" },
  { label: "Einkauf",    value: "EINKAUF" },
  { label: "Verkauf",    value: "VERKAUF" },
  { label: "Strecke",    value: "STRECKE" },
  { label: "Lager",      value: "LAGER" },
];

const FILTER_STATUS = [
  { label: "Alle Status", value: "" },
  { label: "Aktiv",       value: "AKTIV" },
  { label: "Inaktiv",     value: "INAKTIV" },
  { label: "Entwurf",     value: "ENTWURF" },
];

export default function VorlagenPage() {
  const [vorlagen, setVorlagen] = useState<Vorlage[]>(MOCK_VORLAGEN);
  const [search, setSearch] = useState("");
  const [typFilter, setTypFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("AKTIV");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; initial: ModalVorlage } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = [...vorlagen];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(v =>
        v.nummer.toLowerCase().includes(q) ||
        v.bezeichnung.toLowerCase().includes(q) ||
        v.mandant.toLowerCase().includes(q)
      );
    }
    if (typFilter)    rows = rows.filter(v => v.belegTyp === typFilter);
    if (statusFilter) rows = rows.filter(v => v.status === statusFilter);
    return rows;
  }, [vorlagen, search, typFilter, statusFilter]);

  const aktiveCount  = vorlagen.filter(v => v.status === "AKTIV").length;
  const entwurfCount = vorlagen.filter(v => v.status === "ENTWURF").length;

  function openCreate() {
    const nextNum = `VOR-${String(vorlagen.length + 1).padStart(3, "0")}`;
    setModal({ open: true, initial: { ...EMPTY_MODAL, nummer: nextNum } });
  }

  function openEdit(v: Vorlage) {
    setModal({
      open: true,
      initial: {
        id: v.id,
        nummer: v.nummer,
        bezeichnung: v.bezeichnung,
        belegTyp: v.belegTyp,
        status: v.status,
        mandant: v.mandant,
        zahlungsziel: v.konditionenSet.zahlungsziel,
        skonto: v.konditionenSet.skonto,
        skontofrist: v.konditionenSet.skontofrist,
        lieferbedingung: v.konditionenSet.lieferbedingung,
        incotermsOrt: v.konditionenSet.incotermsOrt ?? "",
        kopftext: v.kopftext ?? "",
        fusstext: v.fusstext ?? "",
        internalNote: v.internalNote ?? "",
      },
    });
  }

  function duplicateVorlage(v: Vorlage) {
    const nextNum = `VOR-${String(vorlagen.length + 1).padStart(3, "0")}`;
    const now = new Date().toISOString().slice(0, 10);
    const copy: Vorlage = {
      ...v,
      id: `v${Date.now()}`,
      nummer: nextNum,
      bezeichnung: `${v.bezeichnung} (Kopie)`,
      status: "ENTWURF",
      verwendungen: 0,
      erstelltAm: now,
      geaendertAm: now,
    };
    setVorlagen(prev => [...prev, copy]);
  }

  function handleSave(form: ModalVorlage) {
    const now = new Date().toISOString().slice(0, 10);
    if (form.id) {
      setVorlagen(prev => prev.map(v =>
        v.id === form.id
          ? {
              ...v,
              bezeichnung: form.bezeichnung,
              belegTyp: form.belegTyp,
              status: form.status,
              mandant: form.mandant,
              konditionenSet: {
                zahlungsziel: form.zahlungsziel,
                skonto: form.skonto,
                skontofrist: form.skontofrist,
                lieferbedingung: form.lieferbedingung,
                incotermsOrt: form.incotermsOrt || undefined,
              },
              kopftext: form.kopftext || undefined,
              fusstext: form.fusstext || undefined,
              internalNote: form.internalNote || undefined,
              geaendertAm: now,
            }
          : v
      ));
    } else {
      const neu: Vorlage = {
        id: `v${Date.now()}`,
        nummer: form.nummer,
        bezeichnung: form.bezeichnung,
        belegTyp: form.belegTyp,
        status: form.status,
        mandant: form.mandant,
        konditionenSet: {
          zahlungsziel: form.zahlungsziel,
          skonto: form.skonto,
          skontofrist: form.skontofrist,
          lieferbedingung: form.lieferbedingung,
          incotermsOrt: form.incotermsOrt || undefined,
        },
        kopftext: form.kopftext || undefined,
        fusstext: form.fusstext || undefined,
        internalNote: form.internalNote || undefined,
        erstelltAm: now,
        geaendertAm: now,
        verwendungen: 0,
      };
      setVorlagen(prev => [...prev, neu]);
    }
    setModal(null);
  }

  function handleDelete(id: string) {
    setVorlagen(prev => prev.filter(v => v.id !== id));
    setDeleteConfirm(null);
    if (expandedId === id) setExpandedId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Belegvorlagen</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {vorlagen.length} Vorlagen &middot; {aktiveCount} aktiv
              {entwurfCount > 0 && ` · ${entwurfCount} Entwurf`}
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={openCreate}>
            Neue Vorlage
          </Button>
        </div>

        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: "Aktive Vorlagen",     value: vorlagen.filter(v => v.status === "AKTIV").length,    color: "text-emerald-600" },
            { label: "Einkauf-Vorlagen",    value: vorlagen.filter(v => v.belegTyp === "EINKAUF").length, color: "text-blue-600" },
            { label: "Verkauf-Vorlagen",    value: vorlagen.filter(v => v.belegTyp === "VERKAUF").length, color: "text-emerald-600" },
            { label: "Gesamt Verwendungen", value: vorlagen.reduce((s, v) => s + v.verwendungen, 0),      color: "text-slate-700" },
          ].map(kpi => (
            <div key={kpi.label} className="text-center min-w-[80px]">
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{kpi.label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2 min-w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nummer, Bezeichnung, Mandant..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
            />
          </div>
          <div className="flex items-center gap-1">
            {FILTER_TYP.map(f => (
              <button key={f.value} onClick={() => setTypFilter(f.value)}
                className={cn("px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                  typFilter === f.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {FILTER_STATUS.map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)}
                className={cn("px-3 py-1.5 text-xs rounded-lg font-medium transition-colors",
                  statusFilter === f.value ? "bg-slate-700 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          <div className="grid grid-cols-[56px_1fr_100px_130px_90px_80px_72px] gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
            <div>Typ</div>
            <div>Vorlage / Mandant</div>
            <div>Konditionen</div>
            <div>INCOTERMS</div>
            <div className="text-center">Status</div>
            <div className="text-center">Verw.</div>
            <div />
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <FileText className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Keine Vorlagen gefunden</p>
              <p className="text-xs mt-1">Filter anpassen oder neue Vorlage erstellen</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map(v => {
                const isExpanded = expandedId === v.id;
                const toDelete   = deleteConfirm === v.id;
                const sc = STATUS_CONFIG[v.status];
                return (
                  <div key={v.id}>
                    <div className={cn("grid grid-cols-[56px_1fr_100px_130px_90px_80px_72px] gap-3 px-5 py-3.5 items-center group transition-colors",
                      isExpanded ? "bg-slate-50" : "hover:bg-slate-50/60")}>
                      <div>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", BELEG_TYP_COLORS[v.belegTyp])}>
                          {v.belegTyp === "STRECKE" ? "STR" : v.belegTyp.slice(0, 3)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setExpandedId(isExpanded ? null : v.id)}
                            className="text-sm font-semibold text-blue-600 hover:underline text-left">
                            {v.bezeichnung}
                          </button>
                          <span className="text-xs text-slate-400">{v.nummer}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{v.mandant}</p>
                        <p className="text-[11px] text-slate-400">Geändert: {formatDate(v.geaendertAm)}</p>
                      </div>
                      <div className="text-xs text-slate-700">
                        <p className="font-medium">{v.konditionenSet.zahlungsziel}T netto</p>
                        {v.konditionenSet.skonto > 0
                          ? <p className="text-slate-500">{v.konditionenSet.skonto}% / {v.konditionenSet.skontofrist}T</p>
                          : <p className="text-slate-400 italic">kein Skonto</p>}
                      </div>
                      <div className="text-xs">
                        <span className="font-semibold text-slate-700">{v.konditionenSet.lieferbedingung}</span>
                        {v.konditionenSet.incotermsOrt && (
                          <p className="text-slate-500 truncate">{v.konditionenSet.incotermsOrt}</p>
                        )}
                      </div>
                      <div className="flex justify-center">
                        <Badge label={sc.label} color={sc.color} size="sm" dot />
                      </div>
                      <div className="text-center">
                        <span className={cn("text-xs font-semibold", v.verwendungen > 0 ? "text-slate-700" : "text-slate-400")}>
                          {v.verwendungen}
                        </span>
                      </div>
                      <div className="flex items-center justify-end gap-0.5">
                        <button onClick={() => setExpandedId(isExpanded ? null : v.id)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Details ein-/ausklappen">
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(v)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Bearbeiten">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => duplicateVorlage(v)}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                          title="Duplizieren">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {toDelete ? (
                          <div className="flex items-center gap-1 ml-1">
                            <button onClick={() => handleDelete(v.id)} className="px-2 py-1 text-[11px] font-medium bg-red-600 text-white rounded hover:bg-red-700 transition-colors">Ja</button>
                            <button onClick={() => setDeleteConfirm(null)} className="px-2 py-1 text-[11px] font-medium bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors">Nein</button>
                          </div>
                        ) : (
                          <button
                            onClick={() => v.verwendungen === 0 ? setDeleteConfirm(v.id) : undefined}
                            className={cn("p-1.5 rounded transition-colors",
                              v.verwendungen === 0 ? "hover:bg-red-50 text-slate-400 hover:text-red-600" : "text-slate-200 cursor-not-allowed")}
                            title={v.verwendungen > 0 ? `In ${v.verwendungen} Kontrakten verwendet – nicht löschbar` : "Löschen"}
                            disabled={v.verwendungen > 0}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {isExpanded && <VorlageDetail vorlage={v} />}
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-500">{filtered.length} von {vorlagen.length} Vorlagen</p>
              <p className="text-xs text-slate-400">Gesamt {filtered.reduce((s, v) => s + v.verwendungen, 0)} Verwendungen in Kontrakten</p>
            </div>
          )}
        </div>
      </div>

      {modal?.open && (
        <EditModal initial={modal.initial} onSave={handleSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
