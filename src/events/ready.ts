import chalk from "chalk";
import { Events } from "discord.js";
import { CustomClient } from "../client";

export default {
  name: Events.ClientReady,
  once: true,
  execute(client: CustomClient) {
    console.log(
      chalk.green(
        `[${new Date().toLocaleString()}] Ready! Logged in as ${
          client.user?.tag
        }`
      )
    );
  },
};
