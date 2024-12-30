import chalk from "chalk";
import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
dotenv.config();

const commands: { name: string; description: string; [key: string]: any }[] =
  [];
const foldersPath = path.join(__dirname, "..", "commands", "slash");

function loadCommands(folderPath: string) {
  const entries = fs.readdirSync(folderPath, { withFileTypes: true });

  entries.forEach((entry) => {
    const filePath = path.join(folderPath, entry.name);

    if (entry.isDirectory()) {
      loadCommands(filePath);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".js"))
    ) {
      const command = require(filePath).default;
      if (command?.data) {
        commands.push(command.data.toJSON());
        console.log(
          chalk.blue(
            `[${new Date().toLocaleString()}] Loaded command: ${
              command.data.name
            }`
          )
        );
      } else {
        console.warn(
          `[WARNING] The command at ${filePath} is missing "data" property.`
        );
      }
    }
  });
}

loadCommands(foldersPath);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN ?? "");

(async () => {
  try {
    console.log("Started refreshing global application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.APPLICATION_ID ?? ""),
      { body: commands }
    );

    console.log("Successfully reloaded global application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
