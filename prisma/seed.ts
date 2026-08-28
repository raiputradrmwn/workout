import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ---- Exercise library (hanya alat yang tersedia di rumah) --------------------
// Alat: barbell/bar, dumbbell <= 12 kg, bench (bisa incline), resistance band
// dengan pegangan, pull-up stand, treadmill.
// TIDAK ADA: mesin row, mesin kabel, mesin kaki.
const exercises = [
  // ---- PUSH ----
  {
    name: "Barbell Bench Press",
    category: "PUSH",
    equipment: "barbell",
    muscles: "Dada, triceps, front delt",
    cues: "Scapula ditarik & dikunci ke bench. Turunkan bar ke garis puting, siku ~45 derajat. Dorong sampai lurus tanpa mengunci keras.",
  },
  {
    name: "Incline Barbell Bench Press",
    category: "PUSH",
    equipment: "barbell",
    muscles: "Dada atas, front delt, triceps",
    cues: "Sandaran bench ~30 derajat. Bar turun ke tulang selangka atas. Jaga pinggang tidak melengkung berlebihan.",
  },
  {
    name: "Incline Dumbbell Press",
    category: "PUSH",
    equipment: "dumbbell",
    muscles: "Dada atas, front delt",
    cues: "Dumbbell turun setinggi dada, siku sedikit di bawah bahu. Range gerak penuh karena beban ringan.",
  },
  {
    name: "Seated Dumbbell Shoulder Press",
    category: "PUSH",
    equipment: "dumbbell",
    muscles: "Bahu, triceps",
    cues: "Duduk di bench tegak. Siku sedikit di depan badan. Jangan kunci total di atas, jaga tension.",
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "PUSH",
    equipment: "dumbbell",
    muscles: "Side delt",
    cues: "Pimpin dengan siku, angkat sampai sejajar bahu. Turun perlahan 2 detik. Badan tidak mengayun.",
  },
  {
    name: "Feet-Elevated Push-up",
    category: "PUSH",
    equipment: "bodyweight",
    muscles: "Dada, triceps, core",
    cues: "Kaki di bench supaya beban ke dada atas lebih besar. Tubuh lurus, dada hampir sentuh lantai.",
  },
  {
    name: "Overhead Dumbbell Triceps Extension",
    category: "PUSH",
    equipment: "dumbbell",
    muscles: "Triceps (long head)",
    cues: "Siku tetap sempit menghadap depan. Turunkan dumbbell di belakang kepala, luruskan penuh.",
  },
  {
    name: "Band Triceps Pushdown",
    category: "PUSH",
    equipment: "band",
    muscles: "Triceps",
    cues: "Anchor band tinggi di pull-up stand. Siku terkunci di samping badan, luruskan penuh lalu tahan.",
  },

  // ---- PULL ----
  {
    name: "Pull-up",
    category: "PULL",
    equipment: "pullup",
    muscles: "Lats, upper back, biceps",
    cues: "Mulai dari gantung penuh. Tarik dada ke arah bar, dada membusung. Hindari ayunan (kipping).",
  },
  {
    name: "Band-Assisted / Negative Pull-up",
    category: "PULL",
    equipment: "pullup",
    muscles: "Lats, biceps",
    cues: "Kalau belum kuat full: injak band untuk bantuan, atau lompat ke atas lalu turun perlahan 3-5 detik.",
  },
  {
    name: "Barbell Bent-over Row",
    category: "PULL",
    equipment: "barbell",
    muscles: "Mid-back, lats, rear delt",
    cues: "Punggung netral, badan ~45 derajat. Tarik bar ke perut bawah, remas belikat. Jangan menyentak.",
  },
  {
    name: "One-arm Dumbbell Row",
    category: "PULL",
    equipment: "dumbbell",
    muscles: "Lats, mid-back",
    cues: "Satu tangan & lutut tumpu di bench. Tarik siku ke arah pinggul, jaga bahu tidak berputar.",
  },
  {
    name: "Band Row",
    category: "PULL",
    equipment: "band",
    muscles: "Mid-back, rear delt",
    cues: "Anchor band setinggi dada di pull-up stand. Pegang handle, tarik ke perut, remas belikat, siku dekat badan.",
  },
  {
    name: "Dumbbell Biceps Curl",
    category: "PULL",
    equipment: "dumbbell",
    muscles: "Biceps",
    cues: "Siku diam di samping badan. Jangan ayun badan. Kontrol fase turun 2 detik.",
  },
  {
    name: "Band Face Pull",
    category: "PULL",
    equipment: "band",
    muscles: "Rear delt, upper back",
    cues: "Anchor band setinggi wajah. Tarik ke arah dahi, putar tangan keluar di akhir gerak. Tahan 1 detik.",
  },
  {
    name: "Hanging Knee Raise",
    category: "PULL",
    equipment: "pullup",
    muscles: "Core bawah, hip flexor",
    cues: "Gantung di pull-up stand. Angkat lutut ke dada, kontrol turun, minim ayunan.",
  },

  // ---- LEGS ----
  {
    name: "Goblet Squat",
    category: "LEGS",
    equipment: "dumbbell",
    muscles: "Quad, glute, core",
    cues: "Pegang 1 dumbbell di depan dada. Turun sampai paha minimal sejajar lantai, dada tegak, tumit menempel.",
  },
  {
    name: "Barbell Back Squat",
    category: "LEGS",
    equipment: "barbell",
    muscles: "Quad, glute, hamstring",
    cues: "Bar di upper trap. Dorong lutut searah jari kaki. Kedalaman terkontrol, punggung netral.",
  },
  {
    name: "Romanian Deadlift",
    category: "LEGS",
    equipment: "barbell",
    muscles: "Hamstring, glute, lower back",
    cues: "Dorong pinggul ke belakang, lutut sedikit menekuk. Bar dekat kaki. Rasakan tarikan hamstring, jangan bungkuk.",
  },
  {
    name: "Bulgarian Split Squat",
    category: "LEGS",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: "Punggung kaki belakang di bench. Turun tegak lurus, berat di kaki depan. Dumbbell di kedua tangan.",
  },
  {
    name: "Dumbbell Reverse Lunge",
    category: "LEGS",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: "Langkah mundur, lutut belakang hampir sentuh lantai. Dorong kembali dari tumit kaki depan.",
  },
  {
    name: "Barbell Hip Thrust",
    category: "LEGS",
    equipment: "barbell",
    muscles: "Glute, hamstring",
    cues: "Punggung atas bersandar di bench, bar di lipat paha (pakai bantalan). Dorong pinggul sampai badan lurus, tahan 1 detik.",
  },
  {
    name: "Standing Calf Raise",
    category: "LEGS",
    equipment: "dumbbell",
    muscles: "Betis",
    cues: "Pegang dumbbell, ujung kaki di pijakan. Naik setinggi mungkin, tahan 1 detik, turun perlahan di bawah rentang.",
  },
  {
    name: "Plank",
    category: "LEGS",
    equipment: "bodyweight",
    muscles: "Core",
    cues: "Siku di bawah bahu, badan lurus dari kepala ke tumit. Kencangkan perut & glute. Catat detik sebagai reps.",
  },
];

