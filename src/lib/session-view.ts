import { db } from "@/lib/db";
import { lastPerformanceMany } from "@/lib/actions";
import { alternativesFor, libraryEntry } from "@/lib/library";
import { programForDay, supersetOf } from "@/lib/programs";
import { suggestNext } from "@/lib/progression";
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
  const scheme = programForDay(day.key)?.scheme ?? "double";
  const swaps = (session.swaps as Record<string, string> | null) ?? {};

  const swappedIds = Object.values(swaps);
  const swappedRows = swappedIds.length
    ? await db.exercise.findMany({ where: { id: { in: swappedIds } } })
    : [];
  const byId = new Map(swappedRows.map((e) => [e.id, e]));
  for (const de of day.exercises) byId.set(de.exercise.id, de.exercise);

  const effectiveIds = day.exercises.map((de) => swaps[de.id] ?? de.exerciseId);
  const lastByExercise = await lastPerformanceMany(effectiveIds);

  const exercises: RunnerExercise[] = day.exercises.map((de) => {
    const effId = swaps[de.id] ?? de.exerciseId;
    const ex = byId.get(effId) ?? de.exercise;
    const lib = libraryEntry(ex.name);
    const last = lastByExercise[effId] ?? null;
    const alts = alternativesFor(de.exercise.name);
    return {
      dayExerciseId: de.id,
      exerciseId: ex.id,
      name: ex.name,
      muscles: ex.muscles,
      cues: lib?.cues ?? [ex.cues],
      avoid: lib?.avoid ?? null,
      equipment: ex.equipment,
      order: de.order,
      superset: supersetOf(day.key, de.order, de.exercise.name),
      targetSets: de.targetSets,
      targetReps: de.targetReps,
      restSeconds: de.restSeconds,
      alternatives: alts.length > 1 ? alts : [],
      last,
      suggestion: suggestNext({
        equipment: ex.equipment,
        category: ex.category,
        compound: lib?.compound ?? false,
        targetReps: de.targetReps,
        scheme,
        last,
        fallbackWeight: effId === de.exerciseId ? de.suggestWeight : null,
        fallbackReps: de.suggestReps,
      }),
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

  return { session, day, exercises, scheme };
}
