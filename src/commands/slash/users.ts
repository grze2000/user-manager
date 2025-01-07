import dayjs from "dayjs";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import Guild from "../../models/Guild";

export default {
  data: new SlashCommandBuilder()
    .setName("users")
    .setDescription(
      "Wyświetla listę użytkowników serwera z informacją o ostatniej aktywności"
    )
    .addIntegerOption((option) =>
      option
        .setName("page_size")
        .setDescription("Ilość użytkowników na stronie (domyślnie 5)")
    )
    .addStringOption((option) =>
      option
        .setName("sort")
        .setDescription("Sortowanie (domyślnie alfabetyczne)")
        .addChoices(
          { name: "Domyślne", value: "default" },
          { name: "Najdłużej nieaktywni", value: "inactive" }
        )
    )
    .addStringOption((option) =>
      option
        .setName("join_date")
        .setDescription(
          `Data dołączenia np. "before 2023-01-31", "after 2022-12-31" lub "between 2022-12-31 and 2023-01-31"`
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    if (!interaction.guild) {
      await interaction.reply({
        content: "Ta komenda może być użyta tylko na serwerze.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: false });

    // Pobranie członków serwera
    let members = (await interaction.guild.members.fetch()).filter(
      (member) => !member.user.bot
    );

    if (!members.size) {
      await interaction.editReply({
        content: "Brak członków do wyświetlenia.",
      });
      return;
    }

    // Pobranie parametrów
    // @ts-ignore - TS doesn't know that the option exists
    const pageSize = interaction.options.getInteger("page_size") ?? 5;
    // @ts-ignore - TS doesn't know that the option exists
    const sortOption = interaction.options.getString("sort") ?? "default";
    // @ts-ignore - TS doesn't know that the option exists
    const joinDateFilter = interaction.options.getString("join_date");

    // Filtrowanie według daty dołączenia
    if (joinDateFilter) {
      const betweenMatch = joinDateFilter.match(
        /between\s(\d{4}-\d{2}-\d{2})\sand\s(\d{4}-\d{2}-\d{2})/
      );
      const singleMatch = joinDateFilter.match(
        /(before|after)\s(\d{4}-\d{2}-\d{2})/
      );

      if (betweenMatch) {
        const [, startDate, endDate] = betweenMatch;
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        if (start.isValid() && end.isValid()) {
          members = members.filter((member) => {
            const joinedAt = dayjs(member.joinedAt);
            return joinedAt.isAfter(start) && joinedAt.isBefore(end);
          });
        } else {
          await interaction.editReply({
            content: "Podano nieprawidłową datę w filtrze join_date.",
          });
          return;
        }
      } else if (singleMatch) {
        const [, condition, date] = singleMatch;
        const targetDate = dayjs(date);
        if (targetDate.isValid()) {
          members = members.filter((member) => {
            const joinedAt = dayjs(member.joinedAt);
            return condition === "before"
              ? joinedAt.isBefore(targetDate)
              : joinedAt.isAfter(targetDate);
          });
        } else {
          await interaction.editReply({
            content: "Podano nieprawidłową datę w filtrze join_date.",
          });
          return;
        }
      } else {
        await interaction.editReply({
          content:
            "Nieprawidłowy format join_date. Użyj np. 'before 2023-01-01', 'after 2022-12-31' lub 'between 2022-12-31 and 2023-01-31'.",
        });
        return;
      }
    }

    // Sortowanie
    if (sortOption === "inactive") {
      const guildData = await Guild.findOne({ guildId: interaction.guild.id });
      if (guildData) {
        members = members.sort((a, b) => {
          const userA = guildData.users.find(
            (user) => user.userId === a.user.id
          );
          const userB = guildData.users.find(
            (user) => user.userId === b.user.id
          );
          const lastMessageA =
            userA?.lastMessage?.date || guildData.activityCheckToDate || 0;
          const lastMessageB =
            userB?.lastMessage?.date || guildData.activityCheckToDate || 0;
          return (
            new Date(lastMessageA).getTime() - new Date(lastMessageB).getTime()
          );
        });
      }
    } else {
      members = members.sort((a, b) =>
        a.user.username.localeCompare(b.user.username)
      );
    }

    // Pobranie danych z bazy
    const guildData = await Guild.findOne({ guildId: interaction.guild.id });

    // Paginate settings
    const pages = Math.ceil(members.size / pageSize);
    let currentPage = 0;

    const generateEmbed = (page: number) => {
      const start = page * pageSize;
      const end = start + pageSize;

      const currentMembers = Array.from(members.values()).slice(start, end);

      const memberList = currentMembers.map((member) => {
        let userString = `${member.user} ${member.user.tag}${
          member.nickname ? ` - ${member.nickname}` : ""
        }`;

        if (guildData) {
          const user = guildData.users.find(
            (user) => user.userId === member.user.id
          );
          if (user) {
            userString += ` - Ostatnia wiadomość: ${
              user.lastMessage?.date
                ? `**${dayjs(user.lastMessage?.date).format(
                    "DD.MM.YYYY HH:mm"
                  )}**, kanał: <#${user.lastMessage.channelId}>`
                : `**brak aktywności po ${dayjs(
                    guildData.activityCheckToDate
                  ).format("DD.MM.YYYY")}**`
            }`;
          }
        }

        return userString;
      });

      return new EmbedBuilder()
        .setTitle(`Lista użytkowników (strona ${page + 1} z ${pages})`)
        .setDescription(memberList.join("\n"));
    };

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId("previous")
        .setLabel("Poprzednia")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("Następna")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === pages - 1)
    );

    const message = await interaction.editReply({
      embeds: [generateEmbed(currentPage)],
      components: [buttons],
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000,
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.editReply({
          content: "Nie możesz kontrolować tej paginacji.",
        });
        return;
      }

      if (buttonInteraction.customId === "previous" && currentPage > 0) {
        currentPage--;
      } else if (
        buttonInteraction.customId === "next" &&
        currentPage < pages - 1
      ) {
        currentPage++;
      }

      const updatedButtons =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Poprzednia")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === 0),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Następna")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(currentPage === pages - 1)
        );

      await buttonInteraction.update({
        embeds: [generateEmbed(currentPage)],
        components: [updatedButtons],
      });
    });

    collector.on("end", async () => {
      const disabledButtons =
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId("previous")
            .setLabel("Poprzednia")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true),
          new ButtonBuilder()
            .setCustomId("next")
            .setLabel("Następna")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );

      try {
        await message.edit({ components: [] });
      } catch (error) {
        console.error("Nie można edytować wiadomości: ", error);
      }
    });

    collector.on("error", (error) => {
      console.error("Błąd w kolektorze: ", error);
    });
  },
};
