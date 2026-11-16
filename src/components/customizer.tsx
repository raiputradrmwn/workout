"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import {
  cookieName,
  DEFAULT_PREFS,
  PREF_KEYS,
  PREF_OPTIONS,
  type PrefKey,
  type Prefs,
} from "@/lib/prefs";
import { LogoMark } from "@/components/logo";

function apply(k: PrefKey, v: string) {
  document.documentElement.dataset[k] = v;
  document.cookie = `${cookieName(k)}=${v}; path=/; max-age=63072000; samesite=lax`;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-bold">{title}</h3>
      {children}
    </div>
  );
}

function Seg({
  k,
  value,
  onPick,
}: {
  k: PrefKey;
  value: string;
  onPick: (k: PrefKey, v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PREF_OPTIONS[k].map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onPick(k, o.id)}
            className={`h-11 rounded-full px-4 text-sm font-semibold transition-colors ${
              active ? "bg-volt text-ink" : "bg-muted hover:bg-secondary"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Customizer({ initial }: { initial: Prefs }) {
  const [p, setP] = useState<Prefs>(initial);

  function pick(k: PrefKey, v: string) {
    apply(k, v);
    setP((s) => ({ ...s, [k]: v }));
  }

  function reset() {
    for (const k of PREF_KEYS) apply(k, DEFAULT_PREFS[k]);
    setP(DEFAULT_PREFS);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="card space-y-6 p-5 sm:p-6">
        <Section title="Gaya">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PREF_OPTIONS.style.map((o) => {
              const active = o.id === p.style;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick("style", o.id)}
                  className={`rounded-2xl p-3 text-left transition-colors ${
                    active ? "bg-volt text-ink" : "bg-muted hover:bg-secondary"
                  }`}
                >
                  <span className="flex items-center justify-between font-bold">
                    {o.label}
                    {active && <Check className="size-4" strokeWidth={3} />}
                  </span>
                  <span className={`mt-1 block text-xs ${active ? "text-ink/70" : "text-muted-foreground"}`}>
                    {o.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Warna aksen">
          <div className="flex flex-wrap gap-2.5">
            {PREF_OPTIONS.accent.map((o) => {
              const active = o.id === p.accent;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={active}
                  aria-label={o.label}
                  title={o.label}
                  onClick={() => pick("accent", o.id)}
                  className={`grid size-12 place-items-center rounded-full ring-offset-2 ring-offset-card transition-transform active:scale-90 ${
                    active ? "ring-[3px] ring-ink" : "ring-1 ring-black/10"
                  }`}
                  style={{ background: o.color }}
                >
                  {active && <Check className="size-5 text-[#111]" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Mode">
          <Seg k="mode" value={p.mode} onPick={pick} />
        </Section>

        <Section title="Font judul">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PREF_OPTIONS.font.map((o) => {
              const active = o.id === p.font;
              return (
                <button
                  key={o.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => pick("font", o.id)}
                  className={`rounded-2xl p-3 text-left transition-colors ${
                    active ? "bg-volt text-ink" : "bg-muted hover:bg-secondary"
                  }`}
                >
                  <span
                    className="block text-3xl leading-none uppercase"
                    style={{ fontFamily: o.sample, fontWeight: o.id === "anton" ? 400 : 800 }}
                  >
                    Push A
                  </span>
                  <span className={`mt-1 block text-xs ${active ? "text-ink/70" : "text-muted-foreground"}`}>
                    {o.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <div className="grid gap-6 sm:grid-cols-2">
          <Section title="Ukuran teks">
            <Seg k="size" value={p.size} onPick={pick} />
          </Section>
          <Section title="Animasi">
            <Seg k="motion" value={p.motion} onPick={pick} />
          </Section>
        </div>

        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-muted px-4 text-sm font-semibold hover:bg-secondary"
        >
          <RotateCcw className="size-4" /> Kembalikan ke awal
        </button>
      </div>

      {/* pratinjau langsung — memakai gaya aktif */}
      <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
        <p className="eyebrow">Pratinjau</p>
        <div className="rounded-3xl bg-ink p-5 text-white">
          <p className="text-xs font-semibold text-white/60">Rabu, 18 November</p>
          <p className="display mt-2 text-5xl">Push A</p>
          <p className="mt-1 text-sm text-white/75">Fokus Bench</p>
          <span className="mt-4 inline-flex h-11 items-center rounded-2xl bg-volt px-5 font-bold text-ink">Mulai latihan</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-volt p-4 text-ink">
            <p className="num text-4xl leading-none">6</p>
            <p className="mt-1 text-xs font-semibold">Streak aktif</p>
          </div>
          <div className="card p-4">
            <p className="num text-4xl leading-none">3/6</p>
            <p className="mt-1 text-xs font-semibold">Sesi minggu ini</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <LogoMark className="size-12 shrink-0" />
          <p className="text-sm text-muted-foreground">Logo ikut warna aksen yang kamu pilih.</p>
        </div>
      </aside>
    </div>
  );
}
