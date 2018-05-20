import { Message, TextChannel, Channel, DMChannel, GroupDMChannel } from "discord.js";
import sample from "lodash.sample";

import { BotCommand } from "./bot_command";

export class DecideCommand implements BotCommand {
  shouldRun(message: Message): Boolean {
    return message.content.startsWith('.decide');
  }

  runCommand(message: Message): void {
    let possibilities = message.content.split(' ');
    possibilities.splice(0, 1);
    const decision = sample(possibilities);
    message.channel.send(`**Decision:** ${ decision }`)
  }
}