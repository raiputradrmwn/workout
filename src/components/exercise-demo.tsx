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
import { mediaFor, MUSCLE_LABEL } from "@/lib/exercise-media";

export function ExerciseDemo({
  name,
  cues,
  className,
}: {
  name: string;
  cues: string;
  className?: string;
}) {
  const { youtubeEmbed, wger, muscle } = mediaFor(name);

  if (!youtubeEmbed && wger.length === 0) {
    return (
      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(name + " form")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 shrink-0 items-center rounded-full bg-muted px-3 text-xs font-bold hover:bg-ink hover:text-white"
      >
        Video ↗
      </a>
    );
  }

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Lihat demo gerakan ${name}`}
        className={`group relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border bg-white transition-colors hover:border-ink ${className ?? ""}`}
      >
        {wger[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wger[0]}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover bg-white grayscale"
          />
        ) : (
          <Play className="size-5 fill-foreground" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-foreground/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-6 fill-white text-white" />
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{name}</DialogTitle>

        {youtubeEmbed ? (
          <div className="aspect-video w-full overflow-hidden border bg-black">
            <iframe
              src={youtubeEmbed}
              title={`Demo ${name}`}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        ) : null}

        {wger.length > 0 && (
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
                  className="aspect-square w-full border bg-white object-contain"
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
        )}

        <p className="text-sm">
          <span className="font-medium">Otot utama:</span> {MUSCLE_LABEL[muscle]}
        </p>
        <DialogDescription className="leading-relaxed text-foreground/80">
          {cues}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
