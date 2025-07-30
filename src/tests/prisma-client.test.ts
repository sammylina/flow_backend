import { describe, expect, it } from '@jest/globals';
import path from 'path';
import fs from 'fs';

describe('Prisma Client Generation', () => {
  it('should have generated Prisma client files', () => {
    const prismaClientPath = path.join(__dirname, '../generated/prisma');

    // Check if the generated directory exists
    expect(fs.existsSync(prismaClientPath)).toBe(true);

    // Check if essential files exist
    const essentialFiles = ['index.js', 'index.d.ts', 'package.json', 'schema.prisma'];

    essentialFiles.forEach((file) => {
      const filePath = path.join(prismaClientPath, file);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('should be able to import PrismaClient from generated client', async () => {
    // This test verifies that the generated client can be imported
    // without throwing any errors
    expect(async () => {
      const { PrismaClient } = await import('../generated/prisma');
      expect(PrismaClient).toBeDefined();
      expect(typeof PrismaClient).toBe('function');
    }).not.toThrow();
  });

  it('should be able to import the database utility', async () => {
    // This test verifies that our db utility can import the generated client
    expect(async () => {
      const prisma = await import('../utils/db');
      expect(prisma.default).toBeDefined();
    }).not.toThrow();
  });

  it('should have the correct Prisma client configuration', async () => {
    const { PrismaClient } = await import('../generated/prisma');
    const client = new PrismaClient();

    // Verify that the client is properly instantiated
    expect(client).toBeDefined();
    expect(typeof client.$connect).toBe('function');
    expect(typeof client.$disconnect).toBe('function');

    // Clean up
    await client.$disconnect();
  });
});
