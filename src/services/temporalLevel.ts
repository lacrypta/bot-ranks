import { Member } from '@prisma/client';
import { Message, MessageReaction, User } from 'discord.js';
import { prisma } from './prismaClient';
import { time } from 'console';

const COLDOWN_MS = 5 * 1000;

/// Levels
interface Level {
  [key: string]: number;
}

const levels: Level = {
  '1': 500,
  '2': 1000,
  '3': 2000,
  '4': 4000,
  '5': 5000,
  '6': 6000,
  '7': 7000,
  '8': 8000,
  '9': 9000,
  '10': 10000,
};

enum XpTypes {
  MESSAGE = 100,
  REACTION_RECEIVE = 50,
  REACTION_SEND = 25,
}

/// Level Up
export interface LevelUpStatus {
  canLevelUp: boolean;
  level: number;
  xpRemaining: number;
}

/// aca
function canLevelUp(member: Member, xpToAdd: number) {
  const nextLevelXp: number = levels[(member.discordTemporalLevel + 1).toString()]!;

  // canLevelUp === true, return the remaining xp after level up.
  // canLevelUp === false, return the xp to add.
  const newXp: number = member.discordTemporalLevelXp + xpToAdd;
  return {
    canLevelUp: newXp >= nextLevelXp,
    level: newXp >= nextLevelXp ? member.discordTemporalLevel + 1 : member.discordTemporalLevel,
    xpRemaining: newXp >= nextLevelXp ? newXp - nextLevelXp : xpToAdd,
  } as LevelUpStatus;
}

function amountXpToAddMessage(message: Message, member: Member) {
  const messageLength: number = message.content.length;
  const newMessageTimestamp: number = message.createdTimestamp;
  const lastMessageTimestamp: string = member.discordTemporalLevelCooldown;

  const xpType: number = XpTypes.MESSAGE;
  const deltaTime: number = newMessageTimestamp - parseInt(lastMessageTimestamp);
  const lengthMultiplier: number = (Math.random() * messageLength) % 1; // TODO

  const amountXpToAdd = Math.floor(xpType * Math.min(1, deltaTime / COLDOWN_MS) + xpType * lengthMultiplier);

  const levelUpStatus: LevelUpStatus = canLevelUp(member, amountXpToAdd);

  return levelUpStatus;
}

async function amountXpToAddReaction(reactionTimestamp: number, reactionAuthor: User, messageAuthor: User) {
  try {
    if (reactionAuthor === messageAuthor) {
      throw new Error('Reaction author is the same as message author');
    }
    if (reactionAuthor.bot) {
      throw new Error('Reaction author is a bot');
    }

    /// Message Author
    const prismaMessageAuthor = await prisma.member.update({
      where: {
        discordMemeberId: messageAuthor.id,
      },
      data: {
        discordTemporalLevelXp: {
          increment: XpTypes.REACTION_RECEIVE,
        },
      },
    });

    const levelUpStatusMessageAuthor: LevelUpStatus = canLevelUp(prismaMessageAuthor, XpTypes.REACTION_RECEIVE);

    /// Reaction Author
    const prismaReactionAuthor: Member | null = await prisma.member.findUnique({
      where: {
        discordMemeberId: reactionAuthor.id,
      },
    });

    if (!prismaReactionAuthor) {
      throw new Error('Reaction author not found');
    }

    const newReactionTimestamp: number = reactionTimestamp;
    const lastMessageTimestamp: string = prismaReactionAuthor.discordTemporalLevelCooldown;

    const xpType: number = XpTypes.REACTION_SEND;
    const deltaTime: number = newReactionTimestamp - parseInt(lastMessageTimestamp);

    const amountXpToAdd = Math.floor(xpType * Math.min(1, deltaTime / COLDOWN_MS));

    const levelUpStatusReactionAuthor: LevelUpStatus = canLevelUp(prismaReactionAuthor, amountXpToAdd);

    return { reactionAuthor: levelUpStatusReactionAuthor, messageAuthor: levelUpStatusMessageAuthor };
  } catch (error) {
    console.error(`Failed to add xp to member: `, error);
  }
}

