import { prisma } from './prismaClient';
import {
  Guild as PrismaGuild,
  Channel as PrismaChannel,
  Message as PrismaMessage,
  Role as PrismaRole,
  Member as PrismaMember,
} from '@prisma/client';
import { CacheServiceInterface, ChannelIndex, MessageIndex, RolesIndex, MemberIndex } from '../types/cache';

class CacheService implements CacheServiceInterface {
  private guild: PrismaGuild | null = null;
  private channelsIndexByDiscordId: ChannelIndex = {};
  private messagesIndexByDiscordId: MessageIndex = {};
  private rolesIndexByDiscordId: RolesIndex = {};
  private membersIndexByDiscordId: MemberIndex = {};

  ////////////////////////////////////////////
  //                Guild                   //
  ////////////////////////////////////////////
  async createGuild(_discordGuildId: string): Promise<PrismaGuild | null> {
    // Check if guild is already in the cache
    if (this.guild) return this.guild;

    // If guild is not in the cache, create it in the database
    const prismaGuild: PrismaGuild | null = await prisma.guild.create({
      data: {
        discordGuildId: _discordGuildId,
      },
    });

    // If the role is in the database, add it to the cache and return it. If not, return null
    return prismaGuild ? (this.guild = prismaGuild) : prismaGuild;
  }

  ////////////////////////////////////////////
  //               Channel                  //
  ////////////////////////////////////////////
  async createChannel(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null> {
    // Check if the channel is already in the cache
    const channelAux: PrismaChannel | null = await this.getChannelByDiscordId(_discordGuildId, _discordChannelId);

    if (channelAux) return channelAux;

    // Check if the guild exist
    const prismaGuild: PrismaGuild | null = await prisma.guild.findUnique({
      where: {
        discordGuildId: _discordGuildId,
      },
    });

    if (!prismaGuild) return null;

    // If the channel is not in the cache, create it in the database
    const prismaChannel: PrismaChannel | null = await prisma.channel.create({
      data: {
        guildId: prismaGuild.id,
        discordChannelId: _discordChannelId,
      },
    });

    // If the channel is in the database, add it to the cache and return it. If not, return null
    return prismaChannel ? (this.channelsIndexByDiscordId[_discordChannelId] = prismaChannel) : prismaChannel;
  }

  async getChannelByDiscordId(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null> {
    // Check if the channel is already in the cache
    if (this.channelsIndexByDiscordId[_discordChannelId]) return this.channelsIndexByDiscordId[_discordChannelId]!;

    // If the channel is not in the cache, check the database
    const prismaChannel: PrismaChannel | null = await prisma.channel.findUnique({
      where: {
        discordChannelId: _discordChannelId,
      },
    });

    // If the channel is in the database, add it to the cache and return it. If not, return null
    return prismaChannel ? (this.channelsIndexByDiscordId[_discordChannelId] = prismaChannel) : prismaChannel;
  }

  ////////////////////////////////////////////
  //               Message                  //
  ////////////////////////////////////////////
  async createMessage(
    _discordGuildId: string,
    _discordChannelId: string,
    _discordMessageId: string,
    _discordCommandName: string | undefined,
  ): Promise<PrismaMessage | null> {
    // Check if the message is already in the cache
    const messageAux: PrismaMessage | null = await this.getMessageByDiscordId(_discordChannelId, _discordMessageId);

    if (messageAux) return messageAux;

    // Check if the channel exist
    const prismaChannel: PrismaChannel | null = await this.getChannelByDiscordId(_discordGuildId, _discordChannelId);

    if (!prismaChannel) return null;

    // If the message is not in the cache, create it in the database
    const prismaMessage: PrismaMessage | null = await prisma.message.create({
      data: {
        discordMessageId: _discordMessageId,
        discordCommandName: _discordCommandName ? _discordCommandName : null,
        channelId: this.channelsIndexByDiscordId[_discordChannelId]!.id,
      },
    });

    // If the message is in the database, add it to the cache and return it. If not, return null
    return prismaMessage ? (this.messagesIndexByDiscordId[_discordMessageId] = prismaMessage) : prismaMessage;
  }

  async getMessageByDiscordId(_discordChannelId: string, _discordMessageId: string): Promise<PrismaMessage | null> {
    // Check if the message is already in the cache
    if (this.messagesIndexByDiscordId[_discordMessageId]) return this.messagesIndexByDiscordId[_discordMessageId]!;

    // If the message is not in the cache, check the database
    const prismaMessage: PrismaMessage | null = await prisma.message.findUnique({
      where: {
        discordMessageId: _discordMessageId,
      },
    });

    // If the message is in the database, add it to the cache and return it. If not, return null
    return prismaMessage ? (this.messagesIndexByDiscordId[_discordChannelId] = prismaMessage) : prismaMessage;
  }

  ////////////////////////////////////////////
  //                Role                    //
  ////////////////////////////////////////////
  async createRole(
    _discordGuildId: string,
    _discordRoleId: string,
    _discordRoleName: string,
  ): Promise<PrismaRole | null> {
    // Check if the role is already in the cache
    const roleAux: PrismaRole | null = await this.getRoleByDiscordId(_discordGuildId, _discordRoleId);

    if (roleAux) return roleAux;

    // If the role is not in the cache, create it in the database
    const prismaRole: PrismaRole | null = await prisma.role.create({
      data: {
        guildId: _discordGuildId,
        discordRoleId: _discordRoleId,
        discordRoleName: _discordRoleName,
      },
    });

    // If the role is in the database, add it to the cache and return it. If not, return null
    return prismaRole ? (this.rolesIndexByDiscordId[_discordRoleId] = prismaRole) : prismaRole;
  }

  async getRoleByDiscordId(_discordGuildId: string, _discordRoleId: string): Promise<PrismaRole | null> {
    // Check if the role is already in the cache
    if (this.rolesIndexByDiscordId[_discordRoleId]) return this.rolesIndexByDiscordId[_discordRoleId]!;

    // If the role is not in the cache, check the database
    const prismaRole: PrismaRole | null = await prisma.role.findUnique({
      where: {
        guildId: _discordGuildId,
        discordRoleId: _discordRoleId,
      },
    });

    // If the role is in the database, add it to the cache and return it. If not, return null
    return prismaRole ? (this.rolesIndexByDiscordId[_discordRoleId] = prismaRole) : prismaRole;
  }

  async getAllRoles(): Promise<RolesIndex | null> {
    return this.rolesIndexByDiscordId;
  }

  ////////////////////////////////////////////
  //                Member                  //
  ////////////////////////////////////////////
  async getMemberByDiscordId(_discordGuildId: string, _discordMemberId: string): Promise<PrismaMember | null> {
    // Check if the member is already in the cache
    if (this.membersIndexByDiscordId[_discordMemberId]) {
      console.log(`Member ${this.membersIndexByDiscordId[_discordMemberId]?.discordDisplayName} already in cache`); // debug

      return this.membersIndexByDiscordId[_discordMemberId]!;
    }

    // Check if the guild exist
    if (!this.guild) return null;

    // If the member is not in the cache, check the database
    const prismaMember: PrismaMember | null = await prisma.member.findUnique({
      where: {
        guildId: this.guild.id,
        discordMemeberId: _discordMemberId,
      },
    });

    if (prismaMember) {
      console.log(`Member ${prismaMember.discordDisplayName} added to cache`); // debug
    }

    // If the member is in the database, add it to the cache and return it. If not, return null
    return prismaMember ? (this.membersIndexByDiscordId[_discordMemberId] = prismaMember) : prismaMember;
  }
}

export const cacheService: CacheServiceInterface = new CacheService();
