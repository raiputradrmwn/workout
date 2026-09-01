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

export async function swapExercise(
  sessionId: string,
  dayExerciseId: string,
  exerciseId: string,
) {
  const s = await db.workoutSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { swaps: true, dayId: true },
  });
  const de = await db.dayExercise.findUniqueOrThrow({
    where: { id: dayExerciseId },
    select: { dayId: true },
  });
  if (de.dayId !== s.dayId) throw new Error("Gerakan bukan bagian dari hari ini");

  const swaps = { ...((s.swaps as Record<string, string> | null) ?? {}) };
  // kalau kembali ke gerakan asli, hapus entri
  const de2 = await db.dayExercise.findUniqueOrThrow({
    where: { id: dayExerciseId },
    select: { exerciseId: true },
  });
  if (exerciseId === de2.exerciseId) delete swaps[dayExerciseId];
  else swaps[dayExerciseId] = exerciseId;

  await db.workoutSession.update({
    where: { id: sessionId },
    data: { swaps },
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

type PerfSet = { setNumber: number; weightKg: number | null; reps: number | null };

/**
 * Set "done" terakhir per gerakan dari sesi SEBELUM hari ini (buat patokan beban).
 * Satu query untuk semua gerakan sekaligus — hemat round-trip ke DB.
 */
export async function lastPerformanceMany(
  exerciseIds: string[],
): Promise<Record<string, PerfSet[]>> {
  if (exerciseIds.length === 0) return {};
  const start = startOfToday();
  const rows = await db.setLog.findMany({
    where: {
      exerciseId: { in: exerciseIds },
      done: true,
      session: { date: { lt: start } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      exerciseId: true,
      setNumber: true,
      weightKg: true,
      reps: true,
      session: { select: { date: true } },
    },
  });

  const out: Record<string, PerfSet[]> = {};
  const latestDay: Record<string, string> = {};
  for (const r of rows) {
    const day = r.session.date.toDateString();
    latestDay[r.exerciseId] ??= day;
    if (latestDay[r.exerciseId] !== day) continue;
    (out[r.exerciseId] ??= []).push({
      setNumber: r.setNumber,
      weightKg: r.weightKg,
      reps: r.reps,
    });
  }
  for (const k of Object.keys(out)) {
    out[k].sort((a, b) => a.setNumber - b.setNumber);
  }
  return out;
}

type TreadmillPlan = { incline: number; speed: number; minutes: number };

export async function startTreadmill(plan?: Partial<TreadmillPlan>) {
  const start = startOfToday();
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const existing = await db.treadmillSession.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  if (existing) {
    if (plan && !existing.finishedAt) {
      await db.treadmillSession.update({
        where: { id: existing.id },
        data: {
          incline: plan.incline ?? existing.incline,
          speed: plan.speed ?? existing.speed,
          minutes: plan.minutes ?? existing.minutes,
        },
      });
    }
    return existing.id;
  }
  const rec = await db.treadmillSession.create({
    data: {
      incline: plan?.incline ?? TREADMILL_DEFAULT.incline,
      speed: plan?.speed ?? TREADMILL_DEFAULT.speed,
      minutes: plan?.minutes ?? TREADMILL_DEFAULT.minutes,
    },
  });
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
  return rec.id;
}

export async function finishTreadmill(
  id: string,
  data: { minutes: number; distanceKm: number | null },
) {
  await db.treadmillSession.update({
    where: { id },
    data: {
      finishedAt: new Date(),
      minutes: data.minutes,
      distanceKm: data.distanceKm,
    },
  });
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
  revalidatePath("/history", "page");
}

/** Skip / batal-skip sebuah hari (YYYY-MM-DD). Jadwal PPL minggu itu digeser. */
export async function toggleSkipDay(dateISO: string) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0);
  const existing = await db.skippedDay.findUnique({ where: { date } });
  if (existing) {
    await db.skippedDay.delete({ where: { id: existing.id } });
  } else {
    await db.skippedDay.create({ data: { date } });
  }
  revalidatePath("/", "page");
  revalidatePath("/plan", "page");
}

export async function deleteWorkoutSession(id: string) {
  await db.workoutSession.delete({ where: { id } });
  revalidatePath("/history", "page");
  revalidatePath("/", "page");
}

export async function deleteTreadmill(id: string) {
  await db.treadmillSession.delete({ where: { id } });
  revalidatePath("/history", "page");
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
}

export async function updateTreadmill(
  id: string,
  data: {
    incline: number;
    speed: number;
    minutes: number;
    distanceKm: number | null;
  },
) {
  await db.treadmillSession.update({ where: { id }, data });
  revalidatePath("/history", "page");
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
}

/** Catat / ubah sesi treadmill untuk tanggal tertentu (YYYY-MM-DD), tanpa timer. */
export async function logTreadmill(input: {
  dateISO: string;
  incline: number;
  speed: number;
  minutes: number;
  distanceKm: number | null;
}) {
  const [y, m, d] = input.dateISO.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start.getTime() + 86400000);
  const existing = await db.treadmillSession.findFirst({
    where: { date: { gte: start, lt: end } },
  });
  const data = {
    incline: input.incline,
    speed: input.speed,
    minutes: input.minutes,
    distanceKm: input.distanceKm,
    finishedAt: new Date(),
  };
  if (existing) {
    await db.treadmillSession.update({ where: { id: existing.id }, data });
  } else {
    await db.treadmillSession.create({
      data: { ...data, date: new Date(y, m - 1, d, 12, 0, 0) },
    });
  }
  revalidatePath("/treadmill", "page");
  revalidatePath("/", "page");
  revalidatePath("/history", "page");
}

/** Saran setelan treadmill berikutnya berdasarkan sesi yang sudah selesai. */
export async function treadmillSuggestion(): Promise<
  TreadmillPlan & { note: string }
> {
  const finished = await db.treadmillSession.count({
    where: { finishedAt: { not: null } },
  });
  const last = await db.treadmillSession.findFirst({
    where: { finishedAt: { not: null } },
    orderBy: { date: "desc" },
  });
  const incline = last?.incline ?? TREADMILL_DEFAULT.incline;
  let speed = last?.speed ?? TREADMILL_DEFAULT.speed;
  let minutes = last?.minutes ?? TREADMILL_DEFAULT.minutes;
  let note: string;

  if (finished === 0) {
    note =
      "Mulai dari baseline dan selesaikan penuh: incline 15 · 3.5 km/j · 30 menit.";
  } else if (finished % 6 === 0 && minutes < 45) {
    minutes += 5;
    note = `${finished} sesi selesai — naik level: tambah durasi jadi ${minutes} menit.`;
  } else if (finished % 3 === 0 && speed < 6) {
    speed = Math.round((speed + 0.2) * 10) / 10;
    note = `${finished} sesi selesai — coba naikkan kecepatan ke ${speed} km/j.`;
  } else {
    const toNext = 3 - (finished % 3);
    note = `Pertahankan setelan ini. ${toNext} sesi lagi menuju kenaikan berikutnya.`;
  }
  return { incline, speed, minutes, note };
}
