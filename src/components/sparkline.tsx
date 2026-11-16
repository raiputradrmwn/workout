/** Garis tren kecil. Titik terakhir ditandai; satu titik = garis datar. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const w = 112;
  const h = 32;
  const pad = 3;
  if (values.length === 0) return <svg className={className} viewBox={`0 0 ${w} ${h}`} aria-hidden />;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = values.length === 1 ? w / 2 : pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = max === min ? h / 2 : h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = pts.at(-1)!;
  return (
    <svg className={className} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={`Tren: ${values.join(", ")}`}>
      <line x1={pad} x2={w - pad} y1={h - 1} y2={h - 1} stroke="currentColor" strokeOpacity={0.15} />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.5} fill="currentColor" />
    </svg>
  );
}
