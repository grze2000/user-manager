import { Schema, model } from "mongoose";

const KillChatRankingScehma = new Schema(
  {
    guildId: {
      required: true,
      type: String,
    },
    date: {
      required: true,
      type: Date,
    },
    users: [
      {
        userId: String,
        username: String,
        points: Number,
      }
    ],
  },
);

const KillChatRanking = model("KillChatRankings", KillChatRankingScehma, "killChatRankings");

export default KillChatRanking;
