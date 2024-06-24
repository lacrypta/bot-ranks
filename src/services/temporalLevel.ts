import { prisma } from './prismaClient';

const COLDOWN_MS = 2 * 1000; // 90 seconds

interface Level {
  [key: string]: number;
}

const levels: Level = {
  '1': 5,
  '2': 10,
  '3': 20,
  '4': 400,
  '5': 500,
  '6': 600,
  '7': 700,
  '8': 800,
  '9': 900,
  '10': 1000,
};

interface LevelUpStatus {
  canLevelUp: boolean;
  xpRemaining: number;
}

function canLevelUp(currentXp: number, currentLevel: number): LevelUpStatus {
  const nextLevelXp: number = levels[(currentLevel + 1).toString()]!;

  // canLevelUp === true, return the remaining xp after level up.
  // canLevelUp === false, return the remaining xp to level up.
  return {
    canLevelUp: currentXp >= nextLevelXp,
    xpRemaining: currentXp >= nextLevelXp ? currentXp - nextLevelXp : nextLevelXp - currentXp,
  } as LevelUpStatus;
}

async function addXp(memberId: string, amountXpToAdd: number) {
  try {
    const member = await prisma.member.findUnique({
      where: {
        discordMemeberId: memberId,
      },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    const cooldownTimestamp = parseInt(member.discordTemporalLevelCooldown);
    if (isNaN(cooldownTimestamp)) {
      throw new Error('Invalid cooldown timestamp');
    }

    const currentXpValue = parseInt(member.discordTemporalLevelXp!);
    if (isNaN(currentXpValue)) {
      throw new Error('Invalid XP value');
    }

    const addXp: boolean = Date.now() - cooldownTimestamp > COLDOWN_MS;
    console.log('Actual cooldown: ', Date.now() - cooldownTimestamp);

    if (!addXp) {
      console.log("Cooldown hasn't passed yet");
      return;
    }

    const currentXp: number = currentXpValue + amountXpToAdd; // current xp after adding the new xp
    const levelUpStatus: LevelUpStatus = canLevelUp(currentXp, parseInt(member.discordTemporalLevel!));

    if (levelUpStatus.canLevelUp) {
      console.log('Level up!');
      await prisma.member.update({
        where: {
          discordMemeberId: memberId,
        },
        data: {
          discordTemporalLevel: (parseInt(member.discordTemporalLevel!) + 1).toString(),
          discordTemporalLevelXp: levelUpStatus.xpRemaining.toString(),
          discordTemporalLevelCooldown: Date.now().toString(),
        },
      });

      return levelUpStatus.xpRemaining; // return remaining xp after level up
    } else {
      console.log('Adding xp...');
      await prisma.member.update({
        where: {
          discordMemeberId: memberId,
        },
        data: {
          discordTemporalLevelXp: currentXp.toString(),
          discordTemporalLevelCooldown: Date.now().toString(),
        },
      });

      console.log('Current xp type: ', typeof currentXp);
      console.log('Current xp: ', currentXp);
      return currentXp; // return current xp
    }
  } catch (error) {
    console.error(`Failed to add xp to member: ${memberId}`, error);
  }
}

export { addXp };
