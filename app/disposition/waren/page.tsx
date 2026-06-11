"use client";
export const runtime = 'edge';

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, SelectInput } from "@/components/ui/Input";
import { formatDate, formatNumber } from "@/lib/utils";
import { ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Search, Filter, Download } from "lucide-react";

type BewegungsTyp = "EINGANG" | "AUSGANG" | "UMLAGERUNG";

interface Warenbewegung {
  id: string;
  bewegungsNr: string;
  datum: string;
  kontrakt: string;
  artikel: string;
  einheit: string;
  menge: number;
  lagerVon: string;
  lagerNach: string;
  typ: BewegungsTyp;
  referenz: string;
}

const mockDaten: Warenbewegung[] = [
  {
    id: "1",
    bewegungsNr: "WB-2024-0081",
    datum: "2024-06-10",
    kontrakt: "KT-2024-0142",
    artikel: "Winterweizen",
    einheit: "t",
    menge: 120.5,
    lagerVon: "Außenlager Tulln",
    lagerNach: "Hauptlager Wien",
    typ: "EINGANG",
    referenz: "LF-2024-0033",
  },
  {
    id: "2",
    bewegungsNr: "WB-2024-0082",
    datum: "2024-06-10",
    kontrakt: "KT-2024-0138",
    artikel: "Körnermais",
    einheit: "t",
    menge: 80.0,
    lagerVon: "Hauptlager Wien",
    lagerNach: "Kunde Agrar Invest GmbH",
    typ: "AUSGANG",
    referenz: "AU-2024-0055",
  },
  {
    id: "3",
    bewegungsNr: "WB-2024-0083",
    datum: "2024-06-09",
    kontrakt: "KT-2024-0129",
    artikel: "Winterraps",
    einheit: "t",
    menge: 45.75,
    lagerVon: "Lager Linz",
    lagerNach: "Lager Salzburg",
    typ: "UMLAGERUNG",
    referenz: "UM-2024-0012",
  },
  {
    id: "4",
    bewegungsNr: "WB-2024-0084",
    datum: "2024-06-09",
    kontrakt: "KT-2024-0145",
    artikel: "Gerste",
    einheit: "t",
    menge: 200.0,
    lagerVon: "Magyar Gabona Kft.",
    lagerNach: "Hauptlager Wien",
    typ: "EINGANG",
    referenz: "LF-2024-0034",
  },
  {
    id: "5",
    bewegungsNr: "WB-2024-0085",
    datum: "2024-06-08",
    kontrakt: "KT-2024-0133",
    artikel: "Winterweizen",
    einheit: "t",
    menge: 65.25,
    lagerVon: "Hauptlager Wien",
    lagerNach: "Kunde Bergland Mühle",
    typ: "AUSGANG",
    referenz: "AU-2024-0056",
  },
  {
    id: "6",
    bewegungsNr: "WB-2024-0086",
    datum: "2024-06-08",
    kontrakt: "KT-2024-0140",
    artikel: "Sonnenblumenkerne",
    einheit: "t",
    menge: 30.0,
    lagerVon: "Außenlager Graz",
    lagerNach: "Außenlager Graz",
    typ: "UMLAGERUNG",
    referenz: "UM-2024-0013",
  },
  {
    id: "7",
    bewegungsNr: "WB-2024-0087",
    datum: "2024-06-07",
    kontrakt: "KT-2024-0136",
    artikel: "Körnermais",
    einheit: "t",
    menge: 150.0,
    lagerVon: "Donau Agrar GmbH",
    lagerNach: "Lager Linz",
    typ: "EINGANG",
    referenz: "LF-2024-0035",
  },
  {
    id: "8",
    bewegungsNr: "WB-2024-0088",
    datum: "2024-06-07",
    kontrakt: "KT-2024-0141",
    artikel: "Winterraps",
    einheit: "t",
    menge: 90.0,
    lagerVon: "Lager Salzburg",
    lagerNach: "Kunde Öl & Fett AG",
    typ: "AUSGANG",
    referenz: "AU-2024-0057",
  },
];

