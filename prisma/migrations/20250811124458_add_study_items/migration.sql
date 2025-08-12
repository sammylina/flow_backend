-- CreateEnum
CREATE TYPE "public"."StudyItemType" AS ENUM ('pronounciation', 'writing');

-- CreateTable
CREATE TABLE "public"."StudyItem" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "type" "public"."StudyItemType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "targetText" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,

    CONSTRAINT "StudyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudyItem_lesson_id_idx" ON "public"."StudyItem"("lesson_id");

-- AddForeignKey
ALTER TABLE "public"."StudyItem" ADD CONSTRAINT "StudyItem_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
