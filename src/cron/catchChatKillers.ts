import cron from "node-cron";
import { guilds } from "../globals/users";
import dayjs from "dayjs";
import KillChatRanking from "../models/KillChatRanking";
import GuildModel from "../models/Guild";
import { ChannelType, Client } from "discord.js";

export const catchChatKillersJob = (client: Client) => {
  cron.schedule("*/1 * * * *", () => {
    console.log(`${new Date().toLocaleString()} - run cron`);

    guilds.forEach((guild) => {
      // jeżeli killchat jest aktywny
      // jeżeli godzna jest większa od activeFrom
      // jeżeli godzina jest mniejsza od activeTo
      // jeżeli data ostatniej wiadomości jest większa od activeFrom
      // jeżeli od ostatniej wiadomości minęło więcej niż reactAfter
      // dopisz punkt użytkownikowi lastMessageUser

      console.log(
        guild.killChatFeature?.channelId,
        guild.killChatFeature.lastMessageDate,
        dayjs().isAfter(dayjs().hour(guild.killChatFeature.activeFrom!)),
        dayjs().isBefore(dayjs().hour(guild.killChatFeature.activeTo!)),
        dayjs().diff(dayjs(guild.killChatFeature.lastMessageDate), "m") >
          (guild.killChatFeature.raectAfter ?? 20)
      );

      if (
        guild.killChatFeature?.channelId &&
        guild.killChatFeature.lastMessageDate &&
        dayjs().isAfter(dayjs().hour(guild.killChatFeature.activeFrom!)) &&
        dayjs().isBefore(dayjs().hour(guild.killChatFeature.activeTo!)) &&
        dayjs().diff(dayjs(guild.killChatFeature.lastMessageDate), "m") >
          (guild.killChatFeature.raectAfter ?? 20)
      ) {
        KillChatRanking.findOne({
          guildId: guild.id,
          date: dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`),
        }).then((ranking) => {
          if (ranking) {
            const index = ranking.users.findIndex(
              (user) => user.userId === guild.killChatFeature.lastMessageUser
            );
            if (index !== -1) {
              ranking.users[index].points!++;
            } else {
              ranking.users.push({
                userId: guild.killChatFeature.lastMessageUser,
                points: 1,
              });
            }
            ranking.save();
          } else {
            KillChatRanking.create({
              guildId: guild.id,
              date: dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`),
              users: [
                {
                  userId: guild.killChatFeature.lastMessageUser,
                  points: 1,
                },
              ],
            });
          }
          const guildFromVar = guilds.get(guild.id);
          guildFromVar!.killChatFeature.lastMessageDate = undefined;
          GuildModel.findOneAndUpdate({
            guildId: guild.id,
          }, {
            $set: {
              "killChatFeature.lastMessageDate": null,
            }
        }).catch((err) => {
          console.log(err);
        });
          // TODO - add safety checks, add user points to message
          client.guilds.fetch(guild.id).then((discordGuild) => {
            discordGuild.channels.fetch(guild.killChatFeature.channelId!).then((channel) => {
              if(!channel || channel.type !== ChannelType.GuildText) return;
              channel.send(`Gratulacje, <@${guild.killChatFeature.lastMessageUser}>! Udało ci się zabić czat`);
            });
          });
        });
      }
    });
  });
};
