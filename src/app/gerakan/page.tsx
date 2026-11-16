import { db } from "@/lib/db";
import { ExerciseLibrary } from "@/components/exercise-library";
import { LIBRARY } from "@/lib/library";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const logged = await db.exercise.findMany({
    where: { setLogs: { some: { done: true } } },
    select: { name: true },
  });

  return (
    <div className="space-y-10">
      <header className="rise rounded-3xl bg-ink p-6 text-white sm:p-8">
        <p className="text-sm font-semibold text-volt">Pustaka</p>
        <h1 className="display mt-2 text-5xl sm:text-7xl">Gerakan</h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-white/75">
          {LIBRARY.length} gerakan yang bisa dikerjakan dengan alat di rumah. Ketuk sebuah gerakan
          untuk langkah-langkahnya. Saat latihan, gerakan di grup yang sama bisa saling ditukar.
        </p>
      </header>
      <div className="rise [animation-delay:60ms]">
        <ExerciseLibrary usedNames={logged.map((l) => l.name)} />
      </div>
    </div>
  );
}
