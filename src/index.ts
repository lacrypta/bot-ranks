import { Client, GatewayIntentBits, Events, Message } from 'discord.js';
import { PrismaTest } from './services/prismaTest';
import readyEvent from './events/ready';
import newMessage from './events/newMessage';
require('dotenv').config();

console.info('Hello World');

(async () => {
  // Generate random email
  const testEmail = `${Math.random()}@sdfsdfd.com`;

  // Test create user
  await PrismaTest.createUser(testEmail);

  // Test read users
  const users = await PrismaTest.listUsers();
  console.info('List Users:', users);

  // Test find user by email
  const user = await PrismaTest.findUserByEmail(testEmail);
  console.info('User:', user);

  // Create Post
  const post = await PrismaTest.createPost('Hello World', 'This is a test post', user!.id);
  console.info('Post:', post);

  // Update Post
  await PrismaTest.updatePost(post.id, 'Hello World Updated', 'This is an updated test post');

  // Get posts
  const userPosts = await PrismaTest.getUserPosts(user!.id);
  console.info('User posts:', userPosts);
})();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

readyEvent(client);

client.on(Events.MessageCreate, newMessage);

client.once(Events.ClientReady, () => {
  console.log('Discord bot ready');
});

client.login(process.env.DISCORD_BOT_TOKEN);
