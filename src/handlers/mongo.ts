import { Collection } from 'discord.js';
import mongoose from "mongoose";
import { guilds, User } from "../globals/users";
import Guild from "../models/Guild";

export const handleDbConnection = () => {
  if (!process.env.MONGO_URI) {
    return console.log("No MONGO_URI provided!");
  }
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log(`[${new Date().toLocaleString()}] Connected to MongoDB!`);

      // Load guilds from DB
      Guild.find().then((guildsFromDb) => {
        guildsFromDb.forEach((guild) => {
          const users = new Collection<string, User>();
          guild.users.forEach((user) => {
            users.set(user.userId, {
              username: user.username,
              lastMessage: user.lastMessage.toISOString(),
            });
          });

          guilds.set(guild.guildId, {
            id: guild.guildId,
            users,
            countdownChannels: guild.countdownChannels || []
          });
        });
      });
    })
    .catch((err) => {
      console.log(`[${new Date().toLocaleString()}] Failed to connect to MongoDB!`);
    });
};
