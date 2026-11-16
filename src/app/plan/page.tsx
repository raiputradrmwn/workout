import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { toggleSkipDay } from "@/lib/actions";
import { DAY_NAMES_ID, isoLocal, mondayIndex, mondayOf, weekPlan } from "@/lib/schedule";
import { getActiveContext } from "@/lib/program-state";
import { BlockPlanner } from "@/components/block-planner";
import { ProgramPicker } from "@/components/program-picker";
import { daysPerWeek, SCHEME_INFO, supersetOf } from "@/lib/programs";

export const dynamic = "force-dynamic";

export default async function PlanPage() {
  const now = new Date();
  const todayISO = isoLocal(now);
  const todayIdx = mondayIndex(now);
  const ctx = await getActiveContext(now);
  const program = ctx.program;
  const thisMonday = isoLocal(mondayOf(now));
  const nextMonday = isoLocal(new Date(mondayOf(now).getTime() + 7 * 86400000 + 3600000));

  const weekStart = mondayOf(now);
  const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
  const [days, skippedRows] = await Promise.all([
    db.workoutDay.findMany({
      where: { key: { in: program.days.map((d) => d.key) } },
      include: { exercises: { orderBy: { order: "asc" }, include: { exercise: true } } },
    }),
    db.skippedDay.findMany({ where: { date: { gte: weekStart, lt: weekEnd } } }),
  ]);
  const byKey = new Map(days.map((d) => [d.key, d]));
  const skippedSet = new Set(skippedRows.map((r) => isoLocal(r.date)));
  const plan = weekPlan(now, skippedSet, program);
  const scheme = SCHEME_INFO[program.scheme];

  return (
    <div className="space-y-8">
      <header className="rise rounded-3xl bg-ink p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-white/60">
          Program aktif · {daysPerWeek(program)}× seminggu
          {ctx.slot && !ctx.finished && ` · blok ${ctx.slot.blockIndex + 1}, minggu ${ctx.slot.weekInBlock}/${ctx.slot.blockWeeks}`}
          {ctx.slot?.deload && " · deload"}
        </p>
        <h1 className="display mt-3 text-5xl sm:text-7xl">{program.name}</h1>
        <p className="mt-3 max-w-2xl text-white/80">{program.summary}</p>
        <p className="mt-5 max-w-2xl rounded-2xl bg-white/10 p-4 text-sm text-white/85">
          <span className="font-bold text-volt">{scheme.name}.</span> {scheme.rule}
        </p>
      </header>

      {/* ---- pilih program ---- */}
      <section className="rise [animation-delay:40ms]">
        <h2 className="display mb-1 text-3xl">Pilih program</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          {ctx.plan
            ? "Rencana blok sedang aktif, jadi program mengikuti blok. Hapus rencana di bawah untuk memilih satu program saja."
            : "Satu program terus-menerus. Mau ganti-ganti per beberapa minggu? Pakai Rencana blok di bawah."}
        </p>
        <ProgramPicker activeId={program.id} locked={!!ctx.plan} />
      </section>

      {/* ---- rencana blok ---- */}
      <section className="rise [animation-delay:60ms]">
        <h2 className="display mb-1 text-3xl">Rencana blok</h2>
        <p className="mb-3 max-w-2xl text-sm text-muted-foreground">
          Susun beberapa program berurutan, misalnya PPL 4 minggu, lalu Upper/Lower, lalu 5×5. Tiap
          blok bisa ditutup satu minggu deload (beban ±60%) supaya badan pulih sebelum blok
          berikutnya.
        </p>
        <BlockPlanner
          initial={ctx.plan}
          thisMonday={thisMonday}
          nextMonday={nextMonday}
          todayMonday={thisMonday}
        />
      </section>

      {/* ---- minggu ini ---- */}
      <section className="rise [animation-delay:80ms]">
        <h2 className="display mb-1 text-3xl">Minggu ini</h2>
        <p className="mb-3 text-sm text-muted-foreground">Lewati hari kalau sakit: latihan otomatis geser ke hari berikutnya.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {plan.map(({ iso, key, skipped }, i) => {
            const day = key ? byKey.get(key) : null;
            const isToday = i === todayIdx;
            const canToggle = iso >= todayISO;
            return (
              <article
                key={iso}
                className={`rounded-2xl p-5 ${isToday ? "bg-ink text-white" : "card"} ${skipped ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`text-sm font-bold ${isToday ? "text-volt" : "text-muted-foreground"}`}>
                      {DAY_NAMES_ID[i]}
                      {isToday ? " · hari ini" : ""}
                    </p>
                    <h3 className="display mt-1 text-2xl">
                      {skipped ? "Dilewati" : day ? day.label : "Istirahat"}
                    </h3>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {canToggle && (key || skipped) && (
                      <form action={toggleSkipDay.bind(null, iso)}>
                        <button
                          type="submit"
                          className={`h-10 rounded-full px-3.5 text-sm font-semibold ${isToday ? "bg-white/10" : "bg-muted"}`}
                        >
                          {skipped ? "Batal" : "Lewati"}
                        </button>
                      </form>
                    )}
                    {day && !skipped && (
                      <Link
                        href={`/workout/${day.key}`}
                        aria-label={`Buka ${day.label}`}
                        className={`grid size-10 place-items-center rounded-full ${isToday ? "bg-volt text-ink" : "bg-ink text-white"}`}
                      >
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </div>
                </div>
                {day && !skipped ? (
                  <ul className={`mt-3 space-y-1 text-sm ${isToday ? "text-white/80" : "text-muted-foreground"}`}>
                    {day.exercises.map((de) => {
                      const ss = supersetOf(day.key, de.order, de.exercise.name);
                      return (
                        <li key={de.id} className="flex items-center justify-between gap-3">
                          <span className="flex min-w-0 items-center gap-2">
                            {ss && (
                              <span className="shrink-0 rounded bg-volt px-1.5 text-[10px] font-bold text-ink">{ss}</span>
                            )}
                            <span className="truncate">{de.exercise.name}</span>
                          </span>
                          <span className="num shrink-0">
                            {de.targetSets}×{de.targetReps.replace(" / kaki", "").replace("maks (AMRAP)", "maks")}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  !skipped && <p className="mt-2 text-sm text-muted-foreground">Pemulihan. Treadmill ringan opsional.</p>
                )}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
