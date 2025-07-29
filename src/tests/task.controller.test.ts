import request from 'supertest';
import app from '../app';
import prisma from '../utils/db';

// Mock Prisma client
jest.mock('../utils/db', () => ({
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $connect: jest.fn().mockResolvedValue(undefined),
  $disconnect: jest.fn().mockResolvedValue(undefined),
}));

describe('Task Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Test Task 1',
          description: 'Test Description 1',
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Test Task 2',
          description: 'Test Description 2',
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (prisma.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.tasks).toHaveLength(2);
      expect(prisma.task.findMany).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      (prisma.task.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(prisma.task.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      const mockTask = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.findUnique as jest.Mock).mockResolvedValue(mockTask);

      const response = await request(app).get('/api/tasks/1');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toEqual(
        expect.objectContaining({
          id: '1',
          title: 'Test Task',
        })
      );
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return 404 if task not found', async () => {
      (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get('/api/tasks/999');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(prisma.task.findUnique).toHaveBeenCalledWith({
        where: { id: '999' },
      });
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'New Task',
        description: 'New Description',
      };

      const mockCreatedTask = {
        id: '3',
        ...taskData,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (prisma.task.create as jest.Mock).mockResolvedValue(mockCreatedTask);

      const response = await request(app).post('/api/tasks').send(taskData);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.task).toEqual(
        expect.objectContaining({
          id: '3',
          title: 'New Task',
          description: 'New Description',
        })
      );
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: taskData,
      });
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app).post('/api/tasks').send({ description: 'Missing Title' });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(prisma.task.create).not.toHaveBeenCalled();
    });
  });
});