const typConfig: Record<BewegungsTyp, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  EINGANG: {
    label: "Eingang",
    icon: <ArrowDownToLine className="w-3.5 h-3.5" />,
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  AUSGANG: {
    label: "Ausgang",
    icon: <ArrowUpFromLine className="w-3.5 h-3.5" />,
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
  UMLAGERUNG: {
    label: "Umlagerung",
    icon: <ArrowLeftRight className="w-3.5 h-3.5" />,
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

const typFilterOptionen = [
  { value: "", label: "Alle Typen" },
  { value: "EINGANG", label: "Eingang" },
  { value: "AUSGANG", label: "Ausgang" },
  { value: "UMLAGERUNG", label: "Umlagerung" },
];

const artikelFilterOptionen = [
  { value: "", label: "Alle Artikel" },
  { value: "Winterweizen", label: "Winterweizen" },
  { value: "Körnermais", label: "Körnermais" },
  { value: "Winterraps", label: "Winterraps" },
  { value: "Gerste", label: "Gerste" },
  { value: "Sonnenblumenkerne", label: "Sonnenblumenkerne" },
];

export default function WarenbewegungPage() {
  const [suchtext, setSuchtext] = useState("");
  const [typFilter, setTypFilter] = useState("");
  const [artikelFilter, setArtikelFilter] = useState("");

  const gefiltert = mockDaten.filter((b) => {
    const matchSuche =
      suchtext === "" ||
      b.bewegungsNr.toLowerCase().includes(suchtext.toLowerCase()) ||
      b.kontrakt.toLowerCase().includes(suchtext.toLowerCase()) ||
      b.artikel.toLowerCase().includes(suchtext.toLowerCase()) ||
      b.lagerVon.toLowerCase().includes(suchtext.toLowerCase()) ||
      b.lagerNach.toLowerCase().includes(suchtext.toLowerCase()) ||
      b.referenz.toLowerCase().includes(suchtext.toLowerCase());

    const matchTyp = typFilter === "" || b.typ === typFilter;
    const matchArtikel = artikelFilter === "" || b.artikel === artikelFilter;

    return matchSuche && matchTyp && matchArtikel;
  });

  const summeEingang = gefiltert
    .filter((b) => b.typ === "EINGANG")
    .reduce((s, b) => s + b.menge, 0);
  const summeAusgang = gefiltert
    .filter((b) => b.typ === "AUSGANG")
    .reduce((s, b) => s + b.menge, 0);
  const summeUmlagerung = gefiltert
    .filter((b) => b.typ === "UMLAGERUNG")
    .reduce((s, b) => s + b.menge, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Warenbewegungen</h1>
          <p className="text-slate-500 text-sm mt-1">
            Übersicht aller Ein-, Ausgänge und Umlagerungen
          </p>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* KPI-Zusammenfassung */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Gesamteingang</p>
              <p className="text-xl font-bold text-slate-900">
                {formatNumber(summeEingang)} t
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ArrowUpFromLine className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Gesamtausgang</p>
              <p className="text-xl font-bold text-slate-900">
                {formatNumber(summeAusgang)} t
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-200">
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide">Umlagerungen</p>
              <p className="text-xl font-bold text-slate-900">
                {formatNumber(summeUmlagerung)} t
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter-Leiste */}
      <Card className="border border-slate-200">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Suche nach Bewegungs-Nr., Kontrakt, Artikel, Lager ..."
                value={suchtext}
                onChange={(e) => setSuchtext(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <SelectInput
                value={typFilter}
                onChange={(e) => setTypFilter(e.target.value)}
                options={typFilterOptionen}
                className="w-44"
              />
              <SelectInput
                value={artikelFilter}
                onChange={(e) => setArtikelFilter(e.target.value)}
                options={artikelFilterOptionen}
                className="w-48"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabelle */}
      <Card className="border border-slate-200">
        <CardHeader className="border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <CardTitle>Bewegungsliste</CardTitle>
            <span className="text-sm text-slate-500">
              {gefiltert.length} von {mockDaten.length} Einträgen
            </span>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Bewegungs-Nr.
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Datum
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Kontrakt
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Artikel
                </th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Menge
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Lager Von
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Lager Nach
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Typ
                </th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 whitespace-nowrap">
                  Referenz
                </th>
              </tr>
            </thead>
            <tbody>
              {gefiltert.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-slate-400 text-sm"
                  >
                    Keine Warenbewegungen gefunden.
                  </td>
                </tr>
              ) : (
                gefiltert.map((b, idx) => {
                  const cfg = typConfig[b.typ];
                  return (
                    <tr
                      key={b.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium whitespace-nowrap">
                        {b.bewegungsNr}
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {formatDate(b.datum)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 whitespace-nowrap">
                        {b.kontrakt}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium whitespace-nowrap">
                        {b.artikel}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-800 font-medium whitespace-nowrap">
                        {formatNumber(b.menge)}{" "}
                        <span className="text-slate-400 font-normal">{b.einheit}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap max-w-[180px] truncate">
                        {b.lagerVon}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap max-w-[180px] truncate">
                        {b.lagerNach}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.badgeClass}`}
                        >
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                        {b.referenz}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {gefiltert.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Gesamt:{" "}
              <span className="font-medium text-slate-700">
                {formatNumber(gefiltert.reduce((s, b) => s + b.menge, 0))} t
              </span>{" "}
              über {gefiltert.length} Bewegungen
            </p>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Eingang: <strong className="text-slate-700 ml-0.5">{formatNumber(summeEingang)} t</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                Ausgang: <strong className="text-slate-700 ml-0.5">{formatNumber(summeAusgang)} t</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                Umlagerung: <strong className="text-slate-700 ml-0.5">{formatNumber(summeUmlagerung)} t</strong>
              </span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
