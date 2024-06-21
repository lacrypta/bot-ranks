import { BotEvent } from '../types/botEvents';
import { deployCommands } from '../deployCommands';

const event: BotEvent = {
  name: 'ready',
  once: true,
  execute: async () => {
    await deployCommands();

    console.log('\x1b[37m\x1b[42m%s\x1b[0m', 'Discord bot ready!');
  },
};

export default event;
