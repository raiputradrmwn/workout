// Media acuan per gerakan:
//  - `wger`: URL foto (2 pose) dari wger.de, lisensi CC BY-SA 3.0 (lihat /kredit).
//            17 gerakan punya foto; 7 sisanya pakai animasi figur sebagai gantinya.
//  - `ytQuery`: kata kunci untuk membuka pencarian YouTube (video pendek = demo gerakan).

const WGER: Record<string, string[]> = {
  "Barbell Bench Press": [
    "https://wger.de/media/exercise-images/192/Bench-press-1.png",
    "https://wger.de/media/exercise-images/192/Bench-press-2.png",
  ],
  "Incline Barbell Bench Press": [
    "https://wger.de/media/exercise-images/41/Incline-bench-press-1.png",
    "https://wger.de/media/exercise-images/41/Incline-bench-press-2.png",
  ],
  "Incline Dumbbell Press": [
    "https://wger.de/media/exercise-images/16/Incline-press-1.png",
    "https://wger.de/media/exercise-images/16/Incline-press-2.png",
  ],
  "Seated Dumbbell Shoulder Press": [
    "https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-1.png",
    "https://wger.de/media/exercise-images/123/dumbbell-shoulder-press-large-2.png",
  ],
  "Dumbbell Lateral Raise": [
    "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-1.png",
    "https://wger.de/media/exercise-images/148/lateral-dumbbell-raises-large-2.png",
  ],
  "Band Triceps Pushdown": [
    "https://wger.de/media/exercise-images/805/7a437824-e2cc-46e1-804a-674f0ea31d25.png",
  ],
  "Pull-up": [
    "https://wger.de/media/exercise-images/475/b0554016-16fd-4dbe-be47-a2a17d16ae0e.jpg",
  ],
  "Barbell Bent-over Row": [
    "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-1.png",
    "https://wger.de/media/exercise-images/109/Barbell-rear-delt-row-2.png",
  ],
  "One-arm Dumbbell Row": [
    "https://wger.de/media/exercise-images/81/a751a438-ae2d-4751-8d61-cef0e9292174.png",
  ],
  "Band Row": [
    "https://wger.de/media/exercise-images/1117/2555c4c3-a84d-47db-b83b-cbf721f12e45.png",
    "https://wger.de/media/exercise-images/1117/e74255c0-67a0-4309-b78d-2d79e6ff8c11.png",
  ],
  "Band Face Pull": [
    "https://wger.de/media/exercise-images/1732/d13b9adb-968e-4f73-95e6-b16690bcf616.jpg",
  ],
  "Goblet Squat": [
    "https://wger.de/media/exercise-images/203/1c052351-2af0-4227-aeb0-244008e4b0a8.jpeg",
    "https://wger.de/media/exercise-images/203/2ab30113-4e08-4d39-9d23-d901ce2c0971.jpeg",
  ],
  "Barbell Back Squat": [
    "https://wger.de/media/exercise-images/1801/60043328-1cfb-4289-9865-aaf64d5aaa28.jpg",
    "https://wger.de/media/exercise-images/1801/68720d5e-f422-47ac-81e4-c7b51144d302.jpg",
  ],
  "Romanian Deadlift": [
    "https://wger.de/media/exercise-images/1652/0306c8c0-70cc-45d4-92de-6fa72ceaa834.webp",
  ],
  "Bulgarian Split Squat": [
    "https://wger.de/media/exercise-images/1706/0c5243cc-2539-4005-aee0-d3a8c5d3a32c.jfif",
  ],
  "Standing Calf Raise": [
    "https://wger.de/media/exercise-images/622/9a429bd0-afd3-4ad0-8043-e9beec901c81.jpeg",
    "https://wger.de/media/exercise-images/622/d6d57067-97de-462e-a8bb-15228d730323.jpeg",
  ],
  Plank: [
    "https://wger.de/media/exercise-images/458/b7bd9c28-9f1d-4647-bd17-ab6a3adf5770.png",
    "https://wger.de/media/exercise-images/458/902e6836-394e-458b-b94e-101d714294e2.png",
  ],
};

// kata kunci demo (fokus ke gerakan dasarnya, bukan varian aneh)
const YT: Record<string, string> = {
  "Barbell Bench Press": "barbell bench press form",
  "Incline Barbell Bench Press": "incline barbell bench press form",
  "Incline Dumbbell Press": "incline dumbbell press form",
  "Seated Dumbbell Shoulder Press": "seated dumbbell shoulder press form",
  "Dumbbell Lateral Raise": "dumbbell lateral raise form",
  "Feet-Elevated Push-up": "decline push up feet elevated form",
  "Overhead Dumbbell Triceps Extension":
    "dumbbell overhead triceps extension form",
  "Band Triceps Pushdown": "resistance band triceps pushdown form",
  "Pull-up": "pull up form",
  "Band-Assisted / Negative Pull-up": "band assisted pull up form",
  "Barbell Bent-over Row": "barbell bent over row form",
  "One-arm Dumbbell Row": "one arm dumbbell row form",
  "Band Row": "resistance band row form",
  "Dumbbell Biceps Curl": "dumbbell biceps curl form",
  "Band Face Pull": "band face pull form",
  "Hanging Knee Raise": "hanging knee raise form",
  "Goblet Squat": "goblet squat form",
  "Barbell Back Squat": "barbell back squat form",
  "Romanian Deadlift": "dumbbell romanian deadlift form",
  "Bulgarian Split Squat": "bulgarian split squat form",
  "Dumbbell Reverse Lunge": "dumbbell reverse lunge form",
  "Barbell Hip Thrust": "barbell hip thrust form",
  "Standing Calf Raise": "standing calf raise form",
  Plank: "forearm plank form",
};

export type ExerciseMedia = { wger: string[]; youtube: string };

export function mediaFor(name: string): ExerciseMedia {
  const q = YT[name] ?? `${name} exercise form`;
  return {
    wger: WGER[name] ?? [],
    // sp=EgIYAQ%3D%3D => filter "video pendek" (< 4 menit) = biasanya demo tanpa ceramah
    youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(
      q,
    )}&sp=EgIYAQ%253D%253D`,
  };
}

export const WGER_CREDITED = Object.keys(WGER);
