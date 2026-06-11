"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Save, FileText, Package, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, SelectInput } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import partnerData from "@/data/partner.json";

const PARTNER = partnerData;

const STEPS = ["Belegart", "Partner", "Konditionen", "Positionen"];

const STEUERVORLAGEN = [
  { value: "AT-Inland",             label: "AT – Inland (UST)" },
  { value: "EU-Innergemeinschaftlich", label: "EU – Innergemeinschaftlich (IGEL)" },
  { value: "AT-Ausfuhr",            label: "AT – Ausfuhr (0%)" },
];

const WAEHRUNGEN = [
  { value: "EUR", label: "EUR – Euro" },
  { value: "USD", label: "USD – US Dollar" },
  { value: "CHF", label: "CHF – Schweizer Franken" },
  { value: "HUF", label: "HUF – Ungarischer Forint" },
];

const LIEFERBEDINGUNGEN = [
  { value: "DAP",  label: "DAP – Delivered at Place" },
  { value: "DDP",  label: "DDP – Delivered Duty Paid" },
  { value: "EXW",  label: "EXW – Ex Works" },
  { value: "FOB",  label: "FOB – Free on Board" },
  { value: "CIF",  label: "CIF – Cost, Insurance, Freight" },
  { value: "FCA",  label: "FCA – Free Carrier" },
];

const ZAHLUNGSBEDINGUNGEN = [
  { value: "30n",        label: "30 Tage netto" },
  { value: "14s2",       label: "14 Tage 2% Skonto / 30 Tage netto" },
  { value: "45n",        label: "45 Tage netto" },
  { value: "60n",        label: "60 Tage netto" },
  { value: "7n",         label: "7 Tage netto" },
  { value: "sofort",     label: "Sofort netto" },
];

