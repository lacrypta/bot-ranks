export interface RoleReaction {
  guildId: number;
  channelId: number;
  messageId: number;
  roleId: number | null;
  reactionId: number | null;
}
