"use client";

export const runtime = 'edge';

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Truck, Package, Calendar, Plus, Download,
  CheckCircle, Clock, AlertCircle, XCircle, ChevronDown,
  ChevronRight, Filter, BarChart2, ArrowRight, MapPin,
  FileText, RefreshCw, Eye
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDate, formatNumber, cn } from "@/lib/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────

interface DispoPosition {
  id: string;
  positionsnummer: number;
  bezeichnung: string;
  einheit: string;
  mengeSoll: number;
  mengeDisponiert: number;
  mengeGeliefert: number;
  preis: number;
}

interface Abruf {
  id: string;
  nummer: string;
  datum: string;
  lieferDatum: string;
  status: "GEPLANT" | "FREIGEGEBEN" | "UNTERWEGS" | "GELIEFERT" | "STORNIERT";
  artikel: string;
  menge: number;
  einheit: string;
  lager: string;
  fahrer: string;
  kennzeichen: string;
  notiz?: string;
}

interface Warenbewegung {
  id: string;
  datum: string;
  typ: "EINGANG" | "AUSGANG" | "UMLAGERUNG";
  artikel: string;
  menge: number;
  einheit: string;
  lagerVon: string;
  lagerNach: string;
  lieferscheinNr: string;
  fahrer?: string;
  qualitaet?: {
    feuchte?: number;
    protein?: number;
    hektoliter?: number;
  };
  abrufId?: string;
}

const MOCK_KONTRAKT = {
  id: "ktr_001",
  nummer: "EK-2024-0031",
  belegart: "EINKAUF",
  partner: "Agrar Invest Österreich GmbH",
  status: "TEILGELIEFERT",
  gesamtMenge: 4000,
  disponiertesMenge: 2250,
  gelieferteMenge: 1750,
  waehrung: "EUR",
  lieferbedingung: "DAP",
  lieferort: "Lager Wien, Simmering",
};

const MOCK_POSITIONEN: DispoPosition[] = [
  {
    id: "pos_001_01",
    positionsnummer: 10,
    bezeichnung: "Winterweizen Qualität A",
    einheit: "t",
    mengeSoll: 2000,
    mengeDisponiert: 1500,
    mengeGeliefert: 1200,
    preis: 218.50,
  },
  {
    id: "pos_001_02",
    positionsnummer: 20,
    bezeichnung: "Winterweizen Qualität B",
    einheit: "t",
    mengeSoll: 1500,
    mengeDisponiert: 500,
    mengeGeliefert: 350,
    preis: 205.00,
  },
  {
    id: "pos_001_04",
    positionsnummer: 40,
    bezeichnung: "Winterweizen Qualität A – Bioware",
    einheit: "t",
    mengeSoll: 500,
    mengeDisponiert: 250,
    mengeGeliefert: 200,
    preis: 295.00,
  },
];

