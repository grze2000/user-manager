import cron from "node-cron";
import { guilds, state } from "../globals/users";
import Guild from "../models/Guild";

export const saveUsersToDbJob = () => {
  cron.schedule("*/30 * * * * *", () => {
    if (!state.unsavedChanges) return;

    guilds.forEach((guild) => {
      Guild.findOne({ guildId: guild.id }).then((guildDoc) => {
        if (!guildDoc) {
          guildDoc = new Guild({
            guildId: guild.id,
            guildName: guild.name,
            users: [],
          });
        }
        guildDoc.users = guild.users.map((user, userId) => {
          return {
            userId: userId,
            username: user.username,
            lastMessage: user.lastMessage,
          };
        });
        guildDoc.activityCheckToDate = guild.activityCheckToDate;
        guildDoc.save();
      });
    });
  });
};
