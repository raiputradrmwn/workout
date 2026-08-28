-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "muscles" TEXT NOT NULL,
    "cues" TEXT NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutDay" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DayExercise" (
    "id" TEXT NOT NULL,
    "dayId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "targetSets" INTEGER NOT NULL,
    "targetReps" TEXT NOT NULL,
    "restSeconds" INTEGER NOT NULL,
    "suggestWeight" DOUBLE PRECISION,
    "suggestReps" INTEGER,

    CONSTRAINT "DayExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkoutSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dayId" TEXT NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SetLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "reps" INTEGER,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SetLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TreadmillSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "incline" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "speed" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
    "minutes" INTEGER NOT NULL DEFAULT 30,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "TreadmillSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "public"."Exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDay_key_key" ON "public"."WorkoutDay"("key");

-- CreateIndex
CREATE UNIQUE INDEX "DayExercise_dayId_order_key" ON "public"."DayExercise"("dayId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "SetLog_sessionId_exerciseId_setNumber_key" ON "public"."SetLog"("sessionId", "exerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "public"."DayExercise" ADD CONSTRAINT "DayExercise_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DayExercise" ADD CONSTRAINT "DayExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkoutSession" ADD CONSTRAINT "WorkoutSession_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."WorkoutDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetLog" ADD CONSTRAINT "SetLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SetLog" ADD CONSTRAINT "SetLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "public"."Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

