import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Odpowiada z komunikatem pong"),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply("Pong! 🏓");
  },
};
