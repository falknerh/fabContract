"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Search, ChevronDown, Menu, X,
  LayoutDashboard, FileText, Truck, ArrowLeftRight, BarChart2, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Navigation items ─────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Übersicht & Analyse",
    icon: LayoutDashboard,
    href: "/dashboard",
    children: [
      { label: "Dashboard",           href: "/dashboard" },
      { label: "Realtime Monitor",    href: "/dashboard/realtime" },
      { label: "Abtragungskurven",    href: "/dashboard/abtragung" },
    ],
  },
  {
    id: "kontrakte",
    label: "Kontrakte",
    icon: FileText,
    href: "/kontrakte",
    children: [
      { label: "Alle Kontrakte",      href: "/kontrakte" },
      { label: "Einkauf",             href: "/kontrakte?art=EINKAUF" },
      { label: "Verkauf",             href: "/kontrakte?art=VERKAUF" },
      { label: "Rahmenkontrakte",     href: "/kontrakte?variant=RAHMEN" },
      { label: "Neuer Kontrakt",      href: "/kontrakte/neu" },
    ],
  },
  {
    id: "disposition",
    label: "Disposition",
    icon: Truck,
    href: "/disposition",
    children: [
      { label: "Übersicht",           href: "/disposition" },
      { label: "Geplante Abrufe",     href: "/disposition?typ=GEPLANT" },
      { label: "Frachtaufträge",      href: "/disposition/fracht" },
      { label: "Warenbewegungen",     href: "/disposition/waren" },
    ],
  },
  {
    id: "strecken",
    label: "Strecken",
    icon: ArrowLeftRight,
    href: "/strecken",
    children: [
      { label: "Streckenübersicht",   href: "/strecken" },
      { label: "Deckungsbeitrag",     href: "/strecken/deckungsbeitrag" },
    ],
  },
  {
    id: "analyse",
    label: "Analyse & Forecast",
    icon: BarChart2,
    href: "/analyse",
    children: [
      { label: "Historische Analyse", href: "/analyse" },
      { label: "KI-Prognose",         href: "/analyse/forecast" },
      { label: "Szenarien",           href: "/analyse/szenarien" },
    ],
  },
  {
    id: "verwaltung",
    label: "Verwaltung",
    icon: Settings,
    href: "/verwaltung",
    children: [
      { label: "Artikel",             href: "/verwaltung/artikel" },
      { label: "Partner",             href: "/verwaltung/partner" },
      { label: "Mandanten",           href: "/verwaltung/mandanten" },
      { label: "Steuereinstellungen", href: "/verwaltung/steuern" },
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────

interface HeaderProps {
  onMenuToggle: () => void;
  mobileOpen: boolean;
}

export function Header({ onMenuToggle, mobileOpen }: HeaderProps) {
  const pathname   = usePathname();
  const [openNav,  setOpenNav]  = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    pathname === item.href ||
    pathname.startsWith(item.href + "/") ||
    (item.children?.some(c => pathname === c.href.split("?")[0]));

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm select-none">
      <div className="flex items-center h-14 px-4 gap-1">

        {/* ─ Mobile hamburger ─ */}
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0 mr-1"
        >
          {mobileOpen
            ? <X      style={{ width: 18, height: 18 }} />
            : <Menu   style={{ width: 18, height: 18 }} />}
        </button>

        {/* ─ Module badge ─ */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm text-white">
            A
          </div>
          <span className="font-semibold text-sm text-slate-900 hidden sm:inline tracking-wide">
            AUFTRÄGE
          </span>
        </div>

        {/* ─ Separator ─ */}
        <div className="hidden md:block w-px h-5 bg-slate-200 mx-3 shrink-0" />

        {/* ─ Desktop nav tabs ─ */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1">
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            const open   = openNav === item.id;

            return (
              <div key={item.id} className="relative shrink-0">
                <button
                  onClick={() => setOpenNav(open ? null : item.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-lg transition-all whitespace-nowrap",
                    active
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                  <ChevronDown className={cn(
                    "w-3 h-3 transition-transform ml-0.5",
                    open && "rotate-180",
                    active ? "text-blue-200" : "text-slate-400"
                  )} />
                </button>

                {/* Dropdown */}
                {open && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpenNav(null)} />
                    <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40">
                      {item.children?.map(child => {
                        const childPath = child.href.split("?")[0];
                        const childActive = pathname === childPath || pathname.startsWith(childPath + "/");
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setOpenNav(null)}
                            className={cn(
                              "flex items-center px-4 py-2 text-sm transition-colors",
                              childActive
                                ? "text-blue-600 bg-blue-50 font-medium"
                                : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {/* ─ Right actions ─ */}
        <div className="flex items-center gap-1 ml-auto md:ml-2 shrink-0">

          {/* Search */}
          {searchOpen ? (
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 gap-2 w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                autoFocus
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                onBlur={() => { if (!searchValue) setSearchOpen(false); }}
                placeholder="Suchen..."
                className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              />
              <kbd className="text-[10px] text-slate-400 shrink-0">⌘K</kbd>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-lg px-3 py-1.5 text-xs text-slate-500"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Suchen...</span>
              <kbd className="ml-1 text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded">⌘K</kbd>
            </button>
          )}

          {/* Bell */}
          <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <Bell style={{ width: 18, height: 18 }} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>

          {/* ───────────────────────────────────────────────────────────
              User profile / mandant selector is provided by fabular.
              fabular injects its own OAuth component here at runtime.
          ─────────────────────────────────────────────────────────── */}
        </div>
      </div>

      {/* ─── Mobile drawer ──────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" style={{ top: 56 }}>
          <div className="absolute inset-0 bg-black/40" onClick={onMenuToggle} />
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-lg flex flex-col overflow-y-auto animate-slide-in">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white">A</div>
              <span className="font-semibold text-sm text-slate-900">AUFTRÄGE</span>
            </div>
            <div className="flex-1 py-2">
              {NAV_ITEMS.map(item => {
                const active = isActive(item);
                return (
                  <div key={item.id}>
                    <div className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm font-medium",
                      active ? "text-blue-600" : "text-slate-700"
                    )}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      {item.label}
                    </div>
                    {item.children?.map(child => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onMenuToggle}
                        className={cn(
                          "flex items-center pl-11 pr-4 py-2 text-sm transition-colors",
                          pathname === child.href.split("?")[0]
                            ? "text-blue-600 bg-blue-50 font-medium"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
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
    </header>
  );
}
