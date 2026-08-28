import { Dumbbell, Footprints } from "lucide-react";
import { db } from "@/lib/db";
import { startOfToday } from "@/lib/schedule";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default async function HistoryPage() {
  const [sessions, treadmills] = await Promise.all([
    db.workoutSession.findMany({
      where: { OR: [{ finishedAt: { not: null } }, { setLogs: { some: {} } }] },
      orderBy: { date: "desc" },
      take: 60,
      include: { day: true, setLogs: true },
    }),
    db.treadmillSession.findMany({ orderBy: { date: "desc" }, take: 60 }),
  ]);

  const start7 = new Date(startOfToday().getTime() - 6 * 86400000);
  const workoutsThisWeek = sessions.filter(
    (s) => s.finishedAt && s.date >= start7,
  ).length;
  const treadmillThisWeek = treadmills.filter(
    (t) => t.finishedAt && t.date >= start7,
  ).length;
  const totalVolume = sessions.reduce(
    (a, s) =>
      a +
      s.setLogs
        .filter((l) => l.done)
        .reduce((x, l) => x + (l.weightKg ?? 0) * (l.reps ?? 0), 0),
    0,
  );

  type Item =
    | { kind: "workout"; date: Date; s: (typeof sessions)[number] }
    | { kind: "treadmill"; date: Date; t: (typeof treadmills)[number] };

  const items: Item[] = [
    ...sessions.map((s) => ({ kind: "workout" as const, date: s.date, s })),
    ...treadmills.map((t) => ({ kind: "treadmill" as const, date: t.date, t })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const stats = [
    ["Latihan / 7 hari", workoutsThisWeek],
    ["Treadmill / 7 hari", treadmillThisWeek],
    ["Total volume", `${Math.round(totalVolume).toLocaleString("id-ID")} kg`],
  ] as const;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Progres
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Riwayat</h1>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-5">
        {stats.map(([k, v]) => (
          <div
            key={k}
            className="card-shadow rounded-2xl border bg-card p-4 sm:p-5"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">
              {k}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums sm:text-2xl">
              {v}
            </p>
          </div>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">Belum ada catatan.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((it) => {
            if (it.kind === "treadmill") {
              const t = it.t;
              return (
                <li
                  key={`t-${t.id}`}
                  className="card-shadow flex items-center gap-4 rounded-2xl border bg-card p-4"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-2/10 text-chart-2">
                    <Footprints className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">Treadmill</p>
                    <p className="text-sm text-muted-foreground">
                      {fmt.format(t.date)} &middot; incline {t.incline}, speed{" "}
                      {t.speed}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                      t.finishedAt
                        ? "bg-success/10 text-success"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {t.finishedAt ? `${t.minutes} mnt` : "belum selesai"}
                  </span>
                </li>
              );
            }
            const s = it.s;
            const done = s.setLogs.filter((l) => l.done);
            const volume = done.reduce(
              (a, l) => a + (l.weightKg ?? 0) * (l.reps ?? 0),
              0,
            );
            return (
              <li
                key={`s-${s.id}`}
                className="card-shadow flex items-center gap-4 rounded-2xl border bg-card p-4"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Dumbbell className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{s.day.label}</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {fmt.format(s.date)} &middot; {done.length} set &middot;{" "}
                    {Math.round(volume).toLocaleString("id-ID")} kg
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                    s.finishedAt
                      ? "bg-success/10 text-success"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.finishedAt ? "selesai" : "berjalan"}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
