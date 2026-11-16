import Link from "next/link";
import { ChevronRight, Footprints, History, Palette, Salad, Scale } from "lucide-react";

const LINKS = [
  { href: "/tampilan", label: "Tampilan", desc: "Gaya, warna aksen, mode gelap, font, ukuran teks", icon: Palette },
  { href: "/history", label: "Riwayat", desc: "Semua sesi, edit atau hapus set", icon: History },
  { href: "/treadmill", label: "Treadmill", desc: "Timer incline walk harian", icon: Footprints },
  { href: "/nutrisi", label: "Nutrisi", desc: "Rencana makan & pengganti protein", icon: Salad },
  { href: "/kredit", label: "Kredit & lisensi", desc: "Sumber foto dan video", icon: Scale },
];

export default function MorePage() {
  return (
    <div className="space-y-8">
      <h1 className="display text-5xl">Lainnya</h1>

      <ul className="card divide-y overflow-hidden">
        {LINKS.map(({ href, label, desc, icon: Icon }) => (
          <li key={href}>
            <Link href={href} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted active:bg-muted">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{label}</span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>

    </div>
  );
}
