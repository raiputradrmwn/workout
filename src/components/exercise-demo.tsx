"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ExerciseFigure } from "@/components/exercise-figure";
import { animFor, MUSCLE_LABEL } from "@/lib/exercise-anim";
import { mediaFor } from "@/lib/exercise-media";

export function ExerciseDemo({
  name,
  cues,
  className,
}: {
  name: string;
  cues: string;
  className?: string;
}) {
  const { pattern, muscle } = animFor(name);
  const { wger, youtube } = mediaFor(name);

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Lihat demo gerakan ${name}`}
        className={`group grid size-16 shrink-0 place-items-center rounded-xl border bg-muted/40 p-1 transition-colors hover:border-primary hover:bg-primary/5 ${className ?? ""}`}
      >
        <ExerciseFigure pattern={pattern} muscle={muscle} />
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogTitle>{name}</DialogTitle>

        {wger.length > 0 ? (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-2">
              {wger.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`${name} — pose`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="aspect-square w-full rounded-xl border bg-muted/30 object-contain"
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Foto:{" "}
              <a
                href="https://wger.de"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                wger.de
              </a>{" "}
              &middot; CC BY-SA 3.0 &middot;{" "}
              <Link href="/kredit" className="underline">
                kredit
              </Link>
            </p>
          </div>
        ) : (
          <div className="mx-auto aspect-square w-full max-w-[15rem] rounded-2xl border bg-muted/30 p-4">
            <ExerciseFigure pattern={pattern} muscle={muscle} />
          </div>
        )}

        <a
          href={youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-base font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Play className="size-4 fill-current" />
          Video demo (YouTube)
        </a>

        <p className="text-sm">
          <span className="font-medium">Otot utama:</span> {MUSCLE_LABEL[muscle]}
        </p>
        <DialogDescription className="leading-relaxed text-foreground/80">
          {cues}
        </DialogDescription>

        {wger.length > 0 && (
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer select-none">
              Lihat animasi figur
            </summary>
            <div className="mx-auto mt-2 aspect-square w-full max-w-[13rem] rounded-2xl border bg-muted/30 p-4">
              <ExerciseFigure pattern={pattern} muscle={muscle} />
            </div>
          </details>
        )}
      </DialogContent>
    </Dialog>
  );
}
