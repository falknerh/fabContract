"use client";

export const runtime = 'edge';

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ArrowLeftRight, Truck, Package, FileText,
  Edit3, Save, X, CheckCircle, AlertCircle, Info,
  TrendingUp, TrendingDown, MapPin, Calendar, User,
  ExternalLink, Plus, ChevronDown, ChevronUp, MoreHorizontal,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { cn, formatCurrency, formatDate, formatNumber, formatPercent } from "@/lib/utils";

// ─── Mock data ─────────────────────────────────────────────────────────────

const MOCK_STRECKEN = [
  {
    id: "str_001",
    bezeichnung: "Weizen AT → DE (Bäckerei Schmidt)",
    artikelBezeichnung: "Winterweizen A-Qualität",
    artikelNummer: "ART-WW-001",
    einheit: "t",
    menge: 1500,
    lieferVon: "Agrar Invest Österreich GmbH",
    lieferNach: "Bäckerei Gruppe Schmidt GmbH",
    vonOrt: "Linz, AT",
    nachOrt: "München, DE",
    einkaufNummer: "EK-2024-0031",
    einkaufId: "ek_031",
    einkaufPreis: 176.00,
    verkaufNummer: "VK-2024-0018",
    verkaufId: "vk_018",
    verkaufPreis: 232.00,
    erloes: 348000,
    wareneinsatz: 264000,
    frachtkosten: 28500,
    sonstigeKosten: 4200,
    db1: 84000,
    db2: 55500,
    db3: 51300,
    dbProzent: 14.74,
    status: "AKTIV",
    erstelltAm: "2024-09-15",
    erstelltVon: "K. Maier",
    geaendertAm: "2024-11-02",
    gesamtMenge: 1500,
    disponiertesMenge: 1200,
    gelieferteMenge: 900,
    lieferungVon: "2024-10-01",
    lieferungBis: "2024-12-31",
    notizen: "Qualitätsklasse A, Feuchte max. 14,5 %, Fallzahl min. 220 sec.",
    frachtauftraege: [
      { id: "fra_001", nummer: "FRA-2024-0081", spediteur: "Trans Alpine Logistik GmbH", fahrer: "Hans Gruber",  menge: 300, datum: "2024-10-08", status: "GELIEFERT", kosten: 5700 },
      { id: "fra_002", nummer: "FRA-2024-0095", spediteur: "Trans Alpine Logistik GmbH", fahrer: "Franz Huber",  menge: 300, datum: "2024-10-22", status: "GELIEFERT", kosten: 5700 },
      { id: "fra_003", nummer: "FRA-2024-0112", spediteur: "Österreich Fracht AG",       fahrer: "Josef Bauer",  menge: 300, datum: "2024-11-05", status: "GELIEFERT", kosten: 5850 },
      { id: "fra_004", nummer: "FRA-2024-0134", spediteur: "Trans Alpine Logistik GmbH", fahrer: "Hans Gruber",  menge: 300, datum: "2024-11-20", status: "UNTERWEGS", kosten: 5700 },
      { id: "fra_005", nummer: "FRA-2024-0158", spediteur: "Österreich Fracht AG",       fahrer: "—",            menge: 300, datum: "2024-12-10", status: "GEPLANT",   kosten: 5550 },
    ],
    verlauf: [
      { datum: "2024-09-15", typ: "ERSTELLT",   text: "Strecke erstellt von K. Maier",                  user: "K. Maier"  },
      { datum: "2024-09-18", typ: "KONTRAKT",   text: "EK-Kontrakt EK-2024-0031 verknüpft",             user: "K. Maier"  },
      { datum: "2024-09-18", typ: "KONTRAKT",   text: "VK-Kontrakt VK-2024-0018 verknüpft",             user: "K. Maier"  },
      { datum: "2024-10-01", typ: "FRACHT",     text: "Frachtauftrag FRA-2024-0081 erstellt (300 t)",   user: "M. Fischer"},
      { datum: "2024-10-10", typ: "LIEFERUNG",  text: "300 t geliefert — Wareneingang bestätigt",       user: "System"    },
      { datum: "2024-10-22", typ: "FRACHT",     text: "Frachtauftrag FRA-2024-0095 erstellt (300 t)",   user: "M. Fischer"},
      { datum: "2024-10-25", typ: "LIEFERUNG",  text: "300 t geliefert — Wareneingang bestätigt",       user: "System"    },
      { datum: "2024-11-02", typ: "AENDERUNG",  text: "Preis angepasst: 232,00 EUR/t (+2,50 EUR)",      user: "K. Maier"  },
      { datum: "2024-11-06", typ: "LIEFERUNG",  text: "300 t geliefert — Wareneingang bestätigt",       user: "System"    },
      { datum: "2024-11-20", typ: "FRACHT",     text: "Frachtauftrag FRA-2024-0134 gestartet (300 t)",  user: "M. Fischer"},
    ],
  },
  {
    id: "str_002",
    bezeichnung: "Gerste AT → DE (AlpenMühle)",
    artikelBezeichnung: "Sommergerste Brauqualität",
    artikelNummer: "ART-SG-002",
    einheit: "t",
    menge: 300,
    lieferVon: "Agrar Invest Österreich GmbH",
    lieferNach: "AlpenMühle Vorarlberg AG",
    vonOrt: "Salzburg, AT",
    nachOrt: "Bregenz, AT",
    einkaufNummer: "EK-2024-0031",
    einkaufId: "ek_031",
    einkaufPreis: 175.00,
    verkaufNummer: "VK-2024-0022",
    verkaufId: "vk_022",
    verkaufPreis: 210.00,
    erloes: 63000,
    wareneinsatz: 52500,
    frachtkosten: 4800,
    sonstigeKosten: 600,
    db1: 10500,
    db2: 5700,
    db3: 5100,
    dbProzent: 8.09,
    status: "AKTIV",
    erstelltAm: "2024-09-20",
    erstelltVon: "K. Maier",
    geaendertAm: "2024-10-15",
    gesamtMenge: 300,
    disponiertesMenge: 300,
    gelieferteMenge: 150,
    lieferungVon: "2024-10-15",
    lieferungBis: "2024-11-30",
    notizen: "Brauqualität, Protein 11–12 %, Feuchtigkeit max. 14 %",
    frachtauftraege: [
      { id: "fra_010", nummer: "FRA-2024-0099", spediteur: "Alpen Transport GmbH", fahrer: "Ernst Kofler", menge: 150, datum: "2024-10-17", status: "GELIEFERT", kosten: 2400 },
      { id: "fra_011", nummer: "FRA-2024-0145", spediteur: "Alpen Transport GmbH", fahrer: "Ernst Kofler", menge: 150, datum: "2024-11-12", status: "GEPLANT",   kosten: 2400 },
    ],
    verlauf: [
      { datum: "2024-09-20", typ: "ERSTELLT",  text: "Strecke erstellt von K. Maier",        user: "K. Maier"  },
      { datum: "2024-09-22", typ: "KONTRAKT",  text: "EK-Kontrakt EK-2024-0031 verknüpft",   user: "K. Maier"  },
      { datum: "2024-09-22", typ: "KONTRAKT",  text: "VK-Kontrakt VK-2024-0022 verknüpft",   user: "K. Maier"  },
      { datum: "2024-10-15", typ: "FRACHT",    text: "Frachtauftrag FRA-2024-0099 erstellt (150 t)", user: "M. Fischer" },
      { datum: "2024-10-19", typ: "LIEFERUNG", text: "150 t geliefert — Wareneingang bestätigt", user: "System" },
    ],
  },
  {
    id: "str_003",
    bezeichnung: "Mais HU → AT (Eigenverbrauch)",
    artikelBezeichnung: "Körnermais Klasse C1",
    artikelNummer: "ART-KM-003",
    einheit: "t",
    menge: 2000,
    lieferVon: "Magyar Gabona Kft.",
    lieferNach: "Agrar Invest Österreich GmbH",
    vonOrt: "Győr, HU",
    nachOrt: "Wien, AT",
    einkaufNummer: "EK-2024-0044",
    einkaufId: "ek_044",
    einkaufPreis: 188.00,
    verkaufNummer: "VK-2024-0025",
    verkaufId: "vk_025",
    verkaufPreis: 220.00,
    erloes: 440000,
    wareneinsatz: 376000,
    frachtkosten: 22000,
    sonstigeKosten: 3800,
    db1: 64000,
    db2: 42000,
    db3: 38200,
    dbProzent: 8.68,
    status: "AKTIV",
    erstelltAm: "2024-08-10",
    erstelltVon: "A. Weber",
    geaendertAm: "2024-10-30",
    gesamtMenge: 2000,
    disponiertesMenge: 1500,
    gelieferteMenge: 800,
    lieferungVon: "2024-09-01",
    lieferungBis: "2025-01-31",
    notizen: "Herkunft Ungarn, GMO-frei zertifiziert",
    frachtauftraege: [
      { id: "fra_020", nummer: "FRA-2024-0062", spediteur: "Donau Transporte KG",  fahrer: "Péter Kovács",  menge: 400, datum: "2024-09-05", status: "GELIEFERT", kosten: 4400 },
      { id: "fra_021", nummer: "FRA-2024-0078", spediteur: "Donau Transporte KG",  fahrer: "Péter Kovács",  menge: 400, datum: "2024-09-25", status: "GELIEFERT", kosten: 4400 },
      { id: "fra_022", nummer: "FRA-2024-0110", spediteur: "Magyar Freight Bt.",   fahrer: "Zoltán Tóth",   menge: 500, datum: "2024-11-08", status: "UNTERWEGS", kosten: 5500 },
      { id: "fra_023", nummer: "FRA-2024-0162", spediteur: "Donau Transporte KG",  fahrer: "—",             menge: 700, datum: "2024-12-15", status: "GEPLANT",   kosten: 7700 },
    ],
    verlauf: [
      { datum: "2024-08-10", typ: "ERSTELLT",  text: "Strecke erstellt von A. Weber",                  user: "A. Weber"   },
      { datum: "2024-08-12", typ: "KONTRAKT",  text: "EK-Kontrakt EK-2024-0044 verknüpft",             user: "A. Weber"   },
      { datum: "2024-08-12", typ: "KONTRAKT",  text: "VK-Kontrakt VK-2024-0025 verknüpft",             user: "A. Weber"   },
      { datum: "2024-09-03", typ: "FRACHT",    text: "Frachtauftrag FRA-2024-0062 erstellt (400 t)",   user: "M. Fischer" },
      { datum: "2024-09-07", typ: "LIEFERUNG", text: "400 t geliefert — Wareneingang bestätigt",       user: "System"     },
      { datum: "2024-09-23", typ: "FRACHT",    text: "Frachtauftrag FRA-2024-0078 erstellt (400 t)",   user: "M. Fischer" },
      { datum: "2024-09-27", typ: "LIEFERUNG", text: "400 t geliefert — Wareneingang bestätigt",       user: "System"     },
      { datum: "2024-10-30", typ: "AENDERUNG", text: "Spediteur für Restmenge auf Magyar Freight geändert", user: "A. Weber" },
      { datum: "2024-11-08", typ: "FRACHT",    text: "Frachtauftrag FRA-2024-0110 gestartet (500 t)",  user: "M. Fischer" },
    ],
  },
  {
    id: "str_004",
    bezeichnung: "Raps RO → AT (Agro Romania)",
    artikelBezeichnung: "Raps 00-Qualität",
    artikelNummer: "ART-RP-004",
    einheit: "t",
    menge: 500,
    lieferVon: "Agro Invest Romania SRL",
    lieferNach: "Agrar Invest Österreich GmbH",
    vonOrt: "Bukarest, RO",
    nachOrt: "Graz, AT",
    einkaufNummer: "EK-2024-0052",
    einkaufId: "ek_052",
    einkaufPreis: 382.00,
    verkaufNummer: "VK-2024-0031",
    verkaufId: "vk_031",
    verkaufPreis: 437.00,
    erloes: 218500,
    wareneinsatz: 191000,
    frachtkosten: 8500,
    sonstigeKosten: 1200,
    db1: 27500,
    db2: 19000,
    db3: 17800,
    dbProzent: 8.15,
    status: "ABGESCHLOSSEN",
    erstelltAm: "2024-07-01",
    erstelltVon: "K. Maier",
    geaendertAm: "2024-09-30",
    gesamtMenge: 500,
    disponiertesMenge: 500,
    gelieferteMenge: 500,
    lieferungVon: "2024-07-15",
    lieferungBis: "2024-09-30",
    notizen: "Abgeschlossen. Alle Lieferungen erfolgt und abgerechnet.",
    frachtauftraege: [
      { id: "fra_030", nummer: "FRA-2024-0033", spediteur: "East Europe Transport SRL", fahrer: "Ion Popescu",    menge: 250, datum: "2024-07-18", status: "GELIEFERT", kosten: 4250 },
      { id: "fra_031", nummer: "FRA-2024-0048", spediteur: "East Europe Transport SRL", fahrer: "Gheorghe Stan",  menge: 250, datum: "2024-08-22", status: "GELIEFERT", kosten: 4250 },
    ],
    verlauf: [
      { datum: "2024-07-01", typ: "ERSTELLT",       text: "Strecke erstellt von K. Maier",            user: "K. Maier"   },
      { datum: "2024-07-03", typ: "KONTRAKT",       text: "EK-Kontrakt EK-2024-0052 verknüpft",       user: "K. Maier"   },
      { datum: "2024-07-03", typ: "KONTRAKT",       text: "VK-Kontrakt VK-2024-0031 verknüpft",       user: "K. Maier"   },
      { datum: "2024-07-15", typ: "FRACHT",         text: "Frachtauftrag FRA-2024-0033 erstellt (250 t)", user: "M. Fischer" },
      { datum: "2024-07-20", typ: "LIEFERUNG",      text: "250 t geliefert — Wareneingang bestätigt", user: "System"     },
      { datum: "2024-08-20", typ: "FRACHT",         text: "Frachtauftrag FRA-2024-0048 erstellt (250 t)", user: "M. Fischer" },
      { datum: "2024-08-25", typ: "LIEFERUNG",      text: "250 t geliefert — Wareneingang bestätigt", user: "System"     },
      { datum: "2024-09-30", typ: "ABGESCHLOSSEN",  text: "Strecke als Abgeschlossen markiert",       user: "K. Maier"   },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

const VERLAUF_ICONS: Record<string, React.ReactNode> = {
  ERSTELLT:       <Plus className="w-3.5 h-3.5" />,
  KONTRAKT:       <FileText className="w-3.5 h-3.5" />,
  FRACHT:         <Truck className="w-3.5 h-3.5" />,
  LIEFERUNG:      <CheckCircle className="w-3.5 h-3.5" />,
  AENDERUNG:      <Edit3 className="w-3.5 h-3.5" />,
  ABGESCHLOSSEN:  <CheckCircle className="w-3.5 h-3.5" />,
};

const VERLAUF_COLORS: Record<string, string> = {
  ERSTELLT:       "bg-blue-100 text-blue-600",
  KONTRAKT:       "bg-slate-100 text-slate-600",
  FRACHT:         "bg-amber-100 text-amber-600",
  LIEFERUNG:      "bg-emerald-100 text-emerald-600",
  AENDERUNG:      "bg-violet-100 text-violet-600",
  ABGESCHLOSSEN:  "bg-emerald-100 text-emerald-700",
};

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    AKTIV:          { label: "Aktiv",          cls: "bg-blue-50 text-blue-700 ring-blue-200" },
    ABGESCHLOSSEN:  { label: "Abgeschlossen",  cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
    STORNIERT:      { label: "Storniert",      cls: "bg-red-50 text-red-600 ring-red-200" },
    ENTWURF:        { label: "Entwurf",        cls: "bg-slate-100 text-slate-600 ring-slate-200" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-slate-100 text-slate-600 ring-slate-200" };
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset", cls)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {label}
    </span>
  );
}

function DbRow({ label, value, negative, bold, indent, borderTop }: {
  label: string; value: number; negative?: boolean; bold?: boolean; indent?: boolean; borderTop?: boolean;
}) {
  return (
    <div className={cn(
      "flex justify-between items-center text-sm py-1.5",
      borderTop && "border-t border-slate-200 mt-1 pt-2.5",
      indent && "pl-4",
    )}>
      <span className={cn(indent ? "text-slate-500" : "text-slate-700", bold && "font-semibold text-slate-800")}>
        {label}
      </span>
      <span className={cn(
        bold ? "font-bold" : "font-medium",
        negative ? "text-red-500" : value > 0 ? "text-slate-800" : "text-slate-400",
        !negative && bold && value > 0 && "text-blue-700",
      )}>
        {negative ? `− ${formatCurrency(Math.abs(value), "EUR")}` : formatCurrency(value, "EUR")}
      </span>
    </div>
  );
}

function ProgressBar({ geliefert, disponiert, gesamt }: { geliefert: number; disponiert: number; gesamt: number }) {
  const pGeliefert  = gesamt > 0 ? Math.min(100, (geliefert / gesamt) * 100) : 0;
  const pDisponiert = gesamt > 0 ? Math.min(100, ((disponiert - geliefert) / gesamt) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
      <div className="flex h-full">
        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pGeliefert}%` }} />
        <div className="bg-blue-300 h-full transition-all" style={{ width: `${pDisponiert}%` }} />
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function StreckeDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const strecke = MOCK_STRECKEN.find(s => s.id === id) ?? MOCK_STRECKEN[0];

  const [activeTab, setActiveTab] = useState<"uebersicht" | "disposition" | "verlauf">("uebersicht");
  const [savedMsg, setSavedMsg] = useState(false);
  const [showVerlaufAll, setShowVerlaufAll] = useState(false);
  const [editNotizen, setEditNotizen] = useState(false);
  const [notizenText, setNotizenText] = useState(strecke.notizen);

  const frachtGeliefert = strecke.frachtauftraege.filter(f => f.status === "GELIEFERT");
  const frachtUnterwegs = strecke.frachtauftraege.filter(f => f.status === "UNTERWEGS");
  const frachtGeplant   = strecke.frachtauftraege.filter(f => f.status === "GEPLANT");

  const geliefertPct = strecke.gesamtMenge > 0
    ? Math.round((strecke.gelieferteMenge / strecke.gesamtMenge) * 100)
    : 0;

  const pieData = [
    { name: "Geliefert",  value: strecke.gelieferteMenge,                                          fill: "#10B981" },
    { name: "Disponiert", value: Math.max(0, strecke.disponiertesMenge - strecke.gelieferteMenge), fill: "#93C5FD" },
    { name: "Offen",      value: Math.max(0, strecke.gesamtMenge - strecke.disponiertesMenge),     fill: "#E2E8F0" },
  ];

  const dbChartData = [
    { name: "Erlös",         wert: strecke.erloes,         color: "#2563EB" },
    { name: "Wareneinsatz",  wert: strecke.wareneinsatz,   color: "#EF4444" },
    { name: "Frachtkosten",  wert: strecke.frachtkosten,   color: "#F59E0B" },
    { name: "Sonst. Kosten", wert: strecke.sonstigeKosten, color: "#CBD5E1" },
    { name: "DB 3",          wert: strecke.db3,            color: "#10B981" },
  ];

  const verlaufToShow = showVerlaufAll
    ? [...strecke.verlauf].reverse()
    : [...strecke.verlauf].reverse().slice(0, 5);

  const handleSave = () => {
    setSavedMsg(true);
    setEditNotizen(false);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Saved Toast ── */}
      {savedMsg && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg shadow-lg text-sm">
          <CheckCircle className="w-4 h-4" />
          Strecke gespeichert
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center gap-2 px-6 py-3 flex-wrap">
          <Link href="/strecken">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />}>
              Strecken
            </Button>
          </Link>
          <div className="w-px h-5 bg-slate-200" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900">{strecke.bezeichnung}</span>
            <StatusChip status={strecke.status} />
          </div>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" icon={<FileText className="w-3.5 h-3.5" />}>
            Bericht
          </Button>
          <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={handleSave}>
            Speichern
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-0 px-6 border-t border-slate-100">
          {(["uebersicht", "disposition", "verlauf"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {tab === "uebersicht"  && "Übersicht"}
              {tab === "disposition" && `Disposition (${strecke.frachtauftraege.length})`}
              {tab === "verlauf"     && `Verlauf (${strecke.verlauf.length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-[1400px] mx-auto">

        {/* ═══════════════════════════════════════════════════════════
            TAB: ÜBERSICHT
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "uebersicht" && (
          <div className="grid lg:grid-cols-[1fr_340px] gap-5">
            {/* Left Column */}
            <div className="space-y-5">

              {/* Header Info */}
              <Card>
                <div className="grid md:grid-cols-3 gap-5">
                  {/* Artikel */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Artikel</p>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{strecke.artikelBezeichnung}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{strecke.artikelNummer}</p>
                        <p className="text-xs text-slate-400 mt-1">{formatNumber(strecke.menge, 0)} {strecke.einheit} gesamt</p>
                      </div>
                    </div>
                  </div>

                  {/* Route */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Transportroute</p>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Von</p>
                          <p className="text-sm font-medium text-slate-800">{strecke.lieferVon}</p>
                          <p className="text-xs text-slate-400">{strecke.vonOrt}</p>
                        </div>
                      </div>
                      <div className="ml-[7px] w-px h-3 bg-slate-200" />
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Nach</p>
                          <p className="text-sm font-medium text-slate-800">{strecke.lieferNach}</p>
                          <p className="text-xs text-slate-400">{strecke.nachOrt}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zeitraum + Meta */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Zeitraum & Info</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Lieferzeitraum</p>
                          <p className="text-sm text-slate-700">
                            {formatDate(strecke.lieferungVon)} – {formatDate(strecke.lieferungBis)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Erstellt von</p>
                          <p className="text-sm text-slate-700">{strecke.erstelltVon} · {formatDate(strecke.erstelltAm)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <p className="text-xs text-slate-500">Zuletzt geändert</p>
                          <p className="text-sm text-slate-700">{formatDate(strecke.geaendertAm)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notizen */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notizen / Qualitätsvorgaben</p>
                    {!editNotizen && (
                      <button
                        onClick={() => setEditNotizen(true)}
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Bearbeiten
                      </button>
                    )}
                  </div>
                  {editNotizen ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full text-sm text-slate-700 border border-slate-200 rounded-lg p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        value={notizenText}
                        onChange={e => setNotizenText(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-3 h-3" />}>Speichern</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setEditNotizen(false); setNotizenText(strecke.notizen); }}>Abbrechen</Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">{notizenText || "—"}</p>
                  )}
                </div>
              </Card>

              {/* EK / VK Kontrakte */}
              <Card>
                <CardHeader>
                  <CardTitle subtitle="Verknüpfte Kontrakte">Einkauf / Verkauf</CardTitle>
                </CardHeader>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* EK */}
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Einkauf</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono font-medium">
                        {strecke.einkaufNummer}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{strecke.lieferVon}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">EK-Preis</span>
                        <span className="font-medium text-slate-800">{formatCurrency(strecke.einkaufPreis, "EUR")}/{strecke.einheit}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Menge</span>
                        <span className="font-medium text-slate-800">{formatNumber(strecke.menge, 0)} {strecke.einheit}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold border-t border-blue-200 pt-1.5 mt-1.5">
                        <span className="text-slate-600">Wareneinsatz</span>
                        <span className="text-blue-700">{formatCurrency(strecke.wareneinsatz, "EUR")}</span>
                      </div>
                    </div>
                    <Link href={`/kontrakte/${strecke.einkaufId}`}>
                      <Button variant="outline" size="sm" className="w-full mt-3" iconRight={<ExternalLink className="w-3 h-3" />}>
                        Kontrakt öffnen
                      </Button>
                    </Link>
                  </div>

                  {/* VK */}
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Verkauf</span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-mono font-medium">
                        {strecke.verkaufNummer}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">{strecke.lieferNach}</p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">VK-Preis</span>
                        <span className="font-medium text-slate-800">{formatCurrency(strecke.verkaufPreis, "EUR")}/{strecke.einheit}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Menge</span>
                        <span className="font-medium text-slate-800">{formatNumber(strecke.menge, 0)} {strecke.einheit}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold border-t border-emerald-200 pt-1.5 mt-1.5">
                        <span className="text-slate-600">Erlös</span>
                        <span className="text-emerald-700">{formatCurrency(strecke.erloes, "EUR")}</span>
                      </div>
                    </div>
                    <Link href={`/kontrakte/${strecke.verkaufId}`}>
                      <Button variant="outline" size="sm" className="w-full mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-100" iconRight={<ExternalLink className="w-3 h-3" />}>
                        Kontrakt öffnen
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Spread */}
                <div className="mt-4 bg-slate-50 rounded-lg px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArrowLeftRight className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600">Preis-Spread (VK − EK)</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-700">
                      + {formatCurrency(strecke.verkaufPreis - strecke.einkaufPreis, "EUR")}/{strecke.einheit}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatPercent((strecke.verkaufPreis - strecke.einkaufPreis) / strecke.einkaufPreis * 100)} Aufschlag
                    </p>
                  </div>
                </div>
              </Card>

              {/* DB Calculation */}
              <Card>
                <CardHeader
                  actions={
                    <div className={cn(
                      "text-sm font-bold px-3 py-1 rounded-lg",
                      strecke.dbProzent >= 10 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    )}>
                      {strecke.dbProzent >= 10
                        ? <TrendingUp className="w-4 h-4 inline mr-1" />
                        : <TrendingDown className="w-4 h-4 inline mr-1" />
                      }
                      DB III: {formatPercent(strecke.dbProzent)}
                    </div>
                  }
                >
                  <CardTitle subtitle="Vollständige Kalkulation">Deckungsbeitragsrechnung</CardTitle>
                </CardHeader>

                <div className="grid md:grid-cols-[1fr_240px] gap-6">
                  <div>
                    <DbRow label="Umsatzerlöse"       value={strecke.erloes} />
                    <DbRow label="./. Wareneinsatz"    value={strecke.wareneinsatz}   negative indent />
                    <DbRow label="Deckungsbeitrag I"   value={strecke.db1}   bold borderTop />
                    <DbRow label="./. Frachtkosten"    value={strecke.frachtkosten}   negative indent />
                    <DbRow label="Deckungsbeitrag II"  value={strecke.db2}   bold borderTop />
                    <DbRow label="./. Sonstige Kosten" value={strecke.sonstigeKosten} negative indent />
                    <div className="border-t-2 border-slate-300 mt-2 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-slate-900">Deckungsbeitrag III</span>
                        <div className="text-right">
                          <span className={cn(
                            "text-base font-bold",
                            strecke.db3 > 0 ? "text-emerald-700" : "text-red-600"
                          )}>
                            {formatCurrency(strecke.db3, "EUR")}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatPercent(strecke.dbProzent)} vom Erlös
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Per-unit breakdown */}
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Je Einheit ({strecke.einheit})
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "EK-Preis",  value: strecke.einkaufPreis,          color: "text-blue-600" },
                          { label: "VK-Preis",  value: strecke.verkaufPreis,           color: "text-emerald-600" },
                          { label: "DB III/t",  value: strecke.db3 / strecke.menge,   color: strecke.db3 / strecke.menge >= 0 ? "text-slate-800" : "text-red-600" },
                        ].map(item => (
                          <div key={item.label} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                            <p className={cn("text-sm font-bold", item.color)}>
                              {formatCurrency(item.value, "EUR")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mini chart */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 text-center">
                      Kostenstruktur
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={dbChartData} layout="vertical" margin={{ top: 0, right: 8, left: 60, bottom: 0 }}>
                        <XAxis
                          type="number"
                          tick={{ fontSize: 9, fill: "#94A3B8" }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 10, fill: "#64748B" }}
                          axisLine={false}
                          tickLine={false}
                          width={60}
                        />
                        <Tooltip formatter={(v: number) => formatCurrency(v, "EUR")} />
                        <Bar dataKey="wert" radius={[0, 3, 3, 0]}>
                          {dbChartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-4">
              {/* KPI Tiles */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Erlös",        value: formatCurrency(strecke.erloes, "EUR"),      sub: null,                          color: "text-emerald-600" },
                  { label: "DB III",        value: formatCurrency(strecke.db3, "EUR"),         sub: formatPercent(strecke.dbProzent), color: strecke.dbProzent >= 10 ? "text-emerald-600" : "text-amber-600" },
                  { label: "Geliefert",    value: `${formatNumber(strecke.gelieferteMenge, 0)} t`, sub: `${geliefertPct}% von ${formatNumber(strecke.gesamtMenge, 0)} t`, color: "text-blue-600" },
                  { label: "Frachtkosten", value: formatCurrency(strecke.frachtkosten, "EUR"), sub: `${formatNumber(strecke.frachtkosten / strecke.menge, 2)} €/t`,      color: "text-amber-600" },
                ].map(k => (
                  <Card key={k.label} padding="sm">
                    <p className="text-xs text-slate-500 mb-1">{k.label}</p>
                    <p className={cn("text-base font-bold", k.color)}>{k.value}</p>
                    {k.sub && <p className="text-xs text-slate-400 mt-0.5">{k.sub}</p>}
                  </Card>
                ))}
              </div>

              {/* Disposition Summary */}
              <Card>
                <CardHeader>
                  <CardTitle subtitle="Mengenstatus">Disposition</CardTitle>
                </CardHeader>
                <div className="space-y-3">
                  <ProgressBar
                    geliefert={strecke.gelieferteMenge}
                    disponiert={strecke.disponiertesMenge}
                    gesamt={strecke.gesamtMenge}
                  />
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />Geliefert</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-300 rounded-sm inline-block" />Disponiert</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm inline-block" />Offen</span>
                  </div>
                  <div className="space-y-2 text-sm pt-1">
                    {[
                      { label: "Gesamt",     value: strecke.gesamtMenge,                                      color: "text-slate-700" },
                      { label: "Disponiert", value: strecke.disponiertesMenge,                                color: "text-blue-600"  },
                      { label: "Geliefert",  value: strecke.gelieferteMenge,                                  color: "text-emerald-600" },
                      { label: "Offen",      value: strecke.gesamtMenge - strecke.disponiertesMenge,          color: "text-amber-600" },
                    ].map(item => (
                      <div key={item.label} className="flex justify-between">
                        <span className="text-slate-500">{item.label}</span>
                        <span className={cn("font-semibold", item.color)}>
                          {formatNumber(item.value, 0)} {strecke.einheit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab("disposition")}
                  className="w-full mt-3 text-xs text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Truck className="w-3.5 h-3.5" />
                  Frachtaufträge anzeigen
                </button>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle subtitle="Mengenaufteilung">Mengenstatus</CardTitle>
                </CardHeader>
                <div className="flex items-center gap-3">
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={46} paddingAngle={2}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                          <span className="text-slate-600">{d.name}</span>
                        </div>
                        <span className="font-medium text-slate-800">{formatNumber(d.value, 0)} t</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Frachtaufträge Status */}
              <Card>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Frachtaufträge</p>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Geliefert", count: frachtGeliefert.length, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "Unterwegs", count: frachtUnterwegs.length, color: "text-amber-600",   bg: "bg-amber-50"   },
                    { label: "Geplant",   count: frachtGeplant.length,   color: "text-slate-600",   bg: "bg-slate-50"   },
                  ].map(item => (
                    <div key={item.label} className={cn("flex justify-between items-center px-3 py-2 rounded-lg", item.bg)}>
                      <span className="text-slate-600">{item.label}</span>
                      <span className={cn("font-semibold", item.color)}>{item.count}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center px-3 py-2 bg-slate-100 rounded-lg font-semibold">
                    <span className="text-slate-700">Gesamt</span>
                    <span className="text-slate-800">{strecke.frachtauftraege.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: DISPOSITION
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "disposition" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">Frachtaufträge</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {strecke.frachtauftraege.length} Aufträge · {formatNumber(strecke.menge, 0)} {strecke.einheit} gesamt
                </p>
              </div>
              <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
                Frachtauftrag erstellen
              </Button>
            </div>

            {/* Progress overview */}
            <Card padding="sm">
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: "Gesamt",     value: strecke.gesamtMenge,                                         color: "text-slate-800" },
                  { label: "Geliefert",  value: strecke.gelieferteMenge,                                     color: "text-emerald-600" },
                  { label: "Unterwegs",  value: frachtUnterwegs.reduce((s, f) => s + f.menge, 0),            color: "text-amber-600" },
                  { label: "Ausstehend", value: strecke.gesamtMenge - strecke.disponiertesMenge,             color: "text-slate-500" },
                ].map(item => (
                  <div key={item.label}>
                    <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                    <p className={cn("text-lg font-bold", item.color)}>{formatNumber(item.value, 0)} t</p>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <ProgressBar
                  geliefert={strecke.gelieferteMenge}
                  disponiert={strecke.disponiertesMenge}
                  gesamt={strecke.gesamtMenge}
                />
              </div>
            </Card>

            {/* Table */}
            <Card padding="none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Nr.", "Spediteur / Fahrer", "Menge", "Datum", "Frachtkosten", "Status", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {strecke.frachtauftraege.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 font-mono text-xs">{f.nummer}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-800">{f.spediteur}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{f.fahrer}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-slate-800">{formatNumber(f.menge, 0)} t</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(f.datum)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-slate-700">{formatCurrency(f.kosten, "EUR")}</span>
                        <p className="text-xs text-slate-400">{formatCurrency(f.kosten / f.menge, "EUR")}/t</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={f.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800" colSpan={2}>Gesamt</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatNumber(strecke.frachtauftraege.reduce((s, f) => s + f.menge, 0), 0)} t
                    </td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3 text-right font-bold text-slate-900">
                      {formatCurrency(strecke.frachtauftraege.reduce((s, f) => s + f.kosten, 0), "EUR")}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      Ø {formatCurrency(
                        strecke.frachtauftraege.reduce((s, f) => s + f.kosten, 0) /
                        strecke.frachtauftraege.reduce((s, f) => s + f.menge, 0),
                        "EUR"
                      )}/t
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </Card>

            {/* Info */}
            <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Gebuchte Frachtkosten: <strong>{formatCurrency(strecke.frachtauftraege.reduce((s, f) => s + f.kosten, 0), "EUR")}</strong>
                &nbsp;·&nbsp;
                Kalkuliert: <strong>{formatCurrency(strecke.frachtkosten, "EUR")}</strong>
                &nbsp;·&nbsp;
                Differenz: <strong className={
                  strecke.frachtauftraege.reduce((s, f) => s + f.kosten, 0) > strecke.frachtkosten
                    ? "text-red-600"
                    : "text-emerald-600"
                }>
                  {formatCurrency(strecke.frachtauftraege.reduce((s, f) => s + f.kosten, 0) - strecke.frachtkosten, "EUR")}
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            TAB: VERLAUF
        ═══════════════════════════════════════════════════════════ */}
        {activeTab === "verlauf" && (
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Aktivitätsverlauf</p>
              <span className="text-xs text-slate-400">{strecke.verlauf.length} Einträge</span>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />

              <div className="space-y-1">
                {verlaufToShow.map((eintrag, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0 relative z-10",
                      VERLAUF_COLORS[eintrag.typ] ?? "bg-slate-100 text-slate-500"
                    )}>
                      {VERLAUF_ICONS[eintrag.typ] ?? <Info className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm text-slate-800">{eintrag.text}</p>
                        <span className="text-xs text-slate-400 shrink-0 mt-0.5">{formatDate(eintrag.datum)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-500">{eintrag.user}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {strecke.verlauf.length > 5 && (
              <button
                onClick={() => setShowVerlaufAll(!showVerlaufAll)}
                className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                {showVerlaufAll
                  ? <><ChevronUp className="w-4 h-4" />Weniger anzeigen</>
                  : <><ChevronDown className="w-4 h-4" />Alle {strecke.verlauf.length} Einträge anzeigen</>
                }
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