const MOCK_ABRUFE: Abruf[] = [
  {
    id: "abr_001",
    nummer: "ABR-2024-0031-001",
    datum: "2024-07-10",
    lieferDatum: "2024-07-18",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität A",
    menge: 250,
    einheit: "t",
    lager: "Lager Wien, Simmering",
    fahrer: "Weiss Transport GmbH",
    kennzeichen: "W-WT-4412",
    notiz: "Anlieferung in 5 Teilfuhren à 50t",
  },
  {
    id: "abr_002",
    nummer: "ABR-2024-0031-002",
    datum: "2024-07-28",
    lieferDatum: "2024-08-05",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität A",
    menge: 300,
    einheit: "t",
    lager: "Lager Wien, Simmering",
    fahrer: "Huber Spedition KG",
    kennzeichen: "NÖ-HS-2210",
  },
  {
    id: "abr_003",
    nummer: "ABR-2024-0031-003",
    datum: "2024-08-15",
    lieferDatum: "2024-08-22",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität A",
    menge: 200,
    einheit: "t",
    lager: "Lager Linz, Hafen",
    fahrer: "Weiss Transport GmbH",
    kennzeichen: "W-WT-4412",
  },
  {
    id: "abr_004",
    nummer: "ABR-2024-0031-004",
    datum: "2024-09-02",
    lieferDatum: "2024-09-10",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität A – Bioware",
    menge: 100,
    einheit: "t",
    lager: "Bio-Lager Graz",
    fahrer: "Ökofrisch Logistik GmbH",
    kennzeichen: "GZ-ÖF-8801",
    notiz: "Bio-Zertifizierung EU-Bio mitliefern",
  },
  {
    id: "abr_005",
    nummer: "ABR-2024-0031-005",
    datum: "2024-09-18",
    lieferDatum: "2024-09-25",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität B",
    menge: 200,
    einheit: "t",
    lager: "Lager Wien, Simmering",
    fahrer: "Huber Spedition KG",
    kennzeichen: "NÖ-HS-2210",
  },
  {
    id: "abr_006",
    nummer: "ABR-2024-0031-006",
    datum: "2024-10-05",
    lieferDatum: "2024-10-14",
    status: "GELIEFERT",
    artikel: "Winterweizen Qualität A",
    menge: 450,
    einheit: "t",
    lager: "Lager Wien, Simmering",
    fahrer: "Weiss Transport GmbH",
    kennzeichen: "W-WT-4412",
    notiz: "Abnahme Weizen 3. Tranche",
  },
  {
    id: "abr_007",
    nummer: "ABR-2024-0031-007",
    datum: "2024-11-10",
    lieferDatum: "2024-11-20",
    status: "UNTERWEGS",
    artikel: "Winterweizen Qualität B",
    menge: 150,
    einheit: "t",
    lager: "Lager Linz, Hafen",
    fahrer: "Huber Spedition KG",
    kennzeichen: "NÖ-HS-2210",
  },
  {
    id: "abr_008",
    nummer: "ABR-2024-0031-008",
    datum: "2024-11-28",
    lieferDatum: "2024-12-08",
    status: "FREIGEGEBEN",
    artikel: "Winterweizen Qualität A – Bioware",
    menge: 100,
    einheit: "t",
    lager: "Bio-Lager Graz",
    fahrer: "Ökofrisch Logistik GmbH",
    kennzeichen: "GZ-ÖF-8801",
    notiz: "Bio-Begleitdokumente anfordern",
  },
  {
    id: "abr_009",
    nummer: "ABR-2024-0031-009",
    datum: "2024-12-02",
    lieferDatum: "2025-01-15",
    status: "GEPLANT",
    artikel: "Winterweizen Qualität A",
    menge: 300,
    einheit: "t",
    lager: "Lager Wien, Simmering",
    fahrer: "—",
    kennzeichen: "—",
    notiz: "Fahrerzuteilung ausstehend",
  },
];

const MOCK_WARENBEWEGUNGEN: Warenbewegung[] = [
  {
    id: "wb_001",
    datum: "2024-07-18",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität A",
    menge: 250,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Lager Wien, Simmering",
    lieferscheinNr: "LS-2024-07-0088",
    fahrer: "Weiss Transport GmbH",
    abrufId: "abr_001",
    qualitaet: { feuchte: 13.8, protein: 13.2, hektoliter: 77 },
  },
  {
    id: "wb_002",
    datum: "2024-08-05",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität A",
    menge: 300,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Lager Wien, Simmering",
    lieferscheinNr: "LS-2024-08-0012",
    fahrer: "Huber Spedition KG",
    abrufId: "abr_002",
    qualitaet: { feuchte: 14.1, protein: 12.8, hektoliter: 76 },
  },
  {
    id: "wb_003",
    datum: "2024-08-22",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität A",
    menge: 200,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Lager Linz, Hafen",
    lieferscheinNr: "LS-2024-08-0044",
    fahrer: "Weiss Transport GmbH",
    abrufId: "abr_003",
    qualitaet: { feuchte: 14.3, protein: 13.0, hektoliter: 76 },
  },
  {
    id: "wb_004",
    datum: "2024-09-10",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität A – Bioware",
    menge: 100,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Bio-Lager Graz",
    lieferscheinNr: "LS-2024-09-0021",
    fahrer: "Ökofrisch Logistik GmbH",
    abrufId: "abr_004",
    qualitaet: { feuchte: 13.5, protein: 13.6, hektoliter: 78 },
  },
  {
    id: "wb_005",
    datum: "2024-09-25",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität B",
    menge: 200,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Lager Wien, Simmering",
    lieferscheinNr: "LS-2024-09-0055",
    fahrer: "Huber Spedition KG",
    abrufId: "abr_005",
    qualitaet: { feuchte: 14.5, protein: 11.2, hektoliter: 72 },
  },
  {
    id: "wb_006",
    datum: "2024-10-03",
    typ: "UMLAGERUNG",
    artikel: "Winterweizen Qualität A",
    menge: 50,
    einheit: "t",
    lagerVon: "Lager Wien, Simmering",
    lagerNach: "Lager Linz, Hafen",
    lieferscheinNr: "UML-2024-10-0003",
    qualitaet: { feuchte: 13.9 },
  },
  {
    id: "wb_007",
    datum: "2024-10-14",
    typ: "EINGANG",
    artikel: "Winterweizen Qualität A",
    menge: 450,
    einheit: "t",
    lagerVon: "Lieferant Agrar Invest",
    lagerNach: "Lager Wien, Simmering",
    lieferscheinNr: "LS-2024-10-0088",
    fahrer: "Weiss Transport GmbH",
    abrufId: "abr_006",
    qualitaet: { feuchte: 14.0, protein: 13.1, hektoliter: 77 },
  },
];

