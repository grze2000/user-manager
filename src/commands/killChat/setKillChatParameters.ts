import { Guild as GuildType, guilds } from "../../globals/users";
import {
  ChannelType,
  GuildChannelResolvable,
  Message,
  TextChannel,
} from "discord.js";
import Guild from "../../models/Guild";

export const setKillChatParameters = async (msg: Message) => {
  if (!msg.guild || !msg.mentions.channels.size)
    return msg.reply("Niepoprawne użycie komendy");

  if (
    !msg.member
      ?.permissionsIn(msg.channel as TextChannel)
      .has("Administrator") &&
    msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  const channelID = msg.mentions.channels.first()!.id;

  const groups = /killchat <#\d+> (\d+) (\d+) (\d+)$/g.exec(msg.content);
  if (!groups) return msg.reply("Niepoprawne użycie komendy");

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
    return msg.reply(
      "Nadzorowanie aktywności można ustawić tylko na kanale tekstowym"
    );
  }

  Guild.findOne({ guildId: msg.guild.id })
    .then((guild) => {
      const settings = {
        channelId: channelID,
        activeFrom: parseInt(groups[1]),
        activeTo: parseInt(groups[2]),
        raectAfter: parseInt(groups[3]),
      };
      if (guild) {
        if (guild.killChatFeature === channelID)
          return msg.reply("Ten kanał jest już ustawiony");
        const guildFromVar = guilds.get(msg.guild!.id);
        guild.killChatFeature = {
          ...guild.killChatFeature,
          ...settings,
        };
        guild
          .save()
          .then(() => {
            if (guildFromVar) {
              guildFromVar.killChatFeature.channelId = channelID;
              guildFromVar.killChatFeature.activeFrom = parseInt(groups[1]);
              guildFromVar.killChatFeature.activeTo = parseInt(groups[2]);
              guildFromVar.killChatFeature.raectAfter = parseInt(groups[3]);
            }
            msg.reply(`Zapisano zmiany`);
          })
          .catch((err) => {
            msg.reply(`Wystiąpił błąd przy zapisywaniu zmian`);
          });
      } else {
        Guild.create({
          guildId: msg.guild!.id,
          killChatFeature: settings,
        })
          .then(() => {
            const guild = guilds.get(msg.guild!.id) as GuildType;
            guilds.set(msg.guild!.id, {
              ...guild,
              killChatFeature: settings,
            });
            msg.reply(`Zapisano zmiany`);
          })
          .catch((err) => {
            msg.reply(`Wystiąpił błąd przy zapisywaniu zmian`);
          });
      }
    })
    .catch((err) => {
      msg.reply(`Wystiąpił błąd. Nie odnaleziono serwera.`);
    });
};
