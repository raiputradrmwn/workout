// Pustaka gerakan — sumber kebenaran untuk semua program.
// Hanya alat yang ada di rumah: barbell, dumbbell (sampai 14 kg), bench (bisa incline),
// resistance band dengan pegangan, pull-up stand, treadmill. Tanpa mesin / kabel.
//
import { EXTRA } from "@/lib/library-extra";

// Baris Exercise di database dibuat otomatis (upsert per nama) saat gerakan
// pertama kali dipakai oleh sebuah program atau sebagai pengganti.

export type Category = "PUSH" | "PULL" | "LEGS" | "CORE" | "COND";
export type Equipment = "barbell" | "dumbbell" | "band" | "bodyweight" | "pullup";
export type Group =
  | "dada"
  | "punggung"
  | "bahu"
  | "lengan"
  | "kaki"
  | "posterior"
  | "core"
  | "kondisi";

export type LibraryExercise = {
  name: string;
  category: Category;
  group: Group;
  equipment: Equipment;
  muscles: string;
  /** Langkah eksekusi, urut. */
  cues: string[];
  /** Kesalahan yang paling sering. */
  avoid?: string;
  /** Gerakan compound berat — progresi beban lebih agresif, istirahat lebih lama. */
  compound?: boolean;
};

export const GROUP_LABEL: Record<Group, string> = {
  dada: "Dada",
  punggung: "Punggung",
  bahu: "Bahu",
  lengan: "Lengan",
  kaki: "Paha depan",
  posterior: "Glute & hamstring",
  core: "Core",
  kondisi: "Kondisi & kombinasi",
};

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  barbell: "Barbell",
  dumbbell: "Dumbbell",
  band: "Band",
  bodyweight: "Bodyweight",
  pullup: "Pull-up bar",
};

/** Alat tanpa beban yang bisa dicatat (reps saja). */
export const NO_WEIGHT: ReadonlySet<string> = new Set(["band", "bodyweight", "pullup"]);

