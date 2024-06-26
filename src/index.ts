import { Client, GatewayIntentBits, Events, Interaction, Collection, GuildMember } from 'discord.js';
import { ExtendedClient } from './types/discordClient';
import { readdirSync } from 'fs';
import { join } from 'path';

import { BotEvent } from './types/botEvents';
import { PrismaTest } from './services/prismaTest';
import { commandsList } from './deployCommands';
import { Command } from './types/command';
// import readyEvent from './events/ready';
// import newMessage from './events/newMessage';

require('dotenv').config();

console.info('Hello World');

// (async () => {
//   // Generate random email
//   const testEmail = `${Math.random()}@sdfsdfd.com`;

//   // Test create user
//   await PrismaTest.createUser(testEmail);

//   // Test read users
//   const users = await PrismaTest.listUsers();
//   console.info('List Users:', users);

//   // Test find user by email
//   const user = await PrismaTest.findUserByEmail(testEmail);
//   console.info('User:', user);

//   // Create Post
//   const post = await PrismaTest.createPost('Hello World', 'This is a test post', user!.id);
//   console.info('Post:', post);

//   // Update Post
//   await PrismaTest.updatePost(post.id, 'Hello World Updated', 'This is an updated test post');

//   // Get posts
//   const userPosts = await PrismaTest.getUserPosts(user!.id);
//   console.info('User posts:', userPosts);
// })();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
}) as ExtendedClient;

const eventsPath = join(__dirname, 'events');
const eventFiles = readdirSync(eventsPath);

for (const file of eventFiles) {
  const filePath = join(eventsPath, file);
  const event: BotEvent = require(filePath).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
    console.info(`Event ${event.name} loaded.`);
  } else {
    client.on(event.name, (...args) => event.execute(...args));
    console.info(`Event ${event.name} loaded.`);
  }
}

client.login(process.env.DISCORD_BOT_TOKEN);

/// Commands ///
// Load commands in client instance
client.commands = new Collection();
commandsList.forEach((command: Command) => {
  client.commands.set(command.data.name, command);
});
