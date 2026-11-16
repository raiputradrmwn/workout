import { db } from "@/lib/db";
import { isoLocal, mondayOf, startOfToday } from "@/lib/schedule";
import { exerciseProgress } from "@/lib/progress";

export type Motivation = {
  /** Hari berturut-turut (sampai hari ini/kemarin) dengan latihan beban atau treadmill. */
  streak: number;
  weekDone: number;
  /** Rekor (e1RM / reps terbaik baru) dalam 30 hari terakhir. */
  prs30: number;
  totalSessions: number;
  /** Aktivitas 28 hari terakhir, lama → baru: 0 kosong, 1 treadmill, 2 beban. */
  heat: number[];
};

export async function motivation(): Promise<Motivation> {
  const since = new Date(startOfToday().getTime() - 120 * 86400000);
  const [sessions, treadmill, totalSessions, progress] = await Promise.all([
    db.workoutSession.findMany({
      where: { date: { gte: since }, setLogs: { some: { done: true } } },
      select: { date: true },
    }),
    db.treadmillSession.findMany({
      where: { date: { gte: since }, finishedAt: { not: null } },
      select: { date: true },
    }),
    db.workoutSession.count({ where: { setLogs: { some: { done: true } } } }),
    exerciseProgress(),
  ]);

  const lift = new Set(sessions.map((s) => isoLocal(s.date)));
  const cardio = new Set(treadmill.map((s) => isoLocal(s.date)));
  const active = (iso: string) => lift.has(iso) || cardio.has(iso);

  const today = startOfToday();
  const day = (offset: number) => isoLocal(new Date(today.getTime() - offset * 86400000));
  let streak = 0;
  // hari ini belum latihan tidak memutus streak
  let i = active(day(0)) ? 0 : 1;
  while (active(day(i))) {
    streak++;
    i++;
  }

  const monday = isoLocal(mondayOf(today));
  const weekDone = [...lift].filter((d) => d >= monday).length;

  const cutoff = today.getTime() - 30 * 86400000;
  let prs30 = 0;
  for (const ex of progress) {
    let best = -1;
    for (const p of ex.points) {
      const v = ex.weighted ? (p.e1rm ?? 0) : p.topReps;
      if (best >= 0 && v > best && new Date(p.date).getTime() >= cutoff) prs30++;
      best = Math.max(best, v);
    }
  }

  const heat = Array.from({ length: 28 }, (_, k) => {
    const iso = day(27 - k);
    return lift.has(iso) ? 2 : cardio.has(iso) ? 1 : 0;
  });

  return { streak, weekDone, prs30, totalSessions, heat };
}