/// Functions
async function addXpMessage(message: Message) {
  try {
    const memberId = message.author.id;

    const member = await prisma.member.findUnique({
      where: {
        discordMemeberId: memberId,
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const levelUpStatus: LevelUpStatus = amountXpToAddMessage(message, member);

    if (levelUpStatus.canLevelUp) {
      await prisma.member.update({
        where: {
          discordMemeberId: memberId,
        },
        data: {
          discordTemporalLevel: levelUpStatus.level,
          discordTemporalLevelXp: levelUpStatus.xpRemaining,
          discordTemporalLevelCooldown: message.createdTimestamp.toString(),
        },
      });
    } else {
      await prisma.member.update({
        where: {
          discordMemeberId: memberId,
        },
        data: {
          discordTemporalLevelXp: member.discordTemporalLevelXp + levelUpStatus.xpRemaining,
          discordTemporalLevelCooldown: message.createdTimestamp.toString(),
        },
      });
    }

    return levelUpStatus;
  } catch (error) {
    console.error(`Failed to add xp to member: ${message.author.displayName}`, error);
  }
}

async function addXpReaction(reaction: MessageReaction, userReacted: User) {
  try {
    const messageAuthor = reaction.message.author;
    const reactionAuthor = userReacted;

    if (!messageAuthor || !reactionAuthor) {
      throw new Error('Message or reaction author not found');
    }

    const prismaMessageAuthor = await prisma.member.findUnique({
      where: {
        discordMemeberId: messageAuthor!.id,
      },
    });
    const prismaReactionAuthor = await prisma.member.findUnique({
      where: {
        discordMemeberId: reactionAuthor.id,
      },
    });

    if (!prismaMessageAuthor || !prismaReactionAuthor) {
      throw new Error('Member not found');
    }

    const _cooldown: number = Date.now();
    const _levelUpStatus = await amountXpToAddReaction(_cooldown, reactionAuthor, messageAuthor!);

    if (!_levelUpStatus) return;

    if (_levelUpStatus['reactionAuthor'].canLevelUp) {
      await prisma.member.update({
        where: {
          discordMemeberId: reactionAuthor.id,
        },
        data: {
          discordTemporalLevel: _levelUpStatus['reactionAuthor'].level,
          discordTemporalLevelXp: _levelUpStatus['reactionAuthor'].xpRemaining,
          discordTemporalLevelCooldown: _cooldown.toString(),
        },
      });
    } else {
      await prisma.member.update({
        where: {
          discordMemeberId: reactionAuthor.id,
        },
        data: {
          discordTemporalLevelXp: {
            increment: _levelUpStatus['reactionAuthor'].xpRemaining,
          },
          discordTemporalLevelCooldown: _cooldown.toString(),
        },
      });
    }

    if (_levelUpStatus['messageAuthor'].canLevelUp) {
      await prisma.member.update({
        where: {
          discordMemeberId: messageAuthor.id,
        },
        data: {
          discordTemporalLevel: _levelUpStatus['messageAuthor'].level,
          discordTemporalLevelXp: _levelUpStatus['messageAuthor'].xpRemaining,
          discordTemporalLevelCooldown: _cooldown.toString(),
        },
      });
    } else {
      await prisma.member.update({
        where: {
          discordMemeberId: messageAuthor.id,
        },
        data: {
          discordTemporalLevelXp: {
            increment: _levelUpStatus['messageAuthor'].xpRemaining,
          },
          discordTemporalLevelCooldown: _cooldown.toString(),
        },
      });
    }

    return _levelUpStatus;
  } catch (error) {
    console.error(`Failed to add xp to member`, error);

    return null;
  }
}

export { addXpMessage, addXpReaction };
