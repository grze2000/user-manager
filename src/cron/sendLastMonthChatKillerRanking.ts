import cron from "node-cron";
import { guilds } from "../globals/users";
import dayjs from "dayjs";
import KillChatRanking from "../models/KillChatRanking";
import { ChannelType, Client, EmbedBuilder } from "discord.js";

export const sendLastMonthChatKillerRanking = (client: Client) => {
  cron.schedule("0 0 1 * *", () => {
    console.log('cron');
    guilds.forEach((guild) => {
      if (
        guild.killChatFeature?.channelId
      ) {
        KillChatRanking.findOne({
          guildId: guild.id,
          date: dayjs(`${dayjs().subtract(1, 'M').year()}-${dayjs().subtract(1, 'M').month()+1}-01`),
        }).then(async (ranking) => {
          const channel = client.channels.cache.get(guild.killChatFeature.channelId!);
          if (ranking && channel && channel.type === ChannelType.GuildText) {
            if (!ranking.users.length) {
              channel.send(
                "W poprzednim miesiącu nikomu nie udało się zabić czatu :("
              );
              return;
            }
            ranking.users.sort((a, b) => b.points! - a.points!);
            const date = dayjs(ranking.date);
            let message = "";
            ranking.users.forEach((user, index) => {
              message += `${index + 1}. <@${user.userId}>: ${user.points}\n`;
            });
            let embed = new EmbedBuilder()
              .setTitle(
                `Ranking zabójców czatu (${date.month() + 1 < 10 ? "0" : ""}${
                  date.month() + 1
                }.${date.year()}):\n`
              )
              .setDescription(message);
              channel.send({ embeds: [embed] });
          }
        });
      }
    });
  });
};
