"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  last: SetRef[] | null;
  existing: (SetRef & { done: boolean })[];
};

type Cell = { weight: string; reps: string; done: boolean };

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
  const [rest, setRest] = useState<{ id: number; seconds: number; label: string } | null>(
    null,
  );
  const [openCue, setOpenCue] = useState<string | null>(null);

  const initial = useMemo(() => {
    const map: Record<string, Cell> = {};
    for (const ex of exercises) {
      for (let s = 1; s <= ex.targetSets; s++) {
        const ex0 = ex.existing.find((e) => e.setNumber === s);
        const last = ex.last?.find((e) => e.setNumber === s) ?? ex.last?.[ex.last.length - 1];
        map[`${ex.exerciseId}:${s}`] = {
          weight:
            ex0?.weightKg != null
              ? String(ex0.weightKg)
              : last?.weightKg != null
                ? String(last.weightKg)
                : "",
          reps:
            ex0?.reps != null
              ? String(ex0.reps)
              : last?.reps != null
                ? String(last.reps)
                : "",
          done: ex0?.done ?? false,
        };
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
        label: `${ex.name} - set ${setNumber} selesai`,
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

  return (
    <div className="space-y-5 pb-40">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">{dayLabel}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {doneSets}/{totalSets} set selesai
          </p>
        </div>
        <Button onClick={doFinish} disabled={pending || finished} variant={finished ? "outline" : "default"}>
          {finished ? "Sudah selesai" : "Selesai & Simpan"}
        </Button>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-[width]"
          style={{ width: `${totalSets ? (doneSets / totalSets) * 100 : 0}%` }}
        />
      </div>

      {exercises.map((ex) => {
        const lastText =
          ex.last && ex.last.length
            ? ex.last
                .map((s) => `${s.weightKg ?? "-"}kg x ${s.reps ?? "-"}`)
                .join(", ")
            : null;
        return (
          <Card key={ex.exerciseId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">
                  <span className="text-muted-foreground mr-2">{ex.order}.</span>
                  {ex.name}
                </CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {ex.targetSets} x {ex.targetReps}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{ex.muscles}</span>
                <span>- istirahat {ex.restSeconds}s</span>
                <button
                  type="button"
                  onClick={() => setOpenCue((o) => (o === ex.exerciseId ? null : ex.exerciseId))}
                  className="inline-flex items-center gap-1 text-foreground/80 hover:text-foreground"
                >
                  <Info className="size-3" /> Form
                  <ChevronDown
                    className={`size-3 transition-transform ${openCue === ex.exerciseId ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              {openCue === ex.exerciseId && (
                <p className="rounded-md bg-muted p-2 text-xs leading-relaxed">{ex.cues}</p>
              )}
              {lastText && (
                <p className="text-xs text-muted-foreground">
                  Terakhir: <span className="text-foreground/80">{lastText}</span>
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: ex.targetSets }, (_, i) => i + 1).map((s) => {
                const key = `${ex.exerciseId}:${s}`;
                const cell = cells[key];
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-10 shrink-0 text-sm text-muted-foreground">
                      Set {s}
                    </span>
                    <Input
                      inputMode="decimal"
                      placeholder="kg"
                      value={cell.weight}
                      onChange={(e) => update(key, { weight: e.target.value })}
                      className="h-9"
                    />
                    <span className="text-muted-foreground">x</span>
                    <Input
                      inputMode="numeric"
                      placeholder="reps"
                      value={cell.reps}
                      onChange={(e) => update(key, { reps: e.target.value })}
                      className="h-9"
                    />
                    <Button
                      size="icon"
                      variant={cell.done ? "default" : "outline"}
                      className="shrink-0"
                      onClick={() => completeSet(ex, s)}
                      title={cell.done ? "Batalkan" : "Set selesai"}
                    >
                      <Check className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
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
