import { db } from "@/lib/db";
import { treadmillSuggestion } from "@/lib/actions";
import { startOfToday } from "@/lib/schedule";
import { TreadmillTimer } from "@/components/treadmill-timer";

export const dynamic = "force-dynamic";

export default async function TreadmillPage() {
  const start = startOfToday();
  const end = new Date(start.getTime() + 86400000);
  const [today, suggestion] = await Promise.all([
    db.treadmillSession.findFirst({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: "desc" },
    }),
    treadmillSuggestion(),
  ]);

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Kardio harian
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">Treadmill</h1>
        <p className="text-muted-foreground">
          Atur incline / kecepatan / durasi sesukamu — atau ikuti saran progresif.
        </p>
      </header>
      <TreadmillTimer
        suggestion={suggestion}
        todayFinished={!!today?.finishedAt}
        todayPlan={
          today
            ? { incline: today.incline, speed: today.speed, minutes: today.minutes }
            : null
        }
        todayDistanceKm={today?.distanceKm ?? null}
      />
    </div>
  );
}
