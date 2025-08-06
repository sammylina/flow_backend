import request from 'supertest';
import app from '../../../app';
import prisma from '../../../utils/db';
import jwt from 'jsonwebtoken';

// mock prisma client
jest.mock('../../../utils/db', () => ({
  lesson: {
    create: jest.fn(),
  },
  playlist: {
    count: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Lesson Controller', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockLesson = {
    id: 1,
    title: 'Test Lesson',
    audioUrl: 'https:cdn.com/test_lesson.mp3',
    playlistId: 2,
    order: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/lessons', () => {
    it('should create a new lesson', async () => {
      (prisma.lesson.create as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.playlist.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Test Lesson',
          audioUrl: 'https:cdn.com/test_lesson.mp3',
          playlistId: 2,
        });
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.lesson).toHaveProperty('id');
      expect(response.body.data.lesson.audioUrl).toBe('https:cdn.com/test_lesson.mp3');
      expect(response.body.data.lesson.playlistId).toBe(2);

      expect(prisma.lesson.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Lesson',
          audioUrl: 'https:cdn.com/test_lesson.mp3',
          playlistId: 2,
        },
      });
    });

    it('should reurn 400 for invalid playlist ID', async () => {
      (prisma.lesson.create as jest.Mock).mockResolvedValue(mockLesson);
      (prisma.playlist.count as jest.Mock).mockResolvedValue(0); // The playlist doesn't exist

      const response = await request(app)
        .post('/api/lessons')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Test Lesson',
          audioUrl: 'https://cdn.com/test_lesson.mp3',
          playlistId: 10000,
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(`Playlist does not exist with ID: ${10000}`);

      expect(prisma.lesson.create).not.toHaveBeenCalled();
    });
  });
});
