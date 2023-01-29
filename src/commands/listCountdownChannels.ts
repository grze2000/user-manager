import { Message, TextChannel } from "discord.js";
import Guild from "../models/Guild";

export const listCountdownChannel = async (msg: Message) => {
  if (!msg.guild) return;

  if (
    !msg.member
      ?.permissionsIn(msg.channel as TextChannel)
      .has("Administrator") &&
    msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  Guild.findOne({ guildId: msg.guild.id })
    .then((guild) => {
      if (guild) {
        if (guild.countdownChannels.length) {
          let channels = guild.countdownChannels
            .map((channelId) => `<#${channelId}>`)
            .join(", ");
          return msg.reply(`Ustawione kanały odliczania: ${channels}`);
        } else {
          return msg.reply(`Nie ustawiono żadnych kanałów odliczania.`);
        }
      } else {
        return msg.reply(`Wystiąpił błąd. Nie odnaleziono serwera.`);
      }
    })
    .catch((err) => {
      msg.reply(`Wystiąpił błąd. Nie odnaleziono serwera.`);
    });
};
