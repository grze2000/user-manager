import { Message } from "discord.js";
import { guilds } from "../globals/users";
import GuildModel from "../models/Guild";

export const noteKillChatChannelLastMessage = async (message: Message) => {
  if (!message.guild?.id) return;
  const guild = guilds.get(message.guild.id);
  if (
    !guild?.killChatFeature.channelId ||
    guild.killChatFeature.channelId !== message.channel.id ||
    message.member?.user.bot
  )
    return;
  guild.killChatFeature.lastMessageDate = message.createdAt;
  guild.killChatFeature.lastMessageUser = message.author.id;
  GuildModel.findOneAndUpdate(
    {
      guildId: message.guild.id,
    },
    {
      killChatFeature: guild.killChatFeature,
    }
  ).catch((err) => {
    console.log(err);
  });
};
