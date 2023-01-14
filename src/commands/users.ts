import dayjs from "dayjs";
import {
  Collection,
  EmbedBuilder,
  GuildMember,
  Message,
  TextChannel,
} from "discord.js";
import { shuffleArray } from "../utils/shuffleArray";
import Guild from "../models/Guild";

export const getUserList = async (msg: Message) => {
  if (
    process.env.REQUIRE_ADMIN === "true" &&
    !msg.member?.permissionsIn(msg.channel as TextChannel).has("Administrator")
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  const startTime = dayjs();
  let message = msg.content.slice(1);
  // Get guild members
  let members = (await msg.member?.guild?.members?.fetch()) ?? new Collection();
  if (process.env.DEBUG === "true") {
    console.log(
      `[${new Date().toLocaleString()}] Guild: ${
        msg.guild?.name
      }. Fetched members: ${members.size}`
    );
  }

  // Filter members
  // Filter from date regex
  const fromRegexMatch = message.match(/(from|od) (\d{1,2}\.\d{1,2}\.\d{4})/);
  if (fromRegexMatch) {
    if (!dayjs(fromRegexMatch[2], "DD.MM.YYYY").isValid()) {
      return msg.reply(
        "Nieprawidłowa data początkowa. Poprawny format: DD.MM.RRRR"
      );
    }
  }

  // Filter to date regex
  const toRegexMatch = message.match(/(to|do) (\d{1,2}\.\d{1,2}\.\d{4})/);
  if (toRegexMatch) {
    if (!dayjs(toRegexMatch[2], "DD.MM.YYYY").isValid()) {
      return msg.reply(
        "Nieprawidłowa data końcowa. Poprawny format: DD.MM.RRRR"
      );
    }
  }

  members = members.filter((member: GuildMember) => {
    // Filter from date
    const filterFrom =
      !fromRegexMatch ||
      dayjs(member.joinedAt).isAfter(dayjs(fromRegexMatch[2], "DD.MM.YYYY"));

    // Filter to date
    const filterTo =
      !toRegexMatch ||
      dayjs(member.joinedAt).isBefore(dayjs(toRegexMatch[2], "DD.MM.YYYY"));

    return !member.user.bot && filterFrom && filterTo;
  });

  let membersArray = Array.from(members.values());
  shuffleArray(membersArray);
  const limitRegex = message.match(/max (\d+)/);
  membersArray = membersArray.slice(
    0,
    limitRegex ? parseInt(limitRegex[1]) : 10
  );

  // Find users in DB and get their last message date
  const guildData = await Guild.findOne({ guildId: msg.guild?.id });

  const memberList = membersArray.map((member) => {
    let userString = `${member.user} ${member.user.tag}${
      member.nickname ? ` - ${member.nickname}` : ""
    }`;
    if(guildData) {
      const user = guildData.users.find(user => user.userId === member.user.id);
      if(user) {
        userString += ` - Ostatnia wiadomość: ${dayjs(user.lastMessage).format("DD.MM.YYYY HH:mm")}`;
      }
    }
    return userString;
  });

  if (memberList.length) {
    if (process.env.USE_EMBED === "true") {
      let embed = new EmbedBuilder().setDescription(memberList.join("\n"));
      msg.reply({ embeds: [embed] });
    } else {
      msg.reply({ content: memberList.join("\n") });
    }
  } else {
    return msg.reply("Brak użytkowników spełniających podane kryteria");
  }

  if (process.env.DEBUG === "true") {
    const timeElapsed = dayjs().diff(startTime, "ms");
    console.log(
      `[${new Date().toLocaleString()}] Executed command "${message}" in ${timeElapsed}ms.`
    );
  }
};
