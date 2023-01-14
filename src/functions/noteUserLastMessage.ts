import dayjs from "dayjs";
import { Message } from "discord.js";
import { getUsersInGuild, guilds, state } from "../globals/users";

export const noteUserLastMessage = async (message: Message) => {
  if(!message.guild?.id) return;
  const users = getUsersInGuild(message.guild?.id);

  if (
    !users.has(message.author.id) ||
    !message.author.bot ||
    dayjs(message.createdAt).isAfter(
      dayjs(users.get(message.author.id)?.lastMessage)
    )
  ) {
    users.set(message.author.id, {
      username: message.author.tag,
      lastMessage: dayjs(message.createdAt).toISOString(),
    });
    state.unsavedChanges = true;
  }
};
