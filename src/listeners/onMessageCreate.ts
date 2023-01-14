import { ChannelType, Client, User } from "discord.js";
import { getMessages } from "../commands/getMessages";
import { showHelp } from "../commands/help";
import { getUserList } from "../commands/users";
import { noteUserLastMessage } from "../functions/noteUserLastMessage";

export default (client: Client, prefix: string): void => {
  client.on("messageCreate", async (msg) => {
    if (
      msg.author.id === client?.user?.id ||
      msg.channel.type !== ChannelType.GuildText
    )
      return;

    // Note user last message
    noteUserLastMessage(msg);

    // Show help if bot is mentioned and message ends with "help"
    if (
      msg.mentions.has(client.user as User) &&
      (msg.content.endsWith("help") || msg.content.endsWith("pomoc"))
    ) {
      showHelp(msg);
    }

    if (
      msg.mentions.has(client.user as User) &&
      (msg.content.endsWith("analyse messages"))
    ) {
      getMessages(msg);
    }

    // Ignore messages that don't start with the prefix
    if (!msg.content.startsWith(prefix)) return;
    const message = msg.content.slice(1);

    if (message.startsWith("users") || message.startsWith("userzy")) {
      getUserList(msg);
    }
  });
};
