import { EmbedBuilder, Message } from "discord.js";

export const showHelp = async (msg: Message) => {
  let embed = new EmbedBuilder()
    .setTitle("Borsuk - pomoc")
    .setThumbnail(process.env.THUMBNAIL_URL ?? "")
    .setDescription(
      `Użyj polecenia **${process.env.PREFIX}users** aby wyświetlić listę losowych użytkowników serwera.\n
        Możesz określić minimalną datę dołączenia użytkownika dopisując: **from <DD.MM.RRRR>**\n
        Możesz określić maksymalną datę dołączenia użytkownika dopisując: **to <DD.MM.RRRR>**\n
        Możesz określić maksymalną ilość użytkowników dopisując: **max <liczba>**\n
        --------------------- Odliczanie ---------------------\n
        **${process.env.PREFIX}countdown** - wyświetla listę ustawionych kanałów odliczania\n
        **${process.env.PREFIX}countdown add #nazwa-kanału** - włącza odliczanie na podanym kanale\n
        **${process.env.PREFIX}countdown remove #nazwa-kanału** - wyłącza odliczanie na podanym kanale\n
        --------------------- Zabójcy czatu ---------------------\n
        **${process.env.PREFIX}huntchatkillers #nazwa-kanału <od godziny> <do godziny> <czas nieaktywności(min)>** - ustawia parametry łowów: kanał, czas działania oraz czas nieaktywności \n
        **${process.env.PREFIX}huntchatkillers disable** - wyłącza polowanie na zabójców czatu\n
        **${process.env.PREFIX}chatkills** - wyświetla ranking zabójców czatu dla bieżącego miesiąca\n
        **${process.env.PREFIX}mychatkills** - wyświetla liczbę punktów zdobytych przez użytkownika
        `
    )
    .setFooter({
      text: "Borsuk",
      iconURL: process.env.THUMBNAIL_URL ?? "",
    });
  msg.reply({ embeds: [embed] });
};
