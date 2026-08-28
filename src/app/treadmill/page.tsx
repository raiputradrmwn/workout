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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Treadmill</h1>
        <p className="text-sm text-muted-foreground">
          Dilakukan setiap hari, termasuk hari rest.
        </p>
      </div>
      <TreadmillTimer
        todayFinished={!!today?.finishedAt}
        todayMinutes={today?.finishedAt ? today.minutes : null}
      />
    </div>
  );
}
