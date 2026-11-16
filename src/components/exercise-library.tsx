"use client";

import { useMemo, useState } from "react";
import {
  EQUIPMENT_LABEL,
  GROUP_LABEL,
  LIBRARY,
  type Equipment,
  type Group,
} from "@/lib/library";

const groups = Object.keys(GROUP_LABEL) as Group[];
const equipments = Object.keys(EQUIPMENT_LABEL) as Equipment[];

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors ${
        active ? "bg-ink text-white" : "bg-card text-foreground ring-1 ring-border hover:ring-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ExerciseLibrary({ usedNames }: { usedNames: string[] }) {
  const [group, setGroup] = useState<Group | null>(null);
  const [equip, setEquip] = useState<Equipment | null>(null);
  const [q, setQ] = useState("");
  const used = useMemo(() => new Set(usedNames), [usedNames]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return LIBRARY.filter(
      (e) =>
        (!group || e.group === group) &&
        (!equip || e.equipment === equip) &&
        (!needle ||
          e.name.toLowerCase().includes(needle) ||
          e.muscles.toLowerCase().includes(needle)),
    );
  }, [group, equip, q]);

  const byGroup = groups
    .map((g) => [g, list.filter((e) => e.group === g)] as const)
    .filter(([, l]) => l.length > 0);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari gerakan atau otot…"
          className="h-14 w-full rounded-2xl border-2 border-input bg-card px-5 text-lg outline-none placeholder:text-muted-foreground focus:border-ink"
        />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={!group} onClick={() => setGroup(null)}>
            Semua otot
          </Chip>
          {groups.map((g) => (
            <Chip key={g} active={group === g} onClick={() => setGroup(group === g ? null : g)}>
              {GROUP_LABEL[g]}
            </Chip>
          ))}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
          <Chip active={!equip} onClick={() => setEquip(null)}>
            Semua alat
          </Chip>
          {equipments.map((k) => (
            <Chip key={k} active={equip === k} onClick={() => setEquip(equip === k ? null : k)}>
              {EQUIPMENT_LABEL[k]}
            </Chip>
          ))}
        </div>
        <p className="num text-xs text-muted-foreground">
          {list.length} dari {LIBRARY.length} gerakan
        </p>
      </div>

      {byGroup.length === 0 && (
        <p className="text-muted-foreground">Tidak ada gerakan yang cocok dengan filter ini.</p>
      )}

      {byGroup.map(([g, items]) => (
        <section key={g}>
          <h2 className="display mb-3 text-3xl">
            {GROUP_LABEL[g]}
            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 align-middle font-sans text-xs font-bold text-white">
              {items.length}
            </span>
          </h2>
          <ul className="card divide-y overflow-hidden">
            {items.map((e) => (
              <li key={e.name}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 hover:bg-muted/60">
                    <span className="min-w-0 flex-1">
                      <span className="font-semibold">{e.name}</span>
                      {used.has(e.name) && (
                        <span className="ml-2 rounded-full bg-volt px-2 py-0.5 align-middle text-[10px] font-bold uppercase text-ink">pernah</span>
                      )}
                      <span className="block text-sm text-muted-foreground">{e.muscles}</span>
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold sm:inline">
                      {EQUIPMENT_LABEL[e.equipment]}
                      {e.compound ? " · compound" : ""}
                    </span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-lg font-bold transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="grid gap-4 px-5 pb-5 text-sm leading-relaxed sm:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] sm:gap-10">
                    <ol className="list-decimal space-y-1.5 pl-5 marker:font-mono marker:text-xs marker:text-muted-foreground">
                      {e.cues.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ol>
                    <div className="space-y-3">
                      <p className="eyebrow sm:hidden">{EQUIPMENT_LABEL[e.equipment]}</p>
                      {e.avoid && (
                        <p className="rounded-xl bg-muted p-3">
                          <span className="eyebrow block">Hindari</span>
                          {e.avoid}
                        </p>
                      )}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
