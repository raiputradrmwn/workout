// Grup gerakan yang boleh saling tukar (pola sama, alat beda).
// Semua nama di sini harus ada sebagai baris Exercise di database.

const GROUPS: string[][] = [
  [
    "Barbell Bench Press",
    "Incline Barbell Bench Press",
    "Incline Dumbbell Press",
    "Feet-Elevated Push-up",
  ],
  ["Overhead Dumbbell Triceps Extension", "Bench Dips"],
  ["Pull-up", "Band-Assisted / Negative Pull-up", "Band Lat Pulldown"],
  ["Barbell Bent-over Row", "One-arm Dumbbell Row", "Band Row"],
  ["Dumbbell Biceps Curl", "Band Biceps Curl"],
  ["Goblet Squat", "Barbell Back Squat"],
  ["Bulgarian Split Squat", "Dumbbell Reverse Lunge"],
];

const LOOKUP = new Map<string, string[]>();
for (const g of GROUPS) for (const name of g) LOOKUP.set(name, g);

/** Daftar alternatif untuk sebuah gerakan (termasuk dirinya). Kosong = tak ada. */
export function alternativesFor(name: string): string[] {
  return LOOKUP.get(name) ?? [];
}
