// Import Prisma Client
import { PrismaClient } from '@prisma/client';

// Use custom type
import { User } from '../types/user';

// Instantiate Prisma Client
const prisma = new PrismaClient();

export class PrismaTest {
  static async createUser(email: string): Promise<User> {
    console.info('Creating user...');
    const user = await prisma.user.create({
      data: {
        email: email,
      },
    });
    console.info('User created!');

    return user;
  }

  static async listUsers(): Promise<User[]> {
    console.info('Listing users...');
    const users = await prisma.user.findMany();
    return users;
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    console.info('Finding user...');
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    return user;
  }
}
