"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Breadcrumb } from "./Breadcrumb";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        onMenuToggle={() => setMobileMenuOpen(prev => !prev)}
        mobileOpen={mobileMenuOpen}
      />
      <Breadcrumb />
      <main className="flex-1 bg-fab-bg">
        {children}
      </main>
    </div>
  );
}
