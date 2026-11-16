import { db } from "@/lib/db";
import { treadmillSuggestion } from "@/lib/actions";
import { TreadmillTimer } from "@/components/treadmill-timer";

export const dynamic = "force-dynamic";

export default async function TreadmillPage() {
  const since = new Date(Date.now() - 45 * 86400000);
  const [recent, suggestion] = await Promise.all([
    db.treadmillSession.findMany({
      where: { date: { gte: since } },
      orderBy: { date: "desc" },
      take: 60,
    }),
    treadmillSuggestion(),
  ]);

  return (
    <div className="space-y-8">
      <header className="rise rounded-3xl bg-ink p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-volt">
          Kardio harian
        </p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">Treadmill</h1>
        <p className="mt-3 text-white/75">
          Pilih tanggal, isi incline / kecepatan / menit / km lalu <b>Simpan</b> —
          atau jalankan timer untuk hari ini.
        </p>
      </header>
      <TreadmillTimer
        suggestion={suggestion}
        recent={recent.map((s) => ({
          dateISO: s.date.toISOString().slice(0, 10),
          incline: s.incline,
          speed: s.speed,
          minutes: s.minutes,
          distanceKm: s.distanceKm,
          finished: !!s.finishedAt,
        }))}
      />
    </div>
  );
}
