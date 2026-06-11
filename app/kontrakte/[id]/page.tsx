export const runtime = 'edge';

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Save, Printer, Copy, Trash2, Plus, GripVertical,
  ChevronDown, ChevronUp, Settings2, Image, FileText, Package,
  Truck, Calculator, ExternalLink, AlignLeft, Minus, Info,
  Keyboard, X, CheckCircle, AlertCircle, Edit3, Eye
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, SelectInput } from "@/components/ui/Input";
import { formatCurrency, formatDate, formatNumber, cn } from "@/lib/utils";
import kontrakteData from "@/data/kontrakte.json";
import artikelData    from "@/data/artikel.json";
import type { Kontrakt, KontraktPosition, Artikel } from "@/lib/types";

const ALL_KONTRAKTE = kontrakteData as Kontrakt[];
const ALL_ARTIKEL   = artikelData   as Artikel[];

const STEUEROPTIONEN = [
  { value: "UST20", label: "20% MwSt" },
  { value: "UST10", label: "10% MwSt" },
  { value: "UST0",  label: "0% MwSt (befreit)" },
  { value: "IGEL",  label: "IGEL (ig. Erwerb)" },
];

const EINHEITEN = [
  { value: "t",    label: "Tonnen (t)" },
  { value: "kg",   label: "Kilogramm (kg)" },
  { value: "dt",   label: "Doppelzentner (dt)" },
  { value: "St",   label: "Stück (St)" },
  { value: "Pak",  label: "Packung (Pak)" },
  { value: "Btl",  label: "Beutel (Btl)" },
  { value: "l",    label: "Liter (l)" },
];

// ─── Keyboard shortcut helper ────────────────────────────────────────────

