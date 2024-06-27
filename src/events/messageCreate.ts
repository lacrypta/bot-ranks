import { Message } from 'discord.js';
import { BotEvent } from '../types/botEvents';
import { LevelUpStatus, addXpMessage } from '../services/temporalLevel';

const event: BotEvent = {
  name: 'messageCreate',
  once: false,
  execute: async (message: Message) => {
    if (message.author.bot) return;

    const LevelUpStatus: LevelUpStatus | undefined = await addXpMessage(message);

    if (LevelUpStatus) {
      if (LevelUpStatus.canLevelUp) {
        await message.channel.send(`Felicitacoines <@${message.author.id}>! subiste al nivel ${LevelUpStatus.level}!`);
      } else {
        await message.channel.send(
          `<@${message.author.id}> ganaste ${LevelUpStatus.xpRemaining} puntos de experiencia!`,
        );
      }
    }
  },
};

export default event;
