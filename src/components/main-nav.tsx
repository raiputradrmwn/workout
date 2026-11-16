"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import {
  ArrowLeft,
  BookOpen,
  CalendarRange,
  Dumbbell,
  LayoutGrid,
  Palette,
  TrendingUp,
} from "lucide-react";

const TABS = [
  { href: "/", label: "Hari ini", icon: Dumbbell },
  { href: "/plan", label: "Program", icon: CalendarRange },
  { href: "/progres", label: "Progres", icon: TrendingUp },
  { href: "/gerakan", label: "Gerakan", icon: BookOpen },
  { href: "/lainnya", label: "Lainnya", icon: LayoutGrid },
];

const MORE = ["/history", "/treadmill", "/nutrisi", "/kredit", "/lainnya", "/tampilan"];

const DESKTOP = [
  { href: "/", label: "Hari ini" },
  { href: "/plan", label: "Program" },
  { href: "/progres", label: "Progres" },
  { href: "/gerakan", label: "Gerakan" },
  { href: "/history", label: "Riwayat" },
  { href: "/treadmill", label: "Treadmill" },
  { href: "/nutrisi", label: "Nutrisi" },
  { href: "/lainnya", label: "Lainnya" },
];

const TITLES: [string, string][] = [
  ["/workout", "Sesi latihan"],
  ["/session", "Edit sesi"],
  ["/plan", "Program"],
  ["/progres", "Progres"],
  ["/gerakan", "Gerakan"],
  ["/history", "Riwayat"],
  ["/treadmill", "Treadmill"],
  ["/nutrisi", "Nutrisi"],
  ["/kredit", "Kredit"],
  ["/lainnya", "Lainnya"],
  ["/tampilan", "Tampilan"],
];

/** Halaman induk untuk tombol kembali kalau tidak ada riwayat navigasi. */
function parentOf(path: string) {
  if (path.startsWith("/session/")) return "/history";
  if (path.startsWith("/workout/")) return "/";
  if (["/history", "/treadmill", "/nutrisi", "/kredit", "/tampilan"].includes(path)) return "/lainnya";
  return "/";
}

function isActive(href: string, path: string) {
  if (href === "/") return path === "/" || path.startsWith("/workout");
  if (href === "/lainnya") return MORE.some((m) => path.startsWith(m)) || path.startsWith("/session");
  return path.startsWith(href);
}

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const path = usePathname();
  return (
    <button
      type="button"
      onClick={() => {
        const sameOrigin =
          typeof document !== "undefined" &&
          document.referrer.startsWith(window.location.origin) &&
          window.history.length > 1;
        if (sameOrigin) router.back();
        else router.push(parentOf(path));
      }}
      className={`inline-flex h-11 items-center gap-1.5 rounded-full bg-card pr-4 pl-3 text-sm font-semibold ring-1 ring-border transition-colors hover:bg-ink hover:text-white active:scale-95 ${className}`}
    >
      <ArrowLeft className="size-4" />
      Kembali
    </button>
  );
}

export function TopBar() {
  const path = usePathname();
  const root = path === "/";
  const deep = path.startsWith("/workout") || path.startsWith("/session");
  const title = TITLES.find(([p]) => path.startsWith(p))?.[1] ?? "";
  return (
    <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        {!root && <BackButton className={deep ? "" : "lg:hidden"} />}
        <Link href="/" aria-label="Logbook, ke beranda" className={root ? "flex" : "hidden lg:flex"}>
          <Logo />
        </Link>
        {!root && <span className="display truncate text-xl lg:hidden">{title}</span>}

        <Link
          href="/tampilan"
          aria-label="Atur tampilan"
          className="ml-auto grid size-11 place-items-center rounded-full bg-card ring-1 ring-border hover:bg-ink hover:text-white lg:order-last lg:ml-1"
        >
          <Palette className="size-5" />
        </Link>
        <nav className="hidden lg:ml-auto lg:block">
          <ul className="flex items-center gap-1">
            {DESKTOP.map((it) => {
              const active = it.href === "/" ? path === "/" || path.startsWith("/workout") : path.startsWith(it.href);
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      active ? "bg-ink text-white" : "text-muted-foreground hover:bg-card hover:text-foreground"
                    }`}
                  >
                    {it.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-xl grid-cols-5">
        {TABS.map((t) => {
          const active = isActive(t.href, path);
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 pt-2 pb-2.5 text-[11px] font-semibold"
              >
                <span
                  className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${
                    active ? "bg-volt text-ink" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="size-5" strokeWidth={active ? 2.5 : 2} />
                </span>
                <span className={active ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