const BASE: LibraryExercise[] = [
  // ---------------------------------------------------------------- DADA
  {
    name: "Barbell Bench Press",
    category: "PUSH",
    group: "dada",
    equipment: "barbell",
    compound: true,
    muscles: "Dada, triceps, front delt",
    cues: [
      "Mata tepat di bawah bar, kaki menapak kuat di lantai.",
      "Tarik belikat ke belakang-bawah dan kunci ke bench.",
      "Turunkan bar ke garis puting, siku sekitar 45 derajat dari badan.",
      "Sentuh dada ringan, dorong naik sedikit ke arah wajah sampai lengan lurus.",
    ],
    avoid: "Bar memantul di dada dan pantat terangkat dari bench.",
  },
  {
    name: "Incline Barbell Bench Press",
    category: "PUSH",
    group: "dada",
    equipment: "barbell",
    compound: true,
    muscles: "Dada atas, front delt, triceps",
    cues: [
      "Sandaran bench sekitar 30 derajat, jangan lebih curam.",
      "Belikat dikunci seperti bench press biasa.",
      "Bar turun ke dada atas, tepat di bawah tulang selangka.",
      "Dorong lurus ke atas tanpa melengkungkan pinggang berlebihan.",
    ],
  },
  {
    name: "Close-grip Bench Press",
    category: "PUSH",
    group: "dada",
    equipment: "barbell",
    compound: true,
    muscles: "Triceps, dada, front delt",
    cues: [
      "Genggaman selebar bahu, bukan rapat sekali.",
      "Siku tetap dekat badan saat turun.",
      "Bar turun ke dada bawah, dorong naik dengan triceps.",
    ],
    avoid: "Genggaman terlalu sempit sampai pergelangan tertekuk.",
  },
  {
    name: "Dumbbell Bench Press",
    category: "PUSH",
    group: "dada",
    equipment: "dumbbell",
    muscles: "Dada, triceps, front delt",
    cues: [
      "Berbaring dengan dumbbell di atas dada, telapak menghadap kaki.",
      "Turunkan sampai dumbbell sejajar dada, rasakan regangan.",
      "Dorong naik dan sedikit ke tengah tanpa membenturkan dumbbell.",
    ],
  },
  {
    name: "Incline Dumbbell Press",
    category: "PUSH",
    group: "dada",
    equipment: "dumbbell",
    muscles: "Dada atas, front delt",
    cues: [
      "Sandaran 30 derajat, dumbbell di samping dada atas.",
      "Siku sedikit di bawah garis bahu.",
      "Dorong naik, turun pelan 2-3 detik untuk menambah tension.",
    ],
  },
  {
    name: "Dumbbell Fly",
    category: "PUSH",
    group: "dada",
    equipment: "dumbbell",
    muscles: "Dada",
    cues: [
      "Siku sedikit menekuk dan tetap terkunci di sudut itu.",
      "Buka lengan lebar seperti memeluk pohon besar sampai dada teregang.",
      "Tutup kembali dengan meremas dada, bukan menekuk siku.",
    ],
    avoid: "Turun terlalu dalam sampai bahu depan sakit.",
  },
  {
    name: "Push-up",
    category: "PUSH",
    group: "dada",
    equipment: "bodyweight",
    muscles: "Dada, triceps, core",
    cues: [
      "Tangan sedikit lebih lebar dari bahu, badan lurus dari kepala ke tumit.",
      "Turun sampai dada hampir menyentuh lantai, siku 45 derajat.",
      "Dorong lantai menjauh, kencangkan perut dan glute.",
    ],
  },
  {
    name: "Feet-Elevated Push-up",
    category: "PUSH",
    group: "dada",
    equipment: "bodyweight",
    muscles: "Dada atas, triceps, core",
    cues: [
      "Kaki di atas bench, tangan di lantai.",
      "Badan tetap lurus, jangan biarkan pinggul turun.",
      "Dada turun hampir menyentuh lantai, dorong naik penuh.",
    ],
  },
  {
    name: "Deficit Push-up",
    category: "PUSH",
    group: "dada",
    equipment: "bodyweight",
    muscles: "Dada, triceps",
    cues: [
      "Tangan di atas dua dumbbell atau piring supaya dada bisa turun lebih dalam.",
      "Turun pelan 3 detik sampai dada di bawah garis tangan.",
      "Dorong naik tanpa memantul.",
    ],
  },
  {
    name: "Band Chest Fly",
    category: "PUSH",
    group: "dada",
    equipment: "band",
    muscles: "Dada",
    cues: [
      "Anchor band setinggi dada di belakang badan.",
      "Satu kaki di depan, siku sedikit menekuk.",
      "Bawa kedua tangan bertemu di depan dada, tahan 1 detik, kembali pelan.",
    ],
  },

  // ---------------------------------------------------------------- BAHU
  {
    name: "Barbell Overhead Press",
    category: "PUSH",
    group: "bahu",
    equipment: "barbell",
    compound: true,
    muscles: "Bahu, triceps, upper chest",
    cues: [
      "Berdiri, bar di depan bahu, genggaman sedikit lebih lebar dari bahu.",
      "Kencangkan glute dan perut supaya pinggang tidak melengkung.",
      "Dorong bar lurus ke atas, tarik kepala ke belakang sedikit agar bar lewat.",
      "Di atas, kepala masuk ke depan sehingga bar di atas tengah kaki.",
    ],
    avoid: "Badan condong ke belakang untuk membantu dorongan.",
  },
  {
    name: "Seated Dumbbell Shoulder Press",
    category: "PUSH",
    group: "bahu",
    equipment: "dumbbell",
    muscles: "Bahu, triceps",
    cues: [
      "Duduk tegak di bench dengan sandaran tegak.",
      "Siku sedikit di depan badan, bukan lurus ke samping.",
      "Dorong naik tanpa mengunci keras di atas, jaga tension.",
    ],
  },
  {
    name: "Arnold Press",
    category: "PUSH",
    group: "bahu",
    equipment: "dumbbell",
    muscles: "Front & side delt, triceps",
    cues: [
      "Mulai dengan dumbbell di depan wajah, telapak menghadap badan.",
      "Sambil mendorong, putar telapak keluar.",
      "Turun dengan putaran sebaliknya, pelan dan terkontrol.",
    ],
  },
  {
    name: "Dumbbell Lateral Raise",
    category: "PUSH",
    group: "bahu",
    equipment: "dumbbell",
    muscles: "Side delt",
    cues: [
      "Badan sedikit condong ke depan, siku sedikit menekuk.",
      "Pimpin dengan siku, angkat sampai sejajar bahu.",
      "Turun pelan 2 detik, jangan mengayun badan.",
    ],
    avoid: "Mengangkat bahu ke telinga (trapezius mengambil alih).",
  },
  {
    name: "Band Lateral Raise",
    category: "PUSH",
    group: "bahu",
    equipment: "band",
    muscles: "Side delt",
    cues: [
      "Injak band dengan kaki berlawanan, pegang handle di sisi badan.",
      "Angkat ke samping sampai sejajar bahu.",
      "Tension paling berat di atas, tahan 1 detik.",
    ],
  },
  {
    name: "Pike Push-up",
    category: "PUSH",
    group: "bahu",
    equipment: "bodyweight",
    muscles: "Bahu, triceps",
    cues: [
      "Posisi V terbalik, pinggul tinggi, tangan selebar bahu.",
      "Turunkan kepala ke depan tangan membentuk segitiga.",
      "Dorong naik, kaki di bench untuk versi lebih berat.",
    ],
  },
  {
    name: "Dumbbell Rear Delt Fly",
    category: "PULL",
    group: "bahu",
    equipment: "dumbbell",
    muscles: "Rear delt, upper back",
    cues: [
      "Bungkuk sampai badan hampir sejajar lantai, punggung netral.",
      "Angkat dumbbell ke samping dengan siku sedikit menekuk.",
      "Fokus ke bahu belakang, bukan meremas belikat.",
    ],
  },
  {
    name: "Band Face Pull",
    category: "PULL",
    group: "bahu",
    equipment: "band",
    muscles: "Rear delt, upper back, rotator cuff",
    cues: [
      "Anchor band setinggi wajah.",
      "Tarik ke arah dahi, siku tinggi.",
      "Di akhir gerak putar tangan keluar, tahan 1 detik.",
    ],
  },
  {
    name: "Band Pull-apart",
    category: "PULL",
    group: "bahu",
    equipment: "band",
    muscles: "Rear delt, mid-back",
    cues: [
      "Pegang band di depan dada, lengan lurus.",
      "Tarik band ke samping sampai menyentuh dada.",
      "Kembali pelan, jangan biarkan band menarik balik.",
    ],
  },

  // ---------------------------------------------------------------- PUNGGUNG
  {
    name: "Pull-up",
    category: "PULL",
    group: "punggung",
    equipment: "pullup",
    compound: true,
    muscles: "Lats, upper back, biceps",
    cues: [
      "Genggaman overhand sedikit lebih lebar dari bahu, mulai dari gantung penuh.",
      "Tarik belikat ke bawah dulu sebelum menekuk siku.",
      "Tarik dada ke arah bar sampai dagu melewati bar.",
      "Turun pelan sampai lengan lurus lagi.",
    ],
    avoid: "Mengayun (kipping) dan setengah repetisi.",
  },
  {
    name: "Chin-up",
    category: "PULL",
    group: "punggung",
    equipment: "pullup",
    compound: true,
    muscles: "Lats, biceps",
    cues: [
      "Genggaman underhand selebar bahu.",
      "Tarik siku ke arah pinggul, dada menuju bar.",
      "Turun terkontrol sampai lengan lurus penuh.",
    ],
  },
  {
    name: "Band-Assisted / Negative Pull-up",
    category: "PULL",
    group: "punggung",
    equipment: "pullup",
    muscles: "Lats, biceps",
    cues: [
      "Versi bantu: kaitkan band di bar, injak atau tumpukan lutut di band.",
      "Versi negatif: lompat ke posisi atas, lalu turun pelan 3-5 detik.",
      "Kurangi bantuan setiap kali target reps tercapai.",
    ],
  },
  {
    name: "Band Lat Pulldown",
    category: "PULL",
    group: "punggung",
    equipment: "band",
    muscles: "Lats, upper back, biceps",
    cues: [
      "Anchor band tinggi di pull-up stand, posisi setengah berlutut.",
      "Tarik handle turun ke bahu, siku ke bawah-belakang.",
      "Remas lats di bawah, kembali pelan.",
    ],
  },
  {
    name: "Barbell Bent-over Row",
    category: "PULL",
    group: "punggung",
    equipment: "barbell",
    compound: true,
    muscles: "Mid-back, lats, rear delt",
    cues: [
      "Hinge sampai badan sekitar 45 derajat, punggung netral.",
      "Tarik bar ke perut bawah, siku ke belakang.",
      "Remas belikat di atas, turun terkontrol tanpa menyentak.",
    ],
    avoid: "Badan naik-turun untuk membantu menarik.",
  },
  {
    name: "Pendlay Row",
    category: "PULL",
    group: "punggung",
    equipment: "barbell",
    compound: true,
    muscles: "Upper back, lats",
    cues: [
      "Badan hampir sejajar lantai, bar mulai dari lantai setiap rep.",
      "Tarik eksplosif ke dada bawah.",
      "Kembalikan bar ke lantai, reset napas, ulangi.",
    ],
  },
  {
    name: "One-arm Dumbbell Row",
    category: "PULL",
    group: "punggung",
    equipment: "dumbbell",
    muscles: "Lats, mid-back",
    cues: [
      "Satu tangan dan lutut bertumpu di bench, punggung rata.",
      "Tarik siku ke arah pinggul, bukan ke atas.",
      "Bahu tidak berputar, turun sampai lats teregang.",
    ],
  },
  {
    name: "Chest-supported Dumbbell Row",
    category: "PULL",
    group: "punggung",
    equipment: "dumbbell",
    muscles: "Mid-back, rear delt",
    cues: [
      "Telungkup di bench incline, dada menempel ke sandaran.",
      "Tarik kedua dumbbell ke arah pinggang.",
      "Tahan 1 detik di atas, tidak ada momentum karena dada tertumpu.",
    ],
  },
  {
    name: "Band Row",
    category: "PULL",
    group: "punggung",
    equipment: "band",
    muscles: "Mid-back, rear delt",
    cues: [
      "Anchor band setinggi dada di pull-up stand.",
      "Tarik handle ke perut, siku dekat badan.",
      "Remas belikat, kembali pelan.",
    ],
  },
  {
    name: "Inverted Row",
    category: "PULL",
    group: "punggung",
    equipment: "barbell",
    muscles: "Upper back, lats, biceps",
    cues: [
      "Bar di rak atau pull-up stand rendah, tubuh menggantung di bawahnya.",
      "Badan lurus seperti papan, tumit di lantai.",
      "Tarik dada ke bar, turun sampai lengan lurus.",
    ],
  },
  {
    name: "Dumbbell Pullover",
    category: "PULL",
    group: "punggung",
    equipment: "dumbbell",
    muscles: "Lats, dada",
    cues: [
      "Berbaring melintang di bench, satu dumbbell dipegang dua tangan di atas dada.",
      "Turunkan ke belakang kepala dengan siku sedikit menekuk.",
      "Tarik kembali ke atas dada dengan lats.",
    ],
  },

  // ---------------------------------------------------------------- LENGAN
  {
    name: "Dumbbell Biceps Curl",
    category: "PULL",
    group: "lengan",
    equipment: "dumbbell",
    muscles: "Biceps",
    cues: [
      "Siku diam di samping badan.",
      "Curl sambil memutar telapak menghadap atas.",
      "Turun pelan 2 detik, jangan ayun badan.",
    ],
  },
  {
    name: "Hammer Curl",
    category: "PULL",
    group: "lengan",
    equipment: "dumbbell",
    muscles: "Brachialis, lengan bawah, biceps",
    cues: [
      "Telapak saling berhadapan sepanjang gerak.",
      "Siku diam, curl sampai dumbbell setinggi bahu.",
      "Turun terkontrol.",
    ],
  },
  {
    name: "Incline Dumbbell Curl",
    category: "PULL",
    group: "lengan",
    equipment: "dumbbell",
    muscles: "Biceps (long head)",
    cues: [
      "Duduk bersandar di bench incline 45-60 derajat, lengan menggantung.",
      "Curl tanpa memajukan siku.",
      "Regangan di bawah adalah poinnya, turun penuh.",
    ],
  },
  {
    name: "Barbell Curl",
    category: "PULL",
    group: "lengan",
    equipment: "barbell",
    muscles: "Biceps",
    cues: [
      "Genggaman underhand selebar bahu.",
      "Siku tetap di samping badan, curl ke dada.",
      "Turun penuh tanpa mengayun pinggul.",
    ],
  },
  {
    name: "Band Biceps Curl",
    category: "PULL",
    group: "lengan",
    equipment: "band",
    muscles: "Biceps",
    cues: [
      "Injak band selebar bahu.",
      "Curl handle ke bahu, tahan 1 detik di atas.",
      "Turun pelan 2 detik.",
    ],
  },
  {
    name: "Overhead Dumbbell Triceps Extension",
    category: "PUSH",
    group: "lengan",
    equipment: "dumbbell",
    muscles: "Triceps (long head)",
    cues: [
      "Pegang satu dumbbell dengan dua tangan di atas kepala.",
      "Siku menghadap depan dan tetap sempit.",
      "Turunkan di belakang kepala, luruskan penuh.",
    ],
  },
  {
    name: "Dumbbell Skull Crusher",
    category: "PUSH",
    group: "lengan",
    equipment: "dumbbell",
    muscles: "Triceps",
    cues: [
      "Berbaring di bench, dumbbell lurus di atas bahu.",
      "Tekuk hanya di siku, turunkan dumbbell ke samping kepala.",
      "Luruskan kembali tanpa menggerakkan lengan atas.",
    ],
  },
  {
    name: "Band Triceps Pushdown",
    category: "PUSH",
    group: "lengan",
    equipment: "band",
    muscles: "Triceps",
    cues: [
      "Anchor band tinggi di pull-up stand.",
      "Siku menempel di samping badan.",
      "Dorong ke bawah sampai lurus, tahan, kembali pelan.",
    ],
  },
  {
    name: "Bench Dips",
    category: "PUSH",
    group: "lengan",
    equipment: "bodyweight",
    muscles: "Triceps, dada bawah",
    cues: [
      "Telapak di tepi bench, jari menghadap depan.",
      "Lutut ditekuk lebih ringan, kaki lurus lebih berat.",
      "Turun sampai siku 90 derajat, siku tidak melebar.",
    ],
  },
  {
    name: "Diamond Push-up",
    category: "PUSH",
    group: "lengan",
    equipment: "bodyweight",
    muscles: "Triceps, dada",
    cues: [
      "Ibu jari dan telunjuk membentuk segitiga di bawah dada.",
      "Siku menyusuri badan saat turun.",
      "Dorong naik penuh.",
    ],
  },

  // ---------------------------------------------------------------- KAKI (quad)
  {
    name: "Barbell Back Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "barbell",
    compound: true,
    muscles: "Quad, glute, hamstring",
    cues: [
      "Bar di trapezius atas, genggaman kuat, siku ke bawah.",
      "Tarik napas ke perut dan tahan (bracing).",
      "Duduk ke bawah di antara kaki, lutut searah jari kaki.",
      "Turun minimal sampai paha sejajar, dorong naik dari tengah telapak kaki.",
    ],
    avoid: "Lutut masuk ke dalam dan tumit terangkat.",
  },
  {
    name: "Front Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "barbell",
    compound: true,
    muscles: "Quad, upper back, core",
    cues: [
      "Bar di bahu depan, siku tinggi (genggaman clean atau tangan menyilang).",
      "Badan setegak mungkin sepanjang gerak.",
      "Turun dalam, dorong naik sambil menjaga siku tetap tinggi.",
    ],
  },
  {
    name: "Goblet Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad, glute, core",
    cues: [
      "Pegang satu dumbbell vertikal di depan dada.",
      "Turun sampai siku menyentuh bagian dalam lutut.",
      "Dada tegak, tumit menempel, berdiri penuh.",
    ],
  },
  {
    name: "Bulgarian Split Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: [
      "Punggung kaki belakang di bench, kaki depan cukup jauh.",
      "Turun tegak lurus, berat di kaki depan.",
      "Badan sedikit condong untuk lebih banyak glute, tegak untuk quad.",
    ],
  },
  {
    name: "Dumbbell Reverse Lunge",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: [
      "Langkah mundur, lutut belakang hampir menyentuh lantai.",
      "Badan tegak, berat di kaki depan.",
      "Dorong kembali dari tumit kaki depan.",
    ],
  },
  {
    name: "Dumbbell Walking Lunge",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: [
      "Langkah panjang ke depan, turun sampai lutut belakang hampir menyentuh lantai.",
      "Dorong dari kaki depan langsung ke langkah berikutnya.",
      "Hitung per kaki.",
    ],
  },
  {
    name: "Dumbbell Step-up",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad, glute",
    cues: [
      "Seluruh telapak kaki di atas bench.",
      "Naik dengan kaki di atas, bukan menolak dari kaki bawah.",
      "Turun pelan, ganti kaki setelah satu set.",
    ],
  },
  {
    name: "Heels-elevated Goblet Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Quad",
    cues: [
      "Tumit di atas piring beban atau papan setinggi 2-3 cm.",
      "Turun sedalam mungkin dengan lutut maju melewati jari kaki.",
      "Tempo turun 3 detik untuk menebus beban yang ringan.",
    ],
  },
  {
    name: "Cossack Squat",
    category: "LEGS",
    group: "kaki",
    equipment: "bodyweight",
    muscles: "Adductor, quad, glute",
    cues: [
      "Kaki sangat lebar, jari kaki sedikit keluar.",
      "Duduk ke satu sisi, kaki lain lurus dengan jari menghadap atas.",
      "Pindah ke sisi lain lewat bawah atau berdiri dulu.",
    ],
  },
  {
    name: "Standing Calf Raise",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Betis",
    cues: [
      "Ujung kaki di pijakan, tumit menggantung.",
      "Naik setinggi mungkin, tahan 1 detik.",
      "Turun pelan sampai betis teregang penuh.",
    ],
  },
  {
    name: "Single-leg Calf Raise",
    category: "LEGS",
    group: "kaki",
    equipment: "dumbbell",
    muscles: "Betis",
    cues: [
      "Satu kaki di pijakan, tangan lain berpegangan.",
      "Dumbbell di tangan sisi kaki yang bekerja.",
      "Range penuh, jeda 2 detik di bawah.",
    ],
  },

  // ---------------------------------------------------------------- POSTERIOR
  {
    name: "Conventional Deadlift",
    category: "LEGS",
    group: "posterior",
    equipment: "barbell",
    compound: true,
    muscles: "Hamstring, glute, punggung bawah, upper back",
    cues: [
      "Bar di atas tengah telapak kaki, kaki selebar pinggul.",
      "Pegang bar, tulang kering menyentuh bar, punggung rata.",
      "Tarik 'kelonggaran' dari bar, lalu dorong lantai menjauh.",
      "Bar tetap menempel di kaki, kunci di atas dengan glute.",
    ],
    avoid: "Punggung membulat dan bar menjauh dari badan.",
  },
  {
    name: "Romanian Deadlift",
    category: "LEGS",
    group: "posterior",
    equipment: "barbell",
    compound: true,
    muscles: "Hamstring, glute, punggung bawah",
    cues: [
      "Mulai dari berdiri, lutut sedikit menekuk dan terkunci di sudut itu.",
      "Dorong pinggul ke belakang, bar menyusuri paha.",
      "Turun sampai hamstring teregang, biasanya di bawah lutut.",
      "Kembali dengan mendorong pinggul ke depan.",
    ],
    avoid: "Membungkuk dari punggung, bukan dari pinggul.",
  },
  {
    name: "Dumbbell Romanian Deadlift",
    category: "LEGS",
    group: "posterior",
    equipment: "dumbbell",
    muscles: "Hamstring, glute",
    cues: [
      "Dumbbell di depan paha.",
      "Hinge pinggul ke belakang, dumbbell dekat kaki.",
      "Tempo turun 3 detik supaya beban ringan tetap efektif.",
    ],
  },
  {
    name: "Single-leg Romanian Deadlift",
    category: "LEGS",
    group: "posterior",
    equipment: "dumbbell",
    muscles: "Hamstring, glute, stabilitas pinggul",
    cues: [
      "Berdiri satu kaki, dumbbell di tangan berlawanan.",
      "Badan dan kaki belakang bergerak seperti satu papan.",
      "Pinggul tetap sejajar lantai, tidak membuka ke samping.",
    ],
  },
  {
    name: "Barbell Hip Thrust",
    category: "LEGS",
    group: "posterior",
    equipment: "barbell",
    compound: true,
    muscles: "Glute, hamstring",
    cues: [
      "Punggung atas bersandar di bench, bar di lipat paha dengan bantalan.",
      "Dagu sedikit menunduk, tulang rusuk turun.",
      "Dorong pinggul sampai badan lurus, tahan 1 detik.",
    ],
  },
  {
    name: "Single-leg Hip Thrust",
    category: "LEGS",
    group: "posterior",
    equipment: "bodyweight",
    muscles: "Glute",
    cues: [
      "Punggung atas di bench, satu kaki di lantai, satu terangkat.",
      "Dorong pinggul naik dengan tumit kaki yang bekerja.",
      "Tahan 2 detik di atas.",
    ],
  },
  {
    name: "Glute Bridge",
    category: "LEGS",
    group: "posterior",
    equipment: "bodyweight",
    muscles: "Glute",
    cues: [
      "Berbaring, lutut ditekuk, telapak menapak dekat pantat.",
      "Dorong pinggul ke atas, remas glute.",
      "Turun pelan, jangan sampai pantat beristirahat di lantai.",
    ],
  },
  {
    name: "Good Morning",
    category: "LEGS",
    group: "posterior",
    equipment: "barbell",
    muscles: "Hamstring, punggung bawah, glute",
    cues: [
      "Bar di punggung atas seperti squat, beban ringan.",
      "Hinge ke depan dengan lutut sedikit menekuk.",
      "Berhenti saat hamstring teregang, kembali tegak.",
    ],
  },
  {
    name: "Band Leg Curl",
    category: "LEGS",
    group: "posterior",
    equipment: "band",
    muscles: "Hamstring",
    cues: [
      "Anchor band rendah, telungkup dengan band di pergelangan kaki.",
      "Tekuk lutut, tarik tumit ke arah pantat.",
      "Kembali pelan.",
    ],
  },

  // ---------------------------------------------------------------- CORE
  {
    name: "Plank",
    category: "CORE",
    group: "core",
    equipment: "bodyweight",
    muscles: "Core",
    cues: [
      "Siku di bawah bahu, badan lurus dari kepala ke tumit.",
      "Kencangkan perut dan glute, tulang rusuk turun.",
      "Catat detik sebagai reps.",
    ],
  },
  {
    name: "Side Plank",
    category: "CORE",
    group: "core",
    equipment: "bodyweight",
    muscles: "Obliques, core",
    cues: [
      "Siku di bawah bahu, kaki bertumpuk.",
      "Pinggul tinggi, badan lurus.",
      "Catat detik per sisi sebagai reps.",
    ],
  },
  {
    name: "Hanging Knee Raise",
    category: "CORE",
    group: "core",
    equipment: "pullup",
    muscles: "Core bawah, hip flexor",
    cues: [
      "Gantung di pull-up stand, bahu aktif.",
      "Angkat lutut ke dada sambil menggulung panggul.",
      "Turun terkontrol, minim ayunan.",
    ],
  },
  {
    name: "Hanging Leg Raise",
    category: "CORE",
    group: "core",
    equipment: "pullup",
    muscles: "Core, hip flexor",
    cues: [
      "Gantung, kaki lurus.",
      "Angkat kaki sampai sejajar lantai atau lebih tinggi.",
      "Turun pelan 2-3 detik tanpa mengayun.",
    ],
  },
  {
    name: "Dead Bug",
    category: "CORE",
    group: "core",
    equipment: "bodyweight",
    muscles: "Core dalam",
    cues: [
      "Berbaring, lengan lurus ke atas, lutut 90 derajat.",
      "Punggung bawah menempel lantai sepanjang gerak.",
      "Julurkan tangan dan kaki berlawanan pelan, kembali, ganti sisi.",
    ],
  },
  {
    name: "Ab Wheel / Barbell Rollout",
    category: "CORE",
    group: "core",
    equipment: "barbell",
    muscles: "Core, lats",
    cues: [
      "Berlutut, pegang bar dengan piring kecil sebagai roda.",
      "Gulung ke depan sejauh punggung bawah tetap netral.",
      "Tarik kembali dengan perut, bukan pinggul.",
    ],
  },
  {
    name: "Band Pallof Press",
    category: "CORE",
    group: "core",
    equipment: "band",
    muscles: "Obliques, anti-rotasi",
    cues: [
      "Anchor band setinggi dada di samping badan.",
      "Pegang handle di dada, dorong lurus ke depan.",
      "Tahan 2 detik tanpa badan berputar, kembali.",
    ],
  },
  {
    name: "Dumbbell Farmer Carry",
    category: "CORE",
    group: "core",
    equipment: "dumbbell",
    muscles: "Grip, core, trapezius",
    cues: [
      "Dumbbell terberat di kedua tangan.",
      "Berjalan tegak, bahu turun, langkah pendek.",
      "Catat detik sebagai reps.",
    ],
  },
];

