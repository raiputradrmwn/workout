import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateSession, lastPerformanceMany } from "@/lib/actions";
import { alternativesFor } from "@/lib/exercise-alternatives";
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
  const swaps = (session.swaps as Record<string, string> | null) ?? {};

  // Semua gerakan alternatif yang mungkin dipakai hari ini
  const altNames = new Set<string>();
  for (const de of day.exercises)
    for (const n of alternativesFor(de.exercise.name)) altNames.add(n);
  const altRows = altNames.size
    ? await db.exercise.findMany({ where: { name: { in: [...altNames] } } })
    : [];
  const byName = new Map(altRows.map((e) => [e.name, e]));
  const byId = new Map(altRows.map((e) => [e.id, e]));
  for (const de of day.exercises) byId.set(de.exercise.id, de.exercise);

  const effectiveIds = day.exercises.map(
    (de) => swaps[de.id] ?? de.exerciseId,
  );
  const lastByExercise = await lastPerformanceMany(effectiveIds);

  const exercises: RunnerExercise[] = day.exercises.map((de) => {
    const effId = swaps[de.id] ?? de.exerciseId;
    const ex = byId.get(effId) ?? de.exercise;
    const alts = alternativesFor(de.exercise.name)
      .map((n) => byName.get(n))
      .filter((e): e is NonNullable<typeof e> => !!e)
      .map((e) => ({ id: e.id, name: e.name }));
    return {
      dayExerciseId: de.id,
      exerciseId: ex.id,
      name: ex.name,
      muscles: ex.muscles,
      cues: ex.cues,
      equipment: ex.equipment,
      order: de.order,
      targetSets: de.targetSets,
      targetReps: de.targetReps,
      restSeconds: de.restSeconds,
      suggestWeight: de.suggestWeight,
      suggestReps: de.suggestReps,
      alternatives: alts.length > 1 ? alts : [],
      last: lastByExercise[effId] ?? null,
      existing: session.setLogs
        .filter((l) => l.exerciseId === effId)
        .map((l) => ({
          setNumber: l.setNumber,
          weightKg: l.weightKg,
          reps: l.reps,
          done: l.done,
        })),
    };
  });

  return (
    <SessionRunner
      sessionId={sessionId}
      dayLabel={day.label}
      dayCategory={day.category}
      exercises={exercises}
      alreadyFinished={!!session.finishedAt}
    />
  );
}
