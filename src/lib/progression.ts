import { NO_WEIGHT } from "@/lib/library";
import type { Scheme } from "@/lib/programs";

export type PerfSet = { setNumber: number; weightKg: number | null; reps: number | null };

export type Suggestion = {
  weight: number | null;
  reps: number | null;
  kind: "start" | "increase" | "hold" | "reduce" | "capped";
  note: string;
};

/** Dumbbell terberat yang ada di rumah (riwayat sudah mencatat 14 kg). Ubah kalau alat bertambah. */
export const DUMBBELL_MAX = 14;

/** "6-8" -> [6,8], "5" -> [5,5], "maks (AMRAP)" -> null. */
export function parseRepRange(target: string): [number, number] | null {
  const m = target.match(/(\d+)\s*(?:-\s*(\d+))?/);
  if (!m || /maks|amrap/i.test(target)) return null;
  const lo = Number(m[1]);
  const hi = m[2] ? Number(m[2]) : lo;
  return [lo, hi];
}

export function isTimed(target: string) {
  return /dtk|detik/i.test(target);
}

function increment(equipment: string, category: string, compound: boolean) {
  if (equipment === "dumbbell") return 1;
  if (equipment === "barbell") return compound && category === "LEGS" ? 5 : 2.5;
  return 0;
}

const round = (n: number, step: number) => Math.round(n / step) * step;

/** Estimasi 1RM (Epley). */
export function e1rm(weight: number, reps: number) {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Saran beban & reps untuk sesi berikutnya dari sesi terakhir.
 * Hanya set "done" yang dihitung.
 */
export function suggestNext(input: {
  equipment: string;
  category: string;
  compound: boolean;
  targetReps: string;
  scheme: Scheme;
  last: PerfSet[] | null;
  fallbackWeight: number | null;
  fallbackReps: number | null;
}): Suggestion {
  const { equipment, targetReps, scheme, last } = input;
  const range = parseRepRange(targetReps);
  const timed = isTimed(targetReps);
  const unit = timed ? "dtk" : "reps";
  const weighted = !NO_WEIGHT.has(equipment);

  if (!last || last.length === 0) {
    return {
      weight: weighted ? input.fallbackWeight : null,
      reps: input.fallbackReps,
      kind: "start",
      note: "Belum ada riwayat. Mulai dari saran ini, sisakan 2 rep di tiap set.",
    };
  }

  const repsList = last.map((s) => s.reps ?? 0);
  const minReps = Math.min(...repsList);
  const maxReps = Math.max(...repsList);

  // ---- Tanpa beban: progresi lewat reps / variasi -------------------------
  if (!weighted) {
    if (!range) {
      const next = maxReps + 1;
      return {
        weight: null,
        reps: next,
        kind: "increase",
        note: `Terbaik terakhir ${maxReps}. Kejar ${next} di set pertama.`,
      };
    }
    const [lo, hi] = range;
    if (minReps >= hi) {
      return {
        weight: null,
        reps: hi,
        kind: "capped",
        note: timed
          ? `Semua set sudah ${hi} dtk. Pindah ke variasi lebih sulit atau tambah beban di punggung.`
          : `Semua set sudah ${hi} reps. Pakai band lebih berat, kurangi bantuan, atau ganti variasi lebih sulit.`,
      };
    }
    const step = timed ? 5 : 1;
    const next = Math.min(hi, Math.max(lo, minReps + step));
    return {
      weight: null,
      reps: next,
      kind: "hold",
      note: `Tambah ${step} ${unit} per set sampai semua set ${hi} ${unit}.`,
    };
  }

  // ---- Dengan beban --------------------------------------------------------
  const weights = last.map((s) => s.weightKg ?? 0);
  const top = Math.max(...weights);
  const topSets = last.filter((s) => (s.weightKg ?? 0) === top);
  const topMin = Math.min(...topSets.map((s) => s.reps ?? 0));
  const inc = increment(equipment, input.category, input.compound);
  const stepRound = equipment === "dumbbell" ? 0.5 : 1.25;

  const goal = range ?? [maxReps, maxReps + 2];
  const [lo, hi] = scheme === "linear" && range ? [range[1], range[1]] : goal;

  if (topMin >= hi) {
    const next = round(top + inc, stepRound);
    if (equipment === "dumbbell" && next > DUMBBELL_MAX) {
      return {
        weight: top,
        reps: hi,
        kind: "capped",
        note: `Dumbbell sudah mentok ${DUMBBELL_MAX} kg. Tambah satu set, perlambat turunnya jadi 3 detik, atau pindah ke variasi barbell.`,
      };
    }
    return {
      weight: next,
      reps: lo,
      kind: "increase",
      note:
        scheme === "linear"
          ? `Semua set tuntas. Naik ${inc} kg.`
          : `Semua set kena ${hi} reps. Naik ke ${next} kg dan mulai lagi dari ${lo} reps.`,
    };
  }

  const belowFloor = topSets.filter((s) => (s.reps ?? 0) < lo - 1).length;
  if (belowFloor > topSets.length / 2 && top > 0) {
    const next = round(top * 0.9, stepRound);
    return {
      weight: next,
      reps: lo,
      kind: "reduce",
      note: `Mayoritas set di bawah ${lo} reps. Turunkan ke ${next} kg, bangun lagi dengan form bersih.`,
    };
  }

  return {
    weight: top,
    reps: Math.min(hi, Math.max(lo, topMin + 1)),
    kind: "hold",
    note:
      scheme === "linear"
        ? `Belum tuntas di ${top} kg. Ulangi beban yang sama.`
        : `Tetap ${top} kg. Tambah satu rep per set sampai semua set ${hi}.`,
  };
}
