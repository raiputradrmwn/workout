import Link from "next/link";
import { Activity, CheckCircle2, Footprints } from "lucide-react";
import { db } from "@/lib/db";
import {
  CATEGORY_LABEL,
  DAY_NAMES_ID,
  mondayIndex,
  startOfToday,
  todayDayKey,
  TREADMILL_DEFAULT,
} from "@/lib/schedule";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

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

  const treadmill = await db.treadmillSession.findFirst({
    where: { date: { gte: start, lt: end } },
  });

  const session = day?.sessions[0];
  const workoutDone = !!session?.finishedAt;
  const treadmillDone = !!treadmill?.finishedAt;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{dayName}</p>
        <h1 className="text-2xl font-bold">Latihan Hari Ini</h1>
      </div>

      {/* Strength card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="size-5" />
              {day ? day.label : "Hari Istirahat"}
            </CardTitle>
            {day && (
              <Badge variant={workoutDone ? "default" : "secondary"}>
                {workoutDone
                  ? "Selesai"
                  : session
                    ? "Sedang berjalan"
                    : CATEGORY_LABEL[day.category]}
              </Badge>
            )}
          </div>
          <CardDescription>
            {day
              ? `${day.exercises.length} gerakan - target ${day.exercises.reduce(
                  (a, e) => a + e.targetSets,
                  0,
                )} set`
              : "Tidak ada latihan beban. Boleh treadmill ringan atau mobility."}
          </CardDescription>
        </CardHeader>
        {day && (
          <CardContent className="space-y-4">
            <ol className="space-y-1 text-sm">
              {day.exercises.map((de) => (
                <li
                  key={de.id}
                  className="flex items-baseline justify-between gap-3 border-b border-dashed pb-1 last:border-0"
                >
                  <span>
                    <span className="text-muted-foreground mr-2">{de.order}.</span>
                    {de.exercise.name}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap tabular-nums">
                    {de.targetSets} x {de.targetReps} - istirahat {de.restSeconds}s
                  </span>
                </li>
              ))}
            </ol>
            <Link
              href={`/workout/${day.key}`}
              className={buttonVariants({ size: "lg", className: "w-full" })}
            >
              {session ? "Lanjutkan Sesi" : "Mulai Sesi"}
            </Link>
          </CardContent>
        )}
      </Card>

      {/* Treadmill card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <Footprints className="size-5" />
              Treadmill
            </CardTitle>
            <Badge variant={treadmillDone ? "default" : "secondary"}>
              {treadmillDone ? "Selesai" : "Setiap hari"}
            </Badge>
          </div>
          <CardDescription>
            Incline {TREADMILL_DEFAULT.incline} - kecepatan {TREADMILL_DEFAULT.speed}{" "}
            - {TREADMILL_DEFAULT.minutes} menit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/treadmill"
            className={buttonVariants({
              size: "lg",
              variant: treadmillDone ? "outline" : "default",
              className: "w-full",
            })}
          >
            {treadmillDone ? (
              <>
                <CheckCircle2 className="size-4" /> Lihat / Ulangi
              </>
            ) : (
              "Buka Timer Treadmill"
            )}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
