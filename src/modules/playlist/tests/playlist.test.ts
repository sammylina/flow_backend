import request from 'supertest';
import app from '../../../app';
import prisma from '../../../utils/db';
import jwt from 'jsonwebtoken';

// Mock Prisma client
jest.mock('../../../utils/db', () => ({
  playlist: {
    create: jest.fn(),
    findMany: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Playlist Controller', () => {
  const mockUser = {
    id: 1,
    email: 'test@example.com',
  };

  const mockPlaylist = {
    id: 1,
    name: 'Test Playlist',
    description: 'A test playlist',
    level: 'beginner',
    lessonCount: 0,
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Mock JWT verification to return a valid user
    (jwt.verify as jest.Mock).mockReturnValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/playlists', () => {
    it('should create a new playlist', async () => {
      (prisma.playlist.create as jest.Mock).mockResolvedValue(mockPlaylist);

      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test Playlist',
          description: 'A test playlist',
          level: 'beginner',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.playlist).toHaveProperty('id');
      expect(response.body.data.playlist.name).toBe('Test Playlist');

      expect(prisma.playlist.create).toHaveBeenCalledWith({
        data: {
          name: 'Test Playlist',
          description: 'A test playlist',
          level: 'beginner',
          userId: 1,
        },
      });
    });

    it('should return 400 for invalid level', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Test Playlist',
          level: 'invalid-level',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Level must be one of: beginner, intermediate, advanced');

      expect(prisma.playlist.create).not.toHaveBeenCalled();
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/playlists')
        .set('Authorization', 'Bearer valid-token')
        .send({
          level: 'beginner',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Name and level are required');

      expect(prisma.playlist.create).not.toHaveBeenCalled();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).post('/api/playlists').send({
        name: 'Test Playlist',
        level: 'beginner',
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authenticated');
    });
  });

  describe('GET /api/playlists', () => {
    it('should get all playlists for authenticated user', async () => {
      const mockPlaylists = [mockPlaylist];
      (prisma.playlist.findMany as jest.Mock).mockResolvedValue(mockPlaylists);

      const response = await request(app)
        .get('/api/playlists')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.playlists).toHaveLength(1);
      expect(response.body.data.count).toBe(1);

      expect(prisma.playlist.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app).get('/api/playlists');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Not authenticated');
    });
  });

  describe('GET /api/playlists/:id', () => {
    it('should get a specific playlist by ID', async () => {
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(mockPlaylist);

      const response = await request(app)
        .get('/api/playlists/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.playlist.id).toBe(1);

      expect(prisma.playlist.findFirst).toHaveBeenCalledWith({
        where: { id: 1, userId: 1 },
      });
    });

    it('should return 404 if playlist not found', async () => {
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/playlists/999')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Playlist not found');
    });

    it('should return 400 for invalid ID', async () => {
      const response = await request(app)
        .get('/api/playlists/invalid')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid playlist ID');
    });
  });

  describe('PUT /api/playlists/:id', () => {
    it('should update a playlist', async () => {
      const updatedPlaylist = { ...mockPlaylist, name: 'Updated Playlist' };
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlist.update as jest.Mock).mockResolvedValue(updatedPlaylist);

      const response = await request(app)
        .put('/api/playlists/1')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Playlist',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.playlist.name).toBe('Updated Playlist');

      expect(prisma.playlist.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Playlist' },
      });
    });

    it('should return 404 if playlist not found', async () => {
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/playlists/999')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: 'Updated Playlist',
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Playlist not found');
    });
  });

  describe('DELETE /api/playlists/:id', () => {
    it('should delete a playlist', async () => {
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(mockPlaylist);
      (prisma.playlist.delete as jest.Mock).mockResolvedValue(mockPlaylist);

      const response = await request(app)
        .delete('/api/playlists/1')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Playlist deleted successfully');

      expect(prisma.playlist.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return 404 if playlist not found', async () => {
      (prisma.playlist.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/playlists/999')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Playlist not found');
    });
  });
});
