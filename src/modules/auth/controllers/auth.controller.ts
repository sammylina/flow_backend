import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, getUserById } from '../services/auth.service';
import logger from '../../../utils/logger';
import { ApiError } from '../../../middlewares/error.middleware';

/**
 * Register a new user
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Register user
    const user = await registerUser(email, password, name);
    
    logger.info(`User registered with email: ${email}`);
    
    return res.status(201).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login a user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    // Login user
    const { user, token } = await loginUser(email, password);
    
    logger.info(`User logged in with email: ${email}`);
    
    return res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // User ID is set by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, 'Not authenticated');
    }

    // Get user by ID
    const user = await getUserById(userId);
    
    return res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};