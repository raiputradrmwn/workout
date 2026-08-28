import Link from "next/link";
import { db } from "@/lib/db";
import { DAY_NAMES_ID, WEEK_PLAN, TREADMILL_DEFAULT } from "@/lib/schedule";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const days = await db.workoutDay.findMany({
    include: {
      exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
    },
  });
  const byKey = new Map(days.map((d) => [d.key, d]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Jadwal Mingguan</h1>
        <p className="text-sm text-muted-foreground">
          Push / Pull / Legs (2x seminggu) + treadmill {TREADMILL_DEFAULT.minutes}{" "}
          menit setiap hari (incline {TREADMILL_DEFAULT.incline}, speed{" "}
          {TREADMILL_DEFAULT.speed}).
        </p>
      </div>

      {WEEK_PLAN.map((key, i) => {
        const day = key ? byKey.get(key) : null;
        return (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {DAY_NAMES_ID[i]} - {day ? day.label : "Rest"}
                </CardTitle>
                {day ? (
                  <Link href={`/workout/${day.key}`}>
                    <Badge>Buka</Badge>
                  </Link>
                ) : (
                  <Badge variant="secondary">Treadmill saja</Badge>
                )}
              </div>
              {day && (
                <CardDescription>
                  {day.exercises.length} gerakan -{" "}
                  {day.exercises.reduce((a, e) => a + e.targetSets, 0)} set
                </CardDescription>
              )}
            </CardHeader>
            {day && (
              <CardContent>
                <ol className="space-y-1 text-sm">
                  {day.exercises.map((de) => (
                    <li
                      key={de.id}
                      className="flex items-baseline justify-between gap-3 border-b border-dashed pb-1 last:border-0"
                    >
                      <span>
                        <span className="text-muted-foreground mr-2">
                          {de.order}.
                        </span>
                        {de.exercise.name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {de.exercise.muscles}
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-muted-foreground tabular-nums">
                        {de.targetSets} x {de.targetReps} - {de.restSeconds}s
                      </span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
