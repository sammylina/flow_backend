import prisma from '../../../utils/db';
import { StudyItemType } from '@prisma/client';
import { ApiError } from '../../../middlewares/error.middleware';

type Lesson = {
  id: number;
  title: string;
  audioUrl: string;
  playlistId: number;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

type CreateLessonData = {
  title: string;
  audioUrl: string;
  playlistId: number;
};

// enum StudyItemType {
//   pronounciation,
//   writing
// }

export type StudyItem = {
  id: number;
  type: StudyItemType;
  prompt: string;
  targetText: string;
  audioUrl: string;
};

export const createLesson = async (data: CreateLessonData): Promise<Lesson> => {
  // Check if playlist exists
  const playlistCount = await prisma.playlist.count({ where: { id: data.playlistId } });
  if (playlistCount < 1) {
    throw new ApiError(400, `Playlist does not exist with ID: ${data.playlistId}`);
  }

  // Create lesson
  const lesson = await prisma.lesson.create({ data });
  return lesson;
};

export const createStudyItemService = async (
  lessonId: number,
  { ...studyItemData }: Omit<StudyItem, 'id'>
): Promise<StudyItem> => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    throw new ApiError(400, `Can not create StudyItem, lesson dose not exist with ID: ${lessonId}`);
  }

  const studyItem = await prisma.studyItem.create({
    data: {
      ...studyItemData,
      lessonId,
    },
  });
  if (!studyItem) {
    throw new ApiError(500, `Unable to create StudyItem`);
  }
  return studyItem;
};

export const getStudyItems = async (lessonId: number): Promise<StudyItem[]> => {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } });

  if (!lesson) {
    throw new ApiError(400, `Invalid lesson ID ${lessonId}`);
  }

  const studyItems = await prisma.studyItem.findMany({
    where: {
      lessonId: lessonId,
    },
    omit: { lessonId: true },
    // You can add an orderBy clause if the order is important
    orderBy: {
      id: 'asc', // For example, order by creation
    },
  });

  return studyItems;
};
