"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const LABELS: Record<string, string> = {
  dashboard:    "Dashboard",
  kontrakte:    "Kontrakte",
  neu:          "Neuer Kontrakt",
  disposition:  "Disposition",
  strecken:     "Strecken",
  analyse:      "Analyse & Forecast",
  verwaltung:   "Verwaltung",
  realtime:     "Realtime Monitor",
  abtragung:    "Abtragungskurven",
  forecast:     "KI-Prognose",
  szenarien:    "Szenarien",
  fracht:       "Frachtaufträge",
  waren:        "Warenbewegungen",
  deckungsbeitrag: "Deckungsbeitrag",
};

export function Breadcrumb() {
  const pathname = usePathname();

  // Build crumbs from path segments
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: { label: string; href: string }[] = [
    { label: "AUFTRÄGE", href: "/dashboard" },
  ];

  let accumulated = "";
  for (const seg of segments) {
    accumulated += `/${seg}`;
    // Skip dynamic IDs (look like ktr_xxx, dsp_xxx, etc.)
    const label = LABELS[seg] ?? (seg.includes("_") ? null : seg);
    if (label) {
      crumbs.push({ label, href: accumulated });
    } else if (!seg.includes("_")) {
      crumbs.push({ label: seg, href: accumulated });
    }
  }

  if (crumbs.length <= 1) return null;

  return (
    <div className="bg-white border-b border-slate-100 px-6 py-2 flex items-center gap-1.5 text-xs text-slate-500">
      {crumbs.map((c, i) => (
        <span key={c.href} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 text-slate-300" />}
          {i === crumbs.length - 1 ? (
            <span className="font-medium text-slate-700">{c.label}</span>
          ) : (
            <Link href={c.href} className="hover:text-blue-600 transition-colors">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
