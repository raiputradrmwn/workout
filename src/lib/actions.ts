"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { startOfToday, TREADMILL_DEFAULT } from "@/lib/schedule";

export async function getOrCreateSession(dayKey: string) {
  const day = await db.workoutDay.findUnique({ where: { key: dayKey } });
  if (!day) throw new Error(`Hari latihan tidak ditemukan: ${dayKey}`);

  const start = startOfToday();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  let session = await db.workoutSession.findFirst({
    where: { dayId: day.id, date: { gte: start, lt: end } },
  });
  if (!session) {
    session = await db.workoutSession.create({
      data: { dayId: day.id },
    });
  }
  return session.id;
}

export async function upsertSet(input: {
  sessionId: string;
  exerciseId: string;
  setNumber: number;
  weightKg: number | null;
  reps: number | null;
  done: boolean;
}) {
  await db.setLog.upsert({
    where: {
      sessionId_exerciseId_setNumber: {
        sessionId: input.sessionId,
        exerciseId: input.exerciseId,
        setNumber: input.setNumber,
      },
    },
    create: input,
    update: {
      weightKg: input.weightKg,
      reps: input.reps,
      done: input.done,
    },
  });
  revalidatePath("/workout/[dayKey]", "page");
}

export async function finishSession(sessionId: string) {
  await db.workoutSession.update({
    where: { id: sessionId },
    data: { finishedAt: new Date() },
  });
  revalidatePath("/", "page");
  revalidatePath("/history", "page");
}

/** Set "done" terakhir per gerakan dari sesi SEBELUM hari ini (buat patokan beban). */
export async function lastPerformance(exerciseId: string) {
  const start = startOfToday();
  const rows = await db.setLog.findMany({
    where: {
      exerciseId,
      done: true,
      session: { date: { lt: start } },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { session: true },
  });
  if (rows.length === 0) return null;
  const latestDate = rows[0].session.date.toDateString();
  const sameDay = rows
    .filter((r) => r.session.date.toDateString() === latestDate)
    .sort((a, b) => a.setNumber - b.setNumber);
  return sameDay.map((r) => ({
    setNumber: r.setNumber,
    weightKg: r.weightKg,
    reps: r.reps,
  }));
}

export async function startTreadmill() {
  const start = startOfToday();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const existing = await db.treadmillSession.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  if (existing) return existing.id;
  const rec = await db.treadmillSession.create({ data: { ...TREADMILL_DEFAULT } });
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
  return rec.id;
}

export async function finishTreadmill(id: string, minutes: number) {
  await db.treadmillSession.update({
    where: { id },
    data: { finishedAt: new Date(), minutes },
  });
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
}
