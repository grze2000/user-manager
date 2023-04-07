import { validateCountdownMessage } from "./../functions/validateCountdownMessage";
import { guilds } from "./../globals/users";
import { listCountdownChannel } from "./../commands/listCountdownChannels";
import { removeCountdownChannel } from "./../commands/removeCountdownChannel";
import { addCountdownChannel } from "../commands/addCountdownChannel";
import { ChannelType, Client, User } from "discord.js";
import { getMessages } from "../commands/getMessages";
import { showHelp } from "../commands/help";
import { getUserList } from "../commands/users";
import { noteUserLastMessage } from "../functions/noteUserLastMessage";
import { setKillChatParameters } from "../commands/killChat/setKillChatParameters";
import { noteKillChatChannelLastMessage } from "../functions/noteKillChatChannelLastMessage";
import { disableKillChatFeature } from "../commands/killChat/disableKillChatFeature";
import { getMyChatKills } from "../commands/killChat/getMyChatKills";
import { getCurrentChatKillsRanking } from "../commands/killChat/getChatKillsRanking";

export default (client: Client, prefix: string): void => {
  client.on("messageCreate", async (msg) => {
    if (
      msg.author.id === client?.user?.id ||
      msg.channel.type !== ChannelType.GuildText
    )
      return;

    // Note user last message
    noteUserLastMessage(msg);

    // Note if message is in kill chat channel
    noteKillChatChannelLastMessage(msg);

    const guild = guilds.get(msg.guild!.id);
    if (guild && guild.countdownChannels.includes(msg.channel.id)) {
      validateCountdownMessage(msg);
    }

    // Show help if bot is mentioned and message ends with "help"
    if (
      msg.mentions.has(client.user as User) &&
      (msg.content.endsWith("help") || msg.content.endsWith("pomoc"))
    ) {
      showHelp(msg);
    }

    if (
      msg.mentions.has(client.user as User) &&
      msg.content.endsWith("analyse messages")
    ) {
      getMessages(msg);
    }

    // Ignore messages that don't start with the prefix
    if (!msg.content.startsWith(prefix)) return;
    const message = msg.content.slice(1);

    if (message.startsWith("users") || message.startsWith("userzy")) {
      getUserList(msg);
    } else if (
      (message.toLowerCase().startsWith("odliczanie dodaj") ||
        message.toLowerCase().startsWith("countdown add")) &&
      msg.mentions.channels.size
    ) {
      addCountdownChannel(msg);
    } else if (
      (message.toLowerCase().startsWith("odliczanie usuń") ||
        message.toLowerCase().startsWith("countdown remove")) &&
      msg.mentions.channels.size
    ) {
      removeCountdownChannel(msg);
    } else if (
      message.toLowerCase().startsWith("odliczanie") ||
      message.toLowerCase().startsWith("countdown")
    ) {
      listCountdownChannel(msg);
    } else if (message.toLowerCase() === "huntchatkillers disable") {
      disableKillChatFeature(msg);
    } else if (message.toLowerCase().startsWith("huntchatkillers")) {
      setKillChatParameters(msg);
    } else if (message.toLowerCase() === "mychatkills") {
      getMyChatKills(msg);
    } else if (message.toLowerCase().startsWith("chatkills")) {
      getCurrentChatKillsRanking(msg);
    }
  });
};
