import { db } from "@/lib/db";
import { lastPerformanceMany } from "@/lib/actions";
import { alternativesFor } from "@/lib/exercise-alternatives";
import type { RunnerExercise } from "@/components/session-runner";

/** Bangun data yang dipakai SessionRunner untuk satu WorkoutSession. */
export async function buildSessionView(sessionId: string) {
  const session = await db.workoutSession.findUnique({
    where: { id: sessionId },
    include: {
      setLogs: true,
      day: {
        include: {
          exercises: {
            orderBy: { order: "asc" },
            include: { exercise: true },
          },
        },
      },
    },
  });
  if (!session) return null;

  const day = session.day;
  const swaps = (session.swaps as Record<string, string> | null) ?? {};

  const altNames = new Set<string>();
  for (const de of day.exercises)
    for (const n of alternativesFor(de.exercise.name)) altNames.add(n);
  const altRows = altNames.size
    ? await db.exercise.findMany({ where: { name: { in: [...altNames] } } })
    : [];
  const byName = new Map(altRows.map((e) => [e.name, e]));
  const byId = new Map(altRows.map((e) => [e.id, e]));
  for (const de of day.exercises) byId.set(de.exercise.id, de.exercise);

  const effectiveIds = day.exercises.map((de) => swaps[de.id] ?? de.exerciseId);
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

  return { session, day, exercises };
}
