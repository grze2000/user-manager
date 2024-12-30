import { Events, Interaction } from "discord.js";
import { CustomClient } from "../client";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: CustomClient) {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    // Globalna weryfikacja uprawnień
    const testerId = process.env.TESTER_ID;
    const isAdmin = interaction.memberPermissions?.has("Administrator");
    const isTester = interaction.user.id === testerId;

    if (!isAdmin && !isTester) {
      await interaction.reply({
        content:
          "Nie masz uprawnień do użycia tej komendy. Wymagane uprawnienia: Administrator.",
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  },
};
