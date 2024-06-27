import { prisma } from './prismaClient';
import { Member as PrismaMember } from '@prisma/client';
import { MemberIndex } from '../types/cache';

interface CacheServiceInterface {
  getMemberByDiscordId(_discordMemberId: string): Promise<PrismaMember | null>;
}

class CacheService implements CacheServiceInterface {
  private membersIndexById: MemberIndex = {};

  async getMemberByDiscordId(_discordMemberId: string): Promise<PrismaMember | null> {
    // Check if the member is already in the cache
    if (this.membersIndexById[_discordMemberId]) {
      console.log(`Member ${this.membersIndexById[_discordMemberId]?.discordDisplayName} already in cache`); // debug

      return this.membersIndexById[_discordMemberId]!;
    }

    // If the member is not in the cache, check the database
    const prismaMember: PrismaMember | null = await prisma.member.findUnique({
      where: {
        discordMemeberId: _discordMemberId,
      },
    });

    if (prismaMember) {
      console.log(`Member ${prismaMember.discordDisplayName} added to cache`); // debug
    }

    // If the member is in the database, add it to the cache and return it. If not, return null
    return prismaMember ? (this.membersIndexById[_discordMemberId] = prismaMember) : prismaMember;
  }
}

export const cacheService: CacheServiceInterface = new CacheService();
