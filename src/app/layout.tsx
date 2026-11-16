import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Anton, Barlow, Barlow_Condensed, Oswald, Space_Grotesk } from "next/font/google";
import { readPrefs } from "@/lib/prefs";
import { BottomNav, TopBar } from "@/components/main-nav";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
});

const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["600", "700"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"], weight: ["700"] });

export const metadata: Metadata = {
  title: "Logbook",
  description: "Program latihan, catatan set, progressive overload, dan rest timer.",
};

export const viewport: Viewport = {
  themeColor: "#f2f2ee",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const p = readPrefs(await cookies());
  return (
    <html
      lang="id"
      data-style={p.style}
      data-accent={p.accent}
      data-mode={p.mode}
      data-font={p.font}
      data-size={p.size}
      data-motion={p.motion}
      className={`${barlow.variable} ${barlowCondensed.variable} ${anton.variable} ${oswald.variable} ${grotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-32 sm:px-6 lg:pt-10 lg:pb-16">
          {children}
        </main>
        <BottomNav />
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
