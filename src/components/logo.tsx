/**
 * Logo Logbook: barbell yang menanjak — beban naik, grafik naik.
 * Kotak tinta + barbell volt. Versi `mark` saja atau dengan wordmark.
 */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="15" fill="var(--ink)" />
      <g transform="rotate(-32 32 32)" fill="var(--volt)">
        <rect x="8" y="30" width="48" height="4" rx="2" />
        <rect x="14" y="20" width="6" height="24" rx="2" />
        <rect x="21" y="24" width="4" height="16" rx="1.5" />
        <rect x="44" y="20" width="6" height="24" rx="2" />
        <rect x="39" y="24" width="4" height="16" rx="1.5" />
      </g>
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      <span className="display text-2xl leading-none">
        Log<span className="logo-accent">book</span>
      </span>
    </span>
  );
}
