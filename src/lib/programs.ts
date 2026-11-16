// Definisi program latihan. Hari (WorkoutDay) dibuat di database secara
// otomatis saat program dipilih — tidak pernah menghapus data yang sudah ada.

export type Scheme = "double" | "linear";

/**
 * [nama gerakan, set, target reps, istirahat (dtk), saran berat awal, saran reps awal, superset?]
 * Item berurutan dengan huruf superset yang sama dikerjakan bergantian
 * (A1 → A2 → istirahat → A1 ...). Tiga gerakan atau lebih = circuit.
 */
export type TmplItem = [
  name: string,
  sets: number,
  reps: string,
  rest: number,
  suggestWeight: number | null,
  suggestReps: number,
  superset?: string,
];

export type ProgramDay = {
  key: string;
  label: string;
  category: string;
  items: TmplItem[];
};

export type Program = {
  id: string;
  name: string;
  short: string;
  goal: string;
  summary: string;
  /** Cara menaikkan beban. */
  scheme: Scheme;
  /** Senin..Minggu: true = slot latihan. */
  pattern: boolean[];
  /** Urutan hari dalam seminggu (dipakai mengisi slot latihan). */
  queue: string[];
  days: ProgramDay[];
};

export const SCHEME_INFO: Record<Scheme, { name: string; rule: string }> = {
  double: {
    name: "Double progression",
    rule: "Pakai beban yang sama sampai semua set mencapai batas atas rentang reps. Setelah itu naikkan beban dan mulai lagi dari batas bawah.",
  },
  linear: {
    name: "Linear progression",
    rule: "Setiap sesi yang semua setnya tuntas, beban naik. Gagal di beban yang sama tiga sesi berturut-turut, turunkan 10% lalu bangun lagi.",
  },
};

export const CATEGORY_LABEL: Record<string, string> = {
  PUSH: "Push",
  PULL: "Pull",
  LEGS: "Legs",
  CORE: "Core",
  UPPER: "Upper",
  LOWER: "Lower",
  FULL: "Full body",
};

const PPL: Program = {
  id: "ppl",
  name: "Push / Pull / Legs",
  short: "PPL",
  goal: "Hipertrofi",
  summary:
    "Enam hari, tiap otot dilatih dua kali seminggu dengan volume tinggi. Cocok kalau waktu latihan longgar dan pemulihan bagus.",
  scheme: "double",
  pattern: [true, true, true, true, true, true, false],
  queue: ["PUSH_A", "PULL_A", "LEGS_A", "PUSH_B", "PULL_B", "LEGS_B"],
  days: [
    {
      key: "PUSH_A",
      label: "Push A - Fokus Bench",
      category: "PUSH",
      items: [
        ["Barbell Bench Press", 4, "6-8", 150, 30, 8],
        ["Incline Dumbbell Press", 3, "8-12", 90, 10, 10],
        ["Seated Dumbbell Shoulder Press", 3, "8-12", 90, 8, 10],
        ["Dumbbell Lateral Raise", 3, "12-20", 60, 5, 15],
        ["Overhead Dumbbell Triceps Extension", 3, "10-15", 60, 8, 12, "A"],
        ["Bench Dips", 2, "12-20", 45, null, 15, "A"],
      ],
    },
    {
      key: "PULL_A",
      label: "Pull A - Fokus Pull-up",
      category: "PULL",
      items: [
        ["Pull-up", 4, "maks (AMRAP)", 150, null, 5],
        ["Barbell Bent-over Row", 4, "8-10", 120, 30, 9],
        ["One-arm Dumbbell Row", 3, "10-12", 90, 12, 11],
        ["Dumbbell Biceps Curl", 3, "10-15", 60, 8, 12, "A"],
        ["Band Face Pull", 3, "15-20", 45, null, 18, "A"],
      ],
    },
    {
      key: "LEGS_A",
      label: "Legs A - Fokus Squat",
      category: "LEGS",
      items: [
        ["Goblet Squat", 4, "10-15", 90, 12, 12],
        ["Romanian Deadlift", 4, "8-12", 120, 30, 10],
        ["Bulgarian Split Squat", 3, "10-12 / kaki", 90, 8, 11],
        ["Barbell Hip Thrust", 3, "12-15", 75, 30, 13],
        ["Standing Calf Raise", 4, "15-20", 45, 12, 18],
      ],
    },
    {
      key: "PUSH_B",
      label: "Push B - Fokus Incline & Bahu",
      category: "PUSH",
      items: [
        ["Incline Barbell Bench Press", 4, "6-8", 150, 25, 8],
        ["Seated Dumbbell Shoulder Press", 3, "8-12", 90, 8, 10],
        ["Feet-Elevated Push-up", 3, "maks (AMRAP)", 90, null, 12],
        ["Dumbbell Lateral Raise", 4, "12-20", 60, 5, 15],
        ["Bench Dips", 3, "12-20", 45, null, 15, "A"],
        ["Overhead Dumbbell Triceps Extension", 2, "10-15", 60, 8, 12, "A"],
      ],
    },
    {
      key: "PULL_B",
      label: "Pull B - Volume Punggung",
      category: "PULL",
      items: [
        ["Band-Assisted / Negative Pull-up", 4, "6-10", 150, null, 8],
        ["One-arm Dumbbell Row", 4, "10-12", 90, 12, 11],
        ["Band Row", 3, "12-15", 75, null, 13],
        ["Dumbbell Biceps Curl", 3, "10-15", 60, 8, 12, "A"],
        ["Band Face Pull", 3, "15-20", 45, null, 18, "A"],
        ["Hanging Knee Raise", 3, "10-15", 60, null, 12],
      ],
    },
    {
      key: "LEGS_B",
      label: "Legs B - Fokus Unilateral & Glute",
      category: "LEGS",
      items: [
        ["Barbell Back Squat", 4, "6-10", 150, 30, 8],
        ["Dumbbell Reverse Lunge", 3, "10-12 / kaki", 90, 8, 11],
        ["Romanian Deadlift", 3, "10-12", 120, 30, 11],
        ["Barbell Hip Thrust", 3, "12-15", 75, 30, 13],
        ["Standing Calf Raise", 4, "15-20", 45, 12, 18],
        ["Plank", 3, "40-60 dtk", 45, null, 45],
      ],
    },
  ],
};

