import cron from "node-cron";
import { guilds } from "../globals/users";
import dayjs from "dayjs";
import KillChatRanking from "../models/KillChatRanking";
import GuildModel from "../models/Guild";
import { ChannelType, Client } from "discord.js";

export const catchChatKillersJob = (client: Client) => {
  cron.schedule("*/1 * * * *", () => {
    guilds.forEach((guild) => {
      // if (process.env.DEBUG === "true") {
      //   console.log(
      //     guild.killChatFeature?.channelId,
      //     guild.killChatFeature.lastMessageDate,
      //     dayjs().isSameOrAfter(
      //       dayjs().hour(guild.killChatFeature.activeFrom!)
      //     ),
      //     dayjs().isSameOrBefore(dayjs().hour(guild.killChatFeature.activeTo!)),
      //     dayjs().diff(dayjs(guild.killChatFeature.lastMessageDate), "m") >
      //       (guild.killChatFeature.raectAfter ?? 20)
      //   );
      // }

      if (
        guild.killChatFeature?.channelId &&
        guild.killChatFeature.lastMessageDate &&
        dayjs().isSameOrAfter(
          dayjs().hour(guild.killChatFeature.activeFrom!)
        ) &&
        dayjs().isSameOrBefore(dayjs().hour(guild.killChatFeature.activeTo!)) &&
        dayjs().diff(dayjs(guild.killChatFeature.lastMessageDate), "m") >
          (guild.killChatFeature.raectAfter ?? 20)
      ) {
        KillChatRanking.findOne({
          guildId: guild.id,
          date: dayjs(`${dayjs().year()}-${dayjs().month() + 1}-01`),
        }).then(async (ranking) => {
          try {
            let points = 1;
            if (ranking) {
              const index = ranking.users.findIndex(
                (user) => user.userId === guild.killChatFeature.lastMessageUser
              );
              if (index !== -1) {
                ranking.users[index].points!++;
                points = ranking.users[index].points!;
              } else {
                ranking.users.push({
                  userId: guild.killChatFeature.lastMessageUser,
                  points: 1,
                });
              }
              await ranking.save();
            } else {
              await KillChatRanking.create({
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
            await GuildModel.findOneAndUpdate(
              {
                guildId: guild.id,
              },
              {
                $set: {
                  "killChatFeature.lastMessageDate": null,
                },
              }
            );

            const discordGuild = await client.guilds.fetch(guild.id);
            if (!discordGuild) return;
            const channel = await discordGuild.channels.fetch(
              guild.killChatFeature.channelId!
            );
            if (!channel || channel.type !== ChannelType.GuildText) return;
            channel.send(
              `Gratulacje, <@${guild.killChatFeature.lastMessageUser}>! Udało ci się zabić czat. Twoje punkty: ${points}`
            );
          } catch (err) {
            console.log(err);
          }
        });
      }
    });
  });
};
