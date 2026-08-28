"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div
              className={`grid size-16 place-items-center rounded-full text-lg font-bold tabular-nums ${
                over ? "bg-primary text-primary-foreground animate-pulse" : "bg-muted"
              }`}
            >
              {mm}:{ss.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">
              {over ? "Istirahat selesai - lanjut set berikutnya" : "Istirahat"}
              {label ? ` - ${label}` : ""}
            </p>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
                style={{ width: `${over ? 100 : pct}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={() => addTime(15)}
              title="+15 detik"
            >
              <Plus className="size-4" />
              15
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setRunning((r) => !r)}
              title={running ? "Jeda" : "Lanjut"}
            >
              {running ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button size="icon" onClick={onClose} title="Tutup / lewati">
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
