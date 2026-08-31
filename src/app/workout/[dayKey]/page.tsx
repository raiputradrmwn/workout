import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getOrCreateSession } from "@/lib/actions";
import { buildSessionView } from "@/lib/session-view";
import { SessionRunner } from "@/components/session-runner";

export const dynamic = "force-dynamic";

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ dayKey: string }>;
}) {
  const { dayKey } = await params;

  const day = await db.workoutDay.findUnique({ where: { key: dayKey } });
  if (!day) notFound();

  const sessionId = await getOrCreateSession(dayKey);
  const view = await buildSessionView(sessionId);
  if (!view) notFound();

  return (
    <SessionRunner
      sessionId={sessionId}
      dayLabel={view.day.label}
      dayCategory={view.day.category}
      exercises={view.exercises}
      alreadyFinished={!!view.session.finishedAt}
    />
  );
}
