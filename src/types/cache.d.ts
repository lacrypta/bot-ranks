import { Guild as PrismaGuild, Channel as PrismaChannel, Member as PrismaMember, Message as PrismaMessage, Role as PrismaRole } from '@prisma/client';

export interface CacheServiceInterface {
  // Guild
  async createGuild(_discordGuildId: string): Promise<PrismaGuild | null>;

  // Channel
  async createChannel(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null>;
  async getChannelByDiscordId(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null>;

  // Message
  async createMessage(_discordGuildId: string,
    _discordChannelId: string,
    _discordMessageId: string,
    _discordCommandName: string | undefined,): Promise<PrismaMessage | null>;
  async getMessageByDiscordId(_discordChannelId: string, _discordMessageId: string): Promise<PrismaMessage| null>;


  // Role
  async createRole(_discordGuildId: string, _discordRoleId: string, _discordRoleName: string): Promise<PrismaRole | null>;
  async getRoleByDiscordId(_discordGuildId: string, _discordRoleId: string): Promise<PrismaRole | null>;
  async getAllRoles(): Promise<RolesIndex | null>;

  // MessageReactionRole

  // ReactionButton


  // Member
  async getMemberByDiscordId(_discordChannelId: string, _discordMemberId: string): Promise<PrismaMember | null>;
  
  // Padrino
}

// createChannel
export interface ChannelIndex {
  [discordGuildId: string]: PrismaChannel;
}

// createMessage
export interface MessageIndex {
  [discordMessageId: string]: PrismaMessage;
}

// createRole
export interface RolesIndex {
  [discordRoleId: string]: PrismaRole;
}

// getMemberByDiscordId
export interface MemberIndex {
  [discordMemberId: string]: PrismaMember;
}
