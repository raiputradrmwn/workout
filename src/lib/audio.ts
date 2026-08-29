// Satu AudioContext dipakai bersama seumur sesi — bikin baru tiap bunyi
// kena batas ~6 context per tab (bunyi ke-7 dst. gagal diam-diam).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const C =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** Panggil dari handler interaksi (klik) supaya audio "terbuka" di browser. */
export function primeAudio() {
  getCtx();
}

if (typeof window !== "undefined") {
  const unlock = () => primeAudio();
  window.addEventListener("pointerdown", unlock, { passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
}

/** Nada naik 3 not, diulang `times` kali. */
export function playChime(times = 2) {
  const c = getCtx();
  if (!c) return;
  const notes = [880, 1175, 1568];
  let t = c.currentTime;
  for (let rep = 0; rep < times; rep++) {
    for (const f of notes) {
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g);
      g.connect(c.destination);
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
      o.start(t);
      o.stop(t + 0.3);
      t += 0.16;
    }
    t += 0.24;
  }
}

export function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(pattern);
  } catch {
    /* diabaikan */
  }
}
