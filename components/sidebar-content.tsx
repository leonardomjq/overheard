"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, Settings } from "lucide-react";

const links = [
  { href: "/", label: "Alpha Feed", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3">
      {links.map((link) => {
        const active =
          link.href === "/"
            ? pathname === "/" || pathname.startsWith("/alpha")
            : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
              active
                ? "bg-surface-elevated text-accent-green"
                : "text-text-muted hover:text-text hover:bg-surface-elevated"
            }`}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
