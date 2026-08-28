import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateSession, lastPerformance } from "@/lib/actions";
import {
  SessionRunner,
  type RunnerExercise,
} from "@/components/session-runner";

export const dynamic = "force-dynamic";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ dayKey: string }>;
}) {
  const { dayKey } = await params;

  const day = await db.workoutDay.findUnique({
    where: { key: dayKey },
    include: {
      exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
    },
  });
  if (!day) notFound();

  const sessionId = await getOrCreateSession(dayKey);
  const session = await db.workoutSession.findUniqueOrThrow({
    where: { id: sessionId },
    include: { setLogs: true },
  });

  const exercises: RunnerExercise[] = await Promise.all(
    day.exercises.map(async (de) => ({
      exerciseId: de.exerciseId,
      name: de.exercise.name,
      muscles: de.exercise.muscles,
      cues: de.exercise.cues,
      equipment: de.exercise.equipment,
      order: de.order,
      targetSets: de.targetSets,
      targetReps: de.targetReps,
      restSeconds: de.restSeconds,
      suggestWeight: de.suggestWeight,
      suggestReps: de.suggestReps,
      last: await lastPerformance(de.exerciseId),
      existing: session.setLogs
        .filter((l) => l.exerciseId === de.exerciseId)
        .map((l) => ({
          setNumber: l.setNumber,
          weightKg: l.weightKg,
          reps: l.reps,
          done: l.done,
        })),
    })),
  );

  return (
    <SessionRunner
      sessionId={sessionId}
      dayLabel={day.label}
      exercises={exercises}
      alreadyFinished={!!session.finishedAt}
    />
  );
}
