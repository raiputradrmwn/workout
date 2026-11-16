"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
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
      flashTitle("Istirahat selesai");
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
      role="timer"
      aria-live="off"
      className="rise fixed inset-x-0 bottom-[calc(72px+env(safe-area-inset-bottom))] z-30 px-3 lg:bottom-4"
    >
      <div
        className={`mx-auto max-w-3xl overflow-hidden rounded-2xl shadow-[0_12px_40px_-12px_rgb(0_0_0/0.45)] ${
          over ? "bg-volt text-ink" : "bg-ink text-white"
        }`}
      >
        <div className="h-1.5 bg-white/15">
          <div
            className={`h-full transition-[width] duration-1000 ease-linear ${over ? "bg-ink" : "bg-volt"}`}
            style={{ width: `${over ? 100 : pct}%` }}
          />
        </div>
        <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
          <div className={`num shrink-0 text-5xl leading-none ${over ? "animate-pulse" : ""}`}>
            {mm}:{ss.toString().padStart(2, "0")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide opacity-70">
              {over ? "Gas, set berikutnya!" : running ? "Istirahat" : "Dijeda"}
            </p>
            {label && <p className="truncate text-sm font-semibold">{label}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => addTime(15)}
              title="Tambah 15 detik"
              className="num hidden h-11 rounded-xl bg-white/10 px-3 text-base min-[400px]:block"
              style={over ? { background: "rgb(0 0 0 / 0.08)" } : undefined}
            >
              +15
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              aria-label={running ? "Jeda" : "Lanjut"}
              className="grid size-11 place-items-center rounded-xl bg-white/10"
              style={over ? { background: "rgb(0 0 0 / 0.08)" } : undefined}
            >
              {running ? <Pause className="size-5" /> : <Play className="size-5" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Lewati istirahat"
              className={`h-11 rounded-xl px-4 text-sm font-bold ${over ? "bg-ink text-volt" : "bg-volt text-ink"}`}
            >
              {over ? "Lanjut" : "Skip"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
