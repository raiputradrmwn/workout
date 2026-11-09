// Data & template pola makan. Semua nilai gizi per 100 g (as-eaten), perkiraan.

export type Macro = { kcal: number; p: number; c: number; f: number };
export type Food = {
  id: string;
  name: string;
  per100: Macro;
  /** butir/sachet: berat 1 unit utuh. buah: gram DAGING BERSIH per 1 buah (paha bertulang). */
  unit?: "butir" | "sachet" | "buah";
  unitG?: number;
  /** porsi tetap (buah-buahan) */
  serve?: { g: number; label: string };
  note?: string;
};

export const PROTEIN_FOODS: Food[] = [
  {
    id: "ayam", // id lama dipertahankan (pilihan tersimpan di localStorage)
    name: "Dada ayam fillet",
    per100: { kcal: 165, p: 31, c: 0, f: 3.6 },
    note: "tanpa tulang & kulit",
  },
  {
    id: "paha-fillet",
    name: "Paha ayam fillet",
    per100: { kcal: 209, p: 26, c: 0, f: 10.9 },
    note: "tanpa tulang & kulit",
  },
  {
    id: "paha-tulang",
    name: "Paha bawah bertulang",
    per100: { kcal: 175, p: 26, c: 0, f: 7 },
    unit: "buah",
    unitG: 50,
    note: "tanpa kulit · 1 buah ≈ 90 g matang bertulang",
  },
  {
    id: "telur",
    name: "Telur",
    per100: { kcal: 155, p: 13, c: 1.1, f: 11 },
    unit: "butir",
    unitG: 50,
  },
  { id: "tempe", name: "Tempe", per100: { kcal: 190, p: 19, c: 9, f: 11 } },
  { id: "tahu", name: "Tahu putih", per100: { kcal: 80, p: 8, c: 1.9, f: 4.8 } },
];

export const CARB_FOODS: Food[] = [
  { id: "nasi", name: "Nasi putih", per100: { kcal: 130, p: 2.7, c: 28, f: 0.3 } },
  { id: "kentang", name: "Kentang rebus", per100: { kcal: 87, p: 2, c: 20, f: 0.1 } },
  { id: "ubi", name: "Ubi rebus", per100: { kcal: 90, p: 1.6, c: 21, f: 0.1 } },
  { id: "oat", name: "Oat kering", per100: { kcal: 380, p: 13, c: 60, f: 7 } },
  {
    id: "fukumi",
    name: "FUKUMI (konjac)",
    per100: { kcal: 75, p: 0, c: 3, f: 0 },
    unit: "sachet",
    unitG: 40,
    note: "≈ 0 karbo cerna — pengganti volume, bukan sumber energi",
  },
];

export const FRUIT_FOODS: Food[] = [
  {
    id: "jeruk",
    name: "Jeruk",
    per100: { kcal: 47, p: 0.9, c: 11.8, f: 0.1 },
    serve: { g: 160, label: "2 buah kecil" },
  },
  {
    id: "pisang",
    name: "Pisang",
    per100: { kcal: 89, p: 1.1, c: 22.8, f: 0.3 },
    serve: { g: 120, label: "1 buah sedang" },
    note: "paling padat kalori — cocok sekitar latihan",
  },
  {
    id: "melon",
    name: "Melon",
    per100: { kcal: 34, p: 0.8, c: 8.2, f: 0.2 },
    serve: { g: 200, label: "200 g" },
  },
  {
    id: "nanas",
    name: "Nanas",
    per100: { kcal: 50, p: 0.5, c: 13.1, f: 0.1 },
    serve: { g: 165, label: "1 cup potong" },
    note: "asam — hindari tepat sebelum tidur",
  },
];

export const FOOD_BY_ID = new Map(
  [...PROTEIN_FOODS, ...CARB_FOODS, ...FRUIT_FOODS].map((f) => [f.id, f]),
);

export type Slot =
  | { id: string; kind: "protein"; label: string; targetP: number; def: string }
  | { id: string; kind: "carb"; label: string; targetC: number; def: string }
  | { id: string; kind: "fruit"; label: string; def: string }
  | { id: string; kind: "fixed"; label: string; detail: string; macro: Macro };

export type Meal = { id: string; name: string; time: string; slots: Slot[] };

export const DAILY_TARGET = { kcal: 1900, p: 185, c: 110 };

