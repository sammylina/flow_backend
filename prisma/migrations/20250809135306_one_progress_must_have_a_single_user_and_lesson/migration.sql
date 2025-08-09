/*
  Warnings:

  - Changed the type of `lessonId` on the `lesson_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."lesson_progress" ADD COLUMN     "flowCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "studyCompleted" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "lessonId",
ADD COLUMN     "lessonId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "lesson_progress_userId_lessonId_key" ON "public"."lesson_progress"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "public"."lesson_progress" ADD CONSTRAINT "lesson_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "public"."lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
