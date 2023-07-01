import { EmbedBuilder, Message } from "discord.js";
import KillChatRanking from "../../models/KillChatRanking";
import dayjs from "dayjs";

export const getCurrentChatKillsRanking = async (msg: Message) => {
  if (!msg.guild) return;

  const groups = /chatkills ?(\d{4}.\d{2})?$/g.exec(msg.content);
  const dateFromParams = groups?.[1] ? dayjs(`${groups[1]}.01`) : null;

  if (dateFromParams && dateFromParams.isValid()) {
    KillChatRanking.findOne({
      guildId: msg.guild.id,
      date: dateFromParams,
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
  } else {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    KillChatRanking.aggregate([
      {
        $match: {
          guildId: msg.guild.id,
          date: {
            $gte: startOfYear,
            $lt: endOfYear,
          },
        },
      },
      {
        $unwind: "$users",
      },
      {
        $group: {
          _id: "$users.userId",
          username: { $first: "$users.username" },
          totalPoints: { $sum: "$users.points" },
        },
      },
      {
        $sort: { totalPoints: -1 },
      },
    ])
      .exec()
      .then((result) => {
        if (!result.length) {
          msg.reply("Nie pojawił się jeszcze żaden zabójca czatu w tym roku");
          return;
        }
        let message = "";
        result.forEach((user, index) => {
          message += `${index + 1}. <@${user._id}>: ${user.totalPoints}\n`;
        });
        let embed = new EmbedBuilder()
          .setTitle(`Ranking zabójców czatu (${dayjs().year()}):\n`)
          .setDescription(message);
        msg.reply({ embeds: [embed] });
      })
      .catch((err) => {
        console.error(err);
        msg.reply("Wystąpił błąd podczas pobierania danych.");
      });
  }
};
