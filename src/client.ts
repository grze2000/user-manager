import { Client, Collection, GatewayIntentBits } from "discord.js";

export interface Command {
  data: {
    name: string;
    description: string;
  };
  execute: (...args: any[]) => Promise<void>;
}

export class CustomClient extends Client {
  commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
      ],
    });
    this.commands = new Collection();
  }
}
