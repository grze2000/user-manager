import dayjs from "dayjs";
import { Collection, EmbedBuilder, GuildMember, Message } from "discord.js";
import { shuffleArray } from "../utils/shuffleArray";

export const getUserList = async (msg: Message) => {
  const startTime = dayjs();
  let message = msg.content.slice(1);
  // Get guild members
  let members = (await msg.member?.guild?.members?.fetch()) ?? new Collection();
  if (process.env.DEBUG === "true") {
    console.log(
      `[${new Date().toLocaleString()}] Guild: ${
        msg.member?.guild?.name
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

  const memberList = membersArray.map((member) => {
    return `${member.user} ${member.user.tag}${member.nickname ? ` - ${member.nickname}` : ""}`;
  });

  if (memberList.length) {
    let embed = new EmbedBuilder().setDescription(memberList.join("\n"));
    msg.reply({ embeds: [embed] });
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