const UPPER_LOWER: Program = {
  id: "upper-lower",
  name: "Upper / Lower",
  short: "U/L",
  goal: "Kekuatan + hipertrofi",
  summary:
    "Empat hari. Satu hari berat (reps rendah) dan satu hari volume per bagian tubuh. Hari kosong di tengah membuat pemulihan lebih lega daripada PPL.",
  scheme: "double",
  pattern: [true, true, false, true, true, false, false],
  queue: ["UL_UPPER_H", "UL_LOWER_H", "UL_UPPER_V", "UL_LOWER_V"],
  days: [
    {
      key: "UL_UPPER_H",
      label: "Upper - Berat",
      category: "UPPER",
      items: [
        ["Barbell Bench Press", 4, "4-6", 180, 30, 5],
        ["Barbell Bent-over Row", 4, "5-8", 150, 30, 6],
        ["Barbell Overhead Press", 3, "5-8", 150, 20, 6],
        ["Pull-up", 3, "maks (AMRAP)", 120, null, 5],
        ["Dumbbell Skull Crusher", 2, "8-12", 75, 8, 10, "A"],
        ["Hammer Curl", 2, "8-12", 75, 10, 10, "A"],
      ],
    },
    {
      key: "UL_LOWER_H",
      label: "Lower - Berat",
      category: "LOWER",
      items: [
        ["Barbell Back Squat", 4, "4-6", 180, 35, 5],
        ["Romanian Deadlift", 3, "6-8", 150, 35, 7],
        ["Bulgarian Split Squat", 3, "8-10 / kaki", 90, 8, 9],
        ["Standing Calf Raise", 4, "10-15", 60, 12, 12],
        ["Hanging Leg Raise", 3, "8-12", 60, null, 10],
      ],
    },
    {
      key: "UL_UPPER_V",
      label: "Upper - Volume",
      category: "UPPER",
      items: [
        ["Incline Dumbbell Press", 4, "10-15", 90, 10, 12],
        ["Chest-supported Dumbbell Row", 4, "10-15", 90, 10, 12],
        ["Arnold Press", 3, "10-15", 75, 8, 12],
        ["Band Lat Pulldown", 3, "12-15", 60, null, 13],
        ["Dumbbell Lateral Raise", 3, "15-20", 45, 5, 16],
        ["Incline Dumbbell Curl", 3, "10-15", 60, 6, 12, "A"],
        ["Band Triceps Pushdown", 3, "15-20", 45, null, 16, "A"],
      ],
    },
    {
      key: "UL_LOWER_V",
      label: "Lower - Volume",
      category: "LOWER",
      items: [
        ["Heels-elevated Goblet Squat", 4, "12-15", 90, 12, 12],
        ["Barbell Hip Thrust", 4, "10-15", 90, 35, 12],
        ["Dumbbell Walking Lunge", 3, "10-12 / kaki", 90, 8, 10],
        ["Single-leg Romanian Deadlift", 3, "10-12 / kaki", 75, 10, 10],
        ["Single-leg Calf Raise", 3, "12-20", 45, 10, 14],
        ["Dead Bug", 3, "8-12 / sisi", 45, null, 10],
      ],
    },
  ],
};

