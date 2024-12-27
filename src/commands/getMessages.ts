import chalk from "chalk";
import dayjs from "dayjs";
import {
  ChannelType,
  Collection,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import { getUsersInGuild, guilds, state, User } from "../globals/users";

const noteMessage = (
  message: Message,
  users: Collection<string, User>,
  guildMembers: Collection<string, GuildMember>
) => {
  if (message.author.bot || !guildMembers.has(message.author.id)) return;

  if (
    !users.has(message.author.id) ||
    !users.get(message.author.id)?.lastMessage?.date ||
    dayjs(message.createdAt).isAfter(
      dayjs(users.get(message.author.id)?.lastMessage?.date)
    )
  ) {
    users.set(message.author.id, {
      username: message.author.tag,
      lastMessage: {
        messageId: message.id,
        channelId: message.channel.id,
        content: message.content,
        date: dayjs(message.createdAt).toDate(),
      },
    });
  }
};

const getMessagesInChannel = async (
  channel: TextChannel,
  guildMembers: Collection<string, GuildMember>,
  users: Collection<string, User>,
  maxDate: dayjs.Dayjs
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

      let index = 1;
      for (const [key, message] of nextMessages) {
        if (dayjs(message.createdAt).isBefore(maxDate)) {
          console.log(
            `[${new Date().toLocaleString()}] Stopped reading ${
              channel.name
            } at ${dayjs(message.createdAt).format(
              "DD.MM.YYYY"
            )} Messages count ${messageCount + index}`
          );
          return messageCount + index;
        }
        noteMessage(message, users, guildMembers);
        index++;
      }
      messageCount += nextMessages.size;
      messageCursor =
        nextMessages.size > 0 ? nextMessages.at(nextMessages.size - 1) : null;
    }
    return messageCount;
  } else {
    console.log(
      chalk.red(
        `[${new Date().toLocaleString()}] No permission to view channel: ${
          channel.name
        }`
      )
    );
    return 0;
  }
};

export const getMessages = async (msg: Message, date: string) => {
  if (!msg.guild) return;

  if (
    !msg.member
      ?.permissionsIn(msg.channel as TextChannel)
      .has("Administrator") &&
    msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  const maxDate = dayjs(date);

  if (!maxDate.isValid() || !maxDate.isBefore(dayjs())) {
    return msg.reply("Podano nieprawidłową datę");
  }

  // Get global state array of users for this guild
  const users = getUsersInGuild(msg.guild.id);

  // Get channels in guild
  let channels = (await msg.guild?.channels.fetch()) ?? new Collection();
  const textChannels = channels.filter((channel) => {
    return channel && channel.type === ChannelType.GuildText;
  });

  const guild = guilds.get(msg.guild.id);
  if (guild) {
    guild.activityCheckToDate = new Date();
    state.unsavedChanges = true;
  }

  console.log(`[${new Date().toLocaleString()}] Started mapping messages`);
  const startTime = dayjs();
  let totalCount = 0;

  // Get channel members
  const guildMembers =
    (await msg?.guild?.members?.fetch?.()) ?? new Collection();

  guildMembers.forEach((member) => {
    if (!users.has(member.id) && !member.user.bot) {
      users.set(member.id, {
        username: member.user.tag,
        lastMessage: undefined,
      });
    } else {
      const existingUser = users.get(member.id);
      if (existingUser) {
        existingUser.lastMessage = undefined;
      }
    }
  });

  let progress = 0;
  console.log(
    `[${new Date().toLocaleString()}] Analyzing messages in channels...`
  );
  for (const [key, channel] of textChannels) {
    const messageCountInChannel = await getMessagesInChannel(
      channel as TextChannel,
      guildMembers,
      users,
      maxDate
    );
    totalCount += messageCountInChannel;
    progress++;
    console.log(
      `[${new Date().toLocaleString()}] ${chalk.yellow(
        Math.round((progress * 100) / textChannels.size),
        "%"
      )} - ${chalk.blue(messageCountInChannel)} messages in ${chalk.blue(
        channel?.name
      )}`
    );
  }
  console.log(
    `[${new Date().toLocaleString()}] `,
    "Done in",
    dayjs().diff(startTime, "s"),
    "s! Total messages fetched:",
    totalCount
  );
};
