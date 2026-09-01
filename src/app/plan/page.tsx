import Link from "next/link";
import { ArrowRight, Moon, SkipForward, Undo2 } from "lucide-react";
import { db } from "@/lib/db";
import { toggleSkipDay } from "@/lib/actions";
import {
  CATEGORY_LABEL,
  DAY_NAMES_ID,
  isoLocal,
  mondayIndex,
  mondayOf,
  TREADMILL_DEFAULT,
  weekPlan,
} from "@/lib/schedule";

export const dynamic = "force-dynamic";

const CATEGORY_ACCENT: Record<string, string> = {
  PUSH: "bg-primary/10 text-primary",
  PULL: "bg-chart-4/10 text-chart-4",
  LEGS: "bg-chart-2/10 text-chart-2",
};

export default async function PlanPage() {
  const now = new Date();
  const todayISO = isoLocal(now);
  const todayIdx = mondayIndex(now);

  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const [days, skippedRows] = await Promise.all([
    db.workoutDay.findMany({
      include: {
        exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
      },
    }),
    db.skippedDay.findMany({ where: { date: { gte: weekStart, lt: weekEnd } } }),
  ]);
  const byKey = new Map(days.map((d) => [d.key, d]));
  const skippedSet = new Set(skippedRows.map((r) => isoLocal(r.date)));
  const plan = weekPlan(now, skippedSet);
  const shifted = plan.some((p) => p.skipped);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Program mingguan
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Jadwal Push / Pull / Legs
        </h1>
        <p className="text-muted-foreground">
          6 hari latihan (PPL 2×) + treadmill {TREADMILL_DEFAULT.minutes} menit
          setiap hari.{" "}
          {shifted
            ? "Ada hari yang dilewati — jadwal minggu ini digeser. Senin depan kembali normal."
            : "Lewati satu hari kalau sakit; jadwal otomatis geser ke hari berikutnya sampai Minggu."}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {plan.map(({ iso, key, skipped }, i) => {
          const day = key ? byKey.get(key) : null;
          const isToday = i === todayIdx;
          const canToggle = iso >= todayISO;
          return (
            <section
              key={iso}
              className={`card-shadow overflow-hidden rounded-2xl border bg-card ${
                isToday ? "ring-2 ring-primary" : ""
              } ${skipped ? "opacity-70" : ""}`}
            >
              <div className="flex items-start justify-between gap-3 border-b p-5">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {DAY_NAMES_ID[i]}
                    </span>
                    {isToday && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
                        Hari ini
                      </span>
                    )}
                    {skipped && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                        Dilewati
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">
                    {skipped
                      ? "Dilewati"
                      : day
                        ? day.label
                        : "Istirahat"}
                  </h2>
                  {day && !skipped ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        CATEGORY_ACCENT[day.category] ?? "bg-muted"
                      }`}
                    >
                      {CATEGORY_LABEL[day.category]}
                    </span>
                  ) : (
                    !skipped && (
                      <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                        <Moon className="size-4" /> Treadmill ringan opsional
                      </span>
                    )
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {canToggle && (
                    <form action={toggleSkipDay.bind(null, iso)}>
                      <button
                        type="submit"
                        title={skipped ? "Batalkan lewati" : "Lewati hari ini"}
                        className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {skipped ? (
                          <Undo2 className="size-4" />
                        ) : (
                          <SkipForward className="size-4" />
                        )}
                      </button>
                    </form>
                  )}
                  {day && !skipped && (
                    <Link
                      href={`/workout/${day.key}`}
                      className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </div>

              {day && !skipped && (
                <ol className="divide-y">
                  {day.exercises.map((de) => (
                    <li
                      key={de.id}
                      className="flex items-center gap-3 px-5 py-2.5 text-sm"
                    >
                      <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                        {de.order}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {de.exercise.name}
                      </span>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {de.targetSets} × {de.targetReps}
                      </span>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
