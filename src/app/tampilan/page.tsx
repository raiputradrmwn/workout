import { cookies } from "next/headers";
import { Customizer } from "@/components/customizer";
import { readPrefs } from "@/lib/prefs";

export default async function AppearancePage() {
  const prefs = readPrefs(await cookies());
  return (
    <div className="space-y-6">
      <header>
        <h1 className="display text-5xl sm:text-6xl">Tampilan</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Atur sesukamu: gaya, warna, mode, font, ukuran. Perubahan langsung terlihat dan tersimpan
          di perangkat ini. Bisa dikembalikan ke awal kapan saja.
        </p>
      </header>
      <Customizer initial={prefs} />
    </div>
  );
}
