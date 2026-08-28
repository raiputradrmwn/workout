"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Info, Lightbulb, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { RestTimer } from "@/components/rest-timer";
import { finishSession, upsertSet } from "@/lib/actions";

type SetRef = { setNumber: number; weightKg: number | null; reps: number | null };

export type RunnerExercise = {
  exerciseId: string;
  name: string;
  muscles: string;
  cues: string;
  equipment: string;
  order: number;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  suggestWeight: number | null;
  suggestReps: number | null;
  last: SetRef[] | null;
  existing: (SetRef & { done: boolean })[];
};

type Cell = { weight: string; reps: string; done: boolean };

const NO_WEIGHT = new Set(["band", "bodyweight", "pullup"]);

export function SessionRunner({
  sessionId,
  dayLabel,
  exercises,
  alreadyFinished,
}: {
  sessionId: string;
  dayLabel: string;
  exercises: RunnerExercise[];
  alreadyFinished: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [finished, setFinished] = useState(alreadyFinished);
  const [rest, setRest] = useState<{
    id: number;
    seconds: number;
    label: string;
  } | null>(null);
  const [openCue, setOpenCue] = useState<string | null>(null);

  const initial = useMemo(() => {
    const map: Record<string, Cell> = {};
    for (const ex of exercises) {
      const hasWeight = !NO_WEIGHT.has(ex.equipment);
      for (let s = 1; s <= ex.targetSets; s++) {
        const ex0 = ex.existing.find((e) => e.setNumber === s);
        const last =
          ex.last?.find((e) => e.setNumber === s) ??
          ex.last?.[ex.last.length - 1];
        const weight =
          ex0?.weightKg != null
            ? String(ex0.weightKg)
            : last?.weightKg != null
              ? String(last.weightKg)
              : hasWeight && ex.suggestWeight != null
                ? String(ex.suggestWeight)
                : "";
        const reps =
          ex0?.reps != null
            ? String(ex0.reps)
            : last?.reps != null
              ? String(last.reps)
              : ex.suggestReps != null
                ? String(ex.suggestReps)
                : "";
        map[`${ex.exerciseId}:${s}`] = { weight, reps, done: ex0?.done ?? false };
      }
    }
    return map;
  }, [exercises]);

  const [cells, setCells] = useState<Record<string, Cell>>(initial);

  function update(key: string, patch: Partial<Cell>) {
    setCells((c) => ({ ...c, [key]: { ...c[key], ...patch } }));
  }

  function completeSet(ex: RunnerExercise, setNumber: number) {
    const key = `${ex.exerciseId}:${setNumber}`;
    const cell = cells[key];
    const weightKg = cell.weight === "" ? null : Number(cell.weight);
    const reps = cell.reps === "" ? null : Number(cell.reps);
    const nextDone = !cell.done;
    update(key, { done: nextDone });
    startTransition(async () => {
      await upsertSet({
        sessionId,
        exerciseId: ex.exerciseId,
        setNumber,
        weightKg,
        reps,
        done: nextDone,
      });
    });
    if (nextDone) {
      setRest({
        id: Date.now(),
        seconds: ex.restSeconds,
        label: `${ex.name} · set ${setNumber}`,
      });
    }
  }

  function doFinish() {
    startTransition(async () => {
      await finishSession(sessionId);
      setFinished(true);
      toast.success("Sesi disimpan. Mantap!");
      router.push("/history");
    });
  }

  const totalSets = exercises.reduce((a, e) => a + e.targetSets, 0);
  const doneSets = Object.values(cells).filter((c) => c.done).length;
  const pct = totalSets ? (doneSets / totalSets) * 100 : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-44">
      {/* sticky progress header */}
      <div className="card-shadow sticky top-20 z-10 rounded-2xl border bg-card/95 p-5 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{dayLabel}</h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {doneSets} / {totalSets} set selesai
            </p>
          </div>
          <Button
            onClick={doFinish}
            disabled={pending || finished}
            variant={finished ? "outline" : "default"}
            className="h-11 px-5 text-base"
          >
            <Save className="size-4" />
            {finished ? "Tersimpan" : "Selesai"}
          </Button>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {exercises.map((ex) => {
        const hasWeight = !NO_WEIGHT.has(ex.equipment);
        const lastText =
          ex.last && ex.last.length
            ? ex.last
                .map((s) => `${s.weightKg ?? "BB"} × ${s.reps ?? "-"}`)
                .join(",  ")
            : null;
        const open = openCue === ex.exerciseId;
        return (
          <section
            key={ex.exerciseId}
            className="card-shadow overflow-hidden rounded-2xl border bg-card"
          >
            <div className="space-y-3 p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {ex.order}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold leading-tight">
                    {ex.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">{ex.muscles}</p>
                </div>
                <span className="shrink-0 rounded-lg bg-muted px-2.5 py-1 font-mono text-sm font-medium tabular-nums">
                  {ex.targetSets} × {ex.targetReps}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  Istirahat {ex.restSeconds}s
                </span>
                {lastText ? (
                  <span className="text-muted-foreground">
                    Terakhir:{" "}
                    <span className="font-medium text-foreground">
                      {lastText}
                    </span>
                  </span>
                ) : (
                  (ex.suggestWeight != null || ex.suggestReps != null) && (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <Lightbulb className="size-3.5" />
                      Saran:{" "}
                      <span className="font-medium text-foreground">
                        {hasWeight && ex.suggestWeight != null
                          ? `${ex.suggestWeight} kg × `
                          : ""}
                        {ex.suggestReps ?? "-"}
                      </span>
                    </span>
                  )
                )}
                <button
                  type="button"
                  onClick={() =>
                    setOpenCue((o) => (o === ex.exerciseId ? null : ex.exerciseId))
                  }
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  <Info className="size-3.5" /> Form
                  <ChevronDown
                    className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {open && (
                <p className="rounded-xl bg-accent/60 p-3 text-sm leading-relaxed text-accent-foreground">
                  {ex.cues}
                </p>
              )}
            </div>

            <div className="space-y-2 border-t bg-muted/30 p-4 sm:p-5">
              <div className="flex items-center gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span className="w-12">Set</span>
                <span className="flex-1">Berat (kg)</span>
                <span className="w-6" />
                <span className="flex-1">Reps</span>
                <span className="w-11" />
              </div>
              {Array.from({ length: ex.targetSets }, (_, i) => i + 1).map((s) => {
                const key = `${ex.exerciseId}:${s}`;
                const cell = cells[key];
                return (
                  <div
                    key={s}
                    className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${
                      cell.done
                        ? "border-success/40 bg-success/10"
                        : "border-transparent bg-card"
                    }`}
                  >
                    <span className="w-12 pl-1 text-sm font-medium text-muted-foreground">
                      {s}
                    </span>
                    <input
                      inputMode="decimal"
                      placeholder={hasWeight ? "kg" : "BB"}
                      disabled={!hasWeight}
                      value={hasWeight ? cell.weight : ""}
                      onChange={(e) => update(key, { weight: e.target.value })}
                      className="h-11 w-full min-w-0 flex-1 rounded-lg border bg-background px-3 text-center text-base font-medium tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40 disabled:opacity-40"
                    />
                    <span className="w-6 text-center text-muted-foreground">×</span>
                    <input
                      inputMode="numeric"
                      placeholder="reps"
                      value={cell.reps}
                      onChange={(e) => update(key, { reps: e.target.value })}
                      className="h-11 w-full min-w-0 flex-1 rounded-lg border bg-background px-3 text-center text-base font-medium tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
                    />
                    <button
                      type="button"
                      onClick={() => completeSet(ex, s)}
                      title={cell.done ? "Batalkan" : "Set selesai"}
                      className={`grid size-11 shrink-0 place-items-center rounded-lg border transition-colors ${
                        cell.done
                          ? "border-success bg-success text-success-foreground"
                          : "border-input bg-background text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      <Check className="size-5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {rest && (
        <RestTimer
          key={rest.id}
          initial={rest.seconds}
          label={rest.label}
          onClose={() => setRest(null)}
        />
      )}
    </div>
  );
}
