import { Client } from 'discord.js';

export default (client: Client) => {
  client.on('ready', () => {
    console.log(`Logged in as ${client.user?.tag}!`);
  });
};
