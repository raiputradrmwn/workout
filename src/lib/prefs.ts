// Preferensi tampilan. Disimpan per perangkat di cookie supaya server bisa
// langsung merender dengan gaya yang benar (tanpa kedip).

export const PREF_OPTIONS = {
  style: [
    { id: "classic", label: "Klasik", desc: "Bulat dan bersih" },
    { id: "arena", label: "Arena", desc: "Tajam, garis tebal, bayangan offset" },
    { id: "soft", label: "Soft", desc: "Sangat bulat, tanpa garis, rona aksen" },
    { id: "compact", label: "Kompak", desc: "Padat, muat lebih banyak" },
  ],
  accent: [
    { id: "volt", label: "Volt", color: "#d4f53c" },
    { id: "yellow", label: "Kuning", color: "#ffd84a" },
    { id: "orange", label: "Oranye", color: "#ff8a3d" },
    { id: "red", label: "Merah", color: "#ff6b5e" },
    { id: "pink", label: "Pink", color: "#ff8fcf" },
    { id: "purple", label: "Ungu", color: "#c4a8ff" },
    { id: "blue", label: "Biru", color: "#7cb8ff" },
    { id: "cyan", label: "Cyan", color: "#5ae6e6" },
    { id: "mint", label: "Mint", color: "#5ee8a8" },
    { id: "silver", label: "Perak", color: "#d6d6cf" },
  ],
  mode: [
    { id: "light", label: "Terang" },
    { id: "dark", label: "Gelap" },
    { id: "system", label: "Ikut sistem" },
  ],
  font: [
    { id: "barlow", label: "Barlow", sample: "var(--font-barlow-condensed)" },
    { id: "anton", label: "Anton", sample: "var(--font-anton)" },
    { id: "oswald", label: "Oswald", sample: "var(--font-oswald)" },
    { id: "grotesk", label: "Grotesk", sample: "var(--font-grotesk)" },
  ],
  size: [
    { id: "small", label: "Kecil" },
    { id: "normal", label: "Normal" },
    { id: "large", label: "Besar" },
    { id: "xl", label: "Ekstra besar" },
  ],
  motion: [
    { id: "on", label: "Nyala" },
    { id: "off", label: "Mati" },
  ],
} as const;

export type PrefKey = keyof typeof PREF_OPTIONS;
export type Prefs = Record<PrefKey, string>;

export const DEFAULT_PREFS: Prefs = {
  style: "classic",
  accent: "volt",
  mode: "light",
  font: "barlow",
  size: "normal",
  motion: "on",
};

export const PREF_KEYS = Object.keys(DEFAULT_PREFS) as PrefKey[];

/** Nama cookie per preferensi; "style" dipertahankan agar pilihan lama tetap terbaca. */
export const cookieName = (k: PrefKey) => (k === "style" ? "style" : `pref-${k}`);

function valid(k: PrefKey, v: string | undefined) {
  return !!v && (PREF_OPTIONS[k] as readonly { id: string }[]).some((o) => o.id === v);
}

export function readPrefs(jar: { get(name: string): { value: string } | undefined }): Prefs {
  const out = { ...DEFAULT_PREFS };
  for (const k of PREF_KEYS) {
    const v = jar.get(cookieName(k))?.value;
    if (valid(k, v)) out[k] = v!;
  }
  return out;
}
