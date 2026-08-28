import Link from "next/link";
import { ArrowRight, Moon } from "lucide-react";
import { db } from "@/lib/db";
import {
  CATEGORY_LABEL,
  DAY_NAMES_ID,
  mondayIndex,
  TREADMILL_DEFAULT,
  WEEK_PLAN,
} from "@/lib/schedule";

export const dynamic = "force-dynamic";

const CATEGORY_ACCENT: Record<string, string> = {
  PUSH: "bg-primary/10 text-primary",
  PULL: "bg-chart-4/10 text-chart-4",
  LEGS: "bg-chart-2/10 text-chart-2",
};

export default async function PlanPage() {
  const days = await db.workoutDay.findMany({
    include: {
      exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
    },
  });
  const byKey = new Map(days.map((d) => [d.key, d]));
  const todayIdx = mondayIndex(new Date());

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Program mingguan
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Jadwal Push / Pull / Legs</h1>
        <p className="text-muted-foreground">
          6 hari latihan (PPL 2×) + treadmill {TREADMILL_DEFAULT.minutes} menit
          setiap hari — incline {TREADMILL_DEFAULT.incline}, speed{" "}
          {TREADMILL_DEFAULT.speed}.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {WEEK_PLAN.map((key, i) => {
          const day = key ? byKey.get(key) : null;
          const isToday = i === todayIdx;
          return (
            <section
              key={i}
              className={`card-shadow overflow-hidden rounded-2xl border bg-card ${
                isToday ? "ring-2 ring-primary" : ""
              }`}
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
                  </div>
                  <h2 className="text-lg font-semibold">
                    {day ? day.label : "Istirahat"}
                  </h2>
                  {day ? (
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        CATEGORY_ACCENT[day.category] ?? "bg-muted"
                      }`}
                    >
                      {CATEGORY_LABEL[day.category]}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Moon className="size-4" /> Treadmill ringan opsional
                    </span>
                  )}
                </div>
                {day && (
                  <Link
                    href={`/workout/${day.key}`}
                    className="grid size-9 place-items-center rounded-full border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>

              {day && (
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
