import { Collection } from "discord.js";

export interface User {
  username: string;
  lastMessage: string;
}

export interface Guild {
  id: string;
  users: Collection<string, User>;
  countdownChannels: string[];
}

export let guilds = new Collection<string, Guild>();

export let state = {
  unsavedChanges: false,
}

export const getUsersInGuild = (guildId: string): Collection<string, User> => {
  if (!guilds.has(guildId)) {
    guilds.set(guildId, {
      id: guildId,
      users: new Collection<string, User>(),
      countdownChannels: [],
    });
  }
  return guilds.get(guildId)!.users;
};
