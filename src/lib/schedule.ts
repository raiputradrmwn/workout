// Pembagian hari: Senin..Minggu -> key WorkoutDay (atau null = rest).
// Treadmill dilakukan SETIAP hari (incline 15, speed 3.5, 30 menit).
export const WEEK_PLAN: (string | null)[] = [
  "PUSH_A", // Senin
  "PULL_A", // Selasa
  "LEGS_A", // Rabu
  "PUSH_B", // Kamis
  "PULL_B", // Jumat
  "LEGS_B", // Sabtu
  null, // Minggu - rest (treadmill ringan opsional)
];

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

export function todayDayKey(d = new Date()): string | null {
  return WEEK_PLAN[mondayIndex(d)];
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

/** Urutan latihan PPL dalam seminggu. */
export const PPL_QUEUE = [
  "PUSH_A",
  "PULL_A",
  "LEGS_A",
  "PUSH_B",
  "PULL_B",
  "LEGS_B",
];

/**
 * 7 kunci (Senin..Minggu) untuk minggu yang memuat `date`.
 * Hari yang di-skip jadi rest; sisa latihan digeser mengisi hari berikutnya
 * (termasuk Minggu). Minggu berikutnya kembali normal (skip tidak dibawa).
 */
export function weekPlan(
  date: Date,
  skippedISO: Set<string>,
): { iso: string; key: string | null; skipped: boolean }[] {
  const mon = mondayOf(date);
  const out: { iso: string; key: string | null; skipped: boolean }[] = [];
  let qi = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    const iso = isoLocal(d);
    const skipped = skippedISO.has(iso);
    if (skipped || qi >= PPL_QUEUE.length) out.push({ iso, key: null, skipped });
    else out.push({ iso, key: PPL_QUEUE[qi++], skipped });
  }
  return out;
}

export function effectiveDayKey(
  date: Date,
  skippedISO: Set<string>,
): string | null {
  return weekPlan(date, skippedISO)[mondayIndex(date)].key;
}

export const TREADMILL_DEFAULT = { incline: 15, speed: 3.5, minutes: 30 };

/** Istirahat saat pindah ke gerakan berikutnya (detik). */
export const BETWEEN_EXERCISE_REST = 150;

export const CATEGORY_LABEL: Record<string, string> = {
  PUSH: "Push (Dorong)",
  PULL: "Pull (Tarik)",
  LEGS: "Legs (Kaki)",
  CORE: "Core",
};
