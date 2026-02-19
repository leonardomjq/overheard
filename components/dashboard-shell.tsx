"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { SidebarContent } from "./sidebar-content";
import { MobileDrawer } from "./mobile-drawer";
import { Logo } from "@/components/logo";

interface DashboardShellProps {
  children: ReactNode;
  tier?: string;
}

export function DashboardShell({ children, tier }: DashboardShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-sticky border-b border-text-dim/20 px-4 lg:px-6 py-3 flex items-center justify-between bg-surface/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden text-text-muted hover:text-text transition-colors"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <Logo size="md" href="/feed" />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="text-text-muted hover:text-text text-sm transition-colors hidden lg:block"
          >
            Settings
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 border-r border-border bg-surface flex-col py-4 shrink-0">
          <SidebarContent tier={tier} />
        </aside>

        {/* Mobile drawer */}
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} tier={tier} />

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
