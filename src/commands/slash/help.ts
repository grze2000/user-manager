import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Wyświetla informacje o dostępnych komendach"),

  async execute(interaction: ChatInputCommandInteraction) {
    const commandsPath = path.join(__dirname, "..", "slash");
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

    const commandsList = commandFiles.map((file) => {
      const command = require(path.join(commandsPath, file)).default;
      return `**/${command.data.name}** - ${command.data.description}`;
    });

    const embed = new EmbedBuilder()
      .setTitle("Borsuk - pomoc")
      .setThumbnail(process.env.THUMBNAIL_URL ?? "")
      .setDescription(
        `Oto lista dostępnych komend:\n\n${commandsList.join("\n")}
        
        --------------------- Odliczanie ---------------------
        **${
          process.env.PREFIX
        }countdown** - wyświetla listę ustawionych kanałów odliczania
        **${
          process.env.PREFIX
        }countdown add #nazwa-kanału** - włącza odliczanie na podanym kanale
        **${
          process.env.PREFIX
        }countdown remove #nazwa-kanału** - wyłącza odliczanie na podanym kanale

        --------------------- Zabójcy czatu ---------------------
        **${
          process.env.PREFIX
        }huntchatkillers #nazwa-kanału <od godziny> <do godziny> <czas nieaktywności(min)>** - ustawia parametry łowów: kanał, czas działania oraz czas nieaktywności
        **${
          process.env.PREFIX
        }huntchatkillers disable** - wyłącza polowanie na zabójców czatu
        **${
          process.env.PREFIX
        }chatkills** - wyświetla ranking zabójców czatu dla bieżącego miesiąca
        **${
          process.env.PREFIX
        }chatkills <RRRR.MM>** - wyświetla ranking zabójców czatu dla podanego miesiąca np. **chatkills 2023.01**
        **${
          process.env.PREFIX
        }mychatkills** - wyświetla liczbę punktów zdobytych przez użytkownika`
      )
      .setFooter({
        text: "Borsuk",
        iconURL: process.env.THUMBNAIL_URL ?? "",
      });

    await interaction.reply({ embeds: [embed] });
  },
};
