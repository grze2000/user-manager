import { ChannelType, Client, Message, User } from "discord.js";
import { addCountdownChannel } from "../commands/addCountdownChannel";
import { getMessages } from "../commands/getMessages";
import { disableKillChatFeature } from "../commands/killChat/disableKillChatFeature";
import { getCurrentChatKillsRanking } from "../commands/killChat/getChatKillsRanking";
import { getMyChatKills } from "../commands/killChat/getMyChatKills";
import { setKillChatParameters } from "../commands/killChat/setKillChatParameters";
import { listCountdownChannel } from "../commands/listCountdownChannels";
import { removeCountdownChannel } from "../commands/removeCountdownChannel";
import { getUserList } from "../commands/users";
import { noteKillChatChannelLastMessage } from "../functions/noteKillChatChannelLastMessage";
import { noteUserLastMessage } from "../functions/noteUserLastMessage";
import { validateCountdownMessage } from "../functions/validateCountdownMessage";
import { guilds } from "../globals/users";

export default {
  name: "messageCreate",
  execute: async (msg: Message, client: Client, prefix: string) => {
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

    // Handle "analyse messages YYYY-DD-MM"
    if (msg.mentions.has(client.user as User)) {
      const datePattern = /analyse messages (\d{4}-\d{2}-\d{2})$/;
      const match = msg.content.match(datePattern);
      if (match) {
        const date = match[1];
        getMessages(msg, date);
      }
    }

    // Ignore messages that don't start with the prefix
    if (!msg.content.startsWith(prefix)) return;
    const message = msg.content.slice(prefix.length).trim();

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
  },
};
