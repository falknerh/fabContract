"use client";
export const runtime = 'edge';

import { useState } from "react";
import Link from "next/link";
import {
  Settings, Hash, GitBranch, Shield, Bell, Database,
  ChevronRight, ChevronDown, Save, RotateCcw, CheckCircle2,
  AlertTriangle, Info, Edit2, Plus, Trash2, Copy, ArrowLeft,
  Users, Workflow, Key, Mail, Clock, Globe, Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, SelectInput } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ─── Mock Data ────────────────────────────────────────────────────────────────

type NummernkreisStatus = "AKTIV" | "INAKTIV";

interface Nummernkreis {
  id: string;
  bezeichnung: string;
  kuerzel: string;
  format: string;
  letzteNummer: number;
  naechsteNummer: number;
  schrittweite: number;
  mandant: string;
  status: NummernkreisStatus;
}

const NUMMERNKREISE: Nummernkreis[] = [
  {
    id: "nk_001",
    bezeichnung: "Einkaufskontrakte",
    kuerzel: "EK",
    format: "EK-{YYYY}-{NR:4}",
    letzteNummer: 68,
    naechsteNummer: 69,
    schrittweite: 1,
    mandant: "Agrar Handel Österreich GmbH",
    status: "AKTIV",
  },
  {
    id: "nk_002",
    bezeichnung: "Verkaufskontrakte",
    kuerzel: "VK",
    format: "VK-{YYYY}-{NR:4}",
    letzteNummer: 23,
    naechsteNummer: 24,
    schrittweite: 1,
    mandant: "Agrar Handel Österreich GmbH",
    status: "AKTIV",
  },
  {
    id: "nk_003",
    bezeichnung: "Dispositionen",
    kuerzel: "DSP",
    format: "DSP-{YYYY}-{NR:4}",
    letzteNummer: 140,
    naechsteNummer: 141,
    schrittweite: 1,
    mandant: "Agrar Handel Österreich GmbH",
    status: "AKTIV",
  },
  {
    id: "nk_004",
    bezeichnung: "Frachtaufträge",
    kuerzel: "FRA",
    format: "FRA-{YYYY}-{NR:4}",
    letzteNummer: 87,
    naechsteNummer: 88,
    schrittweite: 1,
    mandant: "Agrar Handel Österreich GmbH",
    status: "AKTIV",
  },
  {
    id: "nk_005",
    bezeichnung: "Einkaufskontrakte (Demo)",
    kuerzel: "EK",
    format: "EK-{YYYY}-{NR:4}",
    letzteNummer: 5,
    naechsteNummer: 6,
    schrittweite: 1,
    mandant: "Demo Mandant",
    status: "AKTIV",
  },
  {
    id: "nk_006",
    bezeichnung: "Warenbewegungen",
    kuerzel: "WB",
    format: "WB-{YYYY}{MM}-{NR:5}",
    letzteNummer: 321,
    naechsteNummer: 322,
    schrittweite: 1,
    mandant: "Agrar Handel Österreich GmbH",
    status: "INAKTIV",
  },
];

interface WorkflowRule {
  id: string;
  bezeichnung: string;
  ausloeser: string;
  aktion: string;
  bedingung: string;
  aktiv: boolean;
  prioritaet: number;
}

const WORKFLOW_RULES: WorkflowRule[] = [
  {
    id: "wf_001",
    bezeichnung: "Kontrakt-Freigabe ab 500.000 €",
    ausloeser: "Kontrakt erstellt",
    aktion: "Benachrichtigung an Geschäftsführung",
    bedingung: "Kontraktwert > 500.000 €",
    aktiv: true,
    prioritaet: 1,
  },
  {
    id: "wf_002",
    bezeichnung: "Disposition überfällig",
    ausloeser: "Disposition Lieferdatum überschritten",
    aktion: "E-Mail an Disponent + Eintrag im Protokoll",
    bedingung: "Verzug > 3 Tage",
    aktiv: true,
    prioritaet: 2,
  },
  {
    id: "wf_003",
    bezeichnung: "Preiswarnung Weizen",
    ausloeser: "Preisindex geändert",
    aktion: "Alert im Dashboard",
    bedingung: "Δ Preis > ±5% in 24h",
    aktiv: true,
    prioritaet: 3,
  },
  {
    id: "wf_004",
    bezeichnung: "Kontraktabschluss Benachrichtigung",
    ausloeser: "Kontraktstatus → ABGESCHLOSSEN",
    aktion: "E-Mail an Buchaltung",
    bedingung: "Immer",
    aktiv: false,
    prioritaet: 4,
  },
];

