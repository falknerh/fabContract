"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Truck, ArrowLeftRight,
  BarChart2, Settings, ChevronDown, X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Übersicht & Analyse",
    icon: LayoutDashboard,
    href: "/dashboard",
    children: [
      { label: "Dashboard",          href: "/dashboard" },
      { label: "Realtime Monitor",   href: "/dashboard/realtime" },
      { label: "Abtragungskurven",   href: "/dashboard/abtragung" },
    ],
  },
  {
    id: "kontrakte",
    label: "Kontrakte",
    icon: FileText,
    href: "/kontrakte",
    children: [
      { label: "Alle Kontrakte",     href: "/kontrakte" },
      { label: "Einkauf",            href: "/kontrakte?art=EINKAUF" },
      { label: "Verkauf",            href: "/kontrakte?art=VERKAUF" },
      { label: "Rahmenkontrakte",    href: "/kontrakte?variant=RAHMEN" },
      { label: "Neuer Kontrakt",     href: "/kontrakte/neu" },
    ],
  },
  {
    id: "disposition",
    label: "Disposition",
    icon: Truck,
    href: "/disposition",
    children: [
      { label: "Übersicht",          href: "/disposition" },
      { label: "Geplante Abrufe",    href: "/disposition?typ=GEPLANT" },
      { label: "Frachtaufträge",     href: "/disposition/fracht" },
      { label: "Warenbewegungen",    href: "/disposition/waren" },
    ],
  },
  {
    id: "strecken",
    label: "Strecken",
    icon: ArrowLeftRight,
    href: "/strecken",
    children: [
      { label: "Streckenübersicht",  href: "/strecken" },
      { label: "Deckungsbeitrag",    href: "/strecken/deckungsbeitrag" },
    ],
  },
  {
    id: "analyse",
    label: "Analyse & Forecast",
    icon: BarChart2,
    href: "/analyse",
    children: [
      { label: "Historische Analyse",href: "/analyse" },
      { label: "KI-Prognose",        href: "/analyse/forecast" },
      { label: "Szenarien",          href: "/analyse/szenarien" },
    ],
  },
  {
    id: "verwaltung",
    label: "Verwaltung",
    icon: Settings,
    href: "/verwaltung",
    children: [
      { label: "Artikel",            href: "/verwaltung/artikel" },
      { label: "Partner",            href: "/verwaltung/partner" },
      { label: "Mandanten",          href: "/verwaltung/mandanten" },
      { label: "Steuereinstellungen",href: "/verwaltung/steuern" },
    ],
  },
];

interface NavigationProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Navigation({ mobileOpen, onMobileClose }: NavigationProps) {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    pathname === item.href || pathname.startsWith(item.href + "/") ||
    item.children?.some(c => pathname === c.href);

  return (
    <>
      {/* ─── Desktop Tab Bar ─────────────────────────────── */}
      <nav className="hidden md:block bg-[#0C1A2E] border-b border-white/10">
        <div className="flex items-center px-4 overflow-x-auto">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const open   = openDropdown === item.id;

            return (
              <div key={item.id} className="relative shrink-0">
                <button
                  onClick={() => setOpenDropdown(open ? null : item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-3 text-sm transition-colors whitespace-nowrap border-b-2",
                    active
                      ? "text-white border-blue-500 bg-white/5"
                      : "text-white/60 border-transparent hover:text-white/90 hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium">{item.label}</span>
                  <ChevronDown className={cn("w-3 h-3 transition-transform ml-0.5", open && "rotate-180")} />
                </button>

                {open && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute top-full left-0 mt-0 w-52 bg-white rounded-b-lg shadow-modal border border-slate-200 border-t-0 py-1 z-40 animate-slide-in">
                      {item.children?.map(child => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpenDropdown(null)}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm transition-colors",
                            pathname === child.href
                              ? "text-blue-600 bg-blue-50 font-medium"
                              : "text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile Drawer ───────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-[#0C1A2E] flex flex-col animate-slide-in overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs">A</div>
                <span className="font-semibold text-sm text-white">AUFTRÄGE</span>
              </div>
              <button onClick={onMobileClose} className="p-1.5 rounded hover:bg-white/10">
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
            <div className="flex-1 py-2">
              {NAV_ITEMS.map(item => {
                const active = isActive(item);
                return (
                  <div key={item.id}>
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm",
                      active ? "text-white" : "text-white/60"
                    )}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.children?.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center px-11 py-2 text-sm transition-colors",
                          pathname === child.href
                            ? "text-blue-300 bg-white/5"
                            : "text-white/50 hover:text-white/80"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
