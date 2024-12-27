import { Collection } from "discord.js";

export interface User {
  username: string;
  lastMessage?: {
    messageId: string;
    channelId: string;
    date: Date;
    content?: string;
  };
}

export interface Guild {
  id: string;
  name: string;
  users: Collection<string, User>;
  countdownChannels: string[];
  killChatFeature: {
    channelId?: string;
    activeFrom?: number;
    activeTo?: number;
    raectAfter?: number;
    lastMessageDate?: Date;
    lastMessageUser?: string;
  };
  activityCheckToDate?: Date;
}

export let guilds = new Collection<string, Guild>();

export let state = {
  unsavedChanges: false,
};

export const getUsersInGuild = (guildId: string): Collection<string, User> => {
  if (!guilds.has(guildId)) {
    guilds.set(guildId, {
      id: guildId,
      name: "",
      users: new Collection<string, User>(),
      countdownChannels: [],
      killChatFeature: {
        channelId: undefined,
        activeFrom: undefined,
        activeTo: undefined,
        raectAfter: undefined,
        lastMessageDate: undefined,
        lastMessageUser: undefined,
      },
    });
  }
  return guilds.get(guildId)!.users;
};
