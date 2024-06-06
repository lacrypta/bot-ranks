// Import Prisma Client
import { PrismaClient } from '@prisma/client';

// Use custom type
import { RoleReaction } from '../types/roleReaction';

// Instantiate Prisma Client
const prisma = new PrismaClient();

export class RoleReactionService {
  static async createRoleReaction(guildId: number, channelId: number, messageId: number): Promise<RoleReaction> {
    console.info('Creating role reaction...');
    const roleReaction = await prisma.roleReaction.create({
      data: {
        guildId: guildId,
        channelId: channelId,
        messageId: messageId,
      },
    });
    console.info('Role reaction created!');

    return roleReaction;
  }

  static async addRoleId(messageId: number, roleId: number): Promise<RoleReaction> {
    console.info('Adding role id...');
    const roleReaction = await prisma.roleReaction.update({
      where: {
        messageId: messageId,
      },
      data: {
        roleId: roleId,
      },
    });
    console.info('Role id added!');

    return roleReaction;
  }

  static async addReactionId(messageId: number, reactionId: number): Promise<RoleReaction> {
    console.info('Adding reaction id...');
    const roleReaction = await prisma.roleReaction.update({
      where: {
        messageId: messageId,
      },
      data: {
        reactionId: reactionId,
      },
    });
    console.info('Reaction id added!');

    return roleReaction;
  }
}
