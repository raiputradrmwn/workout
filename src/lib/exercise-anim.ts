// Peta tiap gerakan -> pola animasi figur + area otot yang disorot.

export type MovePattern =
  | "horizontal-press"
  | "vertical-press"
  | "lateral-raise"
  | "triceps-ext"
  | "vertical-pull"
  | "row"
  | "curl"
  | "face-pull"
  | "knee-raise"
  | "squat"
  | "hinge"
  | "split-squat"
  | "hip-thrust"
  | "calf-raise"
  | "plank";

export type MuscleRegion =
  | "chest"
  | "shoulders"
  | "triceps"
  | "biceps"
  | "lats"
  | "upper-back"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "core";

export const MUSCLE_LABEL: Record<MuscleRegion, string> = {
  chest: "Dada",
  shoulders: "Bahu",
  triceps: "Triceps",
  biceps: "Biceps",
  lats: "Punggung sayap (lats)",
  "upper-back": "Punggung atas",
  quads: "Paha depan",
  hamstrings: "Paha belakang",
  glutes: "Bokong",
  calves: "Betis",
  core: "Perut / core",
};

type Anim = { pattern: MovePattern; muscle: MuscleRegion };

const MAP: Record<string, Anim> = {
  "Barbell Bench Press": { pattern: "horizontal-press", muscle: "chest" },
  "Incline Barbell Bench Press": { pattern: "horizontal-press", muscle: "chest" },
  "Incline Dumbbell Press": { pattern: "horizontal-press", muscle: "chest" },
  "Feet-Elevated Push-up": { pattern: "horizontal-press", muscle: "chest" },
  "Seated Dumbbell Shoulder Press": {
    pattern: "vertical-press",
    muscle: "shoulders",
  },
  "Dumbbell Lateral Raise": { pattern: "lateral-raise", muscle: "shoulders" },
  "Overhead Dumbbell Triceps Extension": {
    pattern: "triceps-ext",
    muscle: "triceps",
  },
  "Band Triceps Pushdown": { pattern: "triceps-ext", muscle: "triceps" },
  "Pull-up": { pattern: "vertical-pull", muscle: "lats" },
  "Band-Assisted / Negative Pull-up": {
    pattern: "vertical-pull",
    muscle: "lats",
  },
  "Barbell Bent-over Row": { pattern: "row", muscle: "upper-back" },
  "One-arm Dumbbell Row": { pattern: "row", muscle: "lats" },
  "Band Row": { pattern: "row", muscle: "upper-back" },
  "Dumbbell Biceps Curl": { pattern: "curl", muscle: "biceps" },
  "Band Face Pull": { pattern: "face-pull", muscle: "upper-back" },
  "Hanging Knee Raise": { pattern: "knee-raise", muscle: "core" },
  "Goblet Squat": { pattern: "squat", muscle: "quads" },
  "Barbell Back Squat": { pattern: "squat", muscle: "quads" },
  "Romanian Deadlift": { pattern: "hinge", muscle: "hamstrings" },
  "Bulgarian Split Squat": { pattern: "split-squat", muscle: "quads" },
  "Dumbbell Reverse Lunge": { pattern: "split-squat", muscle: "glutes" },
  "Barbell Hip Thrust": { pattern: "hip-thrust", muscle: "glutes" },
  "Standing Calf Raise": { pattern: "calf-raise", muscle: "calves" },
  Plank: { pattern: "plank", muscle: "core" },
};

export function animFor(name: string): Anim {
  return MAP[name] ?? { pattern: "squat", muscle: "quads" };
}
