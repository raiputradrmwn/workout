"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Dumbbell, Footprints, History } from "lucide-react";

const items = [
  { href: "/", label: "Hari Ini", icon: Dumbbell },
  { href: "/plan", label: "Jadwal", icon: CalendarDays },
  { href: "/treadmill", label: "Treadmill", icon: Footprints },
  { href: "/history", label: "Riwayat", icon: History },
];

export function MainNav() {
  const path = usePathname();
  return (
    <nav className="flex items-center gap-1">
      {items.map((it) => {
        const active =
          it.href === "/" ? path === "/" : path.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors sm:px-4 ${
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
