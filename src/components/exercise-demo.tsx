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

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Lihat demo gerakan ${name}`}
        className={`group relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl border bg-muted/40 transition-colors hover:border-primary ${className ?? ""}`}
      >
        {wger[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={wger[0]}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="size-full object-cover"
          />
        ) : (
          <Play className="size-6 fill-primary text-primary" />
        )}
        <span className="absolute inset-0 grid place-items-center bg-foreground/25 opacity-0 transition-opacity group-hover:opacity-100">
          <Play className="size-6 fill-white text-white" />
        </span>
      </DialogTrigger>

      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogTitle>{name}</DialogTitle>

        {youtubeEmbed ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl border bg-black">
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