const FULL_BODY: Program = {
  id: "full-body",
  name: "Full Body 3x",
  short: "FB",
  goal: "Umum / waktu terbatas",
  summary:
    "Tiga hari, seluruh tubuh tiap sesi. Paling efisien kalau jadwal padat, dan cocok untuk kembali latihan setelah lama berhenti.",
  scheme: "double",
  pattern: [true, false, true, false, true, false, false],
  queue: ["FB_A", "FB_B", "FB_C"],
  days: [
    {
      key: "FB_A",
      label: "Full Body A",
      category: "FULL",
      items: [
        ["Barbell Back Squat", 3, "6-10", 150, 30, 8],
        ["Barbell Bench Press", 3, "6-10", 150, 30, 8],
        ["One-arm Dumbbell Row", 3, "8-12", 90, 12, 10],
        ["Dumbbell Lateral Raise", 2, "12-20", 45, 5, 15, "A"],
        ["Plank", 2, "40-60 dtk", 45, null, 45, "A"],
      ],
    },
    {
      key: "FB_B",
      label: "Full Body B",
      category: "FULL",
      items: [
        ["Romanian Deadlift", 3, "8-12", 120, 30, 10],
        ["Barbell Overhead Press", 3, "6-10", 120, 20, 8],
        ["Pull-up", 3, "maks (AMRAP)", 120, null, 5],
        ["Dumbbell Reverse Lunge", 2, "10-12 / kaki", 75, 8, 10],
        ["Dumbbell Biceps Curl", 2, "10-15", 45, 8, 12],
      ],
    },
    {
      key: "FB_C",
      label: "Full Body C",
      category: "FULL",
      items: [
        ["Goblet Squat", 3, "10-15", 90, 12, 12],
        ["Incline Dumbbell Press", 3, "8-12", 90, 10, 10],
        ["Barbell Bent-over Row", 3, "8-10", 120, 30, 9],
        ["Barbell Hip Thrust", 3, "10-15", 75, 30, 12],
        ["Overhead Dumbbell Triceps Extension", 2, "10-15", 45, 8, 12],
        ["Hanging Knee Raise", 2, "10-15", 45, null, 12],
      ],
    },
  ],
};

const STRENGTH: Program = {
  id: "strength-5x5",
  name: "Strength 5×5",
  short: "5×5",
  goal: "Kekuatan",
  summary:
    "Tiga hari, dua sesi bergantian dengan lift barbell besar. Beban naik tiap sesi selama masih tuntas. Sederhana, dan grafiknya naik paling cepat.",
  scheme: "linear",
  pattern: [true, false, true, false, true, false, false],
  queue: ["ST_A", "ST_B", "ST_A"],
  days: [
    {
      key: "ST_A",
      label: "5×5 - Sesi A",
      category: "FULL",
      items: [
        ["Barbell Back Squat", 5, "5", 180, 30, 5],
        ["Barbell Bench Press", 5, "5", 180, 30, 5],
        ["Barbell Bent-over Row", 5, "5", 150, 30, 5],
        ["Plank", 2, "40-60 dtk", 45, null, 45],
      ],
    },
    {
      key: "ST_B",
      label: "5×5 - Sesi B",
      category: "FULL",
      items: [
        ["Barbell Back Squat", 5, "5", 180, 30, 5],
        ["Barbell Overhead Press", 5, "5", 180, 20, 5],
        ["Conventional Deadlift", 1, "5", 180, 40, 5],
        ["Chin-up", 3, "maks (AMRAP)", 120, null, 5],
      ],
    },
  ],
};

