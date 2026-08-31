// Media & info acuan per gerakan.
//  - wger:      URL foto (2 pose) dari wger.de, lisensi CC BY-SA 3.0 (lihat /kredit)
//  - youtubeId: video demo pendek (dipilih dari hasil pencarian YouTube berdasarkan
//               judul/channel/durasi — utamakan channel "exercise library" yang
//               klipnya singkat & minim narasi). Ganti di sini kalau ada yang meleset.
//  - muscle:    otot utama

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

type Entry = { yt: string; muscle: MuscleRegion; wger?: string[] };

const W = "https://wger.de/media/exercise-images";

const DATA: Record<string, Entry> = {
  "Barbell Bench Press": {
    yt: "9_JPTA3ie7k",
    muscle: "chest",
    wger: [`${W}/192/Bench-press-1.png`, `${W}/192/Bench-press-2.png`],
  },
  "Incline Barbell Bench Press": {
    yt: "2jFFCy8JBU8",
    muscle: "chest",
    wger: [
      `${W}/41/Incline-bench-press-1.png`,
      `${W}/41/Incline-bench-press-2.png`,
    ],
  },
  "Incline Dumbbell Press": {
    yt: "sK4Rvug6ufo",
    muscle: "chest",
    wger: [`${W}/16/Incline-press-1.png`, `${W}/16/Incline-press-2.png`],
  },
  "Seated Dumbbell Shoulder Press": {
    yt: "TsduLWuhlFM",
    muscle: "shoulders",
    wger: [
      `${W}/123/dumbbell-shoulder-press-large-1.png`,
      `${W}/123/dumbbell-shoulder-press-large-2.png`,
    ],
  },
  "Dumbbell Lateral Raise": {
    yt: "XPPfnSEATJA",
    muscle: "shoulders",
    wger: [
      `${W}/148/lateral-dumbbell-raises-large-1.png`,
      `${W}/148/lateral-dumbbell-raises-large-2.png`,
    ],
  },
  "Feet-Elevated Push-up": { yt: "yvBlNJCvTOI", muscle: "chest" },
  "Overhead Dumbbell Triceps Extension": {
    yt: "a9oPnZReIRE",
    muscle: "triceps",
  },
  "Bench Dips": { yt: "yvAzWxRsnqU", muscle: "triceps" },
  "Pull-up": {
    yt: "jgFel4wZl3I",
    muscle: "lats",
    wger: [`${W}/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg`],
  },
  "Band-Assisted / Negative Pull-up": { yt: "B_VkNQS5YLs", muscle: "lats" },
  "Band Lat Pulldown": { yt: "ErDmbtmQrv4", muscle: "lats" },
  "Band Biceps Curl": { yt: "pXS-fSPWpk8", muscle: "biceps" },
  "Barbell Bent-over Row": {
    yt: "Nr6Gu67wf40",
    muscle: "upper-back",
    wger: [
      `${W}/109/Barbell-rear-delt-row-1.png`,
      `${W}/109/Barbell-rear-delt-row-2.png`,
    ],
  },
  "One-arm Dumbbell Row": {
    yt: "ZRSGpBUVcNw",
    muscle: "lats",
    wger: [`${W}/81/a751a438-ae2d-4751-8d61-cef0e9292174.png`],
  },
  "Band Row": {
    yt: "Y3H17rshgZE",
    muscle: "upper-back",
    wger: [
      `${W}/1117/2555c4c3-a84d-47db-b83b-cbf721f12e45.png`,
      `${W}/1117/e74255c0-67a0-4309-b78d-2d79e6ff8c11.png`,
    ],
  },
  "Dumbbell Biceps Curl": { yt: "cBSD6mQIPQk", muscle: "biceps" },
  "Band Face Pull": {
    yt: "toHfpKStJ48",
    muscle: "upper-back",
    wger: [`${W}/1732/d13b9adb-968e-4f73-95e6-b16690bcf616.jpg`],
  },
  "Hanging Knee Raise": { yt: "RD_A-Z15ER4", muscle: "core" },
  "Goblet Squat": {
    yt: "pEGfGwp6IEA",
    muscle: "quads",
    wger: [
      `${W}/203/1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg`,
      `${W}/203/2ab30113-4e08-4d39-9d23-d901ce2c0971.jpeg`,
    ],
  },
  "Barbell Back Squat": {
    yt: "rrJIyZGlK8c",
    muscle: "quads",
    wger: [
      `${W}/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg`,
      `${W}/1801/68720d5e-f422-47ac-81e4-c7b51144d302.jpg`,
    ],
  },
  "Romanian Deadlift": {
    yt: "Cf3CaHui43A",
    muscle: "hamstrings",
    wger: [`${W}/1652/0306c8c0-70cc-45d4-92de-6fa72ceaa834.webp`],
  },
  "Bulgarian Split Squat": {
    yt: "AGvR91bbHy8",
    muscle: "quads",
    wger: [`${W}/1706/0c5243cc-2539-4005-aee0-d3a8c5d3a32c.jfif`],
  },
  "Dumbbell Reverse Lunge": { yt: "xrPteyQLGAo", muscle: "glutes" },
  "Barbell Hip Thrust": { yt: "pF17m_CXfL0", muscle: "glutes" },
  "Standing Calf Raise": {
    yt: "LnWEIjIls-M",
    muscle: "calves",
    wger: [
      `${W}/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg`,
      `${W}/622/d6d57067-97de-462e-a8bb-15228d730323.jpeg`,
    ],
  },
  Plank: {
    yt: "3QZlgJ40LfU",
    muscle: "core",
    wger: [
      `${W}/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png`,
      `${W}/458/902e6836-394e-458b-b94e-101d714294e2.png`,
    ],
  },
};

export type ExerciseMedia = {
  youtubeEmbed: string | null;
  wger: string[];
  muscle: MuscleRegion;
};

export function mediaFor(name: string): ExerciseMedia {
  const e = DATA[name];
  return {
    youtubeEmbed: e?.yt
      ? `https://www.youtube-nocookie.com/embed/${e.yt}?rel=0&modestbranding=1`
      : null,
    wger: e?.wger ?? [],
    muscle: e?.muscle ?? "core",
  };
}

export const WGER_CREDITED = Object.entries(DATA)
  .filter(([, e]) => e.wger?.length)
  .map(([n]) => n);
