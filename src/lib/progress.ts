import { db } from "@/lib/db";
import { libraryEntry, NO_WEIGHT } from "@/lib/library";
import { e1rm } from "@/lib/progression";

export type ProgressPoint = {
  date: string; // ISO
  topWeight: number | null;
  topReps: number;
  e1rm: number | null;
  volume: number; // kg x reps, atau total reps untuk bodyweight
  sets: number;
};

export type ExerciseProgress = {
  exerciseId: string;
  name: string;
  group: string | null;
  weighted: boolean;
  points: ProgressPoint[]; // urut lama -> baru
  best: number; // e1RM terbaik atau reps terbaik
  bestDate: string;
};

/** Ringkasan per gerakan dari semua set "done". */
export async function exerciseProgress(): Promise<ExerciseProgress[]> {
  const rows = await db.setLog.findMany({
    where: { done: true },
    select: {
      weightKg: true,
      reps: true,
      exercise: { select: { id: true, name: true, equipment: true } },
      session: { select: { id: true, date: true } },
    },
    orderBy: { session: { date: "asc" } },
  });

  type Acc = {
    name: string;
    weighted: boolean;
    sessions: Map<string, { date: Date; sets: { w: number | null; r: number }[] }>;
  };
  const by = new Map<string, Acc>();
  for (const r of rows) {
    const acc =
      by.get(r.exercise.id) ??
      by
        .set(r.exercise.id, {
          name: r.exercise.name,
          weighted: !NO_WEIGHT.has(r.exercise.equipment),
          sessions: new Map(),
        })
        .get(r.exercise.id)!;
    const s =
      acc.sessions.get(r.session.id) ??
      acc.sessions.set(r.session.id, { date: r.session.date, sets: [] }).get(r.session.id)!;
    s.sets.push({ w: r.weightKg, r: r.reps ?? 0 });
  }

  const out: ExerciseProgress[] = [];
  for (const [id, acc] of by) {
    const points: ProgressPoint[] = [...acc.sessions.values()]
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ date, sets }) => {
        if (acc.weighted) {
          const top = sets.reduce((a, b) =>
            e1rm(b.w ?? 0, b.r) > e1rm(a.w ?? 0, a.r) ? b : a,
          );
          return {
            date: date.toISOString(),
            topWeight: top.w ?? 0,
            topReps: top.r,
            e1rm: Math.round(e1rm(top.w ?? 0, top.r) * 10) / 10,
            volume: Math.round(sets.reduce((a, s) => a + (s.w ?? 0) * s.r, 0)),
            sets: sets.length,
          };
        }
        const topReps = Math.max(...sets.map((s) => s.r));
        return {
          date: date.toISOString(),
          topWeight: null,
          topReps,
          e1rm: null,
          volume: sets.reduce((a, s) => a + s.r, 0),
          sets: sets.length,
        };
      });
    const metric = (p: ProgressPoint) => (acc.weighted ? (p.e1rm ?? 0) : p.topReps);
    const bestP = points.reduce((a, b) => (metric(b) >= metric(a) ? b : a));
    out.push({
      exerciseId: id,
      name: acc.name,
      group: libraryEntry(acc.name)?.group ?? null,
      weighted: acc.weighted,
      points,
      best: metric(bestP),
      bestDate: bestP.date,
    });
  }
  return out.sort(
    (a, b) =>
      new Date(b.points.at(-1)!.date).getTime() - new Date(a.points.at(-1)!.date).getTime(),
  );
}