export default function NeuerKontraktPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    belegart:        "EINKAUF",
    belegvariante:   "EINZEL",
    datum:           new Date().toISOString().slice(0, 10),
    gueltigVon:      new Date().toISOString().slice(0, 10),
    gueltigBis:      "",
    beschreibung:    "",
    partnerId:       "",
    filialeId:       "",
    waehrung:        "EUR",
    steuerVorlage:   "AT-Inland",
    lieferbedingung: "DAP",
    zahlungsbedingung: "30n",
    lieferort:       "",
    unserZeichen:    "",
    ihrZeichen:      "",
  });

  const update = (field: string, value: string) =>
    setFormData(p => ({ ...p, [field]: value }));

  const selectedPartner = PARTNER.find(p => p.id === formData.partnerId);

  const handleCreate = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    router.push("/kontrakte");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200 sticky top-[56px] z-30">
        <div className="flex items-center gap-2 px-6 py-3">
          <Link href="/kontrakte">
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-3.5 h-3.5" />}>
              Abbrechen
            </Button>
          </Link>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <span className="text-sm font-semibold text-slate-900">Neuer Kontrakt</span>
          <div className="flex-1" />
          <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}
            onClick={handleCreate} loading={saving} disabled={step < 2}>
            Anlegen
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-slate-200">
        <div className="flex items-center px-6 py-3 gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i <= step + 1 && setStep(i)}
                className="flex items-center gap-2"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  i < step ? "bg-emerald-500 text-white" :
                  i === step ? "bg-blue-600 text-white" :
                  "bg-slate-200 text-slate-500"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:inline ${
                  i === step ? "text-blue-600" : i < step ? "text-slate-700" : "text-slate-400"
                }`}>{s}</span>
              </button>
              {i < STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 max-w-3xl mx-auto space-y-5">

        {/* Step 0: Belegart */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Belegart wählen</h2>

            {/* Art */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Welche Art von Kontrakt möchten Sie anlegen?</p>
              <div className="grid grid-cols-2 gap-3">
                {["EINKAUF", "VERKAUF"].map(art => (
                  <button
                    key={art}
                    onClick={() => update("belegart", art)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                      formData.belegart === art
                        ? art === "EINKAUF" ? "border-blue-500 bg-blue-50" : "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      art === "EINKAUF" ? "bg-blue-100" : "bg-emerald-100"
                    }`}>
                      <FileText className={`w-5 h-5 ${art === "EINKAUF" ? "text-blue-600" : "text-emerald-600"}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{art}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {art === "EINKAUF" ? "Waren & Dienstleistungen einkaufen" : "Waren & Dienstleistungen verkaufen"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Variante */}
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Belegvariante</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "RAHMEN", label: "Rahmenkontrakt", sub: "Großer Kontrakt mit Abrufen" },
                  { value: "EINZEL", label: "Einzelbeleg",    sub: "Schnelle Einzelbestellung" },
                  { value: "ABRUF",  label: "Abruf",          sub: "Abruf aus Rahmenkontrakt" },
                ].map(v => (
                  <button
                    key={v.value}
                    onClick={() => update("belegvariante", v.value)}
                    className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                      formData.belegvariante === v.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{v.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{v.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Belegdatum" type="date" value={formData.datum}
                onChange={e => update("datum", e.target.value)} />
              <Input label="Gültig ab" type="date" value={formData.gueltigVon}
                onChange={e => update("gueltigVon", e.target.value)} />
              <Input label="Gültig bis (optional)" type="date" value={formData.gueltigBis}
                onChange={e => update("gueltigBis", e.target.value)} />
              <Input label="Beschreibung" value={formData.beschreibung}
                onChange={e => update("beschreibung", e.target.value)}
                placeholder="Kurzbeschreibung des Kontrakts" />
            </div>

            <div className="flex justify-end">
              <Button variant="primary" onClick={() => setStep(1)} iconRight={<ChevronRight className="w-4 h-4" />}>
                Weiter: Partner
              </Button>
            </div>
          </div>
        )}

        {/* Step 1: Partner */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">
              {formData.belegart === "EINKAUF" ? "Lieferant" : "Kunde"} auswählen
            </h2>

            <div className="space-y-2">
              {PARTNER
                .filter(p =>
                  p.typ === (formData.belegart === "EINKAUF" ? "LIEFERANT" : "KUNDE") ||
                  p.typ === "BEIDES"
                )
                .map(p => (
                  <button
                    key={p.id}
                    onClick={() => update("partnerId", p.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      formData.partnerId === p.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">
                      {p.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{p.name}</p>
                      {p.name2 && <p className="text-xs text-slate-500 mt-0.5">{p.name2}</p>}
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span>{p.nummer}</span>
                        <span>{p.land}</span>
                        <span>{p.waehrung}</span>
                        <span>{p.lieferbedingung}</span>
                      </div>
                    </div>
                    {formData.partnerId === p.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
            </div>

            {selectedPartner?.filialen && selectedPartner.filialen.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-700 mb-2">Filiale / Lieferort (optional)</p>
                <div className="space-y-2">
                  {selectedPartner.filialen.map(f => (
                    <button
                      key={f.id}
                      onClick={() => update("filialeId", f.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                        formData.filialeId === f.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <Package className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{f.bezeichnung}</p>
                        <p className="text-xs text-slate-500">{f.adresse}, {f.plz} {f.ort}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Unser Zeichen" value={formData.unserZeichen}
                onChange={e => update("unserZeichen", e.target.value)} />
              <Input label="Ihr Zeichen" value={formData.ihrZeichen}
                onChange={e => update("ihrZeichen", e.target.value)} />
            </div>

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(0)} icon={<ChevronLeft className="w-4 h-4" />}>
                Zurück
              </Button>
              <Button variant="primary" onClick={() => setStep(2)} disabled={!formData.partnerId}
                iconRight={<ChevronRight className="w-4 h-4" />}>
                Weiter: Konditionen
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Konditionen */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-slate-900">Konditionen</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <SelectInput label="Währung *" required value={formData.waehrung}
                onChange={e => update("waehrung", e.target.value)}
                options={WAEHRUNGEN} />
              <SelectInput label="Steuervorlage *" required value={formData.steuerVorlage}
                onChange={e => update("steuerVorlage", e.target.value)}
                options={STEUERVORLAGEN} />
              <SelectInput label="Lieferbedingung (INCOTERMS) *" required value={formData.lieferbedingung}
                onChange={e => update("lieferbedingung", e.target.value)}
                options={LIEFERBEDINGUNGEN} />
              <SelectInput label="Zahlungsbedingung *" required value={formData.zahlungsbedingung}
                onChange={e => update("zahlungsbedingung", e.target.value)}
                options={ZAHLUNGSBEDINGUNGEN} />
              <Input label="Lieferort" value={formData.lieferort}
                onChange={e => update("lieferort", e.target.value)}
                placeholder="z.B. Lager Wien, Simmering"
                className="sm:col-span-2" />
            </div>

            {/* Hints based on selections */}
            {formData.steuerVorlage === "EU-Innergemeinschaftlich" && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <Zap className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Innergemeinschaftlicher Erwerb</p>
                  <p className="text-xs mt-0.5">Das System berechnet automatisch Reverse Charge. Die UID-Nummer des Partners wird geprüft.</p>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="secondary" onClick={() => setStep(1)} icon={<ChevronLeft className="w-4 h-4" />}>
                Zurück
              </Button>
              <Button variant="primary" onClick={handleCreate} loading={saving}
                icon={<Save className="w-3.5 h-3.5" />}>
                Kontrakt anlegen & Positionen erfassen
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
