import { BotEvent } from '../types/botEvents';
import { deployCommands } from '../deployCommands';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async () => {
    deployCommands();
    console.log('Discord bot ready!');
  },
};

export default event;
