import { Schema, model } from "mongoose";

const GuildSchema = new Schema(
  {
    guildId: {
      required: true,
      type: String,
    },
    users: [
      {
        userId: {
          required: true,
          type: String,
        },
        username: {
          required: true,
          type: String,
        },
        lastMessage: {
          required: true,
          type: Date,
        },
      },
    ],
    countdownChannels: [String],
    killChatFeature: {
      channelId: String,
      activeFrom: Number,
      activeTo: Number,
      raectAfter: Number,
      lastMessageDate: Date,
      lastMessageUser: String,
    }
  },
  {
    versionKey: false,
  }
);

const GuildModel = model("Guild", GuildSchema, "guilds");

export default GuildModel;
