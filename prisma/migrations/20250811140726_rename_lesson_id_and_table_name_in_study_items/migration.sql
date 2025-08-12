/*
  Warnings:

  - You are about to drop the `StudyItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."StudyItem" DROP CONSTRAINT "StudyItem_lesson_id_fkey";

-- DropTable
DROP TABLE "public"."StudyItem";

-- CreateTable
CREATE TABLE "public"."study_items" (
    "id" SERIAL NOT NULL,
    "lesson_id" INTEGER NOT NULL,
    "type" "public"."StudyItemType" NOT NULL,
    "prompt" TEXT NOT NULL,
    "targetText" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,

    CONSTRAINT "study_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "study_items_lesson_id_idx" ON "public"."study_items"("lesson_id");

-- AddForeignKey
ALTER TABLE "public"."study_items" ADD CONSTRAINT "study_items_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
