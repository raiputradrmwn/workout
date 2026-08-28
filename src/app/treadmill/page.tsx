import { db } from "@/lib/db";
import { startOfToday } from "@/lib/schedule";
import { TreadmillTimer } from "@/components/treadmill-timer";

export const dynamic = "force-dynamic";

export default async function TreadmillPage() {
  const start = startOfToday();
  const end = new Date(start.getTime() + 86400000);
  const today = await db.treadmillSession.findFirst({
    where: { date: { gte: start, lt: end } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Kardio harian
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Treadmill</h1>
        <p className="text-muted-foreground">
          Dilakukan setiap hari, termasuk hari istirahat.
        </p>
      </header>
      <TreadmillTimer
        todayFinished={!!today?.finishedAt}
        todayMinutes={today?.finishedAt ? today.minutes : null}
      />
    </div>
  );
}