function KbdShortcuts({ onClose }: { onClose: () => void }) {
  const shortcuts = [
    { key: "Tab", desc: "Nächstes Feld" },
    { key: "Shift+Tab", desc: "Vorheriges Feld" },
    { key: "Enter", desc: "Neue Zeile hinzufügen" },
    { key: "F4", desc: "Artikelsuche öffnen" },
    { key: "Del", desc: "Aktuelle Zeile löschen" },
    { key: "⌘+S", desc: "Speichern" },
    { key: "Esc", desc: "Bearbeitung abbrechen" },
    { key: "↑ ↓", desc: "Zeile navigieren" },
    { key: "⌘+D", desc: "Zeile duplizieren" },
    { key: "⌘+Z", desc: "Rückgängig" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-modal w-80 border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-blue-500" />
            Tastenkürzel
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{s.desc}</span>
              <kbd className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Artikel Lookup ───────────────────────────────────────────────────────

function ArtikelLookup({ search, onSelect, onClose }: {
  search: string;
  onSelect: (a: Artikel) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState(search);
  const filtered = ALL_ARTIKEL.filter(a =>
    a.nummer.toLowerCase().includes(q.toLowerCase()) ||
    a.bezeichnung.toLowerCase().includes(q.toLowerCase()) ||
    a.artikelgruppe.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40">
      <div className="bg-white rounded-xl shadow-modal w-[520px] border border-slate-200">
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">
            <Package className="w-4 h-4 text-slate-400" />
            <input
              autoFocus
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Artikel-Nr oder Bezeichnung..."
              className="bg-transparent text-sm text-slate-800 outline-none flex-1"
            />
            <kbd className="text-[10px] bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded">F4</kbd>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
          {filtered.map(a => (
            <button
              key={a.id}
              onClick={() => onSelect(a)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-semibold text-slate-500 shrink-0">
                {a.einheit}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{a.bezeichnung}</p>
                <p className="text-xs text-slate-500">{a.nummer} · {a.artikelgruppe} · {a.warengruppe}</p>
              </div>
              <span className="text-xs text-slate-400 shrink-0">{a.steuercode}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">Kein Artikel gefunden</div>
          )}
        </div>
        <div className="p-3 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-400">{filtered.length} Treffer</p>
          <Button variant="ghost" size="sm" onClick={onClose}>Schließen (Esc)</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Sortable Position Row ────────────────────────────────────────────────

interface SortableRowProps {
  position: KontraktPosition;
  isActive: boolean;
  editMode: boolean;
  onFocus: () => void;
  onUpdate: (field: string, value: string | number) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAddRowBelow: () => void;
  onArtikelLookup: () => void;
}

function SortablePositionRow({
  position, isActive, editMode, onFocus, onUpdate,
  onDelete, onDuplicate, onAddRowBelow, onArtikelLookup
}: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: position.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "F4") { e.preventDefault(); onArtikelLookup(); }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAddRowBelow(); }
    if ((e.key === "Delete" || e.key === "Backspace") && e.ctrlKey) { e.preventDefault(); onDelete(); }
  };

  if (position.typ === "TEXT") {
    return (
      <div ref={setNodeRef} style={style} className={cn("flex items-center gap-2 px-3 py-2 group", isActive && "bg-blue-50")}>
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-300 hover:text-slate-500">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <AlignLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          className="flex-1 text-sm text-slate-600 italic bg-transparent outline-none border-0"
          value={position.texte ?? ""}
          onChange={e => onUpdate("texte", e.target.value)}
          onFocus={onFocus}
          placeholder="Textbaustein eingeben..."
        />
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  if (position.typ === "ZWISCHENSUMME") {
    return (
      <div ref={setNodeRef} style={style} className={cn("flex items-center gap-2 px-3 py-2 bg-slate-50 border-t border-b border-slate-200 group")}>
        <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-300 hover:text-slate-500">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
        <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          className="flex-1 text-xs font-semibold text-slate-700 bg-transparent outline-none uppercase tracking-wide"
          value={position.bezeichnung ?? "Zwischensumme"}
          onChange={e => onUpdate("bezeichnung", e.target.value)}
          onFocus={onFocus}
        />
        <div className="ml-auto text-sm font-bold text-slate-800 pr-4">
          {formatCurrency(position.nettoWert ?? 0, "EUR")}
        </div>
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ARTIKEL position
  const menge = position.menge ?? 0;
  const preis = position.preis ?? 0;
  const rabatt = position.rabattProzent ?? 0;
  const netto  = menge * preis * (1 - rabatt / 100);

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onFocus}
      onKeyDown={handleKeyDown}
      className={cn(
        "grid items-center border-b border-slate-100 group transition-colors text-sm",
        "grid-cols-[28px_40px_1fr_90px_70px_90px_70px_90px_80px_32px]",
        isActive ? "bg-blue-50 border-blue-100" : "hover:bg-slate-50"
      )}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners} className="flex items-center justify-center cursor-grab text-slate-300 hover:text-slate-500 h-10">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Pos# */}
      <div className="text-center text-xs text-slate-400 py-2">{position.positionsnummer}</div>

      {/* Bezeichnung / Artikel */}
      <div className="py-1.5 pr-2 min-w-0">
        <input
          className="pos-cell-input font-medium text-slate-800 w-full"
          value={position.bezeichnung ?? ""}
          onChange={e => onUpdate("bezeichnung", e.target.value)}
          onFocus={onFocus}
          placeholder="F4 — Artikel suchen..."
        />
        {position.artikelId && (
          <p className="text-[10px] text-slate-400 mt-0.5 leading-none">{position.artikelId}</p>
        )}
      </div>

      {/* Menge */}
      <div className="py-1.5 px-1">
        <input
          type="number"
          className="pos-cell-input text-right"
          value={menge || ""}
          onChange={e => onUpdate("menge", parseFloat(e.target.value) || 0)}
          onFocus={onFocus}
          placeholder="0"
        />
      </div>

      {/* Einheit */}
      <div className="py-1.5 px-1">
        <select
          className="pos-cell-input text-slate-600"
          value={position.einheit ?? "t"}
          onChange={e => onUpdate("einheit", e.target.value)}
          onFocus={onFocus}
        >
          {EINHEITEN.map(e => <option key={e.value} value={e.value}>{e.value}</option>)}
        </select>
      </div>

      {/* Preis */}
      <div className="py-1.5 px-1">
        <input
          type="number"
          className="pos-cell-input text-right"
          value={preis || ""}
          onChange={e => onUpdate("preis", parseFloat(e.target.value) || 0)}
          onFocus={onFocus}
          placeholder="0,00"
          step="0.01"
        />
      </div>

      {/* Rabatt % */}
      <div className="py-1.5 px-1">
        <input
          type="number"
          className="pos-cell-input text-right"
          value={rabatt || ""}
          onChange={e => onUpdate("rabattProzent", parseFloat(e.target.value) || 0)}
          onFocus={onFocus}
          placeholder="0"
          step="0.1"
        />
      </div>

      {/* Netto */}
      <div className="py-1.5 px-2 text-right font-medium text-slate-700">
        {netto > 0 ? formatCurrency(netto, "EUR") : "—"}
      </div>

      {/* MwSt */}
      <div className="py-1.5 px-1">
        <select
          className="pos-cell-input text-[10px] text-slate-500"
          value={position.steuercode ?? "UST20"}
          onChange={e => onUpdate("steuercode", e.target.value)}
          onFocus={onFocus}
        >
          {STEUEROPTIONEN.map(o => <option key={o.value} value={o.value}>{o.value}</option>)}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-center">
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function KontraktDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params.id as string;

  const original = ALL_KONTRAKTE.find(k => k.id === id);
  const [kontrakt, setKontrakt] = useState<Kontrakt | null>(original ?? null);
  const [positionen, setPositionen] = useState<KontraktPosition[]>(original?.positionen ?? []);
  const [activePos, setActivePos] = useState<string | null>(null);
  const [showKbd, setShowKbd] = useState(false);
  const [showArtikelLookup, setShowArtikelLookup] = useState(false);
  const [artikelSearch, setArtikelSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [activeSection, setActiveSection] = useState<"positionen" | "konditionen" | "disposition" | "dokumente">("positionen");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setPositionen(items => {
        const oldIdx = items.findIndex(i => i.id === active.id);
        const newIdx = items.findIndex(i => i.id === over?.id);
        const moved = arrayMove(items, oldIdx, newIdx);
        return moved.map((p, i) => ({
          ...p,
          positionsnummer: (i + 1) * 10,
        }));
      });
    }
  };

  const addPosition = (typ: KontraktPosition["typ"] = "ARTIKEL") => {
    const newPos: KontraktPosition = {
      id: `pos_new_${Date.now()}`,
      positionsnummer: (positionen.length + 1) * 10,
      typ,
      ebene: 0,
      ...(typ === "ARTIKEL" ? { menge: 0, einheit: "t", preis: 0, steuercode: "UST20" } : {}),
      ...(typ === "ZWISCHENSUMME" ? { bezeichnung: "Zwischensumme" } : {}),
    };
    setPositionen(p => [...p, newPos]);
    setActivePos(newPos.id);
  };

  const updatePosition = (id: string, field: string, value: string | number) => {
    setPositionen(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const deletePosition = (id: string) => {
    setPositionen(prev => prev.filter(p => p.id !== id));
    setActivePos(null);
  };

  const duplicatePosition = (id: string) => {
    const idx = positionen.findIndex(p => p.id === id);
    if (idx < 0) return;
    const orig = positionen[idx];
    const copy = { ...orig, id: `pos_dup_${Date.now()}` };
    setPositionen(prev => {
      const arr = [...prev];
      arr.splice(idx + 1, 0, copy);
      return arr.map((p, i) => ({ ...p, positionsnummer: (i + 1) * 10 }));
    });
    setActivePos(copy.id);
  };

  const handleArtikelSelect = (artikel: Artikel) => {
    if (!activePos) return;
    updatePosition(activePos, "artikelId", artikel.id);
    updatePosition(activePos, "bezeichnung", artikel.bezeichnung);
    updatePosition(activePos, "einheit", artikel.einheit);
    updatePosition(activePos, "steuercode", artikel.steuercode);
    setShowArtikelLookup(false);
  };

  // Totals
  const summeNetto = positionen
    .filter(p => p.typ === "ARTIKEL")
    .reduce((s, p) => s + (p.menge ?? 0) * (p.preis ?? 0) * (1 - (p.rabattProzent ?? 0) / 100), 0);

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
      }
      if (e.key === "Escape") {
        setShowArtikelLookup(false);
        setShowKbd(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!kontrakt) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-slate-400">
        <FileText className="w-12 h-12 mb-3 opacity-30" />
        <p>Kontrakt nicht gefunden</p>
        <Link href="/kontrakte" className="mt-3">
          <Button variant="secondary" size="sm">← Zurück</Button>
        </Link>
      </div>
    );
  }

  const artikelPositionen = positionen.filter(p => p.typ === "ARTIKEL");
  const gesamtMenge = artikelPositionen.reduce((s, p) => s + (p.menge ?? 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {showKbd && <KbdShortcuts onClose={() => setShowKbd(false)} />}
      {showArtikelLookup && (
        <ArtikelLookup
          search={artikelSearch}
          onSelect={handleArtikelSelect}
          onClose={() => setShowArtikelLookup(false)}
        />
      )}

      {/* Saved toast */}
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm animate-slide-in">
          <CheckCircle className="w-4 h-4" />
          Kontrakt gespeichert
        </div>
      )}

      {/* ─── Toolbar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[56px] z-30">
        <div className="flex items-center gap-2 px-6 py-3 flex-wrap">
          {/* Back */}
          <Link href="/kontrakte">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />}>
              Kontrakte
            </Button>
          </Link>
          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-slate-600">
            <span className="font-semibold text-slate-900">{kontrakt.nummer}</span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-500">{kontrakt.partner.name}</span>
          </div>

          <StatusBadge status={kontrakt.status} />

          {kontrakt.belegvariante === "ABRUF" && (
            <span className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded font-medium">
              Abruf #{kontrakt.abrufNummer} aus {kontrakt.rahmenKontraktId}
            </span>
          )}

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={() => setShowKbd(true)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Tastenkürzel (⌘?)"
          >
            <Keyboard className="w-4 h-4" />
          </button>
          <Button variant="ghost"     size="sm" icon={<Printer className="w-3.5 h-3.5" />}>Drucken</Button>
          <Button variant="ghost"     size="sm" icon={<Copy    className="w-3.5 h-3.5" />}>Kopieren</Button>
          <Button
            variant={editMode ? "primary" : "secondary"}
            size="sm"
            icon={editMode ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Vorschau" : "Bearbeiten"}
          </Button>
          <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>
            Speichern <kbd className="ml-1 text-[10px] bg-white/20 px-1.5 py-0.5 rounded">⌘S</kbd>
          </Button>
        </div>
      </div>

      <div className="p-6 grid lg:grid-cols-[1fr_300px] gap-5">
        {/* ─── Left: Main Content ── */}
        <div className="space-y-5">

          {/* Header Card */}
          <Card>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Belegdaten</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs text-slate-500">Belegart</label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ring-1 ring-inset ${kontrakt.belegart === "EINKAUF" ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"}`}>
                        {kontrakt.belegart}
                      </span>
                      <span className="text-xs text-slate-500">{kontrakt.belegvariante}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Belegnummer</label>
                    <p className="text-sm font-semibold text-slate-800">{kontrakt.nummer}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Datum</label>
                    <p className="text-sm text-slate-700">{formatDate(kontrakt.datum)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Gültigkeitszeitraum</label>
                    <p className="text-sm text-slate-700">
                      {formatDate(kontrakt.gueltigVon)}
                      {kontrakt.gueltigBis && ` – ${formatDate(kontrakt.gueltigBis)}`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Partner</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs text-slate-500">{kontrakt.belegart === "EINKAUF" ? "Lieferant" : "Kunde"}</label>
                    <p className="text-sm font-semibold text-slate-800">{kontrakt.partner.name}</p>
                    <p className="text-xs text-slate-500">{kontrakt.partner.nummer} · {kontrakt.partner.land}</p>
                  </div>
                  {kontrakt.filiale && (
                    <div>
                      <label className="text-xs text-slate-500">Filiale / Lager</label>
                      <p className="text-sm text-slate-700">{kontrakt.filialeId}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-slate-500">Unser Zeichen</label>
                    <p className="text-sm text-slate-700">{kontrakt.unserZeichen ?? "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Ihr Zeichen</label>
                    <p className="text-sm text-slate-700">{kontrakt.ihrZeichen ?? "—"}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Konditionen</p>
                <div className="space-y-2.5">
                  <div>
                    <label className="text-xs text-slate-500">Lieferbedingung (INCOTERMS)</label>
                    <p className="text-sm font-semibold text-slate-800">{kontrakt.lieferbedingung}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Lieferort</label>
                    <p className="text-sm text-slate-700">{kontrakt.lieferort ?? "—"}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Zahlungsbedingung</label>
                    <p className="text-sm text-slate-700">{kontrakt.zahlungsbedingung}</p>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500">Währung</label>
                    <p className="text-sm text-slate-700">{kontrakt.waehrung}</p>
                  </div>
                </div>
              </div>
            </div>

            {kontrakt.beschreibung && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="text-xs text-slate-500">Beschreibung</label>
                <p className="text-sm text-slate-700 mt-1">{kontrakt.beschreibung}</p>
              </div>
            )}
          </Card>

          {/* Section Tabs */}
          <div className="flex items-center gap-0 border-b border-slate-200 bg-white px-4 rounded-t-xl">
            {(["positionen", "konditionen", "disposition", "dokumente"] as const).map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSection(sec)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize",
                  activeSection === sec
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {sec === "positionen"  && <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" />Positionen ({artikelPositionen.length})</span>}
                {sec === "konditionen" && <span className="flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" />Konditionen</span>}
                {sec === "disposition" && <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" />Disposition</span>}
                {sec === "dokumente"   && <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />Dokumente</span>}
              </button>
            ))}
          </div>

          {/* ─── Positionen ── */}
          {activeSection === "positionen" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-card overflow-hidden">
              {/* Column Headers */}
              <div className="grid grid-cols-[28px_40px_1fr_90px_70px_90px_70px_90px_80px_32px] gap-0 px-0 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                <div />
                <div className="text-center">Pos</div>
                <div className="px-2">Bezeichnung / Artikel</div>
                <div className="px-1 text-right">Menge</div>
                <div className="px-1">Einheit</div>
                <div className="px-1 text-right">Preis</div>
                <div className="px-1 text-right">Rabatt%</div>
                <div className="px-2 text-right">Netto</div>
                <div className="px-1">MwSt</div>
                <div />
              </div>

              {/* Sortable Rows */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={positionen.map(p => p.id)} strategy={verticalListSortingStrategy}>
                  {positionen.map(pos => (
                    <SortablePositionRow
                      key={pos.id}
                      position={pos}
                      isActive={activePos === pos.id}
                      editMode={editMode}
                      onFocus={() => setActivePos(pos.id)}
                      onUpdate={(field, value) => updatePosition(pos.id, field, value)}
                      onDelete={() => deletePosition(pos.id)}
                      onDuplicate={() => duplicatePosition(pos.id)}
                      onAddRowBelow={() => {
                        const idx = positionen.findIndex(p => p.id === pos.id);
                        const newPos: KontraktPosition = {
                          id: `pos_new_${Date.now()}`,
                          positionsnummer: (idx + 1.5) * 10,
                          typ: "ARTIKEL",
                          ebene: 0,
                          menge: 0, einheit: "t", preis: 0, steuercode: "UST20"
                        };
                        setPositionen(prev => {
                          const arr = [...prev];
                          arr.splice(idx + 1, 0, newPos);
                          return arr.map((p, i) => ({ ...p, positionsnummer: (i + 1) * 10 }));
                        });
                        setActivePos(newPos.id);
                      }}
                      onArtikelLookup={() => {
                        setActivePos(pos.id);
                        setArtikelSearch(pos.bezeichnung ?? "");
                        setShowArtikelLookup(true);
                      }}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add row buttons */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => addPosition("ARTIKEL")}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Position
                </button>
                <button
                  onClick={() => addPosition("TEXT")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  Textzeile
                </button>
                <button
                  onClick={() => addPosition("ZWISCHENSUMME")}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  Zwischensumme
                </button>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-slate-400">
                  <span>F4 = Artikelsuche</span>
                  <span>·</span>
                  <span>Enter = neue Zeile</span>
                  <button
                    onClick={() => setShowKbd(true)}
                    className="ml-1 p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Keyboard className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Konditionen ── */}
          {activeSection === "konditionen" && (
            <Card className="rounded-t-none border-t-0">
              {kontrakt.konditionenAllgemein && kontrakt.konditionenAllgemein.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Allgemeine Kontraktbedingungen</p>
                  <div className="divide-y divide-slate-100">
                    {kontrakt.konditionenAllgemein.map(k => (
                      <div key={k.id} className="flex items-center gap-4 py-2.5">
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium shrink-0">{k.typ}</span>
                        <span className="text-sm text-slate-700 font-medium">{k.bezeichnung}</span>
                        <span className="text-sm text-slate-600 ml-auto">{k.wert}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Keine allgemeinen Konditionen definiert
                </div>
              )}
            </Card>
          )}

          {/* ─── Disposition ── */}
          {activeSection === "disposition" && (
            <Card className="rounded-t-none border-t-0">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Dispositionsübersicht</p>
                  <p className="text-xs text-slate-500 mt-0.5">Abrufe & Warenbewegungen</p>
                </div>
                <Link href={`/kontrakte/${id}/disposition`}>
                  <Button variant="secondary" size="sm" iconRight={<ExternalLink className="w-3 h-3" />}>
                    Detail
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">Gesamtmenge</p>
                  <p className="text-lg font-bold text-slate-800">{formatNumber(kontrakt.gesamtMenge ?? 0, 0)} t</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-600">Disponiert</p>
                  <p className="text-lg font-bold text-blue-700">{formatNumber(kontrakt.disponiertesMenge ?? 0, 0)} t</p>
                  <p className="text-xs text-blue-500">{((kontrakt.disponiertesMenge ?? 0) / (kontrakt.gesamtMenge ?? 1) * 100).toFixed(0)}% von Gesamt</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-600">Geliefert</p>
                  <p className="text-lg font-bold text-emerald-700">{formatNumber(kontrakt.gelieferteMenge ?? 0, 0)} t</p>
                  <p className="text-xs text-emerald-500">{((kontrakt.gelieferteMenge ?? 0) / (kontrakt.gesamtMenge ?? 1) * 100).toFixed(0)}% von Gesamt</p>
                </div>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                <div
                  className="bg-emerald-500 h-2.5 rounded-full relative"
                  style={{ width: `${Math.min(100, ((kontrakt.gelieferteMenge ?? 0) / (kontrakt.gesamtMenge ?? 1)) * 100)}%` }}
                >
                  <div
                    className="absolute top-0 right-0 h-full bg-blue-300 rounded-r-full"
                    style={{ width: `${Math.min(100, (((kontrakt.disponiertesMenge ?? 0) - (kontrakt.gelieferteMenge ?? 0)) / (kontrakt.gesamtMenge ?? 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="text-xs text-slate-400 flex gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />Geliefert</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-300 rounded-sm inline-block" />Disponiert (offen)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm inline-block" />Noch nicht disponiert</span>
              </div>
            </Card>
          )}

          {/* ─── Dokumente ── */}
          {activeSection === "dokumente" && (
            <Card className="rounded-t-none border-t-0">
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keine Dokumente angehängt</p>
                <Button variant="secondary" size="sm" className="mt-3" icon={<Plus className="w-3.5 h-3.5" />}>
                  Dokument hinzufügen
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* ─── Right: Summary Sidebar ── */}
        <div className="space-y-4">
          {/* Totals */}
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Belegzusammenfassung</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Positionen</span>
                <span className="font-medium">{artikelPositionen.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Gesamtmenge</span>
                <span className="font-medium">{formatNumber(gesamtMenge, 0)} t</span>
              </div>
              <div className="border-t border-slate-100 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Summe netto</span>
                  <span className="font-semibold">{formatCurrency(summeNetto, kontrakt.waehrung)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400 text-xs">MwSt</span>
                  <span className="text-xs text-slate-500">{formatCurrency(summeNetto * 0.1, kontrakt.waehrung)}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800">Gesamt brutto</span>
                  <span className="font-bold text-slate-900">{formatCurrency(summeNetto * 1.1, kontrakt.waehrung)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Disposition Quick Summary */}
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Disposition</p>
            <div className="space-y-2.5">
              {[
                { label: "Gesamt",        value: kontrakt.gesamtMenge ?? 0,       color: "text-slate-700" },
                { label: "Disponiert",    value: kontrakt.disponiertesMenge ?? 0, color: "text-blue-600" },
                { label: "Geliefert",     value: kontrakt.gelieferteMenge ?? 0,   color: "text-emerald-600" },
                { label: "Offen",         value: (kontrakt.gesamtMenge ?? 0) - (kontrakt.disponiertesMenge ?? 0), color: "text-amber-600" },
              ].map(item => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{item.label}</span>
                  <span className={`font-semibold ${item.color}`}>{formatNumber(item.value, 0)} t</span>
                </div>
              ))}
            </div>
            <Link href={`/kontrakte/${id}/disposition`}>
              <Button variant="outline" size="sm" className="w-full mt-3" icon={<Truck className="w-3.5 h-3.5" />}>
                Disposition verwalten
              </Button>
            </Link>
          </Card>

          {/* Meta */}
          <Card>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Beleginfo</p>
            <div className="space-y-2 text-xs text-slate-500">
              <div className="flex justify-between"><span>Erstellt</span><span className="text-slate-700">{formatDate(kontrakt.erstelltAm)}</span></div>
              <div className="flex justify-between"><span>Erstellt von</span><span className="text-slate-700">{kontrakt.erstelltVon}</span></div>
              <div className="flex justify-between"><span>Geändert</span><span className="text-slate-700">{formatDate(kontrakt.geaendertAm)}</span></div>
              <div className="flex justify-between"><span>Mandant</span><span className="text-slate-700">AT-001</span></div>
              <div className="flex justify-between"><span>Steuervorlage</span><span className="text-slate-700">{kontrakt.steuerVorlage}</span></div>
            </div>
          </Card>

          {kontrakt.notizen && (
            <Card>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Notizen</p>
              <p className="text-xs text-slate-600 leading-relaxed">{kontrakt.notizen}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
