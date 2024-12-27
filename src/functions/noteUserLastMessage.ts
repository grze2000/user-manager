import dayjs from "dayjs";
import { Message } from "discord.js";
import { getUsersInGuild, state } from "../globals/users";

export const noteUserLastMessage = async (message: Message) => {
  if (!message.guild?.id) return;
  const users = getUsersInGuild(message.guild?.id);

  if (
    !users.has(message.author.id) ||
    !message.author.bot ||
    dayjs(message.createdAt).isAfter(
      dayjs(users.get(message.author.id)?.lastMessage?.date)
    )
  ) {
    users.set(message.author.id, {
      username: message.author.tag,
      lastMessage: {
        messageId: message.id,
        channelId: message.channel.id,
        date: dayjs(message.createdAt).toDate(),
        content: message.content,
      },
    });
    state.unsavedChanges = true;
  }
};
