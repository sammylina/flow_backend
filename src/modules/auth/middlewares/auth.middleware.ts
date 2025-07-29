import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../../middlewares/error.middleware';
import config from '../../../config';
import logger from '../../../utils/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
      };
    }
  }
}

/**
 * Authenticate user using JWT token
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Not authenticated');
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new ApiError(401, 'Not authenticated');
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as {
        id: number;
        email: string;
      };
      
      // Set user in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
      };
      
      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error}`);
      throw new ApiError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
};