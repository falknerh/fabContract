"use client";

export const runtime = 'edge';

import { useState, useEffect } from "react";
import {
  Activity, Package, Truck, RefreshCw, Zap,
  CheckCircle2, AlertTriangle, Info, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PREIS_BASE = [
  { artikel: "Winterweizen", basis: 178.40, delta: +2.30, trend: "up"   as const },
  { artikel: "Körnermais",   basis: 186.75, delta: -1.10, trend: "down" as const },
  { artikel: "Winterraps",   basis: 437.00, delta: +5.50, trend: "up"   as const },
  { artikel: "Gerste",       basis: 162.20, delta: -0.80, trend: "down" as const },
];

const AKTIVITAETEN = [
  { id: 1, typ: "success", zeit: "08:42", titel: "Wareneingang bestätigt",        detail: "500 t Weizen · EK-2024-0031 · Silo West",              href: "/disposition" },
  { id: 2, typ: "info",    zeit: "08:15", titel: "Neue Disposition freigegeben",  detail: "DSP-2024-0122 · 500 t · fällig 15.10.",                href: "/disposition" },
  { id: 3, typ: "warning", zeit: "07:58", titel: "Preisabweichung erkannt",       detail: "VK-2024-0018 · +4,2 % über Kontraktpreis",             href: "/kontrakte/ktr_003" },
  { id: 4, typ: "success", zeit: "07:30", titel: "Kontrakt angelegt",             detail: "EK-2024-0068 · 500 t Weizen · Agrar Invest",           href: "/kontrakte/ktr_005" },
  { id: 5, typ: "info",    zeit: "06:55", titel: "Frachtauftrag zugewiesen",      detail: "FRA-2024-0087 · Spediteur Müller & Co KG",             href: "/disposition/fracht" },
  { id: 6, typ: "warning", zeit: "06:12", titel: "Disposition überfällig",        detail: "DSP-2024-0118 · 3 Tage Verzug",                       href: "/disposition" },
  { id: 7, typ: "success", zeit: "gestern", titel: "Kontraktabschluss",           detail: "EK-2024-0052 · 500 t Raps · vollständig abgetragen",   href: "/kontrakte" },
  { id: 8, typ: "info",    zeit: "gestern", titel: "KI-Forecast aktualisiert",    detail: "Weizen Prognose Nov–Jan neu berechnet",                href: "/analyse/forecast" },
];

const TYP_ICON: Record<string, { icon: typeof Activity; cls: string }> = {
  success: { icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-50" },
  warning: { icon: AlertTriangle, cls: "text-amber-500 bg-amber-50" },
  info:    { icon: Info,          cls: "text-blue-500 bg-blue-50" },
};

export default function RealtimePage() {
  const [preise, setPreise] = useState(PREIS_BASE);
  const [lastUpdate, setLastUpdate] = useState("08:42:17");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPreise(prev => prev.map(p => {
        const d = +(p.delta + (Math.random() - 0.5) * 0.4).toFixed(2);
        return { ...p, basis: +(p.basis + (Math.random() - 0.5) * 0.8).toFixed(2), delta: d, trend: d >= 0 ? "up" : "down" };
      }));
    }, 8000);
    return () => clearInterval(id);
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      const n = new Date();
      setLastUpdate(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`);
      setRefreshing(false);
    }, 800);
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Realtime Monitor</h1>
            <p className="text-sm text-slate-500 mt-0.5">Stand: {lastUpdate} · Agrar Handel Österreich GmbH</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            LIVE
          </span>
        </div>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>
          <RefreshCw className={cn("w-3.5 h-3.5 mr-1.5", refreshing && "animate-spin")} />
          Aktualisieren
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Offene Dispositionen", value: "8", icon: Truck,    bg: "bg-blue-50",    fg: "text-blue-600" },
          { label: "Heute fällig",          value: "2", icon: Clock,    bg: "bg-amber-50",   fg: "text-amber-600" },
          { label: "Wareneingänge heute",   value: "3", icon: Package,  bg: "bg-emerald-50", fg: "text-emerald-600" },
          { label: "Aktive Kontrakte",      value: "5", icon: Activity, bg: "bg-slate-100",  fg: "text-slate-600" },
        ].map(k => (
          <Card key={k.label} padding="sm" className="flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", k.bg)}>
              <k.icon className={cn("w-5 h-5", k.fg)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{k.value}</p>
              <p className="text-xs text-slate-500 leading-tight">{k.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card padding="none">
          <div className="p-5 pb-3 flex items-center justify-between">
            <CardHeader><CardTitle subtitle="Spotpreise · alle 8 s">Preisindizes</CardTitle></CardHeader>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {preise.map(p => (
              <div key={p.artikel} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.artikel}</p>
                  <p className="text-xs text-slate-400">€/t</p>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900">{p.basis.toFixed(2)} €</p>
                  <p className={cn("text-xs font-medium flex items-center justify-end gap-0.5",
                    p.trend === "up" ? "text-emerald-600" : "text-red-500")}>
                    {p.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {p.delta > 0 ? "+" : ""}{p.delta.toFixed(2)} €
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-2 border-t border-slate-50 flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Automatische Aktualisierung alle 8 Sekunden
          </div>
        </Card>

        <Card padding="none">
          <div className="p-5 pb-3">
            <CardHeader><CardTitle subtitle="Letzte 24 Stunden">Aktivitätsfeed</CardTitle></CardHeader>
          </div>
          <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto">
            {AKTIVITAETEN.map(a => {
              const { icon: Icon, cls } = TYP_ICON[a.typ];
              return (
                <a key={a.id} href={a.href}
                  className="flex gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", cls)}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug">{a.titel}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{a.detail}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0 mt-0.5">{a.zeit}</span>
                </a>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
