import { Collection, Guild } from "discord.js";
import fs from "fs";

export const getGuildChannels = async (guild: Guild) => {
  const channels =
    (await guild?.channels.fetch()) ?? new Collection();

  fs.truncate(`data/channels_${guild.id}.txt`, 0, () => {})
  const stream = fs.createWriteStream(`data/channels_${guild.id}.txt`, { flags: "a" });
  for (const [key, channel] of channels) {
    if(!channel) continue;
    stream.write(`${channel.type}\t${channel.viewable}\t${channel.id}\t${channel.name}\n`);
  }

  stream.end();
};
