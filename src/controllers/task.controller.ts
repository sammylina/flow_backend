import { NextFunction, Request, Response } from 'express';
import prisma from '../utils/db';
import logger from '../utils/logger';
import { ApiError } from '../middlewares/error.middleware';

/**
 * Get all tasks
 */
export const getAllTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await prisma.task.findMany();
    logger.info(`Retrieved ${tasks.length} tasks`);

    return res.status(200).json({
      status: 'success',
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a task by ID
 */
export const getTaskById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw new ApiError(404, `Task with ID ${id} not found`);
    }

    logger.info(`Retrieved task with ID: ${id}`);

    return res.status(200).json({
      status: 'success',
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task
 */
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      throw new ApiError(400, 'Title is required');
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
      },
    });

    logger.info(`Created new task with ID: ${newTask.id}`);

    return res.status(201).json({
      status: 'success',
      data: {
        task: newTask,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a task
 */
export const updateTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new ApiError(404, `Task with ID ${id} not found`);
    }

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        completed: completed !== undefined ? completed : existingTask.completed,
      },
    });

    logger.info(`Updated task with ID: ${id}`);

    return res.status(200).json({
      status: 'success',
      data: {
        task: updatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      throw new ApiError(404, `Task with ID ${id} not found`);
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    logger.info(`Deleted task with ID: ${id}`);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
