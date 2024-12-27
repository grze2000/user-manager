import { Client, Collection } from "discord.js";
import { guilds, state, User } from "./../globals/users";

export default (client: Client): void => {
  client.on("guildCreate", async (guild) => {
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
  });
};
