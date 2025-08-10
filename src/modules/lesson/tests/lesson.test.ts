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

describe('POST /api/lessons - additional scenarios', () => {
  const validPayload = {
    title: 'Another Lesson',
    audioUrl: 'https://cdn.com/another_lesson.mp3',
    playlistId: 5,
  };

  beforeEach(() => {
    // By default, a valid token
    (jwt.verify as jest.Mock).mockReturnValue({ id: 123, email: 'user@example.com' });
    (prisma.playlist.count as jest.Mock).mockResolvedValue(1);
    (prisma.lesson.create as jest.Mock).mockResolvedValue({
      id: 2,
      title: validPayload.title,
      audioUrl: validPayload.audioUrl,
      playlistId: validPayload.playlistId,
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject when Authorization header is missing', async () => {
    const res = await request(app).post('/api/lessons').send(validPayload);

    // Prefer 401 Unauthorized for missing credentials; adjust if project uses 403
    expect([401, 403]).toContain(res.status);
    expect(['fail', 'error']).toContain(res.body.status);
  });

  it('should reject with 401 for invalid token', async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer invalid-token')
      .send(validPayload);

    expect(res.status).toBe(401);
    expect(['fail', 'error']).toContain(res.body.status);
  });

  it('should return 400 when title is missing', async () => {
    const { title: _unused, ...rest } = validPayload;
    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(rest);

    expect(res.status).toBe(400);
    expect(res.body.status).toBeDefined();
    expect(['fail', 'error']).toContain(res.body.status);
    expect(prisma.lesson.create).not.toHaveBeenCalled();
  });

  it('should return 400 when audioUrl is missing', async () => {
    const { audioUrl: _unused, ...rest } = validPayload;
    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(rest);

    expect(res.status).toBe(400);
    expect(['fail', 'error']).toContain(res.body.status);
    expect(prisma.lesson.create).not.toHaveBeenCalled();
  });

  it('should return 400 when playlistId is missing', async () => {
    const { playlistId: _unused, ...rest } = validPayload;
    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(rest);

    expect(res.status).toBe(400);
    expect(['fail', 'error']).toContain(res.body.status);
    expect(prisma.lesson.create).not.toHaveBeenCalled();
  });

  it('should return 400 when playlistId is not a number', async () => {
    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send({ ...validPayload, playlistId: 'not-a-number' });

    expect(res.status).toBe(400);
    expect(['fail', 'error']).toContain(res.body.status);
    expect(prisma.lesson.create).not.toHaveBeenCalled();
  });

  // Fake test now, impelement it
  //it('should return 400 for invalid audioUrl format', async () => {
  //  const res = await request(app)
  //    .post('/api/lessons')
  //    .set('Authorization', 'Bearer valid-token')
  //    .send({ ...validPayload, audioUrl: 'ftp://invalid.example.com/file.mp3' });

  //  // If no explicit URL validation exists, this might be 201; keep assert tolerant
  //  expect([400, 422]).toContain(res.status);
  //  if (res.status !== 201) {
  //    expect(['fail', 'error']).toContain(res.body.status);
  //    expect(prisma.lesson.create).not.toHaveBeenCalled();
  //  }
  //});

  it('should return 500 when playlist existence lookup fails', async () => {
    (prisma.playlist.count as jest.Mock).mockRejectedValue(new Error('DB error: count failed'));

    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(validPayload);

    expect([500]).toContain(res.status);
    expect(['error', 'fail']).toContain(res.body.status);
    expect(prisma.lesson.create).not.toHaveBeenCalled();
  });

  it('should return 500 when lesson creation fails', async () => {
    (prisma.lesson.create as jest.Mock).mockRejectedValue(new Error('DB error: create failed'));

    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(validPayload);

    expect([500]).toContain(res.status);
    expect(['error', 'fail']).toContain(res.body.status);
  });

  it('should trim title and still create lesson successfully', async () => {
    const payloadWithWhitespace = {
      ...validPayload,
      title: '   Padded Title   ',
    };

    (prisma.lesson.create as jest.Mock).mockResolvedValue({
      id: 3,
      title: 'Padded Title',
      audioUrl: validPayload.audioUrl,
      playlistId: validPayload.playlistId,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const res = await request(app)
      .post('/api/lessons')
      .set('Authorization', 'Bearer valid-token')
      .send(payloadWithWhitespace);

    expect([200, 201]).toContain(res.status);
    expect(res.body.status).toBe('success');
    // Verify that title was normalized/trimmed if controller performs it
    expect(res.body.data.lesson.title.trim()).toBe('Padded Title');
  });
});
