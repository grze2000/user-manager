require("dotenv").config();
import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import ready from "./listeners/ready";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import onMessageCreate from "./listeners/onMessageCreate";
dayjs.extend(customParseFormat);

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

client.login(process.env.TOKEN);
