"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { finishTreadmill, startTreadmill } from "@/lib/actions";
import { TREADMILL_DEFAULT } from "@/lib/schedule";

const TOTAL = TREADMILL_DEFAULT.minutes * 60;

function ding() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    [660, 880, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.2);
      g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + i * 0.2 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.2 + 0.4);
      o.start(ctx.currentTime + i * 0.2);
      o.stop(ctx.currentTime + i * 0.2 + 0.42);
    });
    setTimeout(() => ctx.close(), 1500);
  } catch {
    /* ignore */
  }
}

export function TreadmillTimer({
  todayFinished,
  todayMinutes,
}: {
  todayFinished: boolean;
  todayMinutes: number | null;
}) {
  const [remaining, setRemaining] = useState(TOTAL);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(todayFinished);
  const idRef = useRef<string | null>(null);
  const [pending, startT] = useTransition();

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      ding();
      if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 300]);
      save(TREADMILL_DEFAULT.minutes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  async function ensureId() {
    if (!idRef.current) idRef.current = await startTreadmill();
    return idRef.current;
  }

  function toggle() {
    if (!running && remaining === TOTAL) {
      startT(async () => {
        await ensureId();
        setRunning(true);
      });
    } else {
      setRunning((r) => !r);
    }
  }

  function reset() {
    setRunning(false);
    setRemaining(TOTAL);
  }

  function save(min: number) {
    startT(async () => {
      const id = await ensureId();
      await finishTreadmill(id, min);
      setFinished(true);
      toast.success(`Treadmill ${min} menit tersimpan.`);
    });
  }

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = ((TOTAL - remaining) / TOTAL) * 100;
  const elapsedMin = Math.max(1, Math.round((TOTAL - remaining) / 60));
  const R = 45;
  const C = 2 * Math.PI * R;

  return (
    <div className="card-shadow mx-auto max-w-md space-y-8 rounded-3xl border bg-card p-8">
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Incline", TREADMILL_DEFAULT.incline],
          ["Speed", TREADMILL_DEFAULT.speed],
          ["Menit", TREADMILL_DEFAULT.minutes],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-muted/60 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {k}
            </p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid aspect-square w-full max-w-[15rem] place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={R}
            className="fill-none stroke-border"
            strokeWidth="7"
          />
          <circle
            cx="50"
            cy="50"
            r={R}
            className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
          />
        </svg>
        <div className="text-center">
          <p className="text-5xl font-semibold tabular-nums">
            {mm}:{ss.toString().padStart(2, "0")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {running ? "berjalan" : remaining === 0 ? "selesai" : "siap mulai"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <Button
          size="lg"
          onClick={toggle}
          disabled={pending || remaining === 0}
          className="h-12 text-base"
        >
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Jeda" : remaining === TOTAL ? "Mulai" : "Lanjut"}
        </Button>
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            size="lg"
            variant="outline"
            onClick={reset}
            disabled={pending}
            className="h-11"
          >
            <RotateCcw className="size-4" /> Reset
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => save(elapsedMin)}
            disabled={pending || remaining === TOTAL}
            className="h-11"
          >
            Selesai sekarang
          </Button>
        </div>
      </div>

      {finished && (
        <p className="rounded-xl bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
          Treadmill hari ini sudah tercatat
          {todayMinutes ? ` (${todayMinutes} menit)` : ""}. Boleh diulang.
        </p>
      )}
    </div>
  );
}
