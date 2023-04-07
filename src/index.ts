import dotenv from "dotenv";
dotenv.config();
import {
  Client,
  GatewayIntentBits,
} from "discord.js";
import ready from "./listeners/ready";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import onMessageCreate from "./listeners/onMessageCreate";
import { handleDbConnection } from "./handlers/mongo";
import { saveUsersToDbJob } from './cron/saveUsersToDb';
import { catchChatKillersJob } from "./cron/catchChatKillers";
import { sendLastMonthChatKillerRanking } from "./cron/sendLastMonthChatKillerRanking";
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

saveUsersToDbJob();

catchChatKillersJob(client);

sendLastMonthChatKillerRanking(client);

client.login(process.env.TOKEN);
