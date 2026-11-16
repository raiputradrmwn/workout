import Link from "next/link";
import { exerciseProgress, type ExerciseProgress } from "@/lib/progress";
import { GROUP_LABEL, type Group } from "@/lib/library";
import { Sparkline } from "@/components/sparkline";

export const dynamic = "force-dynamic";

const dFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });

function metric(p: ExerciseProgress["points"][number], weighted: boolean) {
  return weighted ? (p.e1rm ?? 0) : p.topReps;
}

function Delta({ ex }: { ex: ExerciseProgress }) {
  if (ex.points.length < 2) return <span className="text-muted-foreground">—</span>;
  const first = metric(ex.points[0], ex.weighted);
  const last = metric(ex.points.at(-1)!, ex.weighted);
  const d = Math.round((last - first) * 10) / 10;
  if (d === 0) return <span className="text-muted-foreground">±0</span>;
  return (
    <span className={d > 0 ? "font-bold text-signal" : "text-muted-foreground"}>
      {d > 0 ? "+" : ""}
      {d}
      {ex.weighted ? " kg" : ""}
    </span>
  );
}

export default async function ProgressPage() {
  const all = await exerciseProgress();
  const sessions = new Set(all.flatMap((e) => e.points.map((p) => p.date.slice(0, 10)))).size;
  const prs = all.filter(
    (e) => e.points.length > 1 && e.bestDate === e.points.at(-1)!.date,
  ).length;
  const totalVolume = all
    .filter((e) => e.weighted)
    .reduce((a, e) => a + e.points.reduce((b, p) => b + p.volume, 0), 0);

  return (
    <div className="space-y-12">
      <header className="rise rounded-3xl bg-ink p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-volt">Progressive overload</p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">Progres</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/75">
          Untuk gerakan berbeban, angka utama adalah estimasi 1RM dari set terbaik tiap sesi
          (rumus Epley). Untuk bodyweight dan band, reps terbaik. Garis yang naik pelan tapi
          konsisten lebih berharga daripada lonjakan.
        </p>
      </header>

      <dl className="rise grid grid-cols-3 gap-3 [animation-delay:60ms]">
        {(
          [
            ["Sesi tercatat", sessions],
            ["Rekor di sesi terakhir", prs],
            ["Total volume", `${(totalVolume / 1000).toFixed(1)} t`],
          ] as const
        ).map(([k, v], i) => (
          <div key={k} className={`rounded-2xl p-4 sm:p-5 ${i === 1 ? "bg-volt" : "card"}`}>
            <dt className="text-xs font-semibold sm:text-sm">{k}</dt>
            <dd className="num mt-2 text-3xl sm:text-4xl">{v}</dd>
          </div>
        ))}
      </dl>

      {all.length === 0 ? (
        <p className="max-w-md text-muted-foreground">
          Belum ada set yang ditandai selesai. Mulai sesi dari{" "}
          <Link href="/" className="text-foreground underline underline-offset-4">
            Hari ini
          </Link>
          , dan grafiknya akan muncul di sini.
        </p>
      ) : (
        <section className="rise card overflow-hidden px-4 [animation-delay:120ms] sm:px-5">
          <div className="eyebrow hidden grid-cols-[minmax(0,1fr)_7rem_6rem_6rem_5rem] gap-4 border-b pt-4 pb-2 md:grid">
            <span>Gerakan</span>
            <span>Tren</span>
            <span className="text-right">Terakhir</span>
            <span className="text-right">Terbaik</span>
            <span className="text-right">Sejak awal</span>
          </div>
          <ul>
            {all.map((ex) => {
              const lastP = ex.points.at(-1)!;
              const lastIsBest = ex.points.length > 1 && ex.bestDate === lastP.date;
              return (
                <li key={ex.exerciseId} className="border-b last:border-0">
                  <details className="group">
                    <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-4 md:grid-cols-[minmax(0,1fr)_7rem_6rem_6rem_5rem]">
                      <span className="min-w-0">
                        <span className="font-semibold">{ex.name}</span>
                        <span className="block text-xs text-muted-foreground">
                          {ex.group ? GROUP_LABEL[ex.group as Group] : "—"} · {ex.points.length} sesi
                        </span>
                      </span>
                      <Sparkline
                        values={ex.points.map((p) => metric(p, ex.weighted))}
                        className="h-8 w-28 text-foreground"
                      />
                      <span className="num col-span-2 flex justify-between text-sm md:contents">
                        <span className="md:text-right">
                          <span className="eyebrow mr-2 md:hidden">Terakhir</span>
                          {ex.weighted
                            ? `${lastP.topWeight}×${lastP.topReps}`
                            : `${lastP.topReps} rep`}
                        </span>
                        <span className="md:text-right">
                          <span className="eyebrow mr-2 md:hidden">Best</span>
                          <span className={lastIsBest ? "rounded bg-volt px-1" : ""}>
                            {ex.weighted ? `${ex.best}` : ex.best}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {ex.weighted ? " e1RM" : ""}
                          </span>
                        </span>
                        <span className="md:text-right">
                          <Delta ex={ex} />
                        </span>
                      </span>
                    </summary>
                    <table className="num mb-5 w-full text-xs">
                      <thead className="eyebrow text-left">
                        <tr className="border-b">
                          <th className="py-1.5 font-normal">Tanggal</th>
                          <th className="py-1.5 text-right font-normal">Set terbaik</th>
                          {ex.weighted && <th className="py-1.5 text-right font-normal">e1RM</th>}
                          <th className="py-1.5 text-right font-normal">Set</th>
                          <th className="py-1.5 text-right font-normal">
                            {ex.weighted ? "Volume kg" : "Total rep"}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...ex.points].reverse().map((p) => (
                          <tr key={p.date} className="border-b border-dashed last:border-0">
                            <td className="py-1.5">{dFmt.format(new Date(p.date))}</td>
                            <td className="py-1.5 text-right">
                              {ex.weighted ? `${p.topWeight} × ${p.topReps}` : p.topReps}
                            </td>
                            {ex.weighted && (
                              <td
                                className={`py-1.5 text-right ${p.date === ex.bestDate ? "text-signal" : ""}`}
                              >
                                {p.e1rm}
                              </td>
                            )}
                            <td className="py-1.5 text-right">{p.sets}</td>
                            <td className="py-1.5 text-right">{p.volume}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </details>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
