import { Events } from "discord.js";

export default {
  name: Events.MessageCreate,
  async execute(message) {
    console.log(`Message received: ${message.content}`);
  },
};
