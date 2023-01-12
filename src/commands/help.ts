import { EmbedBuilder, Message } from "discord.js";

export const showHelp = async (msg: Message) => {
  let embed = new EmbedBuilder()
    .setTitle("User Manager - pomoc")
    .setThumbnail(process.env.THUMBNAIL_URL ?? "")
    .setDescription(
      `Użyj polecenia **${process.env.PREFIX}users** aby wyświetlić listę losowych użytkowników serwera.\n
        Możesz określić minimalną datę dołączenia użytkownika dopisując: **from <DD.MM.RRRR>**\n
        Możesz określić maksymalną datę dołączenia użytkownika dopisując: **to <DD.MM.RRRR>**\n
        Możesz określić maksymalną ilość użytkowników dopisując: **max <liczba>**
        `
    )
    .setFooter({
      text: "User Manager",
      iconURL: process.env.THUMBNAIL_URL ?? "",
    });
  msg.reply({ embeds: [embed] });
};
