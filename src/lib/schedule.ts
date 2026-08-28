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

export const TREADMILL_DEFAULT = { incline: 15, speed: 3.5, minutes: 30 };

export const CATEGORY_LABEL: Record<string, string> = {
  PUSH: "Push (Dorong)",
  PULL: "Pull (Tarik)",
  LEGS: "Legs (Kaki)",
  CORE: "Core",
};
