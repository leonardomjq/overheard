"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Alpha Feed", icon: ">" },
  { href: "/settings", label: "Settings", icon: "#" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 border-r border-border bg-surface flex flex-col py-4 shrink-0">
      <nav className="space-y-1 px-3">
        {links.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-surface-elevated text-accent-green"
                  : "text-text-muted hover:text-text hover:bg-surface-elevated"
              }`}
            >
              <span className="font-mono text-xs">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
