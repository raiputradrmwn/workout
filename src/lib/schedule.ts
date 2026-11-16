import { programById, type Program } from "@/lib/programs";

export const DAY_NAMES_ID = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

/** Index 0=Senin ... 6=Minggu dari Date. */
export function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

export function startOfToday(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function isoLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function mondayOf(d: Date): Date {
  const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  m.setDate(m.getDate() - mondayIndex(m));
  return m;
}

/**
 * 7 slot (Senin..Minggu) untuk minggu yang memuat `date` sesuai program aktif.
 * Hari yang di-skip jadi rest; latihan yang tertunda digeser ke hari
 * berikutnya (termasuk hari istirahat). Minggu berikutnya kembali normal.
 */
export function weekPlan(
  date: Date,
  skippedISO: Set<string>,
  program: Pick<Program, "pattern" | "queue"> = programById(null),
): { iso: string; key: string | null; skipped: boolean }[] {
  const mon = mondayOf(date);
  const out: { iso: string; key: string | null; skipped: boolean }[] = [];
  let qi = 0;
  let owed = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    const iso = isoLocal(d);
    const skipped = skippedISO.has(iso);
    const slot = program.pattern[i];
    if (skipped) {
      if (slot) owed++;
      out.push({ iso, key: null, skipped });
    } else if ((slot || owed > 0) && qi < program.queue.length) {
      if (!slot) owed--;
      out.push({ iso, key: program.queue[qi++], skipped });
    } else out.push({ iso, key: null, skipped });
  }
  return out;
}

export function effectiveDayKey(
  date: Date,
  skippedISO: Set<string>,
  program?: Pick<Program, "pattern" | "queue">,
): string | null {
  return weekPlan(date, skippedISO, program)[mondayIndex(date)].key;
}

export const TREADMILL_DEFAULT = { incline: 15, speed: 3.5, minutes: 30 };

/** Istirahat saat pindah ke gerakan berikutnya (detik). */
export const BETWEEN_EXERCISE_REST = 150;

export { CATEGORY_LABEL } from "@/lib/programs";
