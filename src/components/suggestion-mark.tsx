import type { Suggestion } from "@/lib/progression";

const ARROW: Record<Suggestion["kind"], string> = {
  start: "",
  increase: "↑",
  hold: "",
  reduce: "↓",
  capped: "=",
};

/** Target beban × reps ringkas, dengan panah untuk naik/turun. */
export function SuggestionMark({ s, timed = false }: { s: Suggestion; timed?: boolean }) {
  const text =
    s.weight != null ? `${s.weight} kg×${s.reps ?? "–"}` : s.reps != null ? `${s.reps} ${timed ? "dtk" : "rep"}` : "–";
  return (
    <span title={s.note} className={s.kind === "increase" ? "text-signal" : undefined}>
      {ARROW[s.kind] && <span className="mr-1">{ARROW[s.kind]}</span>}
      {text}
    </span>
  );
}
