"use client";

import Link from "next/link";
import { Package, Users, Building, Calculator, Settings, ChevronRight, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";

const SECTIONS = [
  {
    icon: Package,
    label: "Artikel",
    sub: "Artikelstamm, Qualitätsmerkmale, Sets",
    href: "/verwaltung/artikel",
    count: "63 Artikel",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    label: "Partner",
    sub: "Lieferanten, Kunden, Filialen",
    href: "/verwaltung/partner",
    count: "8 Partner",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: Building,
    label: "Mandanten",
    sub: "Rechtliche Einheiten, Länder, Währungen",
    href: "/verwaltung/mandanten",
    count: "3 Mandanten",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Calculator,
    label: "Steuereinstellungen",
    sub: "Steuercodes, Vorlagen, Reihengeschäfte",
    href: "/verwaltung/steuern",
    count: "AT / DE / HU",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: FileText,
    label: "Belegvorlagen",
    sub: "Standard-Konditionensets, Texte",
    href: "/verwaltung/vorlagen",
    count: "12 Vorlagen",
    color: "bg-slate-100 text-slate-600",
  },
  {
    icon: Settings,
    label: "Systemeinstellungen",
    sub: "Nummernkreise, Workflows, Rollen",
    href: "/verwaltung/einstellungen",
    count: "",
    color: "bg-slate-100 text-slate-600",
  },
];

export default function VerwaltungPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-xl font-bold text-slate-900">Verwaltung</h1>
        <p className="text-sm text-slate-500 mt-0.5">Stammdaten, Mandanten und Systemkonfiguration</p>
      </div>
      <div className="p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}>
              <Card hover className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{s.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
                  {s.count && <p className="text-xs text-slate-400 mt-1">{s.count}</p>}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
