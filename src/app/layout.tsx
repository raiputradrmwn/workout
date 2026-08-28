import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Dumbbell } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workout PPL + Treadmill",
  description: "Jadwal Push / Pull / Legs, set logger, dan rest timer.",
};

const nav = [
  { href: "/", label: "Hari Ini" },
  { href: "/plan", label: "Jadwal" },
  { href: "/treadmill", label: "Treadmill" },
  { href: "/history", label: "Riwayat" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b sticky top-0 z-20 bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 h-14 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Dumbbell className="size-5" />
              <span>PPL Trainer</span>
            </Link>
            <nav className="ml-auto flex items-center gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="px-3 py-1.5 rounded-md hover:bg-muted transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
