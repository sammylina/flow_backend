import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../../utils/db';
import { ApiError } from '../../../middlewares/error.middleware';
import config from '../../../config';

// Define User type
type User = {
  id: number;
  email: string;
  passwordHash: string;
  language: string;
  coins: number;
  isPaid: boolean;
};

/**
 * Register a new user
 */
export const registerUser = async (
  email: string,
  password: string,
  language: string = 'en'
): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      language,
    },
  });

  // Generate JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret as string);

  // Return user without password and token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Login a user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Generate JWT token
  const token = jwt.sign({ id: user.id, email: user.email }, config.jwtSecret as string);

  // Return user without password and token
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
};

/**
 * Get user by ID
 */
export const getUserById = async (id: number): Promise<Omit<User, 'passwordHash'>> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Return user without password
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
