import { db } from "@/lib/db";
import { Footprints, Dumbbell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export default async function HistoryPage() {
  const [sessions, treadmills] = await Promise.all([
    db.workoutSession.findMany({
      orderBy: { date: "desc" },
      take: 40,
      include: { day: true, setLogs: true },
    }),
    db.treadmillSession.findMany({ orderBy: { date: "desc" }, take: 40 }),
  ]);

  type Item =
    | { kind: "workout"; date: Date; s: (typeof sessions)[number] }
    | { kind: "treadmill"; date: Date; t: (typeof treadmills)[number] };

  const items: Item[] = [
    ...sessions.map((s) => ({ kind: "workout" as const, date: s.date, s })),
    ...treadmills.map((t) => ({ kind: "treadmill" as const, date: t.date, t })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Riwayat</h1>
      {items.length === 0 && (
        <p className="text-sm text-muted-foreground">Belum ada catatan.</p>
      )}
      {items.map((it) => {
        if (it.kind === "treadmill") {
          const t = it.t;
          return (
            <Card key={`t-${t.id}`}>
              <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Footprints className="size-4" /> Treadmill
                  <span className="font-normal text-muted-foreground">
                    {fmt.format(t.date)}
                  </span>
                </CardTitle>
                <Badge variant={t.finishedAt ? "default" : "secondary"}>
                  {t.finishedAt ? `${t.minutes} mnt` : "belum selesai"}
                </Badge>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                Incline {t.incline} - speed {t.speed}
              </CardContent>
            </Card>
          );
        }
        const s = it.s;
        const done = s.setLogs.filter((l) => l.done);
        const volume = done.reduce(
          (a, l) => a + (l.weightKg ?? 0) * (l.reps ?? 0),
          0,
        );
        return (
          <Card key={`s-${s.id}`}>
            <CardHeader className="flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Dumbbell className="size-4" /> {s.day.label}
                <span className="font-normal text-muted-foreground">
                  {fmt.format(s.date)}
                </span>
              </CardTitle>
              <Badge variant={s.finishedAt ? "default" : "secondary"}>
                {s.finishedAt ? "selesai" : "berjalan"}
              </Badge>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground tabular-nums">
              {done.length} set selesai - total volume{" "}
              {Math.round(volume).toLocaleString("id-ID")} kg
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
