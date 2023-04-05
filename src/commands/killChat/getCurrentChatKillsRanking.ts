import { EmbedBuilder, Message } from "discord.js";
import KillChatRanking from "../../models/KillChatRanking";
import dayjs from "dayjs";

export const getCurrentChatKillsRanking = async (msg: Message) => {
  if (!msg.guild) return;

  KillChatRanking.findOne({
    guildId: msg.guild.id,
    date: dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`),
  })
    .then((ranking) => {
      if (ranking) {
        if(!ranking.users.length) {
          msg.reply("Nie pojawił się jeszcze żaden zabójca czatu w tym miesiącu");
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
        msg.reply({ embeds: [embed] });
      } else {
        msg.reply("Nie odnaleziono rankingu dla bieżącego miesiąca");
      }
    })
    .catch((err) => {
      console.log(err);
      msg.reply("Wystąpił błąd podczas pobierania danych.");
    });
};
