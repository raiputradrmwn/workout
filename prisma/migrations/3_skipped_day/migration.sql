-- CreateTable
CREATE TABLE "public"."SkippedDay" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkippedDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SkippedDay_date_key" ON "public"."SkippedDay"("date");

