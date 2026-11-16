"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { savePlan } from "@/lib/actions";
import { MAX_BLOCKS, planWeeks, type Block, type BlockPlan } from "@/lib/block-plan";
import { PROGRAMS, programById } from "@/lib/programs";

const dFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" });
const parse = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Contoh: PPL minggu ini, Upper/Lower minggu depan, lalu 5×5. */
const EXAMPLE: Block[] = [
  { programId: "ppl", weeks: 4, deload: true },
  { programId: "upper-lower", weeks: 4, deload: true },
  { programId: "strength-5x5", weeks: 4, deload: true },
];

export function BlockPlanner({
  initial,
  thisMonday,
  nextMonday,
  todayMonday,
}: {
  initial: BlockPlan | null;
  thisMonday: string;
  nextMonday: string;
  todayMonday: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [startISO, setStartISO] = useState(initial?.start ?? thisMonday);
  const [blocks, setBlocks] = useState<Block[]>(initial?.blocks ?? EXAMPLE);
  const dirty = JSON.stringify({ s: startISO, b: blocks }) !== JSON.stringify({ s: initial?.start, b: initial?.blocks });

  const weeks = useMemo(() => planWeeks({ start: startISO, blocks }), [startISO, blocks]);
  const shortBlocks = blocks.some((b) => b.weeks < 3);
  const totalWeeks = weeks.length;

  const set = (i: number, patch: Partial<Block>) =>
    setBlocks((bs) => bs.map((b, k) => (k === i ? { ...b, ...patch } : b)));
  const move = (i: number, d: -1 | 1) =>
    setBlocks((bs) => {
      const j = i + d;
      if (j < 0 || j >= bs.length) return bs;
      const n = [...bs];
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });

  function save() {
    start(async () => {
      await savePlan({ start: startISO, blocks });
      toast.success("Rencana blok disimpan");
      router.refresh();
    });
  }
  function clear() {
    start(async () => {
      await savePlan(null);
      setBlocks(EXAMPLE);
      toast.success("Rencana dihapus, kembali ke program tunggal");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold">Mulai</span>
          {[
            [thisMonday, "Minggu ini"],
            [nextMonday, "Minggu depan"],
          ].map(([iso, label]) => (
            <button
              key={iso}
              type="button"
              aria-pressed={startISO === iso}
              onClick={() => setStartISO(iso)}
              className={`h-10 rounded-full px-4 text-sm font-semibold ${
                startISO === iso ? "bg-ink text-white" : "bg-muted"
              }`}
            >
              {label} · {dFmt.format(parse(iso))}
            </button>
          ))}
          {startISO !== thisMonday && startISO !== nextMonday && (
            <span className="rounded-full bg-muted px-3 py-2 text-sm">Mulai {dFmt.format(parse(startISO))}</span>
          )}
        </div>

        <ol className="space-y-3">
          {blocks.map((b, i) => (
            <li key={i} className="rounded-2xl bg-muted p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">
                  {i + 1}
                </span>
                <select
                  value={b.programId}
                  onChange={(e) => set(i, { programId: e.target.value })}
                  aria-label={`Program blok ${i + 1}`}
                  className="h-11 min-w-0 flex-1 rounded-xl border-2 border-input bg-card px-3 font-semibold outline-none focus:border-ink"
                >
                  {PROGRAMS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" aria-label="Naikkan" onClick={() => move(i, -1)} disabled={i === 0} className="grid size-10 place-items-center rounded-full hover:bg-card disabled:opacity-30">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" aria-label="Turunkan" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} className="grid size-10 place-items-center rounded-full hover:bg-card disabled:opacity-30">
                    <ArrowDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Hapus blok"
                    onClick={() => setBlocks((bs) => bs.filter((_, k) => k !== i))}
                    disabled={blocks.length === 1}
                    className="grid size-10 place-items-center rounded-full text-destructive hover:bg-card disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 pl-0 sm:pl-12">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  Lama
                  <span className="flex items-center rounded-full bg-card">
                    <button type="button" aria-label="Kurangi minggu" onClick={() => set(i, { weeks: Math.max(1, b.weeks - 1) })} className="grid size-10 place-items-center rounded-full text-lg">
                      −
                    </button>
                    <span className="num w-16 text-center text-lg">{b.weeks} mgg</span>
                    <button type="button" aria-label="Tambah minggu" onClick={() => set(i, { weeks: Math.min(12, b.weeks + 1) })} className="grid size-10 place-items-center rounded-full text-lg">
                      +
                    </button>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={b.deload}
                    onChange={(e) => set(i, { deload: e.target.checked })}
                    className="size-5 accent-[var(--ink)]"
                  />
                  + 1 minggu deload
                </label>
                <span className="text-sm text-muted-foreground">{programById(b.programId).goal}</span>
              </div>
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBlocks((bs) => [...bs, { programId: "ppl", weeks: 4, deload: true }])}
            disabled={blocks.length >= MAX_BLOCKS}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm font-semibold disabled:opacity-40"
          >
            <Plus className="size-4" /> Tambah blok
          </button>
          <button
            type="button"
            onClick={() => setBlocks((bs) => bs.map((b) => ({ ...b, weeks: 1, deload: false })))}
            className="h-11 rounded-full bg-muted px-4 text-sm font-semibold"
          >
            Ganti tiap minggu
          </button>
        </div>

        {shortBlocks && (
          <p className="flex gap-2 rounded-2xl bg-volt p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>
              Ganti program tiap minggu membuat progres susah diukur: beban belum sempat naik sebelum
              menunya berubah. Saran: blok 3–6 minggu. Riwayat beban tetap tersimpan per gerakan,
              jadi squat di PPL dan di 5×5 tetap satu grafik.
            </span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 border-t pt-4">
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="h-12 rounded-2xl bg-volt px-6 font-bold disabled:opacity-50"
          >
            {initial ? "Simpan perubahan" : "Aktifkan rencana"}
          </button>
          {initial && (
            <button type="button" onClick={clear} disabled={pending} className="h-12 rounded-2xl bg-muted px-5 font-semibold">
              Hapus rencana
            </button>
          )}
          <span className="self-center text-sm text-muted-foreground">Total {totalWeeks} minggu</span>
        </div>
      </div>

      {/* timeline */}
      <div className="card p-4 sm:p-5">
        <h3 className="display text-2xl">Timeline</h3>
        <ol className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {weeks.map((w) => {
            const now = w.monday === todayMonday;
            const past = w.monday < todayMonday;
            return (
              <li
                key={w.monday}
                className={`flex items-center gap-3 rounded-xl p-3 text-sm ${
                  now ? "bg-ink text-white" : w.deload ? "bg-volt" : "bg-muted"
                } ${past ? "opacity-50" : ""}`}
              >
                <span className="num w-14 shrink-0 text-base">{dFmt.format(parse(w.monday))}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {w.deload ? "Deload · " : ""}
                    {w.program.name}
                  </span>
                  <span className={`block text-xs ${now ? "text-white/60" : "opacity-70"}`}>
                    Blok {w.blockIndex + 1} · minggu {w.weekInBlock}/{w.blockWeeks}
                    {now ? " · sekarang" : ""}
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">
          Setelah blok terakhir selesai, program blok terakhir dipakai terus sampai rencana diubah.
        </p>
      </div>
    </div>
  );
}
