import { EmbedBuilder, Message } from "discord.js";
import KillChatRanking from "../../models/KillChatRanking";
import dayjs from "dayjs";

export const getCurrentChatKillsRanking = async (msg: Message) => {
  if (!msg.guild) return;

  const groups = /chatkills ?(\d{4}.\d{2})?$/g.exec(msg.content);
  const dateFromParams = groups?.[1] ? dayjs(`${groups[1]}.01`) : null;
  const date =
    dateFromParams && dateFromParams.isValid()
      ? dateFromParams
      : dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`);

  KillChatRanking.findOne({
    guildId: msg.guild.id,
    date: date,
  })
    .then((ranking) => {
      if (ranking) {
        if (!ranking.users.length) {
          msg.reply(
            "Nie pojawił się jeszcze żaden zabójca czatu w tym miesiącu"
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
        msg.reply({ embeds: [embed] });
      } else {
        msg.reply("Nie odnaleziono rankingu");
      }
    })
    .catch((err) => {
      console.log(err);
      msg.reply("Wystąpił błąd podczas pobierania danych.");
    });
};
