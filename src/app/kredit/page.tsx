import { WGER_CREDITED } from "@/lib/exercise-media";

export const metadata = { title: "Kredit & Lisensi" };

export default function KreditPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Atribusi
        </p>
        <h1 className="text-3xl font-semibold">Kredit &amp; Lisensi</h1>
      </header>

      <section className="card-shadow space-y-3 rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Foto gerakan</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Foto demonstrasi gerakan diambil dari{" "}
          <a
            href="https://wger.de"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline"
          >
            wger Workout Manager (wger.de)
          </a>
          , kontribusi komunitas wger. Dilisensikan di bawah{" "}
          <a
            href="https://creativecommons.org/licenses/by-sa/3.0/deed.en"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline"
          >
            Creative Commons Attribution-ShareAlike 3.0 (CC BY-SA 3.0)
          </a>
          . Tidak ada perubahan pada foto; ditampilkan apa adanya sebagai acuan
          bentuk gerakan.
        </p>
        <div>
          <p className="mb-1 text-sm font-medium">
            Gerakan yang memakai foto wger ({WGER_CREDITED.length}):
          </p>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
            {WGER_CREDITED.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="card-shadow space-y-2 rounded-2xl border bg-card p-6 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Video demo</h2>
        <p>
          Tombol &ldquo;Video demo&rdquo; membuka hasil pencarian YouTube di tab
          baru. Video tetap berada di YouTube — aplikasi ini tidak menyimpan atau
          menyalin video apa pun.
        </p>
        <h2 className="pt-2 text-lg font-semibold text-foreground">
          Animasi figur
        </h2>
        <p>
          Animasi figur samping dibuat sendiri (SVG + CSS), bukan karya pihak
          lain.
        </p>
      </section>
    </div>
  );
}
