import { Schema, model } from "mongoose";

const GuildSchema = new Schema(
  {
    guildId: {
      required: true,
      type: String,
    },
    guildName: {
      type: String,
      required: true,
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
          required: false,
          type: {
            messageId: { type: String, required: true },
            channelId: { type: String, required: true },
            date: { type: Date, required: true },
            content: { type: String, required: true },
          },
          default: null,
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
    },
    activityCheckToDate: {
      type: Date,
      required: false,
    },
  },
  {
    versionKey: false,
  }
);

const GuildModel = model("Guild", GuildSchema, "guilds");

export default GuildModel;
