"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import {
  CARB_FOODS,
  DAILY_TARGET,
  MEALS,
  OPTIONAL_ADDONS,
  PROTEIN_FOODS,
  resolveSlot,
  sumMacro,
  type Macro,
} from "@/lib/nutrition";

const KEY = "nutrisi-swaps-v1";
const r = (n: number) => Math.round(n);

export function NutritionPlanner() {
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChoice(JSON.parse(raw));
    } catch {
      /* abaikan */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(choice));
    } catch {
      /* abaikan */
    }
  }, [choice, loaded]);

  const perMeal = useMemo(
    () =>
      MEALS.map((meal) => {
        // protein dari slot yang di-skip dibagi rata (proporsional) ke slot protein lain
        const pSlots = meal.slots.filter((s) => s.kind === "protein") as Extract<
          (typeof meal.slots)[number],
          { kind: "protein" }
        >[];
        const isSkip = (id: string) => choice[id] === "skip";
        const spare = pSlots
          .filter((s) => isSkip(s.id))
          .reduce((a, s) => a + s.targetP, 0);
        const baseSum = pSlots
          .filter((s) => !isSkip(s.id))
          .reduce((a, s) => a + s.targetP, 0);

        const rows = meal.slots.map((slot) => {
          let eff: number | undefined;
          if (slot.kind === "protein" && !isSkip(slot.id) && baseSum > 0) {
            eff = slot.targetP + spare * (slot.targetP / baseSum);
          }
          return resolveSlot(slot, choice[slot.id], eff);
        });
        return { meal, rows, total: sumMacro(rows.map((x) => x.macro)) };
      }),
    [choice],
  );

  const dayTotal: Macro = sumMacro(perMeal.map((m) => m.total));

  return (
    <div className="space-y-6">
      {/* target vs total */}
      <div className="card-shadow rounded-2xl border bg-card p-5">
        <div className="grid grid-cols-3 gap-3 text-center">
          {(
            [
              ["Kalori", dayTotal.kcal, DAILY_TARGET.kcal, "kkal"],
              ["Protein", dayTotal.p, DAILY_TARGET.p, "g"],
              ["Karbo", dayTotal.c, DAILY_TARGET.c, "g"],
            ] as const
          ).map(([label, val, target, unit]) => (
            <div key={label} className="rounded-xl bg-muted/60 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-xl font-semibold tabular-nums">
                {r(val)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  {unit}
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                target ~{target}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Ganti bahan di dropdown — porsi & kalori dihitung ulang otomatis, dan{" "}
          <b>total protein per makan tetap</b>. Pilih{" "}
          <b>&ldquo;— tidak dipakai&rdquo;</b> untuk melewati satu bahan;
          proteinnya otomatis pindah ke bahan lain di makan itu (mis. skip tahu →
          gram ayam &amp; telur naik). Pilihanmu tersimpan di HP ini.
        </p>
      </div>

      {perMeal.map(({ meal, rows, total }) => (
        <section
          key={meal.id}
          className="card-shadow overflow-hidden rounded-2xl border bg-card"
        >
          <div className="flex items-baseline justify-between border-b p-4">
            <h2 className="text-lg font-semibold">
              {meal.name}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                {meal.time}
              </span>
            </h2>
            <span className="font-mono text-sm tabular-nums text-muted-foreground">
              {r(total.kcal)} kkal · P {r(total.p)} g
            </span>
          </div>
          <ul className="divide-y">
            {rows.map((row, i) => {
              const slot = meal.slots[i];
              const opts =
                slot.kind === "protein"
                  ? PROTEIN_FOODS
                  : slot.kind === "carb"
                    ? CARB_FOODS
                    : null;
              return (
                <li
                  key={row.slotId}
                  className={`flex items-center gap-3 p-4 ${
                    row.foodId === "skip" ? "opacity-50" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    {opts ? (
                      <select
                        value={row.foodId}
                        onChange={(e) =>
                          setChoice((c) => ({
                            ...c,
                            [row.slotId]: e.target.value,
                          }))
                        }
                        className="w-full rounded-md border bg-background px-2 py-1.5 text-sm font-medium outline-none focus:border-ring"
                      >
                        {opts.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                        <option value="skip">— tidak dipakai</option>
                      </select>
                    ) : (
                      <p className="text-sm font-medium">{row.foodName}</p>
                    )}
                    <p className="mt-1 text-sm text-muted-foreground">
                      {row.amount}
                      {row.note ? ` — ${row.note}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
                    {r(row.macro.kcal)} kkal
                    <br />P {r(row.macro.p)} · K {r(row.macro.c)}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <section className="card-shadow rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold">Opsional (kalau lapar)</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {OPTIONAL_ADDONS.map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <button
        onClick={() => setChoice({})}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <RotateCcw className="size-4" /> Kembalikan ke template awal
      </button>
    </div>
  );
}
