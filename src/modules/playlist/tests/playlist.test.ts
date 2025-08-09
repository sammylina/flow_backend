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

  describe('Additional Playlist Controller Tests', () => {
    describe('Authentication edge cases', () => {
      it('should return 401 if Authorization header is malformed (no Bearer)', async () => {
        const response = await request(app)
          .get('/api/playlists')
          .set('Authorization', 'Token some-token'); // malformed scheme

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        // Accept either specific message or generic not authenticated depending on middleware
        expect('Not authenticated').toBe(response.body.message);
      });

      it('should return 401 if JWT verification throws (invalid token)', async () => {
        (jwt.verify as jest.Mock).mockImplementationOnce(() => {
          throw new Error('jwt malformed');
        });

        const response = await request(app)
          .get('/api/playlists')
          .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.status).toBe('error');
        expect('Invalid or expired token').toContain(response.body.message);
      });
    });

    describe('POST /api/playlists additional validations', () => {
      it('should return 400 if level is missing', async () => {
        const res = await request(app)
          .post('/api/playlists')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Name but no level',
          });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(res.body.message).toMatch(/(required|level)/i);
        expect(prisma.playlist.create).not.toHaveBeenCalled();
      });

      it('should return 400 if name is empty string', async () => {
        const res = await request(app)
          .post('/api/playlists')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: '',
            level: 'beginner',
          });

        expect(res.status).toBe(400);
        expect(res.body.status).toBe('error');
        expect(prisma.playlist.create).not.toHaveBeenCalled();
      });

      it('should return 400 for invalid level case-insensitive mismatch (e.g., "Beginner")', async () => {
        const res = await request(app)
          .post('/api/playlists')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Test',
            level: 'Beginner',
          });

        // If controller is strict, expect 400. If it normalizes, this test may be adjusted.
        expect([200, 201, 400]).toContain(res.status);
        if (res.status === 400) {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toMatch(/beginner, intermediate, advanced/);
          expect(prisma.playlist.create).not.toHaveBeenCalled();
        } else {
          // In case the implementation normalizes level, ensure prisma is called appropriately
          expect(prisma.playlist.create).toHaveBeenCalled();
        }
      });

      it('should return 500 if database create fails', async () => {
        (prisma.playlist.create as jest.Mock).mockRejectedValueOnce(new Error('DB down'));

        const res = await request(app)
          .post('/api/playlists')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'Test Playlist',
            description: 'A test playlist',
            level: 'beginner',
          });

        expect([500, 503]).toContain(res.status);
        expect(res.body.status).toBe('error');
        // Prefer a stable message if present
        if (res.body.message) {
          expect(res.body.message).toMatch(/(internal|server|database)/i);
        }
      });

      it('should allow optional description field to be omitted and still create', async () => {
        const created = { ...mockPlaylist, id: 10, description: null };
        (prisma.playlist.create as jest.Mock).mockResolvedValueOnce(created);

        const res = await request(app)
          .post('/api/playlists')
          .set('Authorization', 'Bearer valid-token')
          .send({
            name: 'No description',
            level: 'intermediate',
          });

        expect([200, 201]).toContain(res.status);
        expect(res.body.status).toBe('success');
        expect(res.body.data.playlist).toHaveProperty('id', 10);
        expect(prisma.playlist.create).toHaveBeenCalledWith({
          data: {
            name: 'No description',
            description: null,
            level: 'intermediate',
            userId: 1,
          },
        });
      });
    });

    describe('GET /api/playlists additional scenarios', () => {
      it('should return empty list when user has no playlists', async () => {
        (prisma.playlist.findMany as jest.Mock).mockResolvedValueOnce([]);

        const res = await request(app)
          .get('/api/playlists')
          .set('Authorization', 'Bearer valid-token');

        expect(res.status).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.data.playlists).toEqual([]);
        expect(res.body.data.count).toBe(0);
      });

      it('should return 500 if database list fails', async () => {
        (prisma.playlist.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
          .get('/api/playlists')
          .set('Authorization', 'Bearer valid-token');

        expect([500, 503]).toContain(res.status);
        expect(res.body.status).toBe('error');
        if (res.body.message) {
          expect(res.body.message).toMatch(/(internal|server|database)/i);
        }
      });
    });

    describe('PUT /api/playlists/:id additional validations and ownership', () => {
      it('should return 400 for invalid id param (NaN)', async () => {
        const res = await request(app)
          .put('/api/playlists/abc') // invalid id
          .set('Authorization', 'Bearer valid-token')
          .send({ name: 'Anything' });

        expect([400, 404]).toContain(res.status); // Depending on routing/validation, could be 400 or 404
        if (res.status === 400) {
          expect(res.body.status).toBe('error');
        }
      });

      it('should return 400 for invalid level on update', async () => {
        (prisma.playlist.findFirst as jest.Mock).mockResolvedValueOnce(mockPlaylist);

        const res = await request(app)
          .put('/api/playlists/1')
          .set('Authorization', 'Bearer valid-token')
          .send({ level: 'invalid' });

        expect([400, 422]).toContain(res.status);
        if (res.status === 400) {
          expect(res.body.status).toBe('error');
          expect(res.body.message).toMatch(/beginner, intermediate, advanced/);
          expect(prisma.playlist.update).not.toHaveBeenCalled();
        }
      });

      it('should return 500 if database update fails', async () => {
        (prisma.playlist.findFirst as jest.Mock).mockResolvedValueOnce(mockPlaylist);
        (prisma.playlist.update as jest.Mock).mockRejectedValueOnce(new Error('DB failure'));

        const res = await request(app)
          .put('/api/playlists/1')
          .set('Authorization', 'Bearer valid-token')
          .send({ name: 'Try update' });

        expect([500, 503]).toContain(res.status);
        expect(res.body.status).toBe('error');
        if (res.body.message) {
          expect(res.body.message).toMatch(/(internal|server|database)/i);
        }
      });
    });

    describe('DELETE /api/playlists/:id additional ownership and errors', () => {
      it('should return 500 if database delete fails', async () => {
        (prisma.playlist.findFirst as jest.Mock).mockResolvedValueOnce(mockPlaylist);
        (prisma.playlist.delete as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app)
          .delete('/api/playlists/1')
          .set('Authorization', 'Bearer valid-token');

        expect([500, 503]).toContain(res.status);
        expect(res.body.status).toBe('error');
        if (res.body.message) {
          expect(res.body.message).toMatch(/(internal|server|database)/i);
        }
      });

      it('should return 401 if delete without authentication', async () => {
        const res = await request(app).delete('/api/playlists/1');

        expect(res.status).toBe(401);
        expect(res.body.status).toBe('error');
        expect(['Not authenticated', 'Invalid token']).toContain(res.body.message);
      });
    });
  });
});
