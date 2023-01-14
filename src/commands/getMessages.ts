import chalk from "chalk";
import dayjs from "dayjs";
import {
  ChannelType,
  Collection,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import { getUsersInGuild, User } from "../globals/users";

const noteMessage = (
  message: Message,
  users: Collection<string, User>,
  guildMembers: Collection<string, GuildMember>
) => {
  if (message.author.bot || !guildMembers.has(message.author.id)) return;

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
  }
};

const getMessagesInChannel = async (
  channel: TextChannel,
  guildMembers: Collection<string, GuildMember>,
  users: Collection<string, User>
) => {
  if (channel.viewable) {
    const firstMessage = await channel.messages.fetch({ limit: 1 });
    let messageCursor = firstMessage.size === 1 ? firstMessage.at(0) : null;
    let messageCount = messageCursor ? 1 : 0;
    if (messageCursor) {
      noteMessage(messageCursor, users, guildMembers);
    }

    while (messageCursor) {
      const nextMessages = await channel.messages.fetch({
        limit: 100,
        before: messageCursor.id,
      });

      for (const [key, message] of nextMessages) {
        noteMessage(message, users, guildMembers);
      }
      messageCount += nextMessages.size;
      messageCursor =
        nextMessages.size > 0 ? nextMessages.at(nextMessages.size - 1) : null;
    }
    return messageCount;
  } else {
    console.log(chalk.red("No permission to view channel:", channel.name));
    return 0;
  }
};

export const getMessages = async (msg: Message) => {
  if (!msg.guild) return;

  if (
    !msg.member?.permissionsIn(msg.channel as TextChannel).has("Administrator") && msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  // Get global state array of users for this guild
  const users = getUsersInGuild(msg.guild.id);

  // Get channels in guild
  let channels = (await msg.guild?.channels.fetch()) ?? new Collection();
  const textChannels = channels.filter((channel) => {
    return channel && channel.type === ChannelType.GuildText;
  });

  console.log("Started mapping messages");
  const startTime = dayjs();
  let totalCount = 0;

  // Get channel members
  const guildMembers =
    (await msg?.guild?.members?.fetch?.()) ?? new Collection();

  let progress = 0;
  console.log("Analyzing messages in channels...");
  for (const [key, channel] of textChannels) {
    const messageCountInChannel = await getMessagesInChannel(
      channel as TextChannel,
      guildMembers,
      users
    );
    totalCount += messageCountInChannel;
    progress++;
    console.log(
      `${chalk.yellow(
        Math.round((progress * 100) / textChannels.size),
        "%"
      )} - ${chalk.blue(messageCountInChannel)} messages in ${chalk.blue(
        channel?.name
      )}`
    );
  }
  console.log(
    "Done in",
    dayjs().diff(startTime, "s"),
    "s! Total messages fetched:",
    totalCount
  );
};