// ─── Status helpers ────────────────────────────────────────────────────────

const ABRUF_STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  GEPLANT:     { bg: "bg-slate-100",   text: "text-slate-600",   dot: "bg-slate-400" },
  FREIGEGEBEN: { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500" },
  UNTERWEGS:   { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500" },
  GELIEFERT:   { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500" },
  STORNIERT:   { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-500" },
};

const ABRUF_STATUS_LABEL: Record<string, string> = {
  GEPLANT:     "Geplant",
  FREIGEGEBEN: "Freigegeben",
  UNTERWEGS:   "Unterwegs",
  GELIEFERT:   "Geliefert",
  STORNIERT:   "Storniert",
};

const WB_TYP_COLOR: Record<string, BadgeColor> = {
  EINGANG:    "green",
  AUSGANG:    "red",
  UMLAGERUNG: "blue",
};

type BadgeColor = "blue" | "green" | "amber" | "red" | "slate" | "violet" | "emerald";

const WB_TYP_LABEL: Record<string, string> = {
  EINGANG:    "Wareneingang",
  AUSGANG:    "Warenausgang",
  UMLAGERUNG: "Umlagerung",
};

// ─── Sub-components ────────────────────────────────────────────────────────

function AbrufStatusBadge({ status }: { status: Abruf["status"] }) {
  const s = ABRUF_STATUS_COLOR[status];
  const label = ABRUF_STATUS_LABEL[status];
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset px-2.5 py-1 text-xs",
      s.bg, s.text, "ring-current/20"
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", s.dot)} />
      {label}
    </span>
  );
}

function ProgressBar({ value, total, colorClass = "bg-blue-500" }: {
  value: number;
  total: number;
  colorClass?: string;
}) {
  const pct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5">
        <div
          className={cn("h-1.5 rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 shrink-0 w-8 text-right">{pct.toFixed(0)}%</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function KontraktDispositionPage() {
  const params = useParams();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<"abrufe" | "bewegungen" | "positionen">("abrufe");
  const [abrufFilter, setAbrufFilter] = useState<string>("");
  const [expandedAbruf, setExpandedAbruf] = useState<string | null>(null);
  const [showNewAbrufForm, setShowNewAbrufForm] = useState(false);

  // Use mock data (in a real app, fetch by id)
  const kontrakt = MOCK_KONTRAKT;

  const filteredAbrufe = useMemo(() => {
    if (!abrufFilter) return MOCK_ABRUFE;
    return MOCK_ABRUFE.filter(a => a.status === abrufFilter);
  }, [abrufFilter]);

  const geliefertPct = kontrakt.gesamtMenge > 0
    ? (kontrakt.gelieferteMenge / kontrakt.gesamtMenge) * 100
    : 0;
  const dispoPct = kontrakt.gesamtMenge > 0
    ? (kontrakt.disponiertesMenge / kontrakt.gesamtMenge) * 100
    : 0;
  const offeneMenge = kontrakt.gesamtMenge - kontrakt.disponiertesMenge;

  const abrufCounts = {
    GEPLANT:     MOCK_ABRUFE.filter(a => a.status === "GEPLANT").length,
    FREIGEGEBEN: MOCK_ABRUFE.filter(a => a.status === "FREIGEGEBEN").length,
    UNTERWEGS:   MOCK_ABRUFE.filter(a => a.status === "UNTERWEGS").length,
    GELIEFERT:   MOCK_ABRUFE.filter(a => a.status === "GELIEFERT").length,
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ─── Toolbar ── */}
      <div className="bg-white border-b border-slate-200 sticky top-[56px] z-30">
        <div className="flex items-center gap-2 px-6 py-3 flex-wrap">
          <Link href={`/kontrakte/${id}`}>
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />}>
              Kontrakt
            </Button>
          </Link>
          <div className="w-px h-5 bg-slate-200 mx-1" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/kontrakte" className="hover:text-blue-600 transition-colors">Kontrakte</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <Link href={`/kontrakte/${id}`} className="hover:text-blue-600 transition-colors font-medium text-slate-700">
              {kontrakt.nummer}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-blue-500" />
              Disposition
            </span>
          </div>

          <StatusBadge status={kontrakt.status} />

          <div className="flex-1" />

          <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />}>
            Export
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowNewAbrufForm(true)}
          >
            Neuer Abruf
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* ─── KPI Summary Bar ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <Package className="w-4.5 h-4.5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Gesamtmenge</p>
                <p className="text-xl font-bold text-slate-800">{formatNumber(kontrakt.gesamtMenge, 0)} t</p>
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <BarChart2 className="w-4.5 h-4.5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-blue-600">Disponiert</p>
                <p className="text-xl font-bold text-blue-700">{formatNumber(kontrakt.disponiertesMenge, 0)} t</p>
                <ProgressBar value={kontrakt.disponiertesMenge} total={kontrakt.gesamtMenge} colorClass="bg-blue-400" />
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-4.5 h-4.5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-600">Geliefert</p>
                <p className="text-xl font-bold text-emerald-700">{formatNumber(kontrakt.gelieferteMenge, 0)} t</p>
                <ProgressBar value={kontrakt.gelieferteMenge} total={kontrakt.gesamtMenge} colorClass="bg-emerald-500" />
              </div>
            </div>
          </Card>

          <Card padding="sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center shrink-0">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-amber-600">Offen (nicht disponiert)</p>
                <p className="text-xl font-bold text-amber-700">{formatNumber(offeneMenge, 0)} t</p>
                <p className="text-xs text-amber-500">
                  {kontrakt.gesamtMenge > 0
                    ? `${(100 - dispoPct).toFixed(0)}% noch zuzuteilen`
                    : "—"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* ─── Progress Visual ── */}
        <Card padding="sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
              Kontrakterfüllung — {kontrakt.nummer}
            </p>
            <span className="text-xs text-slate-500">{kontrakt.partner}</span>
          </div>

          {/* Stacked progress bar */}
          <div className="relative w-full bg-slate-100 rounded-full h-4 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-emerald-500 rounded-l-full transition-all"
              style={{ width: `${geliefertPct}%` }}
            />
            <div
              className="absolute inset-y-0 bg-blue-300 transition-all"
              style={{
                left: `${geliefertPct}%`,
                width: `${Math.max(0, dispoPct - geliefertPct)}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-5 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm inline-block" />
              Geliefert ({geliefertPct.toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-blue-300 rounded-sm inline-block" />
              Disponiert, offen ({Math.max(0, dispoPct - geliefertPct).toFixed(0)}%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-slate-100 rounded-sm inline-block border border-slate-200" />
              Nicht disponiert ({Math.max(0, 100 - dispoPct).toFixed(0)}%)
            </span>

            {/* Abruf status summary (right side) */}
            <div className="ml-auto flex items-center gap-3">
              {abrufCounts.UNTERWEGS > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Truck className="w-3.5 h-3.5" />
                  {abrufCounts.UNTERWEGS} unterwegs
                </span>
              )}
              {abrufCounts.FREIGEGEBEN > 0 && (
                <span className="flex items-center gap-1 text-blue-600 font-medium">
                  <RefreshCw className="w-3.5 h-3.5" />
                  {abrufCounts.FREIGEGEBEN} freigegeben
                </span>
              )}
              {abrufCounts.GEPLANT > 0 && (
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {abrufCounts.GEPLANT} geplant
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* ─── Tabs ── */}
        <div>
          <div className="flex items-center gap-0 border-b border-slate-200 bg-white px-4 rounded-t-xl">
            {(["abrufe", "bewegungen", "positionen"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab === "abrufe"     && <span className="flex items-center gap-1.5"><Truck    className="w-3.5 h-3.5" />Abrufe ({MOCK_ABRUFE.length})</span>}
                {tab === "bewegungen" && <span className="flex items-center gap-1.5"><Package  className="w-3.5 h-3.5" />Warenbewegungen ({MOCK_WARENBEWEGUNGEN.length})</span>}
                {tab === "positionen" && <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Positionsübersicht</span>}
              </button>
            ))}
          </div>

          {/* ─── Abrufe Tab ── */}
          {activeTab === "abrufe" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-card overflow-hidden">

              {/* Filter bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-500 font-medium">Status:</span>
                {["", "GEPLANT", "FREIGEGEBEN", "UNTERWEGS", "GELIEFERT"].map(s => (
                  <button
                    key={s}
                    onClick={() => setAbrufFilter(s)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-full font-medium transition-colors",
                      abrufFilter === s
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {s === "" ? "Alle" : ABRUF_STATUS_LABEL[s]}
                    {s !== "" && (
                      <span className="ml-1 text-[10px] opacity-70">
                        ({MOCK_ABRUFE.filter(a => a.status === s).length})
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[1fr_140px_100px_100px_120px_80px_32px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                <div>Abruf / Artikel</div>
                <div>Fahrer / Spediteur</div>
                <div className="text-center">Abrufdatum</div>
                <div className="text-center">Lieferdatum</div>
                <div className="text-right">Menge</div>
                <div className="text-center">Status</div>
                <div />
              </div>

              {/* Rows */}
              <div className="divide-y divide-slate-100">
                {filteredAbrufe.map(abruf => (
                  <div key={abruf.id}>
                    <div
                      className="grid grid-cols-[1fr_140px_100px_100px_120px_80px_32px] gap-3 px-5 py-3 items-center hover:bg-slate-50 transition-colors cursor-pointer group"
                      onClick={() => setExpandedAbruf(expandedAbruf === abruf.id ? null : abruf.id)}
                    >
                      {/* Abruf Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-600">{abruf.nummer}</span>
                          {abruf.notiz && (
                            <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">Notiz</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 truncate mt-0.5">{abruf.artikel}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {abruf.lager}
                        </p>
                      </div>

                      {/* Fahrer */}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">{abruf.fahrer}</p>
                        {abruf.kennzeichen !== "—" && (
                          <p className="text-[10px] text-slate-400 mt-0.5">{abruf.kennzeichen}</p>
                        )}
                      </div>

                      {/* Abrufdatum */}
                      <div className="text-center">
                        <p className="text-xs text-slate-600">{formatDate(abruf.datum)}</p>
                      </div>

                      {/* Lieferdatum */}
                      <div className="text-center">
                        <p className="text-xs text-slate-600">{formatDate(abruf.lieferDatum)}</p>
                      </div>

                      {/* Menge */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">{formatNumber(abruf.menge, 0)} {abruf.einheit}</p>
                      </div>

                      {/* Status */}
                      <div className="flex justify-center">
                        <AbrufStatusBadge status={abruf.status} />
                      </div>

                      {/* Expand toggle */}
                      <div className="flex items-center justify-center text-slate-300 group-hover:text-slate-500">
                        {expandedAbruf === abruf.id
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />
                        }
                      </div>
                    </div>

                    {/* Expanded details */}
                    {expandedAbruf === abruf.id && (
                      <div className="px-5 pb-4 pt-0 bg-blue-50/40 border-t border-blue-100">
                        <div className="grid md:grid-cols-3 gap-4 pt-3">
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Abrufdetails</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Abruf-Nr.</span>
                                <span className="font-medium text-slate-700">{abruf.nummer}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Artikel</span>
                                <span className="text-slate-700">{abruf.artikel}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Menge</span>
                                <span className="font-medium text-slate-800">{formatNumber(abruf.menge, 0)} {abruf.einheit}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Lieferbedingung</span>
                                <span className="text-slate-700">{kontrakt.lieferbedingung}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Transport</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Fahrer / Spedition</span>
                                <span className="text-slate-700">{abruf.fahrer}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Kennzeichen</span>
                                <span className="text-slate-700">{abruf.kennzeichen}</span>
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-slate-500">Lieferort:</span>
                                <span className="font-medium text-slate-700">{abruf.lager}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">Termine</p>
                            <div className="space-y-1.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Abrufdatum</span>
                                <span className="text-slate-700">{formatDate(abruf.datum)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Lieferdatum</span>
                                <span className="font-medium text-slate-700">{formatDate(abruf.lieferDatum)}</span>
                              </div>
                            </div>
                            {abruf.notiz && (
                              <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-100">
                                <p className="text-[10px] font-semibold text-amber-700 mb-0.5">Notiz</p>
                                <p className="text-xs text-amber-800">{abruf.notiz}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Find matching Warenbewegung */}
                        {MOCK_WARENBEWEGUNGEN.filter(w => w.abrufId === abruf.id).length > 0 && (
                          <div className="mt-3 pt-3 border-t border-blue-100">
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2">
                              Zugehörige Warenbewegungen
                            </p>
                            {MOCK_WARENBEWEGUNGEN.filter(w => w.abrufId === abruf.id).map(wb => (
                              <div key={wb.id} className="flex items-center gap-4 text-xs bg-white rounded-lg p-2.5 border border-slate-100">
                                <Badge label={WB_TYP_LABEL[wb.typ]} color={WB_TYP_COLOR[wb.typ]} size="sm" />
                                <span className="text-slate-600">{formatDate(wb.datum)}</span>
                                <span className="font-medium text-slate-800">{formatNumber(wb.menge, 0)} {wb.einheit}</span>
                                <span className="text-slate-500 flex items-center gap-1">
                                  {wb.lagerVon} <ArrowRight className="w-3 h-3" /> {wb.lagerNach}
                                </span>
                                <span className="ml-auto text-slate-400">LS: {wb.lieferscheinNr}</span>
                                {wb.qualitaet && (
                                  <span className="text-slate-400">
                                    F: {wb.qualitaet.feuchte}% · P: {wb.qualitaet.protein}% · HL: {wb.qualitaet.hektoliter}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-3">
                          {abruf.status === "GEPLANT" && (
                            <Button variant="primary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                              Freigeben
                            </Button>
                          )}
                          {abruf.status === "FREIGEGEBEN" && (
                            <Button variant="primary" size="sm" icon={<Truck className="w-3.5 h-3.5" />}>
                              Als unterwegs markieren
                            </Button>
                          )}
                          {abruf.status === "UNTERWEGS" && (
                            <Button variant="primary" size="sm" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                              Wareneingang buchen
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" icon={<Eye className="w-3.5 h-3.5" />}>
                            Details
                          </Button>
                          {abruf.status !== "GELIEFERT" && abruf.status !== "STORNIERT" && (
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Stornieren
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredAbrufe.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Truck className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Keine Abrufe für diesen Filter</p>
                </div>
              )}

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>{filteredAbrufe.length} Abruf{filteredAbrufe.length !== 1 ? "e" : ""}</span>
                <span className="font-semibold text-slate-700">
                  Gesamt: {formatNumber(filteredAbrufe.reduce((s, a) => s + a.menge, 0), 0)} t
                </span>
              </div>
            </div>
          )}

          {/* ─── Warenbewegungen Tab ── */}
          {activeTab === "bewegungen" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-card overflow-hidden">

              {/* Table header */}
              <div className="grid grid-cols-[100px_90px_1fr_100px_1fr_80px_120px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                <div>Datum</div>
                <div>Typ</div>
                <div>Artikel</div>
                <div className="text-right">Menge</div>
                <div>Von → Nach</div>
                <div>Lieferschein</div>
                <div>Qualität</div>
              </div>

              <div className="divide-y divide-slate-100">
                {MOCK_WARENBEWEGUNGEN.map(wb => (
                  <div
                    key={wb.id}
                    className="grid grid-cols-[100px_90px_1fr_100px_1fr_80px_120px] gap-3 px-5 py-3.5 items-center hover:bg-slate-50 transition-colors"
                  >
                    {/* Datum */}
                    <div>
                      <p className="text-sm text-slate-700">{formatDate(wb.datum)}</p>
                    </div>

                    {/* Typ */}
                    <div>
                      <Badge label={WB_TYP_LABEL[wb.typ]} color={WB_TYP_COLOR[wb.typ]} size="sm" />
                    </div>

                    {/* Artikel */}
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 truncate">{wb.artikel}</p>
                      {wb.fahrer && (
                        <p className="text-xs text-slate-400 mt-0.5">{wb.fahrer}</p>
                      )}
                    </div>

                    {/* Menge */}
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{formatNumber(wb.menge, 0)} {wb.einheit}</p>
                    </div>

                    {/* Von → Nach */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600 truncate">
                        <span className="truncate max-w-[120px]">{wb.lagerVon}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[120px]">{wb.lagerNach}</span>
                      </div>
                    </div>

                    {/* Lieferschein */}
                    <div>
                      <p className="text-xs text-blue-600 font-medium">{wb.lieferscheinNr}</p>
                    </div>

                    {/* Qualität */}
                    <div>
                      {wb.qualitaet ? (
                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          {wb.qualitaet.feuchte !== undefined && (
                            <p>F: {wb.qualitaet.feuchte}%</p>
                          )}
                          {wb.qualitaet.protein !== undefined && (
                            <p>P: {wb.qualitaet.protein}%</p>
                          )}
                          {wb.qualitaet.hektoliter !== undefined && (
                            <p>HL: {wb.qualitaet.hektoliter}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>{MOCK_WARENBEWEGUNGEN.length} Bewegungen</span>
                <span className="font-semibold text-slate-700">
                  Gesamteingang: {formatNumber(
                    MOCK_WARENBEWEGUNGEN.filter(w => w.typ === "EINGANG").reduce((s, w) => s + w.menge, 0),
                    0
                  )} t
                </span>
              </div>
            </div>
          )}

          {/* ─── Positionen Tab ── */}
          {activeTab === "positionen" && (
            <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 shadow-card overflow-hidden">

              {/* Table header */}
              <div className="grid grid-cols-[50px_1fr_100px_100px_100px_100px_90px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                <div className="text-center">Pos</div>
                <div>Artikel / Bezeichnung</div>
                <div className="text-right">Soll-Menge</div>
                <div className="text-right">Disponiert</div>
                <div className="text-right">Geliefert</div>
                <div className="text-right">Offen</div>
                <div className="text-right">Deckung</div>
              </div>

              <div className="divide-y divide-slate-100">
                {MOCK_POSITIONEN.map(pos => {
                  const offMenge = pos.mengeSoll - pos.mengeDisponiert;
                  const deckungPct = pos.mengeSoll > 0
                    ? (pos.mengeGeliefert / pos.mengeSoll) * 100
                    : 0;
                  const dispoPctPos = pos.mengeSoll > 0
                    ? (pos.mengeDisponiert / pos.mengeSoll) * 100
                    : 0;

                  return (
                    <div
                      key={pos.id}
                      className="grid grid-cols-[50px_1fr_100px_100px_100px_100px_90px] gap-3 px-5 py-4 items-center hover:bg-slate-50 transition-colors"
                    >
                      {/* Pos Nr */}
                      <div className="text-center">
                        <span className="text-xs font-medium text-slate-400 bg-slate-100 rounded px-1.5 py-0.5">
                          {pos.positionsnummer}
                        </span>
                      </div>

                      {/* Bezeichnung */}
                      <div>
                        <p className="text-sm font-medium text-slate-800">{pos.bezeichnung}</p>
                        <p className="text-xs text-slate-400">{pos.einheit} · {formatCurrency(pos.preis, "EUR")}/{pos.einheit}</p>
                        {/* Mini progress bar */}
                        <div className="mt-1.5 relative w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-emerald-500 rounded-l-full"
                            style={{ width: `${deckungPct}%` }}
                          />
                          <div
                            className="absolute inset-y-0 bg-blue-300"
                            style={{
                              left: `${deckungPct}%`,
                              width: `${Math.max(0, dispoPctPos - deckungPct)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Soll-Menge */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{formatNumber(pos.mengeSoll, 0)}</p>
                        <p className="text-xs text-slate-400">{pos.einheit}</p>
                      </div>

                      {/* Disponiert */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-blue-600">{formatNumber(pos.mengeDisponiert, 0)}</p>
                        <p className="text-xs text-blue-400">{dispoPctPos.toFixed(0)}%</p>
                      </div>

                      {/* Geliefert */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">{formatNumber(pos.mengeGeliefert, 0)}</p>
                        <p className="text-xs text-emerald-400">{deckungPct.toFixed(0)}%</p>
                      </div>

                      {/* Offen */}
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-semibold",
                          offMenge > 0 ? "text-amber-600" : "text-emerald-600"
                        )}>
                          {formatNumber(offMenge, 0)}
                        </p>
                        <p className="text-xs text-slate-400">{pos.einheit}</p>
                      </div>

                      {/* Deckung indicator */}
                      <div className="text-right">
                        <span className={cn(
                          "text-xs font-semibold px-2 py-1 rounded-full",
                          deckungPct >= 100
                            ? "bg-emerald-100 text-emerald-700"
                            : deckungPct >= 50
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                        )}>
                          {deckungPct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer totals */}
              <div className="grid grid-cols-[50px_1fr_100px_100px_100px_100px_90px] gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <div />
                <div className="text-slate-500">{MOCK_POSITIONEN.length} Positionen</div>
                <div className="text-right text-slate-800">
                  {formatNumber(MOCK_POSITIONEN.reduce((s, p) => s + p.mengeSoll, 0), 0)} t
                </div>
                <div className="text-right text-blue-700">
                  {formatNumber(MOCK_POSITIONEN.reduce((s, p) => s + p.mengeDisponiert, 0), 0)} t
                </div>
                <div className="text-right text-emerald-700">
                  {formatNumber(MOCK_POSITIONEN.reduce((s, p) => s + p.mengeGeliefert, 0), 0)} t
                </div>
                <div className="text-right text-amber-700">
                  {formatNumber(MOCK_POSITIONEN.reduce((s, p) => s + (p.mengeSoll - p.mengeDisponiert), 0), 0)} t
                </div>
                <div />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── New Abruf Modal ── */}
      {showNewAbrufForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-[540px] border border-slate-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-500" />
                Neuer Abruf — {kontrakt.nummer}
              </h2>
              <button
                onClick={() => setShowNewAbrufForm(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Artikel / Position</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {MOCK_POSITIONEN.map(p => (
                      <option key={p.id} value={p.id}>{p.bezeichnung}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Menge (t)</label>
                  <input
                    type="number"
                    placeholder="z.B. 200"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Lieferdatum</label>
                  <input
                    type="date"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Lieferort / Lager</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Lager Wien, Simmering</option>
                    <option>Lager Linz, Hafen</option>
                    <option>Bio-Lager Graz</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Fahrer / Spediteur</label>
                  <select className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">— bitte wählen —</option>
                    <option>Weiss Transport GmbH</option>
                    <option>Huber Spedition KG</option>
                    <option>Ökofrisch Logistik GmbH</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1.5">Kennzeichen</label>
                  <input
                    type="text"
                    placeholder="z.B. W-WT-4412"
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1.5">Notiz (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Interne Hinweise zum Abruf..."
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Info banner */}
              <div className="flex items-start gap-2.5 bg-blue-50 rounded-lg p-3 border border-blue-100">
                <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Der Abruf wird mit Status <strong>Geplant</strong> angelegt. Nach der Freigabe
                  kann der Fahrer informiert werden.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
              <Button variant="secondary" size="sm" onClick={() => setShowNewAbrufForm(false)}>
                Abbrechen
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => setShowNewAbrufForm(false)}
              >
                Abruf anlegen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
