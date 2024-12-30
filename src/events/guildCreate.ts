import { Collection, Events, Guild } from "discord.js";
import { guilds, state, User } from "../globals/users";

export default {
  name: Events.GuildCreate,
  async execute(guild: Guild) {
    if (!guilds.has(guild.id)) {
      guilds.set(guild.id, {
        id: guild.id,
        name: guild.name,
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

      state.unsavedChanges = true;
    }

    console.info(
      `[${new Date().toLocaleString()}] Added to guild: ${guild.name}!`
    );
  },
};
