import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { catchChatKillersJob } from "./cron/catchChatKillers";
import { saveUsersToDbJob } from "./cron/saveUsersToDb";
import { sendLastMonthChatKillerRanking } from "./cron/sendLastMonthChatKillerRanking";
import { handleDbConnection } from "./handlers/mongo";
import onGuildCreate from "./listeners/onGuildCreate";
import onMessageCreate from "./listeners/onMessageCreate";
import ready from "./listeners/ready";
dotenv.config();
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

console.log("Connecting to MongoDB...");

handleDbConnection();

console.log("Bot is starting...");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

ready(client);

onMessageCreate(client, process.env.PREFIX ?? "!");

onGuildCreate(client);

saveUsersToDbJob();

catchChatKillersJob(client);

sendLastMonthChatKillerRanking(client);

client.login(process.env.TOKEN);
