import { db } from "@/lib/db";
import { startOfToday } from "@/lib/schedule";
import { HistoryList, type HistoryItem } from "@/components/history-list";

export const dynamic = "force-dynamic";

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

  const items: HistoryItem[] = [
    ...sessions.map((s) => {
      const done = s.setLogs.filter((l) => l.done);
      return {
        kind: "workout" as const,
        id: s.id,
        date: s.date.toISOString(),
        label: s.day.label,
        sets: done.length,
        volume: done.reduce(
          (a, l) => a + (l.weightKg ?? 0) * (l.reps ?? 0),
          0,
        ),
        finished: !!s.finishedAt,
      };
    }),
    ...treadmills.map((t) => ({
      kind: "treadmill" as const,
      id: t.id,
      date: t.date.toISOString(),
      incline: t.incline,
      speed: t.speed,
      minutes: t.minutes,
      distanceKm: t.distanceKm,
      finished: !!t.finishedAt,
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

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

      <HistoryList items={items} />
    </div>
  );
}
