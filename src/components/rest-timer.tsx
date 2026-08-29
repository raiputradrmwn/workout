"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { playChime, vibrate } from "@/lib/audio";

function flashTitle(msg: string) {
  if (typeof document === "undefined") return;
  const original = document.title;
  let on = true;
  let n = 0;
  const id = setInterval(() => {
    document.title = on ? msg : original;
    on = !on;
    if (++n > 12) {
      clearInterval(id);
      document.title = original;
    }
  }, 600);
}

function notify(body: string) {
  try {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted")
      new Notification("Istirahat selesai", { body, tag: "rest-timer" });
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
  const oncePerZeroRef = useRef(false);

  useEffect(() => {
    try {
      if (
        typeof Notification !== "undefined" &&
        Notification.permission === "default"
      )
        Notification.requestPermission().catch(() => {});
    } catch {
      /* diabaikan */
    }
  }, []);

  // hitung mundur
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  // saat 0: bunyi + getar BERULANG tiap 3 dtk sampai ditutup / dijeda
  useEffect(() => {
    if (remaining !== 0) {
      oncePerZeroRef.current = false;
      return;
    }
    if (!oncePerZeroRef.current) {
      oncePerZeroRef.current = true;
      notify(label ?? "Lanjut set berikutnya");
      flashTitle("⏰ Istirahat selesai!");
      toast.success("Istirahat selesai", { description: label });
    }
    if (!running) return; // dijeda = berhenti mengganggu
    const fire = () => {
      playChime(2);
      vibrate([400, 150, 400, 150, 600]);
    };
    fire();
    const id = setInterval(fire, 3000);
    return () => clearInterval(id);
  }, [remaining, running, label]);

  const addTime = useCallback((sec: number) => {
    if (sec > 0) setRunning(true);
    setRemaining((r) => Math.max(0, r + sec));
    setTotal((t) => Math.max(1, t + sec));
  }, []);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = total > 0 ? (remaining / total) * 100 : 0;
  const over = remaining === 0;

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-30 border-t backdrop-blur-md ${
        over ? "border-success bg-success/15" : "border-border bg-card/95"
      }`}
    >
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
          <p className={`text-sm font-semibold ${over ? "text-success" : ""}`}>
            {over ? "✓ Istirahat selesai — lanjut!" : "Istirahat"}
          </p>
          {label && (
            <p className="hidden truncate text-sm text-muted-foreground min-[420px]:block">
              {label}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => addTime(-15)}
            title="-15 detik"
            className="inline-flex h-11 items-center gap-0.5 rounded-xl border border-input bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            <Minus className="size-4" />
            15
          </button>
          <button
            onClick={() => addTime(15)}
            title="+15 detik"
            className="inline-flex h-11 items-center gap-0.5 rounded-xl border border-input bg-background px-2.5 text-sm font-medium hover:bg-muted"
          >
            <Plus className="size-4" />
            15
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
            title="Lewati / tutup"
            className={`grid size-11 place-items-center rounded-xl text-primary-foreground ${
              over ? "bg-success hover:bg-success/90" : "bg-primary hover:bg-primary/90"
            }`}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
