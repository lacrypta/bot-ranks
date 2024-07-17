import { Guild as PrismaGuild, Channel as PrismaChannel, Member as PrismaMember, Message as PrismaMessage, Role as PrismaRole, MessageReactionRole as PrismaMessageReactionRole, ReactionButton as PrismaReactionBUtton} from '@prisma/client';

export interface CacheServiceInterface {
  // Guild
  async upsertGuild(_discordGuildId: string): Promise<PrismaGuild | null>;
  async getGuildByDiscordId(_discordGuildId: string): Promise<PrismaGuild | null>;

  // Channel
  async createChannel(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null>;
  async getChannelByDiscordId(_discordGuildId: string, _discordChannelId: string): Promise<PrismaChannel | null>;

  // Message
  async createMessage(_discordGuildId: string,
    _discordChannelId: string,
    _discordMessageId: string,
    _discordCommandName: string | undefined,): Promise<PrismaMessage | null>;
  async getMessageByDiscordId(_discordChannelId: string, _discordMessageId: string): Promise<PrismaMessage | null>;
  async getAllMessages(): Promise<MessageIndex | null>
  
  // Role
  async upsertRole(_discordGuildId: string, _discordRoleId: string, _discordRoleName: string): Promise<PrismaRole | null>;
  async getRoleByDiscordId(_discordGuildId: string, _discordRoleId: string): Promise<PrismaRole | null>;
  async getAllRoles(): Promise<RolesIndex | null>;

  // MessageReactionRole
  async createMessageReactionRole(_prismaMessageId: string, _prismaRoleId: string, _discordEmojiId: string | undefined): Promise<PrismaMessageReactionRole | null>;
  async getMessageReactionRoleByPrismaMessageId(_prismaMessageId: string, _discordEmojiId: string): Promise<PrismaMessageReactionRole | null> 
  async updateMessageReactionRoleWithEmojiNullByPrismaMessageId(_prismaMessageId: string, _discordEmojiId: string): Promise<PrismaMessageReactionRole | null>

  // ReactionButton
  async createReactionButton(_prismaRoleId: string, _discordButtonId: string): Promise<PrismaReactionButton | null>;

  // Member
  async upsertMember(_discordGuildId: string, _discordMemberId: string, _discordMemberDisplayName: string, _discordMemeberProfilePicture: string): Promise<PrismaMember | null>;
  async updatePadrinoOfMember(_discordMemberId: string, _prismaPadrinoId: string): Promise<PrismaMember | null>;
  async incrementMemberXp(_prismaMember: PrismaMember, _xp: number, _timestamp: string | undefined, ): Promise<PrismaMember | null>;
  async levelUpMember(_prismaMember: PrismaMember, _xp: number, _level: number, _timestamp: string, ): Promise<PrismaMember | null>;
  async updateMembersLevelsToDatabase(): Promise<boolean>;
  async resetLevels(): Promise<boolean>;
  async getMemberByDiscordId(_discordGuildId: string, _discordMemberId: string): Promise<PrismaMember | null>;
  async getMemberByPrismaId(_prismaMemberId: string): Promise<PrismaMember | null>;
  async getMembersRankingTopTen(_discordGuildId: string): Promise<PrismaMember[] | null>;
  
  // Padrino
  async createPadrino(_memberId: string, _shortDescription: string, _longDescription: string): Promise<PrismaPadrino | null>;
  async updatePadrino(_padrinoId: string, _shortDescription: string, _longDescription: string): Promise<PrismaPadrino | null>;
  async getPadrinoByPrismaId(_prismaPadrinoId: string): Promise<PrismaPadrino | null>;
  async getPadrinoByMemberId(_memberId: string): Promise<PrismaPadrino | null>;
  async getAhijadosByMemberId(_memberId: string): Promise<PrismaMember[] | null>;
  async getAllPadrinos(): Promise<PadrinoIndex | null>
}

// Channel
export interface ChannelIndex {
  [discordGuildId: string]: PrismaChannel;
}

// Message
export interface MessageIndex {
  [discordMessageId: string]: PrismaMessage;
}

// Role
export interface RolesIndex {
  [discordRoleId: string]: PrismaRole;
}

// Member
export interface MemberIndex {
  byPrismaId: { [prismaMemberId: string]: PrismaMember };
  byDiscordId: { [discordMemberId: string]: string}; // Reference to byPrismaId
}

// MessageReactionRole
export interface MessageReactionRoleIndex {
  [prismaMessageId: string]: PrismaMessageReactionRole;
}

// ReactionButton
export interface ReactionButtonIndex {
  [prismaRoleId: string]: PrismaReactionBUtton;
}

// Padrino
export interface PadrinoIndex {
  [memberId: string]: PrismaPadrino;
}