// Rencana blok (mesocycle): urutan program, masing-masing beberapa minggu,
// opsional diakhiri satu minggu deload. Disimpan di cookie (per perangkat).
// Riwayat & progres beban tetap per gerakan, jadi lintas blok tetap nyambung.

import { isoLocal, mondayOf } from "@/lib/schedule";
import { programById, type Program } from "@/lib/programs";
import type { Suggestion } from "@/lib/progression";

export const PLAN_COOKIE = "block-plan";

export type Block = { programId: string; weeks: number; deload: boolean };
export type BlockPlan = { start: string; blocks: Block[] }; // start = Senin (YYYY-MM-DD)

export type WeekSlot = {
  monday: string;
  program: Program;
  blockIndex: number;
  weekInBlock: number; // 1-based
  blockWeeks: number; // termasuk deload
  deload: boolean;
};

export const MAX_BLOCKS = 8;

export function parsePlan(raw: string | undefined): BlockPlan | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(decodeURIComponent(raw)) as BlockPlan;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.start) || !Array.isArray(p.blocks) || p.blocks.length === 0) return null;
    const blocks = p.blocks.slice(0, MAX_BLOCKS).map((b) => ({
      programId: programById(b.programId).id,
      weeks: Math.min(12, Math.max(1, Math.round(Number(b.weeks) || 4))),
      deload: !!b.deload,
    }));
    return { start: p.start, blocks };
  } catch {
    return null;
  }
}

export function serializePlan(p: BlockPlan) {
  return encodeURIComponent(JSON.stringify(p));
}

function parseISO(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Semua minggu dalam rencana, urut. */
export function planWeeks(plan: BlockPlan): WeekSlot[] {
  const out: WeekSlot[] = [];
  const start = parseISO(plan.start);
  let w = 0;
  plan.blocks.forEach((b, bi) => {
    const total = b.weeks + (b.deload ? 1 : 0);
    for (let k = 1; k <= total; k++) {
      const mon = new Date(start);
      mon.setDate(mon.getDate() + w * 7);
      out.push({
        monday: isoLocal(mon),
        program: programById(b.programId),
        blockIndex: bi,
        weekInBlock: k,
        blockWeeks: total,
        deload: b.deload && k === total,
      });
      w++;
    }
  });
  return out;
}

/** Slot minggu untuk tanggal; di luar rencana -> null (sebelum mulai) atau blok terakhir (sesudah selesai). */
export function slotFor(plan: BlockPlan, date: Date): { slot: WeekSlot; finished: boolean } | null {
  const weeks = planWeeks(plan);
  const mon = isoLocal(mondayOf(date));
  if (mon < weeks[0].monday) return null;
  const hit = weeks.find((w) => w.monday === mon);
  if (hit) return { slot: hit, finished: false };
  const last = weeks.at(-1)!;
  return { slot: { ...last, deload: false }, finished: true };
}

/** Minggu deload: beban ~60%, reps sama, fokus teknik & pemulihan. */
export function applyDeload(s: Suggestion): Suggestion {
  if (s.weight == null) {
    return { ...s, kind: "hold", note: "Minggu deload: kerjakan 2 set saja, sisakan banyak tenaga." };
  }
  const w = Math.round((s.weight * 0.6) / 0.5) * 0.5;
  return {
    ...s,
    weight: w,
    kind: "reduce",
    note: `Minggu deload: ${w} kg (±60%), 2–3 set, gerakan bersih. Minggu depan kembali naik.`,
  };
}
