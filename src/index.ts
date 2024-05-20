import { Client, GatewayIntentBits, Events, Message } from "discord.js";
import readyEvent from "./events/ready";
import newMessage from "./events/newMessage";
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

readyEvent(client);

client.on(Events.MessageCreate, newMessage);

client.once(Events.ClientReady, () => {
  console.log("Discord bot ready");
});

client.login(process.env.DISCORD_BOT_TOKEN);
