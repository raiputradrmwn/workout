type Drill = { name: string; detail: string };

export const GENERAL_WARMUP: Drill[] = [
  {
    name: "Kardio ringan",
    detail: "Treadmill jalan santai / marching 3–5 menit sampai agak berkeringat",
  },
  { name: "Leg swings", detail: "10×/kaki depan-belakang + 10×/kaki menyamping" },
  { name: "Arm circles", detail: "15× maju + 15× mundur" },
  { name: "Cat–cow", detail: "8× pelan, lemaskan tulang belakang" },
  { name: "Bodyweight squat", detail: "15× tempo terkontrol, kedalaman penuh" },
];

export const CATEGORY_WARMUP: Record<"PUSH" | "PULL" | "LEGS", Drill[]> = {
  PUSH: [
    { name: "Band pull-apart / shoulder dislocate", detail: "15×, siapkan bahu" },
    { name: "Scapular push-up", detail: "10×" },
    { name: "Push-up pelan", detail: "10× tempo terkontrol" },
    {
      name: "Ramp-up set",
      detail:
        "Gerakan pertama: 1–2 set ringan (bar kosong / 40–50%) sebelum set kerja",
    },
  ],
  PULL: [
    {
      name: "Dead hang / scapular pull",
      detail: "Gantung 20 dtk atau 10× scapular pull di pull-up stand",
    },
    { name: "Band row ringan", detail: "15×, remas tulang belikat" },
    { name: "Band face pull", detail: "15×, aktifkan rotator & upper back" },
    {
      name: "Ramp-up set",
      detail: "Gerakan pertama: 1–2 set ringan sebelum set kerja",
    },
  ],
  LEGS: [
    { name: "Glute bridge", detail: "15×, aktifkan bokong" },
    { name: "Walking lunge", detail: "8×/kaki" },
    { name: "Ankle rocks", detail: "10×/kaki, mobilitas pergelangan kaki" },
    { name: "90/90 hip switch", detail: "8×/sisi, buka pinggul" },
    {
      name: "Ramp-up set",
      detail: "Squat / RDL pertama: 2 set ringan, naik bertahap ke beban kerja",
    },
  ],
};

export function warmupFor(category: string): Drill[] {
  const extra =
    category in CATEGORY_WARMUP
      ? CATEGORY_WARMUP[category as keyof typeof CATEGORY_WARMUP]
      : [];
  return [...GENERAL_WARMUP, ...extra];
}
