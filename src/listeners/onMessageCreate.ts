import { Client, EmbedBuilder, User } from "discord.js";
import { showHelp } from "../commands/help";
import { getUserList } from "../commands/users";

export default (client: Client, prefix: string): void => {
  client.on("messageCreate", async (msg) => {
    if (msg.author.id === client?.user?.id) return;

    if (
      msg.mentions.has(client.user as User) &&
      (msg.content.endsWith("help") || msg.content.endsWith("pomoc"))
    ) {
      showHelp(msg);
    }

    if (!msg.content.startsWith(prefix)) return;
    const message = msg.content.slice(1);

    if (message.startsWith("users") || message.startsWith("userzy")) {
      getUserList(msg);
    }
  });
};
