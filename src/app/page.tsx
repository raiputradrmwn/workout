import Link from "next/link";
import { ArrowRight, Flame, Footprints, Timer, Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { lastPerformanceMany, toggleSkipDay, treadmillSuggestion } from "@/lib/actions";
import {
  CATEGORY_LABEL,
  DAY_NAMES_ID,
  effectiveDayKey,
  isoLocal,
  mondayIndex,
  mondayOf,
  startOfToday,
  weekPlan,
} from "@/lib/schedule";
import { getActiveProgram } from "@/lib/program-state";
import { libraryEntry } from "@/lib/library";
import { daysPerWeek, supersetOf } from "@/lib/programs";
import { isTimed, suggestNext } from "@/lib/progression";
import { motivation } from "@/lib/motivation";
import { SuggestionMark } from "@/components/suggestion-mark";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long" });

function pepTalk(m: { streak: number; weekDone: number; prs30: number }, target: number, done: boolean) {
  if (done) return "Sesi hari ini sudah beres. Makan protein, tidur cukup, besok lebih kuat.";
  if (m.weekDone >= target) return `Target minggu ini sudah tercapai (${m.weekDone}/${target}). Sesi tambahan = bonus.`;
  if (m.streak >= 3) return `${m.streak} hari berturut-turut aktif. Jangan putus di hari ini.`;
  if (m.prs30 > 0) return `${m.prs30} rekor baru dalam 30 hari. Sesi ini bisa menambah satu lagi.`;
  return "Satu sesi hari ini sudah cukup untuk memulai lagi. Datang, kerjakan set pertama.";
}

export default async function TodayPage() {
  const now = new Date();
  const todayISO = isoLocal(now);
  const todayIdx = mondayIndex(now);
  const start = startOfToday(now);
  const end = new Date(start.getTime() + 86400000);
  const program = await getActiveProgram();

  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const skippedRows = await db.skippedDay.findMany({
    where: { date: { gte: weekStart, lt: weekEnd } },
  });
  const skippedSet = new Set(skippedRows.map((r) => isoLocal(r.date)));
  const isSkippedToday = skippedSet.has(todayISO);
  const dayKey = effectiveDayKey(now, skippedSet, program);
  const week = weekPlan(now, skippedSet, program);

  const day = dayKey
    ? await db.workoutDay.findUnique({
        where: { key: dayKey },
        include: {
          exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
          sessions: { where: { date: { gte: start, lt: end } } },
        },
      })
    : null;

  // hari istirahat: tampilkan pratinjau sesi berikutnya
  const nextIdx = week.findIndex((w, i) => i > todayIdx && w.key);
  const nextKey = day ? null : nextIdx >= 0 ? week[nextIdx].key : program.queue[0];
  const nextDay = nextKey
    ? await db.workoutDay.findUnique({
        where: { key: nextKey },
        include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } },
      })
    : null;
  const nextWhen = nextIdx >= 0 ? DAY_NAMES_ID[nextIdx] : "Senin depan";

  const [treadmill, tmSuggest, last, mot] = await Promise.all([
    db.treadmillSession.findFirst({ where: { date: { gte: start, lt: end } } }),
    treadmillSuggestion(),
    lastPerformanceMany(day?.exercises.map((e) => e.exerciseId) ?? []),
    motivation(),
  ]);
  const tmPlan = treadmill
    ? { incline: treadmill.incline, speed: treadmill.speed, minutes: treadmill.minutes }
    : tmSuggest;

  const target = daysPerWeek(program);
  const labelOf = new Map(program.days.map((d) => [d.key, d.label]));
  const session = day?.sessions[0];
  const workoutDone = !!session?.finishedAt;
  const treadmillDone = !!treadmill?.finishedAt;
  const totalSets = day?.exercises.reduce((a, e) => a + e.targetSets, 0) ?? 0;
  const estMin = day
    ? Math.round(day.exercises.reduce((a, e) => a + e.targetSets * (e.restSeconds + 40), 0) / 60)
    : 0;
  const [title, focus] = day ? day.label.split(" - ") : [isSkippedToday ? "Dilewati" : "Istirahat", ""];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-6">
      {/* ---------- hero ---------- */}
      <section className="rise relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold text-white/60">
            {DAY_NAMES_ID[todayIdx]}, {dateFmt.format(now)}
          </p>
          <Link
            href="/plan"
            className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80 hover:bg-white/20"
          >
            {program.name}
          </Link>
        </div>
        <h1 className="display mt-4 text-6xl sm:text-8xl">{title}</h1>
        {focus && <p className="mt-2 text-lg font-medium text-white/80">{focus}</p>}

        {day ? (
          <>
            <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{day.exercises.length} gerakan</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{totalSets} set</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5">
                <Timer className="size-4" /> ±{estMin} menit
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{CATEGORY_LABEL[day.category]}</span>
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={`/workout/${day.key}`}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-volt px-8 text-lg font-bold text-ink transition-transform active:scale-[0.98]"
              >
                {workoutDone ? "Lihat sesi" : session ? "Lanjutkan sesi" : "Mulai latihan"}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
              {!workoutDone && (
                <form action={toggleSkipDay.bind(null, todayISO)}>
                  <button
                    type="submit"
                    className="h-11 px-2 text-sm font-medium text-white/60 underline-offset-4 hover:text-white hover:underline"
                  >
                    Lewati hari ini, geser ke besok
                  </button>
                </form>
              )}
            </div>
          </>
        ) : (
          <div className="mt-4 max-w-lg space-y-4">
            <p className="text-white/80">
              {isSkippedToday
                ? "Latihan hari ini digeser ke besok. Senin jadwal kembali normal."
                : "Hari pemulihan. Otot tumbuh saat istirahat: tidur cukup, protein cukup, jalan santai boleh."}
            </p>
            {isSkippedToday && (
              <form action={toggleSkipDay.bind(null, todayISO)}>
                <button type="submit" className="h-12 rounded-2xl bg-volt px-6 font-bold text-ink">
                  Batal, latihan hari ini
                </button>
              </form>
            )}
          </div>
        )}
        <p className="mt-6 border-t border-white/15 pt-4 text-sm text-white/70">
          {pepTalk(mot, target, workoutDone)}
        </p>
      </section>

      {/* ---------- statistik ---------- */}
      <section className="rise grid grid-cols-3 gap-3 [animation-delay:40ms] lg:col-span-2 lg:gap-4">
        {(
          [
            [Flame, mot.streak, "hari", "Streak aktif"],
            [Trophy, mot.prs30, "PR", "Rekor 30 hari"],
            [Timer, `${mot.weekDone}/${target}`, "", "Sesi minggu ini"],
          ] as const
        ).map(([Icon, v, unit, label], i) => (
          <div key={label} className={`rounded-2xl p-4 sm:p-5 ${i === 0 && mot.streak > 0 ? "bg-volt" : "card"}`}>
            <Icon className="size-5" />
            <p className="num mt-3 text-4xl leading-none sm:text-5xl">
              {v}
              {unit && <span className="ml-1 text-base text-muted-foreground">{unit}</span>}
            </p>
            <p className="mt-1 text-xs font-semibold sm:text-sm">{label}</p>
          </div>
        ))}
      </section>

      {/* ---------- daftar gerakan ---------- */}
      <section className="rise card self-start overflow-hidden [animation-delay:80ms]">
        <div className="flex items-baseline justify-between px-5 pt-5 pb-3">
          <h2 className="display text-2xl">Menu hari ini</h2>
          <span className="eyebrow">target berikutnya</span>
        </div>
        {day ? (
          <ol className="pb-2">
            {day.exercises.map((de, idx) => {
              const lib = libraryEntry(de.exercise.name);
              const ss = supersetOf(day.key, de.order, de.exercise.name);
              const prevSs =
                idx > 0 ? supersetOf(day.key, day.exercises[idx - 1].order, day.exercises[idx - 1].exercise.name) : null;
              const s = suggestNext({
                equipment: de.exercise.equipment,
                category: de.exercise.category,
                compound: lib?.compound ?? false,
                targetReps: de.targetReps,
                scheme: program.scheme,
                last: last[de.exerciseId] ?? null,
                fallbackWeight: de.suggestWeight,
                fallbackReps: de.suggestReps,
              });
              const target = `${de.targetSets}×${de.targetReps.replace(" / kaki", "").replace("maks (AMRAP)", "maks")}`;
              return (
                <li key={de.id}>
                  {ss && ss !== prevSs && (
                    <p className="mx-5 mt-3 mb-1 inline-flex rounded-full bg-volt px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-ink uppercase">
                      Superset {ss} · tanpa istirahat di antara
                    </p>
                  )}
                  <div className={`flex items-center gap-3 px-5 py-3 ${ss ? "border-l-4 border-volt" : ""}`}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-sm font-bold">
                      {de.order}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{de.exercise.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {target} · {de.exercise.muscles}
                      </p>
                    </div>
                    <span className="num shrink-0 text-right text-lg">
                      <SuggestionMark s={s} timed={isTimed(de.targetReps)} />
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : nextDay ? (
          <div className="px-5 pb-5">
            <p className="text-muted-foreground">
              Tidak ada sesi beban hari ini. Berikutnya{" "}
              <span className="font-semibold text-foreground">{nextWhen}</span>:
            </p>
            <div className="mt-3 rounded-2xl bg-muted p-4">
              <p className="display text-2xl">{nextDay.label}</p>
              <ul className="mt-2 space-y-1 text-sm">
                {nextDay.exercises.map((de) => (
                  <li key={de.id} className="flex justify-between gap-3">
                    <span className="truncate">{de.exercise.name}</span>
                    <span className="num shrink-0 text-muted-foreground">
                      {de.targetSets}×{de.targetReps.replace(" / kaki", "").replace("maks (AMRAP)", "maks")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Ide hari istirahat: jalan santai 20–30 menit, stretching ringan, tidur 7–9 jam, protein
              tetap cukup.
            </p>
          </div>
        ) : (
          <p className="px-5 pb-6 text-muted-foreground">Tidak ada sesi beban hari ini.</p>
        )}
      </section>

      <div className="space-y-4 lg:space-y-6">
        {/* ---------- minggu ini ---------- */}
        <section className="rise card p-5 [animation-delay:120ms]">
          <h2 className="display text-2xl">Minggu ini</h2>
          <ol className="mt-3 space-y-1">
            {week.map((w, i) => {
              const isToday = i === todayIdx;
              return (
                <li
                  key={w.iso}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                    isToday ? "bg-ink font-semibold text-white" : i < todayIdx ? "text-muted-foreground" : ""
                  }`}
                >
                  <span className="w-9 font-semibold">{DAY_NAMES_ID[i].slice(0, 3)}</span>
                  <span className="flex-1 truncate">
                    {w.skipped ? "Dilewati" : w.key ? labelOf.get(w.key) ?? w.key : "Istirahat"}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4">
            <p className="eyebrow mb-2">28 hari terakhir</p>
            <div className="grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
              {mot.heat.map((h, i) => (
                <span
                  key={i}
                  title={h === 2 ? "Latihan beban" : h === 1 ? "Treadmill" : "Kosong"}
                  className={`aspect-square rounded-[4px] ${h === 2 ? "bg-ink" : h === 1 ? "bg-volt" : "bg-muted"}`}
                />
              ))}
            </div>
            <p className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px] bg-ink" /> beban
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px] bg-volt" /> treadmill
              </span>
            </p>
          </div>
        </section>

        {/* ---------- treadmill ---------- */}
        <section className="rise card p-5 [animation-delay:160ms]">
          <div className="flex items-center justify-between">
            <h2 className="display inline-flex items-center gap-2 text-2xl">
              <Footprints className="size-5" /> Treadmill
            </h2>
            {treadmillDone && (
              <span className="rounded-full bg-volt px-2.5 py-0.5 text-xs font-bold">Selesai</span>
            )}
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2">
            {(
              [
                ["Incline", tmPlan.incline, "%"],
                ["Speed", tmPlan.speed, "km/j"],
                ["Durasi", tmPlan.minutes, "mnt"],
              ] as const
            ).map(([k, v, u]) => (
              <div key={k} className="rounded-xl bg-muted p-3">
                <dt className="eyebrow">{k}</dt>
                <dd className="num mt-1 text-2xl">
                  {v}
                  <span className="ml-0.5 text-xs text-muted-foreground">{u}</span>
                </dd>
              </div>
            ))}
          </dl>
          {!treadmillDone && <p className="mt-3 text-sm text-muted-foreground">{tmSuggest.note}</p>}
          <Link
            href="/treadmill"
            className="mt-4 flex h-12 items-center justify-center gap-2 rounded-xl bg-ink font-semibold text-white active:scale-[0.98]"
          >
            {treadmillDone ? "Lihat sesi" : "Buka timer"} <ArrowRight className="size-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
