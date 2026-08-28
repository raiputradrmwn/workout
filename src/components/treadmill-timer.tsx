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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          ["Incline", TREADMILL_DEFAULT.incline],
          ["Kecepatan", TREADMILL_DEFAULT.speed],
          ["Menit", TREADMILL_DEFAULT.minutes],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="text-xl font-bold tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="relative mx-auto grid aspect-square w-full max-w-xs place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="fill-none stroke-muted" strokeWidth="6" />
          <circle
            cx="50"
            cy="50"
            r="45"
            className="fill-none stroke-primary transition-[stroke-dashoffset] duration-1000 ease-linear"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - pct / 100)}
          />
        </svg>
        <div className="text-center">
          <p className="text-5xl font-bold tabular-nums">
            {mm}:{ss.toString().padStart(2, "0")}
          </p>
          <p className="text-sm text-muted-foreground">
            {running ? "berjalan" : remaining === 0 ? "selesai" : "siap"}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button size="lg" onClick={toggle} disabled={pending || remaining === 0}>
          {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          {running ? "Jeda" : remaining === TOTAL ? "Mulai" : "Lanjut"}
        </Button>
        <Button size="lg" variant="outline" onClick={reset} disabled={pending}>
          <RotateCcw className="size-5" /> Reset
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => save(elapsedMin)}
          disabled={pending || remaining === TOTAL}
        >
          Selesai sekarang
        </Button>
      </div>

      {finished && (
        <p className="text-center text-sm text-primary">
          Treadmill hari ini sudah tercatat
          {todayMinutes ? ` (${todayMinutes} menit)` : ""}. Boleh diulang kalau mau.
        </p>
      )}
    </div>
  );
}
