

import { Request, Response } from 'express';
import { createLesson, getLessonById, getLessonsByPlaylistId, updateLesson, deleteLesson } from './lesson.service';

export const create = async (req: Request, res: Response) => {
  try {
    const { title, audioUrl, duration, playlistId, order } = req.body;
    const lesson = await createLesson(title, audioUrl, duration, playlistId, order);
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Error creating lesson', error });
  }
};

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await getLessonById(Number(id));
    if (lesson) {
      res.status(200).json(lesson);
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching lesson', error });
  }
};

export const getByPlaylistId = async (req: Request, res: Response) => {
    try {
      const { playlistId } = req.params;
      const lessons = await getLessonsByPlaylistId(Number(playlistId));
      res.status(200).json(lessons);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching lessons for playlist', error });
    }
  };

export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const lesson = await updateLesson(Number(id), data);
    if (lesson) {
      res.status(200).json(lesson);
    } else {
      res.status(404).json({ message: 'Lesson not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating lesson', error });
  }
};

export const remove = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deleteLesson(Number(id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting lesson', error });
  }
};

