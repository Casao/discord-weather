import { Client as DiscordClient } from "discord.js";

import { BotCommand } from "./commands/bot_command"
import { WeatherCommand } from "./commands/weather";
import { DecideCommand } from "./commands/decide";
import { DiceCommand } from "./commands/dice";

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const token = process.env['DISCORD_KEY'];

const client = new DiscordClient();

client.on('ready', () => {
  console.log('I am ready!');
});

const commands = [new WeatherCommand, new DecideCommand, new DiceCommand];

client.on('message', message => {
  commands.forEach(((command: BotCommand) => {
    if (command.shouldRun(message)) {
      command.runCommand(message);
    }
  }));
});

// Log our bot in
client.login(token);
