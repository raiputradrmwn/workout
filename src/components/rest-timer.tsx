"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, X } from "lucide-react";

function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.62);
    osc.onended = () => ctx.close();
  } catch {
    /* diabaikan */
  }
}

export function RestTimer({
  initial,
  label,
  onClose,
}: {
  initial: number;
  label?: string;
  onClose: () => void;
}) {
  const [remaining, setRemaining] = useState(initial);
  const [total, setTotal] = useState(initial);
  const [running, setRunning] = useState(true);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (remaining === 0 && !firedRef.current) {
      firedRef.current = true;
      beep();
      if (typeof navigator !== "undefined" && navigator.vibrate)
        navigator.vibrate([200, 100, 200]);
    }
  }, [remaining]);

  const addTime = useCallback((sec: number) => {
    firedRef.current = false;
    setRemaining((r) => r + sec);
    setTotal((t) => t + sec);
    setRunning(true);
  }, []);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const over = remaining === 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur-md">
      <div
        className={`h-1 transition-[width] duration-1000 ease-linear ${over ? "bg-success" : "bg-primary"}`}
        style={{ width: `${over ? 100 : pct}%` }}
      />
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4 py-3.5 sm:px-6">
        <div
          className={`grid size-16 shrink-0 place-items-center rounded-2xl text-xl font-bold tabular-nums ${
            over
              ? "animate-pulse bg-success text-success-foreground"
              : "bg-primary/10 text-primary"
          }`}
        >
          {mm}:{ss.toString().padStart(2, "0")}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {over ? "Waktunya set berikutnya" : "Istirahat"}
          </p>
          {label && (
            <p className="truncate text-sm text-muted-foreground">{label}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => addTime(15)}
            title="+15 detik"
            className="inline-flex h-11 items-center gap-1 rounded-xl border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
          >
            <Plus className="size-4" />
            15s
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            title={running ? "Jeda" : "Lanjut"}
            className="grid size-11 place-items-center rounded-xl border border-input bg-background hover:bg-muted"
          >
            {running ? <Pause className="size-5" /> : <Play className="size-5" />}
          </button>
          <button
            onClick={onClose}
            title="Lewati"
            className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
