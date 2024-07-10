import { GuildTextBasedChannel, Message } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { LevelUpStatus, addXpMessage } from '../services/temporalLevel';
import { prisma } from '../services/prismaClient';

const event: BotEvent = {
  name: 'messageCreate',
  once: false,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    const LevelUpStatus: LevelUpStatus | undefined = await addXpMessage(message);

    if (LevelUpStatus) {
      // Find levels channel
      const levelsChannelId: string | null | undefined = await prisma.guild
        .findUnique({
          where: {
            discordGuildId: message.guild?.id,
          },
        })
        .then((guild) => guild?.levelsChannelId);
      const discordChannel: GuildTextBasedChannel | undefined = message.guild?.channels.cache.get(
        levelsChannelId || message.channel.id,
      ) as GuildTextBasedChannel;

      if (LevelUpStatus.canLevelUp) {
        await discordChannel.send(`Felicitacoines <@${message.author.id}>! subiste al nivel ${LevelUpStatus.level}!`);
      }
      // else {
      //   await discordChannel.send(
      //     `<@${message.author.id}> ganaste ${LevelUpStatus.xpRemaining} puntos de experiencia **por enviar un mensaje**!`,
      //   );
      // }
    }
  },
};

export default event;
