import { NutritionPlanner } from "@/components/nutrition-planner";
import { CARB_FOODS, FRUIT_FOODS, PROTEIN_FOODS } from "@/lib/nutrition";

export const metadata = { title: "Nutrisi" };

export default function NutrisiPage() {
  const foods = [...PROTEIN_FOODS, ...CARB_FOODS, ...FRUIT_FOODS];

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="rise rounded-3xl bg-ink p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-volt">
          Pola makan
        </p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">Nutrisi</h1>
        <p className="mt-3 text-white/75">
          Template 2 makan · defisit ~800 kkal · protein tinggi. Bahan bisa
          diganti tanpa kehilangan protein.
        </p>
      </header>

      <NutritionPlanner />

      <section className="space-y-3 rounded-sm border bg-card p-5">
        <h2 className="text-base font-semibold">Prinsip</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            Target ~<b>1.900 kkal · 185 g protein · ~110 g karbo</b> (BB 93 kg,
            tujuan turun lemak). Defisit ~800 kkal ≈ turun ~0,75 kg/minggu.
          </li>
          <li>
            <b>Jangan di bawah 1.900 kkal</b> — itu sekitar BMR-mu. Lebih rendah
            = otot ikut hilang, tenaga & tidur drop, akhirnya balas dendam makan.
          </li>
          <li>
            Mau defisit lebih besar? <b>Tambah treadmill / langkah</b>, jangan
            potong makanan.
          </li>
          <li>
            Masak <b>rebus / kukus / panggang / tumis minyak sedikit</b>. Jangan
            goreng tepung atau santan kental.
          </li>
          <li>Kuning telur jangan dibuang. Sayur ≥ 400 g/hari. Air 3–3,5 L.</li>
          <li>
            Tanpa ikan → pertimbangkan multivitamin, variasikan warna sayur.
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-sm border bg-card p-5">
        <h2 className="text-base font-semibold">Ayam: fillet vs bertulang</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <b>Dada / paha fillet</b> — tanpa tulang & kulit. Timbang <b>matang</b>,
            angka gram di template langsung dipakai.
          </li>
          <li>
            <b>Paha bawah bertulang</b> — dihitung per <b>buah</b>. 1 buah ≈ 90 g
            matang bertulang ≈ <b>50 g daging bersih</b> ≈ 13 g protein. Atau timbang
            matang bertulang &amp; berkulit lalu <b>kali 0,55</b>.
          </li>
          <li>
            <b>Buang kulitnya</b> — kulit menambah ±45 kkal per paha.
          </li>
          <li>
            Per gram protein, paha ±26% lebih padat kalori daripada dada; kalau
            banyak ganti ke paha, kurangi minyak tumis atau nasi sedikit.
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-sm border bg-card p-5">
        <h2 className="text-base font-semibold">Saat shift malam (23:00–07:00)</h2>
        <p className="text-sm text-muted-foreground">
          Window 12:00–19:00 tidak masuk. Geser jam-nya, kalori & protein tetap:
        </p>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>
            <b>Sebelum berangkat ~20:00</b> — porsi &ldquo;Makan 1&rdquo;
            (pakai nasi asli, itu bahan bakar shift).
          </li>
          <li>
            <b>Tengah shift ~02:30</b> — protein + sayur saja, nasi
            dikit/skip. Hindari gorengan & karbo olahan (bikin begah/ngantuk).
          </li>
          <li>
            <b>Sesudah shift</b> — air / telur rebus 1–2 butir kalau lapar, lalu
            tidur.
          </li>
        </ul>
      </section>

      <section className="overflow-hidden rounded-sm border bg-card">
        <h2 className="border-b p-4 text-base font-semibold">
          Referensi bahan (per 100 g)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left eyebrow">
              <tr className="border-b">
                <th className="p-3">Bahan</th>
                <th className="p-3 text-right">Kkal</th>
                <th className="p-3 text-right">Protein</th>
                <th className="p-3 text-right">Karbo</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">
                    {f.name}
                    {f.unit === "sachet" && " (1 sachet ≈ 40 g)"}
                    {f.unit === "buah" && " (per 100 g daging bersih · 1 buah ≈ 50 g)"}
                    {f.serve && ` (porsi: ${f.serve.label} ≈ ${f.serve.g} g)`}
                  </td>
                  <td className="p-3 text-right tabular-nums">{f.per100.kcal}</td>
                  <td className="p-3 text-right tabular-nums">{f.per100.p} g</td>
                  <td className="p-3 text-right tabular-nums">{f.per100.c} g</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
