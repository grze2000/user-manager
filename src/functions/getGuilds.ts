import { Client } from "discord.js";
import fs from "fs";

export const getGuilds = async (client: Client) => {
  const guilds = await client.guilds.fetch();
  const stream = fs.createWriteStream("data/guilds.txt", { flags: "a" });
  for (const [key, guild] of guilds) {
    stream.write(`${guild.id} ${guild.name}\n`);
  }
  stream.end();
};
