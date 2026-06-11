// ─── Enums & Unions ────────────────────────────────────────────────────────

export type Belegart       = "EINKAUF" | "VERKAUF";
export type Belegvariante  = "RAHMEN"  | "EINZEL" | "ABRUF";
export type KontraktStatus = "ENTWURF" | "OFFEN"  | "TEILGELIEFERT" | "ABGESCHLOSSEN" | "STORNIERT";
export type PositionTyp    = "ARTIKEL" | "TEXT"   | "ZWISCHENSUMME"  | "SEITENUMBRUCH";
export type DispoStatus    = "GEPLANT" | "FREIGEGEBEN" | "ZUGEWIESEN" | "UNTERWEGS" | "GELIEFERT" | "STORNIERT";
export type DispoTyp       = "GEPLANT" | "REAL";
export type WarenbewTyp    = "EINGANG" | "AUSGANG" | "UMBUCHUNG";

// ─── Master Data ───────────────────────────────────────────────────────────

export interface Partner {
  id: string;
  nummer: string;
  name: string;
  name2?: string;
  land: string;
  ustId?: string;
  waehrung: string;
  zahlungsziel: number; // days
  zahlungsbedingung: string;
  lieferbedingung: string; // INCOTERMS
  typ: "LIEFERANT" | "KUNDE" | "BEIDES";
  filialen?: Filiale[];
}

export interface Filiale {
  id: string;
  partnerId: string;
  bezeichnung: string;
  adresse: string;
  plz: string;
  ort: string;
  land: string;
  kontakt?: string;
}

export interface Artikel {
  id: string;
  nummer: string;
  bezeichnung: string;
  bezeichnung2?: string;
  artikelgruppe: string;
  einheit: string;
  warengruppe: string;
  steuercode: string;
  mindestmenge?: number;
  verpackungseinheit?: number;
  qualitaetsmerkmale?: QualitaetsMerkmal[];
  sets?: string[]; // set IDs this article belongs to
  bildUrl?: string;
}

export interface QualitaetsMerkmal {
  key: string;
  bezeichnung: string;
  typ: "TEXT" | "ZAHL" | "PROZENT" | "BOOLEAN";
  einheit?: string;
  standardwert?: string | number | boolean;
}

export interface ArtikelSet {
  id: string;
  bezeichnung: string;
  beschreibung?: string;
  kategorie: string;
  positionen: SetPosition[];
}

export interface SetPosition {
  artikelId: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  optional: boolean;
  reihenfolge: number;
}

export interface Mandant {
  id: string;
  bezeichnung: string;
  land: string;
  waehrung: string;
  ustNummer: string;
  rechtsform: string;
  adresse: string;
}

// ─── Kontrakt ──────────────────────────────────────────────────────────────

export interface Kontrakt {
  id: string;
  nummer: string;
  belegart: Belegart;
  belegvariante: Belegvariante;
  status: KontraktStatus;

  // Header
  datum: string;
  gueltigVon: string;
  gueltigBis?: string;
  lieferDatumVon?: string;
  lieferDatumBis?: string;
  beschreibung?: string;

  // Partner
  partnerId: string;
  partner: Partner;
  filialeId?: string;
  filiale?: Filiale;
  unserZeichen?: string;
  ihrZeichen?: string;

  // Financial
  mandantId: string;
  waehrung: string;
  wechselkurs?: number;
  steuerVorlage: string;
  zahlungsbedingung: string;
  lieferbedingung: string; // INCOTERMS
  lieferort?: string;

  // Conditions
  konditionenAllgemein?: Kondition[];

  // Positions
  positionen: KontraktPosition[];

  // Totals (calculated)
  summeNetto: number;
  summeRabatt: number;
  summeSteuern: number;
  summeBrutto: number;
  summeMenge?: number;

  // Relations
  rahmenKontraktId?: string;
  abrufNummer?: number;
  streckeId?: string;
  verknuepfterKontraktId?: string;

  // Disposition summary
  gesamtMenge?: number;
  disponiertesMenge?: number;
  gelieferteMenge?: number;

  // Meta
  erstelltAm: string;
  erstelltVon: string;
  geaendertAm: string;
  geaendertVon: string;
  notizen?: string;
  anhaenge?: Anhang[];
}

export interface KontraktPosition {
  id: string;
  positionsnummer: number;
  typ: PositionTyp;
  ebene: number; // 0=main, 1=sub, 2=sub-sub for calculation positions

  // Artikel
  artikelId?: string;
  artikel?: Artikel;
  bezeichnung?: string;
  bezeichnung2?: string;
  menge?: number;
  einheit?: string;
  preis?: number;
  rabattProzent?: number;
  rabattBetrag?: number;
  steuercode?: string;
  steuersatz?: number;

  // Delivery
  lieferDatumVon?: string;
  lieferDatumBis?: string;
  lieferort?: string;

  // Quality
  qualitaet?: Record<string, string | number | boolean>;

  // Calculated
  nettoWert?: number;
  steuerWert?: number;
  bruttoWert?: number;

