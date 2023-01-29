import { guilds } from "./../globals/users";
import { Message, TextChannel } from "discord.js";
import Guild from "../models/Guild";

export const removeCountdownChannel = async (msg: Message) => {
  if (!msg.guild || !msg.mentions.channels.size) return;

  if (
    !msg.member
      ?.permissionsIn(msg.channel as TextChannel)
      .has("Administrator") &&
    msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  const channelID = msg.mentions.channels.first()!.id;

  Guild.findOne({ guildId: msg.guild.id })
    .then((guild) => {
      if (guild) {
        if (!guild.countdownChannels.includes(channelID!))
          return msg.reply(
            "Ten kanał nie jest ustawiony jako kanał odliczania"
          );
        guild.countdownChannels.splice(
          guild.countdownChannels.indexOf(channelID!),
          1
        );
        guild
          .save()
          .then(() => {
            const guildInState = guilds.get(msg.guild!.id);
            guildInState?.countdownChannels.splice(
              guildInState?.countdownChannels.indexOf(channelID!),
              1
            );
            msg.reply(`Usunięto kanał odliczania <#${channelID}>`);
          })
          .catch((err) => {
            msg.reply(`Wystiąpił błąd przy usuwaniu kanału odliczania`);
          });
      } else {
        return msg.reply("Ten kanał nie jest ustawiony jako kanał odliczania");
      }
    })
    .catch((err) => {
      msg.reply(
        `Wystiąpił błąd przy usuwaniu kanału odliczania. Nie odnaleziono serwera.`
      );
    });
};