interface Rolle {
  id: string;
  name: string;
  beschreibung: string;
  benutzerAnzahl: number;
  berechtigungen: string[];
  systemrolle: boolean;
}

const ROLLEN: Rolle[] = [
  {
    id: "r_001",
    name: "Administrator",
    beschreibung: "Vollzugriff auf alle Module und Einstellungen",
    benutzerAnzahl: 2,
    berechtigungen: ["Alle Module", "Benutzerverwaltung", "Systemeinstellungen", "Mandantenverwaltung"],
    systemrolle: true,
  },
  {
    id: "r_002",
    name: "Händler",
    beschreibung: "Kontrakterfassung, Disposition, Analysen",
    benutzerAnzahl: 5,
    berechtigungen: ["Kontrakte", "Disposition", "Analyse", "Dashboard"],
    systemrolle: false,
  },
  {
    id: "r_003",
    name: "Buchhalter",
    beschreibung: "Lesezugriff auf Kontrakte, Steuern, Berichte",
    benutzerAnzahl: 2,
    berechtigungen: ["Kontrakte (Lesen)", "Steuereinstellungen (Lesen)", "Berichte"],
    systemrolle: false,
  },
  {
    id: "r_004",
    name: "Disponent",
    beschreibung: "Disposition und Frachtaufträge verwalten",
    benutzerAnzahl: 3,
    berechtigungen: ["Disposition", "Frachtaufträge", "Warenbewegungen"],
    systemrolle: false,
  },
];

const SYSTEMPARAMETER = [
  { gruppe: "Allgemein", key: "sys.wirtschaftsjahr.start", label: "Wirtschaftsjahr Beginn", wert: "01.07.", typ: "text", beschreibung: "Startmonat des Wirtschaftsjahres (MM.TT.)" },
  { gruppe: "Allgemein", key: "sys.standardwaehrung", label: "Standardwährung", wert: "EUR", typ: "select", optionen: ["EUR", "USD", "CHF", "HUF"], beschreibung: "Standardwährung für neue Kontrakte" },
  { gruppe: "Allgemein", key: "sys.standardsprache", label: "Systemsprache", wert: "de-AT", typ: "select", optionen: ["de-AT", "de-DE", "en-US", "hu-HU"], beschreibung: "Sprache der Benutzeroberfläche" },
  { gruppe: "Allgemein", key: "sys.zeitzone", label: "Zeitzone", wert: "Europe/Vienna", typ: "select", optionen: ["Europe/Vienna", "Europe/Berlin", "Europe/Budapest", "UTC"], beschreibung: "Systemzeitzone für Zeitstempel" },
  { gruppe: "Kontrakte", key: "kontrakt.max.betrag", label: "Max. Kontraktwert ohne Freigabe (€)", wert: "500000", typ: "number", beschreibung: "Kontrakte über diesem Wert erfordern manuelle Freigabe" },
  { gruppe: "Kontrakte", key: "kontrakt.standard.lieferfrist", label: "Standard Lieferfrist (Tage)", wert: "30", typ: "number", beschreibung: "Voreingestellte Lieferfrist für neue Kontrakte" },
  { gruppe: "Kontrakte", key: "kontrakt.preistoleranz.pct", label: "Preistoleranz (%)", wert: "2.5", typ: "number", beschreibung: "Zulässige Preisabweichung ohne Warnung" },
  { gruppe: "Disposition", key: "dispo.vorwarnung.tage", label: "Vorwarnung Disposition (Tage)", wert: "7", typ: "number", beschreibung: "Tage vor Fälligkeit für Warnung im Dashboard" },
  { gruppe: "Disposition", key: "dispo.max.menge.t", label: "Max. Dispositionsmenge (t)", wert: "10000", typ: "number", beschreibung: "Maximalmenge pro Disposition" },
  { gruppe: "Benachrichtigungen", key: "notif.email.absender", label: "E-Mail Absenderadresse", wert: "erp@agrarhandel.at", typ: "text", beschreibung: "Absenderadresse für automatische E-Mails" },
  { gruppe: "Benachrichtigungen", key: "notif.email.signatur", label: "E-Mail Signatur", wert: "Agrar Handel Österreich GmbH | ERP-System", typ: "text", beschreibung: "Signatur in automatisch versendeten E-Mails" },
];

