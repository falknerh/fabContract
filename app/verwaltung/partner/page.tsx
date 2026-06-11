"use client";

export const runtime = 'edge';

import { useState, useMemo } from "react";
import { Search, Plus, Pencil, Building2, MapPin, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

type PartnerTyp = "LIEFERANT" | "KUNDE" | "BOTH";

const MOCK_PARTNER = [
  { id: "prtn_001", nummer: "P-1001", name: "Agrar Invest Österreich GmbH",   land: "AT", ort: "Wien",       plz: "1010", typ: "BOTH"      as PartnerTyp, aktiv: true,  uid: "ATU12345678" },
  { id: "prtn_002", nummer: "P-1002", name: "Agro Invest Romania SRL",         land: "RO", ort: "București", plz: "010101", typ: "LIEFERANT" as PartnerTyp, aktiv: true,  uid: "RO98765432" },
  { id: "prtn_003", nummer: "P-1003", name: "Magyar Gabona Kft.",               land: "HU", ort: "Budapest",  plz: "1051",   typ: "LIEFERANT" as PartnerTyp, aktiv: true,  uid: "HU55443322" },
  { id: "prtn_004", nummer: "P-1004", name: "Bäckerei Gruppe Schmidt GmbH",    land: "DE", ort: "München",   plz: "80331",  typ: "KUNDE"     as PartnerTyp, aktiv: true,  uid: "DE123456789" },
  { id: "prtn_005", nummer: "P-1005", name: "AlpenMühle Vorarlberg AG",         land: "AT", ort: "Feldkirch", plz: "6800",   typ: "KUNDE"     as PartnerTyp, aktiv: true,  uid: "ATU87654321" },
  { id: "prtn_006", nummer: "P-1006", name: "REWE International AG",            land: "AT", ort: "Wiener Neustadt", plz: "2700", typ: "KUNDE" as PartnerTyp, aktiv: true,  uid: "ATU11223344" },
  { id: "prtn_007", nummer: "P-1007", name: "FrischePack GmbH",                 land: "AT", ort: "Graz",      plz: "8010",   typ: "BOTH"      as PartnerTyp, aktiv: true,  uid: "ATU55667788" },
  { id: "prtn_008", nummer: "P-1008", name: "Tiefkühllogistik Nord GmbH",       land: "DE", ort: "Hamburg",   plz: "20095",  typ: "LIEFERANT" as PartnerTyp, aktiv: false, uid: "DE987654321" },
];

const TYP_LABEL: Record<PartnerTyp, string> = { LIEFERANT: "Lieferant", KUNDE: "Kunde", BOTH: "Lieferant & Kunde" };
const TYP_COLOR: Record<PartnerTyp, string> = {
  LIEFERANT: "bg-blue-50 text-blue-700",
  KUNDE:     "bg-emerald-50 text-emerald-700",
  BOTH:      "bg-purple-50 text-purple-700",
};
const FLAG: Record<string, string> = { AT: "🇦🇹", DE: "🇩🇪", HU: "🇭🇺", RO: "🇷🇴" };

type EditPartner = typeof MOCK_PARTNER[0];

export default function PartnerPage() {
  const [search, setSearch] = useState("");
  const [typFilter, setTypFilter] = useState<PartnerTyp | "ALLE">("ALLE");
  const [landFilter, setLandFilter] = useState("ALLE");
  const [editing, setEditing] = useState<EditPartner | null>(null);
  const [partners, setPartners] = useState(MOCK_PARTNER);
  const [saved, setSaved] = useState(false);

  const filtered = useMemo(() => partners.filter(p => {
    const matchSearch = [p.name, p.nummer, p.ort, p.uid].some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchTyp  = typFilter === "ALLE" || p.typ === typFilter;
    const matchLand = landFilter === "ALLE" || p.land === landFilter;
    return matchSearch && matchTyp && matchLand;
  }), [partners, search, typFilter, landFilter]);

  function handleSave() {
    if (!editing) return;
    setPartners(prev => prev.map(p => p.id === editing.id ? editing : p));
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditing(null); }, 1200);
  }

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Partner-Stammdaten</h1>
          <p className="text-sm text-slate-500 mt-0.5">{partners.length} Partner · {partners.filter(p=>p.aktiv).length} aktiv</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Neuer Partner
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-2 w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Suchen (Name, Nummer, UID…)"
            className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full" />
          {search && <button onClick={() => setSearch("")}><X className="w-3 h-3 text-slate-400" /></button>}
        </div>
        <div className="flex gap-1">
          {(["ALLE","LIEFERANT","KUNDE","BOTH"] as const).map(t => (
            <button key={t} onClick={() => setTypFilter(t)}
              className={cn("px-3 py-1.5 text-xs rounded-lg font-medium border transition-colors",
                typFilter === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300")}>
              {t === "ALLE" ? "Alle" : TYP_LABEL[t as PartnerTyp]}
            </button>
          ))}
        </div>
        <select value={landFilter} onChange={e => setLandFilter(e.target.value)}
          className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 bg-white outline-none">
          <option value="ALLE">Alle Länder</option>
          {["AT","DE","HU","RO"].map(l => <option key={l} value={l}>{FLAG[l]} {l}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card padding="none">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["Nr.", "Name", "Land / Ort", "Typ", "UID", "Status", ""].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-500 text-xs font-mono">{p.nummer}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-900">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {FLAG[p.land]} {p.plz} {p.ort}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", TYP_COLOR[p.typ])}>
                    {TYP_LABEL[p.typ]}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500">{p.uid}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                    p.aktiv ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                    {p.aktiv ? "Aktiv" : "Inaktiv"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(p)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">Keine Partner gefunden</div>
        )}
      </Card>

      {/* Edit drawer */}
      {editing && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(null)} />
          <div className="relative ml-auto w-full max-w-md bg-white shadow-xl flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <p className="font-semibold text-slate-900">Partner bearbeiten</p>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 px-6 py-5 space-y-4">
              {[
                { label: "Name", field: "name" as const },
                { label: "PLZ", field: "plz" as const },
                { label: "Ort", field: "ort" as const },
                { label: "UID", field: "uid" as const },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">{label}</label>
                  <input value={editing[field]} onChange={e => setEditing(prev => prev ? { ...prev, [field]: e.target.value } : prev)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Typ</label>
                <select value={editing.typ} onChange={e => setEditing(prev => prev ? { ...prev, typ: e.target.value as PartnerTyp } : prev)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 bg-white">
                  <option value="LIEFERANT">Lieferant</option>
                  <option value="KUNDE">Kunde</option>
                  <option value="BOTH">Lieferant & Kunde</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">Aktiv</label>
                <button onClick={() => setEditing(prev => prev ? { ...prev, aktiv: !prev.aktiv } : prev)}
                  className={cn("w-10 h-5 rounded-full transition-colors relative",
                    editing.aktiv ? "bg-blue-600" : "bg-slate-200")}>
                  <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                    editing.aktiv ? "translate-x-5" : "translate-x-0.5")} />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                {saved ? "✓ Gespeichert" : "Speichern"}
              </Button>
              <Button variant="secondary" onClick={() => setEditing(null)}>Abbrechen</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
