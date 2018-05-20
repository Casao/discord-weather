import { Message } from "discord.js";

export interface BotCommand {
  shouldRun(message: Message): Boolean;
  runCommand(message:Message): void;
}
