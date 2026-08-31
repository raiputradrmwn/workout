import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { buildSessionView } from "@/lib/session-view";
import { SessionRunner } from "@/components/session-runner";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export default async function SessionEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await buildSessionView(id);
  if (!view) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/history"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Riwayat
      </Link>
      <p className="text-sm text-muted-foreground">
        Edit sesi &middot; {fmt.format(view.session.date)}
      </p>
      <SessionRunner
        sessionId={id}
        dayLabel={view.day.label}
        dayCategory={view.day.category}
        exercises={view.exercises}
        alreadyFinished={!!view.session.finishedAt}
      />
    </div>
  );
}