  // Kalkulation
  kalkulationsPositionen?: KalkulationsPosition[];

  // Visual
  bilder?: string[];
  notiz?: string;
  texte?: string;

  // Config
  konfiguriert?: boolean;
  konfiguration?: KonfigurationsErgebnis;

  // Sets
  setId?: string;
  setName?: string;

  // Disposition
  disponiertesMenge?: number;
  offeneMenge?: number;
}

export interface KalkulationsPosition {
  id: string;
  bezeichnung: string;
  typ: "ZUSCHLAG" | "ABZUG" | "FRACHT" | "VERSICHERUNG" | "SONSTIG";
  berechnungsbasis: "BETRAG" | "PROZENT_NETTO" | "PROZENT_BRUTTO" | "JE_EINHEIT";
  wert: number;
  ergebnis: number;
}

export interface Kondition {
  id: string;
  typ: string;
  bezeichnung: string;
  wert: string;
}

export interface Anhang {
  id: string;
  bezeichnung: string;
  dateiname: string;
  typ: string;
  groesse: number;
  url: string;
}

export interface KonfigurationsErgebnis {
  merkmale: Record<string, string | number | boolean>;
  zusatzpositionen: KalkulationsPosition[];
  gesamtaufschlag: number;
}

// ─── Disposition ───────────────────────────────────────────────────────────

export interface Disposition {
  id: string;
  nummer: string;
  kontraktId: string;
  kontraktNummer: string;
  typ: DispoTyp;
  status: DispoStatus;

  datum: string;
  lieferDatum: string;
  lieferDatumBis?: string;

  positionen: DispoPosition[];

  frachtauftragId?: string;
  frachtauftragNummer?: string;
  tourId?: string;
  tourBezeichnung?: string;

  lieferant?: Partner;
  empfaenger?: Partner;
  lieferort?: string;

  notiz?: string;
  erstelltAm: string;
  erstelltVon: string;

  warenbewegungen?: Warenbewegung[];
}

export interface DispoPosition {
  id: string;
  positionsnummer: number;
  kontraktPositionId: string;
  artikelId: string;
  bezeichnung: string;
  menge: number;
  einheit: string;
  preis: number;
  nettoWert: number;
  gelieferteMenge?: number;
}

export interface Warenbewegung {
  id: string;
  dispositionId: string;
  typ: WarenbewTyp;
  datum: string;
  menge: number;
  einheit: string;
  chargenNummer?: string;
  lagerort?: string;
  dokumentNummer?: string;
  erfasstVon: string;
}

// ─── Strecke (Triangle / Pass-through) ────────────────────────────────────

export interface Strecke {
  id: string;
  bezeichnung: string;
  einkaufsKontraktId: string;
  einkaufsKontrakt?: Kontrakt;
  verkaufsKontraktId: string;
  verkaufsKontrakt?: Kontrakt;
  status: "AKTIV" | "ABGESCHLOSSEN";
  erstelltAm: string;

  // Contribution margin
  deckungsbeitrag?: Deckungsbeitrag;
  frachtkosten?: FrachtKosten[];
}

export interface Deckungsbeitrag {
  erloesNetto: number;
  wareneinsatz: number;
  frachtkosten: number;
  sonstigeKosten: number;
  db1: number; // Erlös - Wareneinsatz
  db2: number; // DB1 - Frachtkosten
  db3: number; // DB2 - Sonstige
  dbProzent: number;
}

export interface FrachtKosten {
  id: string;
  streckeId: string;
  frachtauftragId: string;
  betrag: number;
  waehrung: string;
  datum: string;
  notiz?: string;
}

// ─── Forecast / Scenario ───────────────────────────────────────────────────

export interface ForecastSzenario {
  id: string;
  bezeichnung: string;
  beschreibung?: string;
  typ: "OPTIMISTISCH" | "REALISTISCH" | "PESSIMISTISCH" | "CUSTOM";
  erstellt: string;
  erstelltVon: string;
  datenpunkte: ForecastDatapunkt[];
  parameter: Record<string, number | string>;
  istAktiv: boolean;
}

export interface ForecastDatapunkt {
  datum: string;
  wert: number;
  menge?: number;
  preis?: number;
  untergrenze?: number;
  obergrenze?: number;
}

// ─── Dashboard Types ───────────────────────────────────────────────────────

export interface KpiCard {
  id: string;
  titel: string;
  wert: number | string;
  einheit?: string;
  veraenderung?: number;
  veraenderungTyp?: "POSITIV" | "NEGATIV" | "NEUTRAL";
  untertitel?: string;
  status?: "OK" | "WARNING" | "CRITICAL";
  icon?: string;
}

export interface AbtragungsKurve {
  datum: string;
  geplant: number;
  real: number;
  kumuliertGeplant: number;
  kumuliertReal: number;
}

// ─── User / Auth (fabular OAuth stub) ─────────────────────────────────────

export interface FabularUser {
  id: string;
  name: string;
  email: string;
  initialen: string;
  land: string;
  mandantId: string;
  rollen: string[];
}
