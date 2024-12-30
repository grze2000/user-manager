import chalk from "chalk";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { CustomClient } from "./client";
import { catchChatKillersJob } from "./cron/catchChatKillers";
import { saveUsersToDbJob } from "./cron/saveUsersToDb";
import { sendLastMonthChatKillerRanking } from "./cron/sendLastMonthChatKillerRanking";
import { handleDbConnection } from "./handlers/mongo";
dotenv.config();
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);

console.log("Connecting to MongoDB...");

handleDbConnection();

console.log("Bot is starting...");

const client = new CustomClient();

saveUsersToDbJob();

catchChatKillersJob(client);

sendLastMonthChatKillerRanking(client);

// Ładowanie komend
const commandsPath = path.join(__dirname, "commands", "slash");

// Funkcja rekurencyjnie przeszukująca foldery i ładowanie plików komend
function loadCommands(folderPath: string) {
  const commandFiles = fs.readdirSync(folderPath, { withFileTypes: true });

  commandFiles.forEach((file) => {
    const filePath = path.join(folderPath, file.name);

    if (file.isDirectory()) {
      loadCommands(filePath); // Jeśli to folder, wchodzimy głębiej
    } else if (file.isFile() && file.name.endsWith(".ts")) {
      const command = require(filePath).default;

      if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        console.log(
          chalk.blue(
            `[${new Date().toLocaleString()}] Loaded command: ${
              command.data.name
            }`
          )
        );
      } else {
        console.log(
          chalk.yellow(
            `[${new Date().toLocaleString()}] (WARNING) The command at ${filePath} is missing a required "data" or "execute" property.`
          )
        );
      }
    }
  });
}

loadCommands(commandsPath);

// Ładowanie eventów
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".ts"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
  console.log(
    chalk.blue(`[${new Date().toLocaleString()}] Created event: ${event.name}`)
  );
}

client.login(process.env.TOKEN);
