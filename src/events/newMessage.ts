import { Message } from "discord.js";

export default (message: Message) => {
  console.log(
    `Message received from ${message.author.tag}: ${message.content}`
  );
};
