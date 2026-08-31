"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Lightbulb, Pause, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  finishTreadmill,
  logTreadmill,
  startTreadmill,
} from "@/lib/actions";
import { playChime, primeAudio, vibrate } from "@/lib/audio";

type Plan = { incline: number; speed: number; minutes: number };
type Recent = Plan & {
  dateISO: string;
  distanceKm: number | null;
  finished: boolean;
};

const num = (v: string, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function TreadmillTimer({
  suggestion,
  recent,
}: {
  suggestion: Plan & { note: string };
  recent: Recent[];
}) {
  const todayISO = isoOf(new Date());
  const [dateISO, setDateISO] = useState(todayISO);
  const isToday = dateISO === todayISO;

  const entry = useMemo(
    () => recent.find((r) => r.dateISO === dateISO),
    [recent, dateISO],
  );

  const [incline, setIncline] = useState(String(suggestion.incline));
  const [speed, setSpeed] = useState(String(suggestion.speed));
  const [minutes, setMinutes] = useState(String(suggestion.minutes));
  const [distance, setDistance] = useState("");
  const [pending, startT] = useTransition();

  // isi ulang kolom saat ganti tanggal
  useEffect(() => {
    const base = entry ?? suggestion;
    setIncline(String(base.incline));
    setSpeed(String(base.speed));
    setMinutes(String(base.minutes));
    setDistance(entry?.distanceKm != null ? String(entry.distanceKm) : "");
  }, [dateISO, entry, suggestion]);

  const targetMin = num(minutes, suggestion.minutes);
  const total = Math.round(targetMin * 60);
  const [remaining, setRemaining] = useState(total);
  const [running, setRunning] = useState(false);
  const idRef = useRef<string | null>(null);

  useEffect(() => {
    if (!running) setRemaining(total);
  }, [total, running]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const elapsedSec = total - remaining;
  const autoKm = (num(speed, suggestion.speed) * elapsedSec) / 3600;
  const plannedKm =
    (num(speed, suggestion.speed) * num(minutes, suggestion.minutes)) / 60;

  function resolvedKm(min: number) {
    if (distance.trim() !== "") {
      const n = Number(distance);
      return Number.isFinite(n) ? n : null;
    }
    return Math.round(((num(speed, suggestion.speed) * min) / 60) * 100) / 100;
  }

  function saveManual() {
    primeAudio();
    startT(async () => {
      const min = num(minutes, suggestion.minutes);
      const km = resolvedKm(min);
      await logTreadmill({
        dateISO,
        incline: num(incline, suggestion.incline),
        speed: num(speed, suggestion.speed),
        minutes: min,
        distanceKm: km,
      });
      toast.success(
        `Treadmill ${isToday ? "hari ini" : dateISO} — ${min} mnt${
          km ? ` · ${km} km` : ""
        } tersimpan.`,
      );
    });
  }

  // ---- timer (hari ini saja) ----
  useEffect(() => {
    if (remaining === 0 && running) {
      setRunning(false);
      playChime(3);
      vibrate([300, 120, 300, 120, 300]);
      finishTimer(targetMin);
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
    } else setRunning((r) => !r);
  }

  function finishTimer(min: number) {
    startT(async () => {
      const id = await ensureId();
      const km = resolvedKm(min);
      await finishTreadmill(id, { minutes: min, distanceKm: km });
      toast.success(`Treadmill ${min} menit${km ? ` · ${km} km` : ""} tersimpan.`);
    });
  }

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const pct = total > 0 ? (elapsedSec / total) * 100 : 0;
  const elapsedMin = Math.max(1, Math.round(elapsedSec / 60));
  const R = 45;
  const C = 2 * Math.PI * R;
  const locked = running;

  const strip = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const iso = isoOf(d);
    return { iso, d, done: recent.some((r) => r.dateISO === iso && r.finished) };
  });

  const fields: [string, string, string, (v: string) => void, string][] = [
    ["Incline", incline, "level", setIncline, "0.5"],
    ["Speed", speed, "km/j", setSpeed, "0.1"],
    ["Menit", minutes, "menit", setMinutes, "1"],
  ];

  return (
    <div className="card-shadow mx-auto max-w-md space-y-6 rounded-3xl border bg-card p-6 sm:p-8">
      {/* Tanggal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium">Tanggal</label>
          <input
            type="date"
            value={dateISO}
            max={todayISO}
            onChange={(e) => setDateISO(e.target.value || todayISO)}
            className="rounded-lg border bg-background px-3 py-1.5 text-sm tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
          />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {strip.map(({ iso, d, done }) => {
            const sel = iso === dateISO;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setDateISO(iso)}
                className={`flex flex-col items-center rounded-lg py-1.5 text-xs transition-colors ${
                  sel
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/60 hover:bg-muted"
                }`}
              >
                <span>{DOW[d.getDay()]}</span>
                <span className="font-semibold tabular-nums">{d.getDate()}</span>
                <span
                  className={`mt-0.5 size-1.5 rounded-full ${
                    done
                      ? sel
                        ? "bg-primary-foreground"
                        : "bg-success"
                      : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
        {entry?.finished && (
          <p className="text-xs text-success">
            Sudah tercatat: {entry.incline} · {entry.speed} km/j · {entry.minutes}{" "}
            mnt{entry.distanceKm ? ` · ${entry.distanceKm} km` : ""}. Simpan lagi
            untuk menimpa.
          </p>
        )}
      </div>

      {/* Saran */}
      <div className="rounded-2xl bg-accent/60 p-4">
        <p className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
          <Lightbulb className="size-4" /> Saran
        </p>
        <p className="mt-1 text-sm text-accent-foreground/90">{suggestion.note}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="font-mono text-sm tabular-nums text-accent-foreground">
            {suggestion.incline} · {suggestion.speed} km/j · {suggestion.minutes}′
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={locked}
            onClick={() => {
              setIncline(String(suggestion.incline));
              setSpeed(String(suggestion.speed));
              setMinutes(String(suggestion.minutes));
            }}
          >
            Pakai saran
          </Button>
        </div>
      </div>

      {/* Setelan */}
      <div className="grid grid-cols-3 gap-3">
        {fields.map(([label, val, unit, set, step]) => (
          <label
            key={label}
            className="block rounded-2xl bg-muted/60 p-3 text-center"
          >
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

      {/* Jarak */}
      <label className="flex items-center justify-between gap-3 rounded-2xl bg-muted/60 p-3">
        <span className="text-sm text-muted-foreground">Jarak (km)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min={0}
          placeholder={plannedKm > 0 ? plannedKm.toFixed(2) : "otomatis"}
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="w-28 rounded-lg border bg-background px-3 py-2 text-center text-base font-medium tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
        />
      </label>

      <Button
        size="lg"
        onClick={saveManual}
        disabled={pending || running}
        className="h-12 w-full text-base"
      >
        {isToday ? "Simpan (input manual)" : `Simpan untuk ${dateISO}`}
      </Button>

      {/* Timer — hanya hari ini */}
      {isToday && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            atau pakai timer
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-[13rem] place-items-center">
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
              <p className="text-4xl font-semibold tabular-nums">
                {mm}:{ss.toString().padStart(2, "0")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                {running
                  ? `≈ ${autoKm.toFixed(2)} km`
                  : remaining === 0
                    ? "selesai"
                    : "siap mulai"}
              </p>
            </div>
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
                onClick={() => {
                  setRunning(false);
                  setRemaining(total);
                }}
                disabled={pending}
                className="h-11"
              >
                <RotateCcw className="size-4" /> Reset
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => finishTimer(elapsedMin)}
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