// ─── Section Tabs ─────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "nummernkreise", label: "Nummernkreise",      icon: Hash },
  { id: "workflows",    label: "Workflows",           icon: GitBranch },
  { id: "rollen",       label: "Rollen & Rechte",     icon: Shield },
  { id: "parameter",    label: "Systemparameter",     icon: Settings },
];

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function InfoBox({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warning" }) {
  const styles = {
    info:    "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
  };
  const Icon = type === "warning" ? AlertTriangle : Info;
  return (
    <div className={cn("flex items-start gap-2.5 px-4 py-3 rounded-lg border text-sm mb-5", styles[type])}>
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

// ─── Nummernkreise Section ────────────────────────────────────────────────────

function NummernkreiseSection() {
  const [editId, setEditId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setEditId(null);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div>
      <SectionHeader
        title="Nummernkreise"
        subtitle="Definiert die automatische Nummerierung für Belege und Vorgänge"
        action={
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neuer Nummernkreis
          </Button>
        }
      />
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Nummernkreis gespeichert.
        </div>
      )}
      <InfoBox type="info">
        Nummernkreise werden pro Mandant und Belegart gepflegt. Laufende Nummern können nur erhöht, nicht verringert werden.
      </InfoBox>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Bezeichnung</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Format</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Mandant</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Letzte Nr.</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3">Nächste Nr.</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {NUMMERNKREISE.map(nk => (
              <tr key={nk.id} className={cn("hover:bg-slate-50 transition-colors", editId === nk.id && "bg-blue-50/40")}>
                <td className="px-4 py-3">
                  <span className="font-medium text-slate-800">{nk.bezeichnung}</span>
                  <span className="ml-2 font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{nk.kuerzel}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{nk.format}</td>
                <td className="px-4 py-3 text-slate-600 text-xs">{nk.mandant}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-600">{String(nk.letzteNummer).padStart(4, '0')}</td>
                <td className="px-4 py-3 text-right">
                  {editId === nk.id ? (
                    <input
                      type="number"
                      defaultValue={nk.naechsteNummer}
                      className="w-20 text-right px-2 py-1 text-sm border border-blue-300 rounded-lg outline-none font-mono focus:ring-2 focus:ring-blue-200"
                    />
                  ) : (
                    <span className="font-mono font-semibold text-slate-800">{String(nk.naechsteNummer).padStart(4, '0')}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    label={nk.status}
                    color={nk.status === "AKTIV" ? "green" : "slate"}
                    dot
                    size="sm"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {editId === nk.id ? (
                      <>
                        <Button variant="primary" size="sm" onClick={handleSave} icon={<Save className="w-3 h-3" />}>
                          Speichern
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setEditId(null)}>
                          Abbrechen
                        </Button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditId(nk.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Duplizieren"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Workflows Section ────────────────────────────────────────────────────────

function WorkflowsSection() {
  const [rules, setRules] = useState(WORKFLOW_RULES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggleAktiv(id: string) {
    setRules(prev => prev.map(r => r.id === id ? { ...r, aktiv: !r.aktiv } : r));
  }

  return (
    <div>
      <SectionHeader
        title="Workflow-Regeln"
        subtitle="Automatisierte Aktionen bei definierten Systemereignissen"
        action={
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neue Regel
          </Button>
        }
      />
      <InfoBox type="info">
        Workflows werden in der Reihenfolge ihrer Priorität ausgeführt. Deaktivierte Regeln werden übersprungen.
      </InfoBox>
      <div className="space-y-3">
        {rules.map(rule => (
          <Card key={rule.id} padding="none" className={cn(!rule.aktiv && "opacity-60")}>
            <div
              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors rounded-xl"
              onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}
            >
              {/* Priority badge */}
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                {rule.prioritaet}
              </div>

              {/* Main info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{rule.bezeichnung}</span>
                  <Badge label={rule.aktiv ? "Aktiv" : "Inaktiv"} color={rule.aktiv ? "green" : "slate"} size="sm" dot />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Auslöser: <span className="text-slate-700">{rule.ausloeser}</span>
                </p>
              </div>

              {/* Toggle */}
              <button
                onClick={e => { e.stopPropagation(); toggleAktiv(rule.id); }}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-colors shrink-0 focus:outline-none",
                  rule.aktiv ? "bg-emerald-500" : "bg-slate-200"
                )}
                title={rule.aktiv ? "Deaktivieren" : "Aktivieren"}
              >
                <span className={cn(
                  "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  rule.aktiv && "translate-x-5"
                )} />
              </button>

              <ChevronDown
                className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", expandedId === rule.id && "rotate-180")}
              />
            </div>

            {expandedId === rule.id && (
              <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50 rounded-b-xl">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Auslöser</p>
                    <p className="text-slate-700">{rule.ausloeser}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Bedingung</p>
                    <p className="text-slate-700">{rule.bedingung}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Aktion</p>
                    <p className="text-slate-700">{rule.aktion}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Button variant="secondary" size="sm" icon={<Edit2 className="w-3 h-3" />}>Bearbeiten</Button>
                  <Button variant="ghost" size="sm" icon={<Copy className="w-3 h-3" />}>Duplizieren</Button>
                  <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600 hover:bg-red-50 ml-auto">Löschen</Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Rollen Section ───────────────────────────────────────────────────────────

function RollenSection() {
  const [selectedRolle, setSelectedRolle] = useState<string | null>(null);

  return (
    <div>
      <SectionHeader
        title="Rollen & Berechtigungen"
        subtitle="Zugriffssteuerung für Systembenutzer"
        action={
          <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
            Neue Rolle
          </Button>
        }
      />
      <InfoBox type="warning">
        Systemrollen können nicht gelöscht werden. Änderungen an Rollen wirken sich auf alle zugeordneten Benutzer aus.
      </InfoBox>
      <div className="grid md:grid-cols-2 gap-4">
        {ROLLEN.map(rolle => (
          <Card
            key={rolle.id}
            className={cn("cursor-pointer transition-all", selectedRolle === rolle.id && "border-blue-300 ring-2 ring-blue-100")}
            onClick={() => setSelectedRolle(selectedRolle === rolle.id ? null : rolle.id)}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                rolle.systemrolle ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"
              )}>
                {rolle.systemrolle ? <Lock className="w-5 h-5" /> : <Users className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-slate-800">{rolle.name}</span>
                  {rolle.systemrolle && (
                    <Badge label="Systemrolle" color="violet" size="sm" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{rolle.beschreibung}</p>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <Users className="w-3 h-3" />
                  <span>{rolle.benutzerAnzahl} Benutzer zugeordnet</span>
                </div>
              </div>
            </div>

            {selectedRolle === rolle.id && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Berechtigungen</p>
                <div className="flex flex-wrap gap-1.5">
                  {rolle.berechtigungen.map(b => (
                    <span key={b} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      {b}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="secondary" size="sm" icon={<Edit2 className="w-3 h-3" />}>
                    Bearbeiten
                  </Button>
                  {!rolle.systemrolle && (
                    <Button variant="ghost" size="sm" icon={<Trash2 className="w-3 h-3" />} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      Löschen
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Systemparameter Section ──────────────────────────────────────────────────

const GRUPPEN = Array.from(new Set(SYSTEMPARAMETER.map(p => p.gruppe)));

function SystemparameterSection() {
  const [params, setParams] = useState<Record<string, string>>(
    Object.fromEntries(SYSTEMPARAMETER.map(p => [p.key, p.wert]))
  );
  const [dirty, setDirty] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  function handleChange(key: string, value: string) {
    setParams(prev => ({ ...prev, [key]: value }));
    setDirty(prev => prev.includes(key) ? prev : [...prev, key]);
  }

  function handleSave() {
    setSaved(true);
    setDirty([]);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleReset() {
    setParams(Object.fromEntries(SYSTEMPARAMETER.map(p => [p.key, p.wert])));
    setDirty([]);
  }

  return (
    <div>
      <SectionHeader
        title="Systemparameter"
        subtitle="Globale Konfigurationswerte für alle Module"
        action={
          <div className="flex items-center gap-2">
            {dirty.length > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                {dirty.length} ungespeicherte Änderung{dirty.length !== 1 ? "en" : ""}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleReset}
              disabled={dirty.length === 0}
            >
              Zurücksetzen
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={handleSave}
              disabled={dirty.length === 0}
            >
              Speichern
            </Button>
          </div>
        }
      />
      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-lg mb-4">
          <CheckCircle2 className="w-4 h-4" />
          Systemparameter erfolgreich gespeichert.
        </div>
      )}
      <div className="space-y-6">
        {GRUPPEN.map(gruppe => {
          const gruppen_params = SYSTEMPARAMETER.filter(p => p.gruppe === gruppe);
          const GruppenIcon =
            gruppe === "Allgemein" ? Globe :
            gruppe === "Kontrakte" ? Key :
            gruppe === "Disposition" ? Clock :
            Mail;

          return (
            <Card key={gruppe}>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GruppenIcon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">{gruppe}</h3>
              </div>
              <div className="space-y-4">
                {gruppen_params.map(param => (
                  <div key={param.key} className="grid md:grid-cols-3 gap-3 items-start">
                    <div className="md:col-span-1">
                      <p className={cn(
                        "text-sm font-medium",
                        dirty.includes(param.key) ? "text-amber-700" : "text-slate-700"
                      )}>
                        {param.label}
                        {dirty.includes(param.key) && (
                          <span className="ml-1 text-amber-500 text-xs">●</span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{param.beschreibung}</p>
                      <p className="text-[10px] font-mono text-slate-300 mt-0.5">{param.key}</p>
                    </div>
                    <div className="md:col-span-2">
                      {param.typ === "select" && param.optionen ? (
                        <select
                          value={params[param.key]}
                          onChange={e => handleChange(param.key, e.target.value)}
                          className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 transition-colors"
                        >
                          {param.optionen.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={param.typ === "number" ? "number" : "text"}
                          value={params[param.key]}
                          onChange={e => handleChange(param.key, e.target.value)}
                          className={cn(
                            "w-full px-3 py-2 text-sm text-slate-900 bg-white border rounded-lg outline-none transition-colors",
                            dirty.includes(param.key) ? "border-amber-300 focus:border-amber-400 bg-amber-50/30" : "border-slate-200 focus:border-blue-400"
                          )}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EinstellungenPage() {
  const [activeSection, setActiveSection] = useState("nummernkreise");

  const ActiveIcon = SECTIONS.find(s => s.id === activeSection)?.icon ?? Settings;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ─── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Link href="/verwaltung" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">Verwaltung</span>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-xs text-slate-600 font-medium">Systemeinstellungen</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">Systemeinstellungen</h1>
            <p className="text-sm text-slate-500 mt-0.5">Nummernkreise, Workflows, Rollen und Systemparameter</p>
          </div>
        </div>
      </div>

      {/* ─── Layout: Sidebar + Content ── */}
      <div className="flex min-h-[calc(100vh-100px)]">
        {/* Sidebar Navigation */}
        <aside className="w-56 shrink-0 bg-white border-r border-slate-200 p-3">
          <nav className="space-y-1">
            {SECTIONS.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                  {sec.label}
                </button>
              );
            })}
          </nav>

          {/* System info */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="px-3 space-y-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">System</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Version</span>
                <span className="font-mono text-slate-700">2.4.1</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Datenbank</span>
                <Badge label="OK" color="green" size="sm" dot />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Letztes Backup</span>
                <span className="text-slate-600">heute 03:00</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Umgebung</span>
                <Badge label="PROD" color="blue" size="sm" />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Section pill header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <ActiveIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Systemeinstellungen</p>
              <p className="text-sm font-semibold text-slate-800">
                {SECTIONS.find(s => s.id === activeSection)?.label}
              </p>
            </div>
          </div>

          {activeSection === "nummernkreise" && <NummernkreiseSection />}
          {activeSection === "workflows" && <WorkflowsSection />}
          {activeSection === "rollen" && <RollenSection />}
          {activeSection === "parameter" && <SystemparameterSection />}
        </main>
      </div>
    </div>
  );
}