export const MEALS: Meal[] = [
  {
    id: "m1",
    name: "Makan 1",
    time: "± 12:00",
    slots: [
      { id: "m1p1", kind: "protein", label: "Ayam", targetP: 78, def: "ayam" },
      { id: "m1p2", kind: "protein", label: "Protein 2", targetP: 13, def: "telur" },
      { id: "m1p3", kind: "protein", label: "Protein 3", targetP: 15, def: "tempe" },
      { id: "m1c", kind: "carb", label: "Nasi", targetC: 29.4, def: "nasi" },
      {
        id: "m1v",
        kind: "fixed",
        label: "Sayur + minyak",
        detail: "Sayur 250 g (brokoli/bayam/buncis) + minyak 1 sdt",
        macro: { kcal: 100, p: 3, c: 8, f: 5 },
      },
    ],
  },
  {
    id: "m2",
    name: "Makan 2",
    time: "± 18:00",
    slots: [
      { id: "m2p1", kind: "protein", label: "Ayam", targetP: 56, def: "ayam" },
      { id: "m2p2", kind: "protein", label: "Protein 2", targetP: 7, def: "telur" },
      { id: "m2p3", kind: "protein", label: "Protein 3", targetP: 16, def: "tahu" },
      { id: "m2n", kind: "carb", label: "Nasi", targetC: 29.4, def: "nasi" },
      { id: "m2f", kind: "carb", label: "FUKUMI (opsional)", targetC: 2, def: "fukumi" },
      { id: "m2fr", kind: "fruit", label: "Buah (1 porsi)", def: "jeruk" },
      {
        id: "m2v",
        kind: "fixed",
        label: "Sayur + minyak",
        detail: "Sayur 300 g + minyak 1 sdt",
        macro: { kcal: 110, p: 3, c: 9, f: 5 },
      },
    ],
  },
];

export const OPTIONAL_ADDONS = [
  "Telur rebus 2 butir (+13 g protein, ~155 kkal)",
  "Dada ayam fillet 100 g (+31 g protein, ~165 kkal)",
  "Pisang 1 buah sedang (~107 kkal, 27 g karbo) — hari latihan / sebelum shift malam",
];

export type SlotResult = {
  slotId: string;
  foodId: string;
  foodName: string;
  amount: string;
  grams: number;
  macro: Macro;
  note?: string;
};

const ZERO: Macro = { kcal: 0, p: 0, c: 0, f: 0 };
const round5 = (n: number) => Math.max(5, Math.round(n / 5) * 5);
const scale = (m: Macro, g: number): Macro => ({
  kcal: (m.kcal * g) / 100,
  p: (m.p * g) / 100,
  c: (m.c * g) / 100,
  f: (m.f * g) / 100,
});

/**
 * Hitung porsi sebuah slot untuk food terpilih, menjaga target protein/karbo.
 * `effTarget` menimpa targetP/targetC (untuk redistribusi saat slot lain di-skip).
 * `foodId === "skip"` → slot tidak dipakai.
 */
export function resolveSlot(
  slot: Slot,
  foodId?: string,
  effTarget?: number,
): SlotResult {
  if (slot.kind === "fixed") {
    return {
      slotId: slot.id,
      foodId: "fixed",
      foodName: slot.label,
      amount: slot.detail,
      grams: 0,
      macro: slot.macro,
    };
  }

  if (foodId === "skip") {
    return {
      slotId: slot.id,
      foodId: "skip",
      foodName: "—",
      amount: "tidak dipakai",
      grams: 0,
      macro: ZERO,
    };
  }

  const food = FOOD_BY_ID.get(foodId ?? slot.def) ?? FOOD_BY_ID.get(slot.def)!;

  // Buah: porsi tetap
  if (slot.kind === "fruit") {
    const s = food.serve ?? { g: 100, label: "100 g" };
    return {
      slotId: slot.id,
      foodId: food.id,
      foodName: food.name,
      amount: `${s.label} (±${s.g} g)`,
      grams: s.g,
      macro: scale(food.per100, s.g),
      note: food.note,
    };
  }

  // FUKUMI: selalu per sachet, karbo ~0
  if (food.unit === "sachet") {
    const g = food.unitG ?? 40;
    return {
      slotId: slot.id,
      foodId: food.id,
      foodName: food.name,
      amount: "1 sachet",
      grams: g,
      macro: scale(food.per100, g),
      note: food.note,
    };
  }

  const key = slot.kind === "protein" ? "p" : "c";
  const baseTarget = slot.kind === "protein" ? slot.targetP : slot.targetC;
  const target = effTarget ?? baseTarget;
  const per = food.per100[key];
  let grams = per > 0 ? (target * 100) / per : 0;

  let amount: string;
  if (food.unit === "butir" || food.unit === "buah") {
    const u = food.unitG ?? 50;
    const n = Math.max(1, Math.round(grams / u));
    grams = n * u;
    amount =
      food.unit === "buah" ? `${n} buah · ±${grams} g daging` : `${n} butir`;
  } else {
    grams = round5(grams);
    amount = `${grams} g`;
  }

  return {
    slotId: slot.id,
    foodId: food.id,
    foodName: food.name,
    amount,
    grams,
    macro: scale(food.per100, grams),
    note: food.note,
  };
}

export function sumMacro(list: Macro[]): Macro {
  return list.reduce(
    (a, m) => ({
      kcal: a.kcal + m.kcal,
      p: a.p + m.p,
      c: a.c + m.c,
      f: a.f + m.f,
    }),
    { kcal: 0, p: 0, c: 0, f: 0 },
  );
}
