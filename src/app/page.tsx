import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Footprints,
  Moon,
  Timer,
} from "lucide-react";
import { db } from "@/lib/db";
import { treadmillSuggestion } from "@/lib/actions";
import {
  CATEGORY_LABEL,
  DAY_NAMES_ID,
  mondayIndex,
  startOfToday,
  todayDayKey,
} from "@/lib/schedule";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
});

const CATEGORY_ACCENT: Record<string, string> = {
  PUSH: "bg-primary/10 text-primary",
  PULL: "bg-chart-4/10 text-chart-4",
  LEGS: "bg-chart-2/10 text-chart-2",
};

export default async function TodayPage() {
  const now = new Date();
  const dayKey = todayDayKey(now);
  const dayName = DAY_NAMES_ID[mondayIndex(now)];
  const start = startOfToday(now);
  const end = new Date(start.getTime() + 86400000);

  const day = dayKey
    ? await db.workoutDay.findUnique({
        where: { key: dayKey },
        include: {
          exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
          sessions: { where: { date: { gte: start, lt: end } } },
        },
      })
    : null;

  const [treadmill, tmSuggest] = await Promise.all([
    db.treadmillSession.findFirst({ where: { date: { gte: start, lt: end } } }),
    treadmillSuggestion(),
  ]);
  const tmPlan = treadmill
    ? { incline: treadmill.incline, speed: treadmill.speed, minutes: treadmill.minutes }
    : tmSuggest;

  const session = day?.sessions[0];
  const workoutDone = !!session?.finishedAt;
  const treadmillDone = !!treadmill?.finishedAt;
  const totalSets = day?.exercises.reduce((a, e) => a + e.targetSets, 0) ?? 0;
  const estMin = day
    ? Math.round(
        day.exercises.reduce(
          (a, e) => a + e.targetSets * (e.restSeconds + 40),
          0,
        ) / 60,
      )
    : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {dayName} &middot; {dateFmt.format(now)}
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Latihan Hari Ini</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---- Strength ---- */}
        <section className="card-shadow rounded-3xl border bg-card lg:col-span-2">
          {day ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b p-6">
                <div className="space-y-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      CATEGORY_ACCENT[day.category] ?? "bg-muted"
                    }`}
                  >
                    {CATEGORY_LABEL[day.category]}
                  </span>
                  <h2 className="text-2xl font-semibold">{day.label}</h2>
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{day.exercises.length} gerakan</span>
                    <span>{totalSets} set</span>
                    <span className="inline-flex items-center gap-1">
                      <Timer className="size-4" /> ~{estMin} menit
                    </span>
                  </p>
                </div>
                {workoutDone && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                    <CheckCircle2 className="size-4" /> Selesai
                  </span>
                )}
              </div>

              <ol className="divide-y">
                {day.exercises.map((de) => (
                  <li
                    key={de.id}
                    className="flex items-center gap-4 px-6 py-3.5"
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                      {de.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{de.exercise.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {de.exercise.muscles}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-sm font-medium tabular-nums">
                        {de.targetSets} &times; {de.targetReps}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        istirahat {de.restSeconds}s
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="p-6 pt-4">
                <Link
                  href={`/workout/${day.key}`}
                  className={buttonVariants({
                    size: "lg",
                    className: "h-12 w-full text-base",
                  })}
                >
                  {session ? "Lanjutkan Sesi" : "Mulai Sesi"}
                  <ArrowRight className="size-5" />
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-muted">
                <Moon className="size-7 text-muted-foreground" />
              </span>
              <h2 className="text-2xl font-semibold">Hari Istirahat</h2>
              <p className="max-w-sm text-muted-foreground">
                Tidak ada latihan beban hari ini. Fokus pemulihan, mobility
                ringan, dan tidur yang cukup. Treadmill ringan tetap boleh.
              </p>
            </div>
          )}
        </section>

        {/* ---- Treadmill ---- */}
        <section className="card-shadow flex flex-col rounded-3xl border bg-card">
          <div className="flex items-center justify-between gap-2 border-b p-6">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-chart-2/10 text-chart-2">
                <Footprints className="size-5" />
              </span>
              <h2 className="text-xl font-semibold">Treadmill</h2>
            </div>
            {treadmillDone ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-sm font-medium text-success">
                <CheckCircle2 className="size-4" /> Selesai
              </span>
            ) : (
              <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                Setiap hari
              </span>
            )}
          </div>

          <div className="space-y-3 p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                ["Incline", tmPlan.incline],
                ["Speed", tmPlan.speed],
                ["Menit", tmPlan.minutes],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-muted/60 p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {k}
                  </p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
                </div>
              ))}
            </div>
            {!treadmillDone && (
              <p className="text-sm text-muted-foreground">{tmSuggest.note}</p>
            )}
          </div>

          <div className="mt-auto p-6 pt-0">
            <Link
              href="/treadmill"
              className={buttonVariants({
                size: "lg",
                variant: treadmillDone ? "outline" : "default",
                className: "h-12 w-full text-base",
              })}
            >
              {treadmillDone ? "Lihat / Ulangi" : "Buka Timer"}
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
