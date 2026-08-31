"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Dumbbell, Footprints, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteTreadmill,
  deleteWorkoutSession,
  updateTreadmill,
} from "@/lib/actions";

const fmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export type WorkoutItem = {
  kind: "workout";
  id: string;
  date: string;
  label: string;
  sets: number;
  volume: number;
  finished: boolean;
};
export type TreadmillItem = {
  kind: "treadmill";
  id: string;
  date: string;
  incline: number;
  speed: number;
  minutes: number;
  distanceKm: number | null;
  finished: boolean;
};
export type HistoryItem = WorkoutItem | TreadmillItem;

const nfmt = (n: number) => Math.round(n).toLocaleString("id-ID");

export function HistoryList({ items }: { items: HistoryItem[] }) {
  const router = useRouter();
  const [pending, startT] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);

  function removeWorkout(id: string) {
    if (!confirm("Hapus sesi latihan ini beserta semua set-nya?")) return;
    startT(async () => {
      await deleteWorkoutSession(id);
      toast.success("Sesi latihan dihapus.");
      router.refresh();
    });
  }
  function removeTreadmill(id: string) {
    if (!confirm("Hapus catatan treadmill ini?")) return;
    startT(async () => {
      await deleteTreadmill(id);
      toast.success("Catatan treadmill dihapus.");
      router.refresh();
    });
  }

  if (items.length === 0)
    return <p className="text-muted-foreground">Belum ada catatan.</p>;

  return (
    <ul className="space-y-3">
      {items.map((it) => {
        if (it.kind === "treadmill") {
          return (
            <li
              key={it.id}
              className="card-shadow rounded-2xl border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-chart-2/10 text-chart-2">
                  <Footprints className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">Treadmill</p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {fmt.format(new Date(it.date))} &middot; incline {it.incline}{" "}
                    &middot; {it.speed} km/j
                    {it.distanceKm ? ` · ${it.distanceKm} km` : ""} &middot;{" "}
                    {it.minutes} mnt
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() =>
                      setEditing((e) => (e === it.id ? null : it.id))
                    }
                    className="grid size-9 place-items-center rounded-lg border hover:bg-muted"
                    title="Ubah"
                  >
                    {editing === it.id ? (
                      <X className="size-4" />
                    ) : (
                      <Pencil className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => removeTreadmill(it.id)}
                    disabled={pending}
                    className="grid size-9 place-items-center rounded-lg border text-destructive hover:bg-destructive/10"
                    title="Hapus"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              {editing === it.id && (
                <TreadmillEdit
                  item={it}
                  pending={pending}
                  onDone={() => {
                    setEditing(null);
                    router.refresh();
                  }}
                  startT={startT}
                />
              )}
            </li>
          );
        }
        return (
          <li
            key={it.id}
            className="card-shadow flex items-center gap-4 rounded-2xl border bg-card p-4"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Dumbbell className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{it.label}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                {fmt.format(new Date(it.date))} &middot; {it.sets} set &middot;{" "}
                {nfmt(it.volume)} kg
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/session/${it.id}`}
                className="grid size-9 place-items-center rounded-lg border hover:bg-muted"
                title="Edit set"
              >
                <Pencil className="size-4" />
              </Link>
              <button
                onClick={() => removeWorkout(it.id)}
                disabled={pending}
                className="grid size-9 place-items-center rounded-lg border text-destructive hover:bg-destructive/10"
                title="Hapus"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function TreadmillEdit({
  item,
  pending,
  onDone,
  startT,
}: {
  item: TreadmillItem;
  pending: boolean;
  onDone: () => void;
  startT: (cb: () => void) => void;
}) {
  const [incline, setIncline] = useState(String(item.incline));
  const [speed, setSpeed] = useState(String(item.speed));
  const [minutes, setMinutes] = useState(String(item.minutes));
  const [distance, setDistance] = useState(
    item.distanceKm != null ? String(item.distanceKm) : "",
  );

  const fields: [string, string, (v: string) => void, string][] = [
    ["Incline", incline, setIncline, "0.5"],
    ["Speed", speed, setSpeed, "0.1"],
    ["Menit", minutes, setMinutes, "1"],
    ["Km", distance, setDistance, "0.01"],
  ];

  function save() {
    startT(async () => {
      await updateTreadmill(item.id, {
        incline: Number(incline) || item.incline,
        speed: Number(speed) || item.speed,
        minutes: Math.round(Number(minutes)) || item.minutes,
        distanceKm: distance.trim() === "" ? null : Number(distance),
      });
      toast.success("Catatan treadmill diperbarui.");
      onDone();
    });
  }

  return (
    <div className="mt-3 space-y-3 border-t pt-3">
      <div className="grid grid-cols-4 gap-2">
        {fields.map(([label, val, set, step]) => (
          <label key={label} className="block text-center">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </span>
            <input
              type="number"
              inputMode="decimal"
              step={step}
              min={0}
              value={val}
              onChange={(e) => set(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-2 py-1.5 text-center text-base font-medium tabular-nums outline-none focus:border-ring focus:ring-2 focus:ring-ring/40"
            />
          </label>
        ))}
      </div>
      <button
        onClick={save}
        disabled={pending}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
      >
        <Check className="size-4" /> Simpan perubahan
      </button>
    </div>
  );
}
