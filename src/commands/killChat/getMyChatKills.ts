import {
  Message,
} from "discord.js";
import KillChatRanking from "../../models/KillChatRanking";
import dayjs from "dayjs";

export const getMyChatKills = async (msg: Message) => {
  if (!msg.guild) return;

  KillChatRanking.findOne({
    guildId: msg.guild.id,
    date: dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`),
  }).then((ranking) => {
    if(ranking) {
      const user = ranking.users.find((user) => user.userId === msg.author.id);
      if(user) {
        msg.reply(`Twoja liczba punktów w bieżącym miesiącu: ${user.points}`);
      } else {
        msg.reply("Nie masz punktów w bieżącym miesiącu");
      }
    } else {
      msg.reply("Nie odnaleziono rankingu dla bieżącego miesiąca");
    }  
  }).catch((err) => {
    console.log(err);
    msg.reply("Wystąpił błąd podczas pobierania danych.");
  });
};