// ---- Day templates ----------------------------------------------------------
// [nama, set, target reps, istirahat(dtk), saran berat(kg|null=bodyweight/band), saran reps]
type TmplItem = [
  name: string,
  sets: number,
  reps: string,
  rest: number,
  suggestWeight: number | null,
  suggestReps: number,
];

const days: {
  key: string;
  label: string;
  category: string;
  order: number;
  items: TmplItem[];
}[] = [
  {
    key: "PUSH_A",
    label: "Push A - Fokus Bench",
    category: "PUSH",
    order: 1,
    items: [
      ["Barbell Bench Press", 4, "6-8", 150, 30, 8],
      ["Incline Dumbbell Press", 3, "8-12", 90, 10, 10],
      ["Seated Dumbbell Shoulder Press", 3, "8-12", 90, 8, 10],
      ["Dumbbell Lateral Raise", 3, "12-20", 60, 5, 15],
      ["Overhead Dumbbell Triceps Extension", 3, "10-15", 60, 8, 12],
      ["Band Triceps Pushdown", 2, "15-20", 45, null, 18],
    ],
  },
  {
    key: "PULL_A",
    label: "Pull A - Fokus Pull-up",
    category: "PULL",
    order: 2,
    items: [
      ["Pull-up", 4, "maks (AMRAP)", 150, null, 5],
      ["Barbell Bent-over Row", 4, "8-10", 120, 30, 9],
      ["One-arm Dumbbell Row", 3, "10-12", 90, 12, 11],
      ["Dumbbell Biceps Curl", 3, "10-15", 60, 8, 12],
      ["Band Face Pull", 3, "15-20", 45, null, 18],
    ],
  },
  {
    key: "LEGS_A",
    label: "Legs A - Fokus Squat",
    category: "LEGS",
    order: 3,
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
    order: 4,
    items: [
      ["Incline Barbell Bench Press", 4, "6-8", 150, 25, 8],
      ["Seated Dumbbell Shoulder Press", 3, "8-12", 90, 8, 10],
      ["Feet-Elevated Push-up", 3, "maks (AMRAP)", 90, null, 12],
      ["Dumbbell Lateral Raise", 4, "12-20", 60, 5, 15],
      ["Band Triceps Pushdown", 3, "15-20", 45, null, 18],
      ["Overhead Dumbbell Triceps Extension", 2, "10-15", 60, 8, 12],
    ],
  },
  {
    key: "PULL_B",
    label: "Pull B - Volume Punggung",
    category: "PULL",
    order: 5,
    items: [
      ["Band-Assisted / Negative Pull-up", 4, "6-10", 150, null, 8],
      ["One-arm Dumbbell Row", 4, "10-12", 90, 12, 11],
      ["Band Row", 3, "12-15", 75, null, 13],
      ["Dumbbell Biceps Curl", 3, "10-15", 60, 8, 12],
      ["Band Face Pull", 3, "15-20", 45, null, 18],
      ["Hanging Knee Raise", 3, "10-15", 60, null, 12],
    ],
  },
  {
    key: "LEGS_B",
    label: "Legs B - Fokus Unilateral & Glute",
    category: "LEGS",
    order: 6,
    items: [
      ["Barbell Back Squat", 4, "6-10", 150, 30, 8],
      ["Dumbbell Reverse Lunge", 3, "10-12 / kaki", 90, 8, 11],
      ["Romanian Deadlift", 3, "10-12", 120, 30, 11],
      ["Barbell Hip Thrust", 3, "12-15", 75, 30, 13],
      ["Standing Calf Raise", 4, "15-20", 45, 12, 18],
      ["Plank", 3, "40-60 dtk", 45, null, 45],
    ],
  },
];

async function main() {
  await prisma.setLog.deleteMany();
  await prisma.workoutSession.deleteMany();
  await prisma.dayExercise.deleteMany();
  await prisma.workoutDay.deleteMany();
  await prisma.exercise.deleteMany();

  const exMap = new Map<string, string>();
  for (const e of exercises) {
    const rec = await prisma.exercise.create({ data: e });
    exMap.set(e.name, rec.id);
  }

  for (const d of days) {
    const day = await prisma.workoutDay.create({
      data: { key: d.key, label: d.label, category: d.category, order: d.order },
    });
    for (let i = 0; i < d.items.length; i++) {
      const [name, sets, reps, rest, suggestWeight, suggestReps] = d.items[i];
      const exerciseId = exMap.get(name);
      if (!exerciseId) throw new Error(`Exercise not found in library: ${name}`);
      await prisma.dayExercise.create({
        data: {
          dayId: day.id,
          exerciseId,
          order: i + 1,
          targetSets: sets,
          targetReps: reps,
          restSeconds: rest,
          suggestWeight,
          suggestReps,
        },
      });
    }
  }

  console.log(
    `Seed selesai: ${exercises.length} gerakan, ${days.length} hari latihan.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
