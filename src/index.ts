import { Client, GatewayIntentBits, Events, Message } from "discord.js";
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on(Events.MessageCreate, async (message: Message) => {
  if (message.guildId == process.env.DISCORD_GUILD_ID) {
    console.log(`Message received from ${message.author.tag}: ${message.content}`);
  }
});

client.once(Events.ClientReady, () => {
  console.log("Discord bot ready");
});

client.login(process.env.DISCORD_BOT_TOKEN);
