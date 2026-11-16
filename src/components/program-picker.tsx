"use client";

import { useRef, useState, useTransition } from "react";
import { Check, Eye, Repeat2, Timer } from "lucide-react";
import { toast } from "sonner";
import { setProgram } from "@/lib/actions";
import { CATEGORY_LABEL, daysPerWeek, PROGRAMS, SCHEME_INFO, type ProgramDay } from "@/lib/programs";
import { DAY_NAMES_ID } from "@/lib/schedule";

const fmtRest = (s: number) => (s === 0 ? "langsung" : s >= 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}` : `${s} dtk`);
const reps = (r: string) => r.replace("maks (AMRAP)", "maks").replace(" / kaki", "/kaki").replace(" / sisi", "/sisi");

function DayPreview({ day, n }: { day: ProgramDay; n: number }) {
  const sets = day.items.reduce((a, i) => a + i[1], 0);
  const minutes = Math.round(day.items.reduce((a, i) => a + i[1] * (i[3] + 40), 0) / 60);
  return (
    <article className="rounded-2xl bg-muted p-4">
      <p className="text-xs font-bold text-muted-foreground">
        Hari {n} · {CATEGORY_LABEL[day.category] ?? day.category}
      </p>
      <h4 className="display mt-1 text-2xl">{day.label}</h4>
      <p className="mt-1 flex gap-3 text-xs font-semibold text-muted-foreground">
        <span>{day.items.length} gerakan</span>
        <span>{sets} set</span>
        <span className="inline-flex items-center gap-1">
          <Timer className="size-3" />±{minutes} mnt
        </span>
      </p>
      <ol className="mt-3 space-y-1.5 text-sm">
        {day.items.map(([name, s, r, rest, , , ss], i) => {
          const prevSs = i > 0 ? day.items[i - 1][6] : undefined;
          return (
            <li key={name + i}>
              {ss && ss !== prevSs && (
                <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-volt px-2 py-0.5 text-[10px] font-bold uppercase">
                  <Repeat2 className="size-3" />
                  {day.items.filter((x) => x[6] === ss).length > 2 ? "Circuit" : "Superset"} {ss}
                </span>
              )}
              <div className={`flex items-baseline justify-between gap-3 ${ss ? "border-l-4 border-volt pl-2" : ""}`}>
                <span className="min-w-0 truncate">{name}</span>
                <span className="num shrink-0 text-muted-foreground">
                  {s}×{reps(r)} <span className="text-xs">· {fmtRest(rest)}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </article>
  );
}

export function ProgramPicker({ activeId, locked }: { activeId: string; locked: boolean }) {
  const [previewId, setPreviewId] = useState(activeId);
  const [pending, start] = useTransition();
  const panel = useRef<HTMLDivElement>(null);
  const p = PROGRAMS.find((x) => x.id === previewId) ?? PROGRAMS[0];
  const active = p.id === activeId;

  function show(id: string) {
    setPreviewId(id);
    requestAnimationFrame(() => panel.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function use(id: string) {
    start(async () => {
      await setProgram(id);
      toast.success(`Program diganti ke ${PROGRAMS.find((x) => x.id === id)?.name}`);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {PROGRAMS.map((x) => {
          const isActive = x.id === activeId;
          const isPreview = x.id === previewId;
          const hasSuperset = x.days.some((d) => d.items.some((i) => i[6]));
          return (
            <article
              key={x.id}
              className={`flex flex-col gap-2 rounded-2xl p-5 ${isActive ? "bg-volt" : "card"} ${
                isPreview && !isActive ? "ring-2 ring-ink" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="display text-4xl">{x.short}</span>
                {isActive ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-ink px-2.5 py-1 text-xs font-bold text-volt">
                    <Check className="size-3.5" strokeWidth={3} /> Dipakai
                  </span>
                ) : (
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold">{daysPerWeek(x)}×/minggu</span>
                )}
              </div>
              <h3 className="text-lg font-bold">{x.name}</h3>
              <p className={`text-sm ${isActive ? "" : "text-muted-foreground"}`}>{x.summary}</p>
              <div className="flex flex-wrap gap-1.5 pt-1 text-xs font-semibold">
                <span className="rounded-full bg-black/5 px-2 py-0.5">{x.goal}</span>
                {hasSuperset && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2 py-0.5">
                    <Repeat2 className="size-3" /> superset
                  </span>
                )}
              </div>
              <div className="mt-auto flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => show(x.id)}
                  aria-pressed={isPreview}
                  className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${
                    isPreview ? "bg-ink text-white" : "bg-black/5 hover:bg-black/10"
                  }`}
                >
                  <Eye className="size-4" /> {isPreview ? "Sedang dilihat" : "Lihat isi"}
                </button>
                {!isActive && !locked && (
                  <button
                    type="button"
                    onClick={() => use(x.id)}
                    disabled={pending}
                    className="h-11 flex-1 rounded-xl bg-ink text-sm font-bold text-white disabled:opacity-50"
                  >
                    Pakai
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* ---- pratinjau isi program ---- */}
      <div ref={panel} className="card scroll-mt-20 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-muted-foreground">
              Pratinjau{active ? " · program yang dipakai" : ""}
            </p>
            <h3 className="display mt-1 text-4xl">{p.name}</h3>
          </div>
          {!active && !locked && (
            <button
              type="button"
              onClick={() => use(p.id)}
              disabled={pending}
              className="h-12 rounded-2xl bg-volt px-5 font-bold disabled:opacity-50"
            >
              Pakai {p.short}
            </button>
          )}
        </div>

        {/* pola mingguan */}
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {DAY_NAMES_ID.map((d, i) => {
            const on = p.pattern[i];
            const nth = p.pattern.slice(0, i + 1).filter(Boolean).length;
            const key = on ? p.queue[nth - 1] : null;
            const parts = key ? (p.days.find((x) => x.key === key)?.label ?? "").split(" - ") : [];
            const sameHead = p.days.every((x) => x.label.split(" - ")[0] === parts[0]);
            const label = key ? (sameHead ? parts[1] : parts[0]) : null;
            return (
              <div key={d} className={`rounded-xl p-2 text-center ${on ? "bg-ink text-white" : "bg-muted"}`}>
                <p className="text-[11px] font-bold">{d.slice(0, 3)}</p>
                <p className={`mt-0.5 truncate text-[11px] ${on ? "text-volt" : "text-muted-foreground"}`}>
                  {label ?? "rest"}
                </p>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{SCHEME_INFO[p.scheme].name}.</span> {SCHEME_INFO[p.scheme].rule}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {p.days.map((d, i) => (
            <DayPreview key={d.key} day={d} n={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