const HYBRID: Program = {
  id: "hybrid",
  name: "Hybrid Superset + Circuit",
  short: "HYB",
  goal: "Kekuatan + kondisi",
  summary:
    "Tiga hari. Gerakan berat dipasangkan jadi superset (dorong + tarik, kaki + core) supaya padat, lalu ditutup circuit kardio yang bikin ngos-ngosan. Sesi ±45 menit.",
  scheme: "double",
  pattern: [true, false, true, false, true, false, false],
  queue: ["HY_A", "HY_B", "HY_C"],
  days: [
    {
      key: "HY_A",
      label: "Hybrid A - Dorong & Tarik",
      category: "UPPER",
      items: [
        ["Barbell Bench Press", 4, "6-8", 90, 30, 7, "A"],
        ["Barbell Bent-over Row", 4, "6-8", 90, 30, 7, "A"],
        ["Seated Dumbbell Shoulder Press", 3, "8-12", 60, 8, 10, "B"],
        ["Chin-up", 3, "maks (AMRAP)", 75, null, 5, "B"],
        ["Burpee", 3, "10", 0, null, 10, "C"],
        ["Dumbbell Thruster", 3, "12", 0, 8, 12, "C"],
        ["Mountain Climber", 3, "30 dtk", 90, null, 30, "C"],
      ],
    },
    {
      key: "HY_B",
      label: "Hybrid B - Kaki & Core",
      category: "LOWER",
      items: [
        ["Barbell Back Squat", 4, "6-8", 90, 35, 7, "A"],
        ["Hanging Knee Raise", 4, "10-15", 90, null, 12, "A"],
        ["Romanian Deadlift", 3, "8-10", 75, 35, 9, "B"],
        ["Dumbbell Walking Lunge", 3, "10-12 / kaki", 75, 8, 10, "B"],
        ["Jump Squat", 3, "12", 0, null, 12, "C"],
        ["Russian Twist", 3, "20", 0, 6, 20, "C"],
        ["High Knees", 3, "30 dtk", 90, null, 30, "C"],
      ],
    },
    {
      key: "HY_C",
      label: "Hybrid C - Seluruh Tubuh",
      category: "FULL",
      items: [
        ["Man Maker", 4, "6-8", 120, 8, 6],
        ["Renegade Row", 3, "8-10 / sisi", 60, 10, 8, "A"],
        ["Deficit Push-up", 3, "maks (AMRAP)", 60, null, 12, "A"],
        ["Dumbbell Clean & Press", 3, "8", 0, 10, 8, "B"],
        ["Skater Jump", 3, "20", 0, null, 20, "B"],
        ["Bear Crawl", 3, "30 dtk", 0, null, 30, "B"],
        ["Plank", 3, "40-60 dtk", 90, null, 45, "B"],
      ],
    },
  ],
};

export const PROGRAMS: Program[] = [PPL, UPPER_LOWER, FULL_BODY, STRENGTH, HYBRID];

/** Huruf superset untuk gerakan ke-`order` di hari `dayKey` (kalau namanya cocok). */
export function supersetOf(dayKey: string, order: number, name: string): string | null {
  const day = programForDay(dayKey)?.days.find((d) => d.key === dayKey);
  const item = day?.items[order - 1];
  return item && item[0] === name ? (item[6] ?? null) : null;
}
export const DEFAULT_PROGRAM_ID = PPL.id;

export function programById(id: string | undefined | null): Program {
  return PROGRAMS.find((p) => p.id === id) ?? PPL;
}

/** Program pemilik sebuah hari (berdasarkan key). */
export function programForDay(dayKey: string): Program | undefined {
  return PROGRAMS.find((p) => p.days.some((d) => d.key === dayKey));
}

export function daysPerWeek(p: Program): number {
  return p.pattern.filter(Boolean).length;
}
