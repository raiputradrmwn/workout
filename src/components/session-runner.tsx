"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Repeat2, Timer, Trophy } from "lucide-react";
import { toast } from "sonner";
import { RestTimer } from "@/components/rest-timer";
import { ExerciseDemo } from "@/components/exercise-demo";
import { finishSession, swapExercise, upsertSet } from "@/lib/actions";
import { BETWEEN_EXERCISE_REST } from "@/lib/schedule";
import { warmupFor } from "@/lib/warmup";
import { primeAudio } from "@/lib/audio";
import { NO_WEIGHT } from "@/lib/library";
import { e1rm, isTimed, type PerfSet, type Suggestion } from "@/lib/progression";

export type RunnerExercise = {
  dayExerciseId: string;
  exerciseId: string;
  name: string;
  muscles: string;
  cues: string[];
  avoid: string | null;
  equipment: string;
  order: number;
  superset: string | null;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  alternatives: string[];
  last: PerfSet[] | null;
  suggestion: Suggestion;
  existing: (PerfSet & { done: boolean })[];
};

type Cell = { weight: string; reps: string; done: boolean };

/** Jeda singkat antar gerakan dalam satu superset / circuit. */
const SUPERSET_GAP = 15;

const fmtRest = (s: number) =>
  s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s} dtk`;

export function SessionRunner({
  sessionId,
  dayLabel,
  dayCategory,
  exercises,
  alreadyFinished,
}: {
  sessionId: string;
  dayLabel: string;
  dayCategory: string;
  exercises: RunnerExercise[];
  alreadyFinished: boolean;
}) {
  const router = useRouter();
  const warmup = useMemo(() => warmupFor(dayCategory), [dayCategory]);
  const [warmDone, setWarmDone] = useState<Set<number>>(new Set());
  const [pending, startTransition] = useTransition();
  const [finished, setFinished] = useState(alreadyFinished);
  const [rest, setRest] = useState<{ id: number; seconds: number; label: string } | null>(null);
  const [openCue, setOpenCue] = useState<string | null>(null);

  /** Anggota tiap superset, urut. */
  const groups = useMemo(() => {
    const g = new Map<string, RunnerExercise[]>();
    exercises.forEach((ex, i) => {
      if (!ex.superset) return;
      const prev = exercises[i - 1];
      const key = prev?.superset === ex.superset ? [...g.keys()].at(-1)! : `${ex.superset}-${i}`;
      g.set(key, [...(g.get(key) ?? []), ex]);
    });
    const byEx = new Map<string, RunnerExercise[]>();
    for (const members of g.values()) for (const m of members) byEx.set(m.dayExerciseId, members);
    return byEx;
  }, [exercises]);

  const initial = useMemo(() => {
    const map: Record<string, Cell> = {};
    for (const ex of exercises) {
      const hasWeight = !NO_WEIGHT.has(ex.equipment);
      for (let s = 1; s <= ex.targetSets; s++) {
        const cur = ex.existing.find((e) => e.setNumber === s);
        const weight =
          cur?.weightKg != null
            ? String(cur.weightKg)
            : hasWeight && ex.suggestion.weight != null
              ? String(ex.suggestion.weight)
              : "";
        const reps =
          cur?.reps != null ? String(cur.reps) : ex.suggestion.reps != null ? String(ex.suggestion.reps) : "";
        map[`${ex.exerciseId}:${s}`] = { weight, reps, done: cur?.done ?? false };
      }
    }
    return map;
  }, [exercises]);

  const [cells, setCells] = useState<Record<string, Cell>>(initial);

  function update(key: string, patch: Partial<Cell>) {
    setCells((c) => ({ ...c, [key]: { ...c[key], ...patch } }));
  }

  function bestBefore(ex: RunnerExercise) {
    const w = !NO_WEIGHT.has(ex.equipment);
    return (ex.last ?? []).reduce((a, s) => Math.max(a, w ? e1rm(s.weightKg ?? 0, s.reps ?? 0) : (s.reps ?? 0)), 0);
  }

  function valueOf(ex: RunnerExercise, c: Cell) {
    return NO_WEIGHT.has(ex.equipment) ? Number(c.reps) || 0 : e1rm(Number(c.weight) || 0, Number(c.reps) || 0);
  }

  function completeSet(ex: RunnerExercise, setNumber: number) {
    primeAudio();
    const key = `${ex.exerciseId}:${setNumber}`;
    const cell = cells[key];
    const weightKg = cell.weight === "" ? null : Number(cell.weight);
    const reps = cell.reps === "" ? null : Number(cell.reps);
    const nextDone = !cell.done;
    update(key, { done: nextDone });
    startTransition(async () => {
      await upsertSet({ sessionId, exerciseId: ex.exerciseId, setNumber, weightKg, reps, done: nextDone });
    });
    if (!nextDone) return;

    const best = bestBefore(ex);
    if (best > 0 && valueOf(ex, cell) > best) toast.success(`Rekor baru: ${ex.name}`, { description: "Lebih berat dari sesi terakhir." });

    const members = groups.get(ex.dayExerciseId);
    if (members) {
      const pos = members.findIndex((m) => m.dayExerciseId === ex.dayExerciseId);
      const nextMember = members[pos + 1];
      if (nextMember && setNumber <= nextMember.targetSets) {
        setRest({ id: Date.now(), seconds: SUPERSET_GAP, label: `Langsung: ${nextMember.name} · set ${setNumber}` });
        return;
      }
      const first = members[0];
      if (setNumber < first.targetSets) {
        setRest({ id: Date.now(), seconds: Math.max(ex.restSeconds, 45), label: `Ronde ${setNumber + 1}: ${first.name}` });
        return;
      }
      const after = exercises[exercises.indexOf(members.at(-1)!) + 1];
      if (after) setRest({ id: Date.now(), seconds: BETWEEN_EXERCISE_REST, label: `Berikutnya: ${after.name}` });
      return;
    }

    const next = exercises[exercises.indexOf(ex) + 1];
    if (setNumber >= ex.targetSets) {
      if (next) setRest({ id: Date.now(), seconds: Math.max(ex.restSeconds, BETWEEN_EXERCISE_REST), label: `Berikutnya: ${next.name}` });
    } else {
      setRest({ id: Date.now(), seconds: ex.restSeconds, label: `${ex.name} · set ${setNumber + 1}` });
    }
  }

  function doFinish() {
    const prs = exercises.filter((ex) => {
      const best = bestBefore(ex);
      return (
        best > 0 &&
        Array.from({ length: ex.targetSets }, (_, i) => cells[`${ex.exerciseId}:${i + 1}`]).some(
          (c) => c.done && valueOf(ex, c) > best,
        )
      );
    }).length;
    startTransition(async () => {
      await finishSession(sessionId);
      setFinished(true);
      toast.success(prs ? `Sesi tersimpan · ${prs} rekor baru` : "Sesi tersimpan. Kerja bagus!");
      router.push("/progres");
    });
  }

  function doSwap(dayExerciseId: string, name: string) {
    startTransition(async () => {
      await swapExercise(sessionId, dayExerciseId, name);
      router.refresh();
    });
  }

  const totalSets = exercises.reduce((a, e) => a + e.targetSets, 0);
  const doneSets = Object.values(cells).filter((c) => c.done).length;
  const pct = totalSets ? (doneSets / totalSets) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-40">
      <datalist id="dumbbell-kg">
        {Array.from({ length: 27 }, (_, i) => 1 + i * 0.5).map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      {/* header lengket */}
      <div className="sticky top-14 z-10 -mx-4 bg-background/95 px-4 pt-3 pb-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-4 rounded-2xl bg-ink p-4 text-white">
          <div className="min-w-0 flex-1">
            <h1 className="display truncate text-2xl sm:text-3xl">{dayLabel}</h1>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-volt transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <div className="text-right">
            <p className="num text-3xl leading-none">
              {doneSets}
              <span className="text-base text-white/50">/{totalSets}</span>
            </p>
            <p className="text-[11px] font-semibold text-white/60">set</p>
          </div>
          <button
            onClick={doFinish}
            disabled={pending || finished}
            className="h-12 shrink-0 rounded-xl bg-volt px-4 font-bold text-ink active:scale-95 disabled:opacity-50"
          >
            {finished ? "Tersimpan" : "Selesai"}
          </button>
        </div>
      </div>

      {/* pemanasan */}
      <details className="group card overflow-hidden">
        <summary className="flex cursor-pointer list-none items-center gap-3 p-5">
          <span className="display text-xl">Pemanasan</span>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
            {warmDone.size}/{warmup.length}
          </span>
          <ChevronDown className="ml-auto size-5 transition-transform group-open:rotate-180" />
        </summary>
        <ul className="space-y-1 px-3 pb-3">
          {warmup.map((d, i) => {
            const done = warmDone.has(i);
            return (
              <li key={d.name + i}>
                <button
                  type="button"
                  onClick={() =>
                    setWarmDone((s) => {
                      const n = new Set(s);
                      if (n.has(i)) n.delete(i);
                      else n.add(i);
                      return n;
                    })
                  }
                  className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors ${done ? "bg-muted" : "hover:bg-muted"}`}
                >
                  <span
                    className={`grid size-6 shrink-0 place-items-center rounded-md border-2 ${
                      done ? "border-ink bg-ink text-white" : "border-input"
                    }`}
                  >
                    {done && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className={done ? "text-muted-foreground line-through" : ""}>
                    <span className="font-semibold">{d.name}</span>
                    <span className="block text-sm text-muted-foreground">{d.detail}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </details>

      {exercises.map((ex, idx) => {
        const hasWeight = !NO_WEIGHT.has(ex.equipment);
        const timed = isTimed(ex.targetReps);
        const best = bestBefore(ex);
        const lastText = ex.last?.length
          ? ex.last.map((s) => (hasWeight ? `${s.weightKg ?? 0}×${s.reps ?? "–"}` : `${s.reps ?? "–"}`)).join(" · ")
          : null;
        const open = openCue === ex.dayExerciseId;
        const s = ex.suggestion;
        const members = groups.get(ex.dayExerciseId);
        const firstInGroup = members && members[0].dayExerciseId === ex.dayExerciseId;
        const pos = members ? members.findIndex((m) => m.dayExerciseId === ex.dayExerciseId) + 1 : 0;
        const exDone = Array.from({ length: ex.targetSets }, (_, i) => cells[`${ex.exerciseId}:${i + 1}`]).every((c) => c.done);
        return (
          <div key={ex.dayExerciseId}>
            {firstInGroup && (
              <div className="mt-6 mb-2 flex items-center gap-2 px-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-volt px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink">
                  <Repeat2 className="size-3.5" />
                  {members!.length > 2 ? "Circuit" : "Superset"} {ex.superset}
                </span>
                <span className="text-sm text-muted-foreground">
                  {members!.map((m) => m.name.split(" ").slice(-2).join(" ")).join(" → ")}, lalu istirahat
                </span>
              </div>
            )}
            <section
              className={`card overflow-hidden ${members ? "border-l-[6px] border-l-volt" : ""}`}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <span
                    className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                      exDone ? "bg-ink text-white" : "bg-muted"
                    }`}
                  >
                    {exDone ? <Check className="size-5" strokeWidth={3} /> : members ? `${ex.superset}${pos}` : idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-bold leading-tight">{ex.name}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">{ex.muscles}</p>
                  </div>
                  <ExerciseDemo name={ex.name} cues={ex.cues.join(" ")} />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-muted p-3">
                    <p className="eyebrow">Target</p>
                    <p className="num mt-0.5 text-xl">
                      {ex.targetSets}×{ex.targetReps.replace(" / kaki", "/kaki").replace("maks (AMRAP)", "maks")}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${s.kind === "increase" ? "bg-volt" : "bg-muted"}`}>
                    <p className="eyebrow" style={s.kind === "increase" ? { color: "var(--ink)" } : undefined}>
                      {s.kind === "increase" ? "Naik!" : "Saran"}
                    </p>
                    <p className="num mt-0.5 text-xl">
                      {hasWeight && s.weight != null ? `${s.weight}×` : ""}
                      {s.reps ?? "maks"}
                      {timed ? " dtk" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      primeAudio();
                      setRest({ id: Date.now(), seconds: ex.restSeconds || SUPERSET_GAP, label: ex.name });
                    }}
                    className="rounded-xl bg-muted p-3 text-left transition-colors hover:bg-ink hover:text-white active:scale-95"
                  >
                    <span className="eyebrow inline-flex items-center gap-1" style={{ color: "inherit", opacity: 0.7 }}>
                      <Timer className="size-3" /> Istirahat
                    </span>
                    <span className="num mt-0.5 block text-xl">{fmtRest(ex.restSeconds || SUPERSET_GAP)}</span>
                  </button>
                </div>

                <p className="mt-3 text-sm text-muted-foreground">{s.note}</p>
                {lastText && <p className="mt-1 text-sm">Terakhir: <span className="num">{lastText}</span></p>}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenCue((o) => (o === ex.dayExerciseId ? null : ex.dayExerciseId))}
                    aria-expanded={open}
                    className="inline-flex h-9 items-center gap-1 rounded-full bg-muted px-3.5 text-sm font-semibold hover:bg-secondary"
                  >
                    Cara melakukan
                    <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                  </button>
                  {ex.alternatives.length > 1 && (
                    <label className="inline-flex h-9 items-center gap-2 rounded-full bg-muted pr-2 pl-3.5 text-sm font-semibold">
                      Ganti
                      <select
                        value={ex.name}
                        disabled={pending}
                        onChange={(e) => doSwap(ex.dayExerciseId, e.target.value)}
                        className="max-w-44 bg-transparent font-normal outline-none"
                      >
                        {!ex.alternatives.includes(ex.name) && <option value={ex.name}>{ex.name}</option>}
                        {ex.alternatives.map((a) => (
                          <option key={a} value={a}>
                            {a}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>

                {open && (
                  <div className="rise mt-3 rounded-xl bg-muted p-4 text-sm leading-relaxed">
                    <ol className="list-decimal space-y-1.5 pl-5 marker:font-bold">
                      {ex.cues.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ol>
                    {ex.avoid && (
                      <p className="mt-3 border-t border-border pt-3">
                        <span className="font-bold">Hindari:</span> {ex.avoid}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* tabel set */}
              <div className="border-t bg-background/60 p-3 sm:p-4">
                <div className="eyebrow grid grid-cols-[2.25rem_1fr_1fr_3.25rem] gap-2 px-1 pb-2">
                  <span>Set</span>
                  <span>{hasWeight ? "Berat kg" : "Beban"}</span>
                  <span>{timed ? "Detik" : "Reps"}</span>
                  <span />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: ex.targetSets }, (_, i) => i + 1).map((n) => {
                    const key = `${ex.exerciseId}:${n}`;
                    const cell = cells[key];
                    const pr = cell.done && best > 0 && valueOf(ex, cell) > best;
                    return (
                      <div
                        key={n}
                        className={`grid grid-cols-[2.25rem_1fr_1fr_3.25rem] items-center gap-2 rounded-xl p-1 transition-colors ${
                          cell.done ? "bg-volt/40" : ""
                        }`}
                      >
                        <span className="num relative text-center text-lg">
                          {n}
                          {pr && (
                            <Trophy className="pop absolute -top-1 -right-1 size-3.5" aria-label="Rekor baru" />
                          )}
                        </span>
                        <input
                          inputMode="decimal"
                          aria-label={`Berat set ${n}`}
                          list={ex.equipment === "dumbbell" ? "dumbbell-kg" : undefined}
                          placeholder={hasWeight ? "kg" : "BW"}
                          disabled={!hasWeight}
                          value={hasWeight ? cell.weight : ""}
                          onChange={(e) => update(key, { weight: e.target.value })}
                          className="num h-12 w-full min-w-0 rounded-xl border-2 border-input bg-card px-3 text-center text-xl outline-none focus:border-ink disabled:border-dashed disabled:bg-transparent"
                        />
                        <input
                          inputMode="numeric"
                          aria-label={`Reps set ${n}`}
                          placeholder={timed ? "dtk" : "reps"}
                          value={cell.reps}
                          onChange={(e) => update(key, { reps: e.target.value })}
                          className="num h-12 w-full min-w-0 rounded-xl border-2 border-input bg-card px-3 text-center text-xl outline-none focus:border-ink"
                        />
                        <button
                          type="button"
                          onClick={() => completeSet(ex, n)}
                          aria-label={cell.done ? `Batalkan set ${n}` : `Set ${n} selesai`}
                          aria-pressed={cell.done}
                          className={`grid size-12 place-items-center rounded-xl transition-all active:scale-90 ${
                            cell.done ? "pop bg-ink text-volt" : "border-2 border-input bg-card text-muted-foreground hover:border-ink hover:text-ink"
                          }`}
                        >
                          <Check className="size-6" strokeWidth={3} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        );
      })}

      {rest && <RestTimer key={rest.id} initial={rest.seconds} label={rest.label} onClose={() => setRest(null)} />}
    </div>
  );
}
