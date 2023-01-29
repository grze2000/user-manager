import { guilds } from "./../globals/users";
import {
  ChannelType,
  GuildChannelResolvable,
  Message,
  TextChannel,
} from "discord.js";
import Guild from "../models/Guild";

export const addCountdownChannel = async (msg: Message) => {
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

  if (
    !msg
      .guild!.members.me!.permissionsIn(
        msg.mentions.channels.first()! as GuildChannelResolvable
      )
      .has("ViewChannel")
  ) {
    return msg.reply("Nie mam uprawnień do tego kanału");
  }

  if (msg.mentions.channels.first()!.type !== ChannelType.GuildText) {
    return msg.reply("Można dodać odliczanie tylko w kanałach tekstowych");
  }

  Guild.findOne({ guildId: msg.guild.id })
    .then((guild) => {
      if (guild) {
        if (guild.countdownChannels.includes(channelID!))
          return msg.reply(
            "Ten kanał jest już ustawiony jako kanał odliczania"
          );
        guild.countdownChannels.push(channelID!);
        guild
          .save()
          .then(() => {
            guilds.get(msg.guild!.id)?.countdownChannels.push(channelID);
            msg.reply(`Ustawiono kanał odliczania <#${channelID}>`);
          })
          .catch((err) => {
            msg.reply(`Wystiąpił błąd przy dodawaniu kanału odliczania`);
          });
      } else {
        Guild.create({
          guildId: msg.guild!.id,
          countdownChannels: [channelID],
        })
          .then(() => {
            guilds.get(msg.guild!.id)?.countdownChannels.push(channelID);
            msg.reply(`Ustawiono kanał odliczania <#${channelID}>`);
          })
          .catch((err) => {
            msg.reply(`Wystiąpił błąd przy dodawaniu kanału odliczania`);
          });
      }
    })
    .catch((err) => {
      msg.reply(
        `Wystiąpił błąd przy dodawaniu kanału odliczania. Nie odnaleziono serwera.`
      );
    });
};