export const LIBRARY: LibraryExercise[] = [...BASE, ...EXTRA];

export const LIBRARY_BY_NAME = new Map(LIBRARY.map((e) => [e.name, e]));

export function libraryEntry(name: string): LibraryExercise | undefined {
  return LIBRARY_BY_NAME.get(name);
}

/** Baris untuk tabel Exercise di database. */
export function toDbRow(e: LibraryExercise) {
  return {
    name: e.name,
    category: e.category,
    equipment: e.equipment,
    muscles: e.muscles,
    cues: e.cues.join(" "),
  };
}

/**
 * Alternatif = gerakan lain di grup otot sama yang polanya mirip.
 * Diambil dari tabel pola manual supaya yang muncul memang setara.
 */
const SWAP_GROUPS: string[][] = [
  [
    "Barbell Bench Press",
    "Dumbbell Bench Press",
    "Incline Barbell Bench Press",
    "Incline Dumbbell Press",
    "Feet-Elevated Push-up",
    "Deficit Push-up",
    "Push-up",
    "Dumbbell Floor Press",
    "Archer Push-up",
  ],
  ["Dumbbell Fly", "Band Chest Fly"],
  ["Barbell Overhead Press", "Push Press", "Seated Dumbbell Shoulder Press", "Arnold Press", "Z Press", "Pike Push-up"],
  ["Dumbbell Lateral Raise", "Band Lateral Raise"],
  ["Dumbbell Rear Delt Fly", "Band Face Pull", "Band Pull-apart"],
  [
    "Overhead Dumbbell Triceps Extension",
    "Dumbbell Skull Crusher",
    "Band Triceps Pushdown",
    "Bench Dips",
    "Diamond Push-up",
    "Close-grip Bench Press",
    "Dumbbell Kickback",
    "Tate Press",
  ],
  ["Pull-up", "Chin-up", "Band-Assisted / Negative Pull-up", "Band Lat Pulldown"],
  [
    "Barbell Bent-over Row",
    "Pendlay Row",
    "One-arm Dumbbell Row",
    "Chest-supported Dumbbell Row",
    "Band Row",
    "Inverted Row",
    "Renegade Row",
    "Seal Row",
  ],
  ["Dumbbell Biceps Curl", "Hammer Curl", "Incline Dumbbell Curl", "Barbell Curl", "Band Biceps Curl", "Zottman Curl", "Concentration Curl", "Reverse Barbell Curl"],
  ["Barbell Back Squat", "Front Squat", "Zercher Squat", "Goblet Squat", "Heels-elevated Goblet Squat", "Wall Sit"],
  [
    "Bulgarian Split Squat",
    "Dumbbell Reverse Lunge",
    "Dumbbell Walking Lunge",
    "Dumbbell Step-up",
    "Cossack Squat",
    "Barbell Reverse Lunge",
    "Lateral Lunge",
  ],
  [
    "Romanian Deadlift",
    "Dumbbell Romanian Deadlift",
    "Single-leg Romanian Deadlift",
    "Good Morning",
    "Conventional Deadlift",
    "Sumo Deadlift",
  ],
  ["Barbell Hip Thrust", "Single-leg Hip Thrust", "Glute Bridge", "Nordic Curl", "Band Leg Curl"],
  ["Standing Calf Raise", "Single-leg Calf Raise"],
  ["Plank", "Side Plank", "Dead Bug", "Band Pallof Press", "Ab Wheel / Barbell Rollout"],
  ["Hanging Knee Raise", "Hanging Leg Raise", "V-up", "Hollow Hold", "Russian Twist"],
  ["Burpee", "Mountain Climber", "Jump Squat", "Skater Jump", "High Knees"],
  ["Dumbbell Thruster", "Dumbbell Clean & Press", "Man Maker", "Barbell Complex"],
  ["Barbell Shrug", "Dumbbell Shrug", "Upright Row"],
  ["Dumbbell Farmer Carry", "Suitcase Carry"],
];

const SWAP_LOOKUP = new Map<string, string[]>();
for (const g of SWAP_GROUPS) for (const n of g) SWAP_LOOKUP.set(n, g);

export function alternativesFor(name: string): string[] {
  return SWAP_LOOKUP.get(name) ?? [];
}
