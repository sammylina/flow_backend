import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate } from '../middlewares/auth.middleware';
import { ApiError } from '../../../middlewares/error.middleware';
import config from '../../../config';

// Mock jwt
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Auth Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call next if token is valid', async () => {
    // Set up request with valid token
    req.headers = {
      authorization: 'Bearer valid-token',
    };

    // Mock jwt.verify to return decoded token
    (jwt.verify as jest.Mock).mockReturnValue({
      id: 'user-id',
      email: 'test@example.com',
    });

    await authenticate(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', config.jwtSecret);
    expect(req.user).toEqual({
      id: 'user-id',
      email: 'test@example.com',
    });
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(ApiError));
  });

  it('should return 401 if no authorization header', async () => {
    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Not authenticated',
    }));
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers = {
      authorization: 'invalid-token',
    };

    await authenticate(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Not authenticated',
    }));
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    req.headers = {
      authorization: 'Bearer invalid-token',
    };

    // Mock jwt.verify to throw an error
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authenticate(req as Request, res as Response, next);

    expect(jwt.verify).toHaveBeenCalledWith('invalid-token', config.jwtSecret);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
      message: 'Invalid or expired token',
    }));
  });
});