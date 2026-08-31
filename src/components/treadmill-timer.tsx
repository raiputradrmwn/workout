"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Lightbulb, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { finishTreadmill, startTreadmill } from "@/lib/actions";
import { playChime, primeAudio, vibrate } from "@/lib/audio";

type Plan = { incline: number; speed: number; minutes: number };

const num = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function TreadmillTimer({
  suggestion,
  todayFinished,
  todayPlan,
  todayDistanceKm,
}: {
  suggestion: Plan & { note: string };
  todayFinished: boolean;
  todayPlan: Plan | null;
  todayDistanceKm: number | null;
}) {
  const startPlan = todayPlan ?? {
    incline: suggestion.incline,
    speed: suggestion.speed,
    minutes: suggestion.minutes,
  };

  const [incline, setIncline] = useState(String(startPlan.incline));
  const [speed, setSpeed] = useState(String(startPlan.speed));
  const [minutes, setMinutes] = useState(String(startPlan.minutes));
  const [distance, setDistance] = useState(
    todayDistanceKm != null ? String(todayDistanceKm) : "",
  );

  const targetMin = num(minutes, suggestion.minutes);
  const total = Math.round(targetMin * 60);

  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(todayFinished);
  const idRef = useRef<string | null>(null);
  const [pending, startT] = useTransition();

  // Kalau durasi diubah sebelum mulai, reset hitung mundur.
  useEffect(() => {
    if (!running && !finished) setRemaining(total);
  }, [total, running, finished]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const elapsedSec = total - remaining;
  const autoDistance = useMemo(
    () => (num(speed, suggestion.speed) * elapsedSec) / 3600,
    [speed, elapsedSec, suggestion.speed],
  );

  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      playChime(3);
      vibrate([300, 120, 300, 120, 300]);
      save(targetMin);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  async function ensureId() {
    if (!idRef.current)
      idRef.current = await startTreadmill({
        incline: num(incline, suggestion.incline),
        speed: num(speed, suggestion.speed),
        minutes: targetMin,
      });
    return idRef.current;
  }

  function toggle() {
    primeAudio();
    if (!running && remaining === total) {
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
    setRemaining(total);
  }

  function save(min: number) {
    startT(async () => {
      const id = await ensureId();
      const km =
        distance.trim() !== ""
          ? Number(distance)
          : Math.round(((num(speed, suggestion.speed) * min * 60) / 3600) * 100) /
            100;
      await finishTreadmill(id, {
        minutes: min,
        distanceKm: Number.isFinite(km) ? km : null,
      });
      setFinished(true);
      toast.success(`Treadmill ${min} menit${km ? ` · ${km} km` : ""} tersimpan.`);
    });
  }

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = total > 0 ? (elapsedSec / total) * 100 : 0;
  const elapsedMin = Math.max(1, Math.round(elapsedSec / 60));
  const R = 45;
  const C = 2 * Math.PI * R;
  const locked = running || finished;

  const fields: [string, string, string, (v: string) => void, string][] = [
    ["Incline", incline, "level", setIncline, "0.5"],
    ["Speed", speed, "km/j", setSpeed, "0.1"],
    ["Menit", minutes, "menit", setMinutes, "1"],
  ];

  const suggestionMatches =
    num(incline, -1) === suggestion.incline &&
    num(speed, -1) === suggestion.speed &&
    num(minutes, -1) === suggestion.minutes;

  return (
    <div className="card-shadow mx-auto max-w-md space-y-6 rounded-3xl border bg-card p-6 sm:p-8">
      {/* Saran */}
      <div className="rounded-2xl bg-accent/60 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
          <Lightbulb className="size-4" /> Saran hari ini
        </p>
        <p className="mt-1 text-sm text-accent-foreground/90">{suggestion.note}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-sm tabular-nums text-accent-foreground">
            {suggestion.incline} · {suggestion.speed} km/j · {suggestion.minutes}′
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={locked || suggestionMatches}
            onClick={() => {
              setIncline(String(suggestion.incline));
              setSpeed(String(suggestion.speed));
              setMinutes(String(suggestion.minutes));
            }}
          >
            {suggestionMatches ? "Terpakai" : "Pakai saran"}
          </Button>
        </div>
      </div>

      {/* Setelan (bisa diubah) */}
      <div className="grid grid-cols-3 gap-3">
        {fields.map(([label, val, unit, set, step]) => (
          <label key={label} className="block rounded-2xl bg-muted/60 p-3 text-center">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={step}
              min={0}
              value={val}
              disabled={locked}
              onChange={(e) => set(e.target.value)}
              className="mt-1 w-full bg-transparent text-center text-2xl font-semibold tabular-nums outline-none disabled:opacity-60"
            />
            <span className="text-[11px] text-muted-foreground">{unit}</span>
          </label>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative mx-auto grid aspect-square w-full max-w-[14rem] place-items-center">
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
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {running
              ? `≈ ${autoDistance.toFixed(2)} km`
              : remaining === 0
                ? "selesai"
                : "siap mulai"}
          </p>
        </div>
      </div>

      {/* Jarak */}
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3">
        <span className="text-sm text-muted-foreground">Jarak (km)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          placeholder={autoDistance > 0 ? autoDistance.toFixed(2) : "otomatis"}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="w-28 rounded-lg border bg-background px-3 py-2 text-center text-base font-medium tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
        />
      </label>

      {finished ? (
        <div className="space-y-2.5">
          <p className="rounded-xl bg-success/10 px-4 py-3 text-center text-sm font-medium text-success">
            Treadmill hari ini tercatat
            {todayDistanceKm ? ` · ${todayDistanceKm} km` : ""}.
          </p>
          <Button
            size="lg"
            variant="outline"
            onClick={() => {
              setFinished(false);
              reset();
            }}
            disabled={pending}
            className="h-11 w-full"
          >
            <RotateCcw className="size-4" /> Ubah / catat lagi
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Catat manual — langsung dari angka yang diisi di atas */}
          <Button
            size="lg"
            onClick={() => save(num(minutes, suggestion.minutes))}
            disabled={pending || running}
            className="h-12 w-full text-base"
          >
            Simpan (input manual)
          </Button>

          {/* atau pakai timer */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau pakai timer
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="flex flex-col gap-2.5">
            <Button
              size="lg"
              variant="secondary"
              onClick={toggle}
              disabled={pending || remaining === 0}
              className="h-11 text-base"
            >
              {running ? <Pause className="size-5" /> : <Play className="size-5" />}
              {running ? "Jeda" : remaining === total ? "Mulai" : "Lanjut"}
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
                variant="outline"
                onClick={() => save(elapsedMin)}
                disabled={pending || elapsedSec === 0}
                className="h-11"
              >
                Selesai sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
