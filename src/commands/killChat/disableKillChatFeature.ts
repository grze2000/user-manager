import { guilds } from "../../globals/users";
import {
  Message,
  TextChannel,
} from "discord.js";
import Guild from "../../models/Guild";

export const disableKillChatFeature = async (msg: Message) => {
  if (!msg.guild?.id) return;

  if (
    !msg.member
      ?.permissionsIn(msg.channel as TextChannel)
      .has("Administrator") &&
    msg.member?.user.id !== process.env.TESTER_ID
  ) {
    return msg.reply("Nie masz uprawnień do użycia tej komendy");
  }

  const initial = {
    channelId: undefined,
    activeFrom: undefined,
    activeTo: undefined,
    raectAfter: undefined,
    lastMessageDate: undefined,
    lastMessageUser: undefined,
  };

  Guild.findOneAndUpdate(
    {
      guildId: msg.guild.id,
    },
    {
      killChatFeature: initial,
    }
  )
    .then(() => {
      guilds.get(msg.guild!.id)!.killChatFeature = initial;
      msg.reply("Wyłączono funkcję nadzorowania aktywności na kanale");
    })
    .catch((err) => {
      console.log(err);
      msg.reply("Wystąpił błąd przy zapisywaniu zmian");
    });
};
