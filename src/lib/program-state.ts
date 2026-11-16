import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { libraryEntry, toDbRow } from "@/lib/library";
import { programById, type Program } from "@/lib/programs";
import { parsePlan, PLAN_COOKIE, slotFor, type BlockPlan, type WeekSlot } from "@/lib/block-plan";

export const PROGRAM_COOKIE = "program";

/** Pastikan baris Exercise ada untuk nama-nama ini. Mengembalikan nama -> id. */
export async function ensureExercises(names: string[]) {
  const unique = [...new Set(names)];
  const existing = await db.exercise.findMany({ where: { name: { in: unique } } });
  const map = new Map(existing.map((e) => [e.name, e.id]));
  for (const name of unique) {
    if (map.has(name)) continue;
    const entry = libraryEntry(name);
    if (!entry) throw new Error(`Gerakan tidak ada di pustaka: ${name}`);
    const rec = await db.exercise.upsert({
      where: { name },
      create: toDbRow(entry),
      update: {},
    });
    map.set(name, rec.id);
  }
  return map;
}

/**
 * Buat WorkoutDay + DayExercise untuk hari program yang belum ada.
 * Hari yang sudah ada tidak diubah, jadi data lama aman.
 */
export async function ensureProgramDays(program: Program) {
  const keys = program.days.map((d) => d.key);
  const have = await db.workoutDay.findMany({
    where: { key: { in: keys } },
    select: { key: true },
  });
  const missing = program.days.filter((d) => !have.some((h) => h.key === d.key));
  if (missing.length === 0) return;

  const ids = await ensureExercises(missing.flatMap((d) => d.items.map((i) => i[0])));
  const maxOrder = await db.workoutDay.aggregate({ _max: { order: true } });
  let order = (maxOrder._max.order ?? 0) + 1;

  for (const d of missing) {
    await db.workoutDay.create({
      data: {
        key: d.key,
        label: d.label,
        category: d.category,
        order: order++,
        exercises: {
          create: d.items.map(([name, sets, reps, rest, w, r], i) => ({
            exerciseId: ids.get(name)!,
            order: i + 1,
            targetSets: sets,
            targetReps: reps,
            restSeconds: rest,
            suggestWeight: w,
            suggestReps: r,
          })),
        },
      },
    });
  }
}

export type ActiveContext = {
  program: Program;
  plan: BlockPlan | null;
  slot: WeekSlot | null;
  /** Rencana blok sudah lewat; program blok terakhir dipakai terus. */
  finished: boolean;
};

/** Program aktif untuk tanggal tertentu: dari rencana blok kalau ada, kalau tidak dari pilihan tunggal. */
export async function getActiveContext(date = new Date()): Promise<ActiveContext> {
  const jar = await cookies();
  const plan = parsePlan(jar.get(PLAN_COOKIE)?.value);
  const hit = plan ? slotFor(plan, date) : null;
  const program = hit ? hit.slot.program : programById(jar.get(PROGRAM_COOKIE)?.value);
  await ensureProgramDays(program);
  return { program, plan, slot: hit?.slot ?? null, finished: hit?.finished ?? false };
}

export async function getActiveProgram(date = new Date()): Promise<Program> {
  return (await getActiveContext(date)).program;
}

/** Apakah tanggal ini jatuh di minggu deload rencana blok. */
export async function isDeloadWeek(date: Date): Promise<boolean> {
  const plan = parsePlan((await cookies()).get(PLAN_COOKIE)?.value);
  return !!(plan && slotFor(plan, date)?.slot.deload);
}
