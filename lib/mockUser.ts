import type { FabularUser } from "./types";

export const CURRENT_USER: FabularUser = {
  id: "usr_001",
  name: "Harald Falkner",
  email: "h.falkner@fab4minds.com",
  initialen: "HF",
  land: "AT",
  mandantId: "mdt_001",
  rollen: ["KONTRAKT_ERSTELLEN", "KONTRAKT_FREIGEBEN", "DISPOSITION_ERSTELLEN", "ADMIN"],
};

export const CURRENT_MANDANT = {
  id: "mdt_001",
  bezeichnung: "Agrar Handel Österreich GmbH",
  land: "AT",
  waehrung: "EUR",
  ustNummer: "ATU12345678",
  rechtsform: "GmbH",
  adresse: "Mariahilfer Str. 45, 1060 Wien",
};
