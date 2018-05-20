import { Message, TextChannel, Channel, DMChannel, GroupDMChannel, RichEmbed as DiscordRichEmbed } from "discord.js";
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
    const embed = new DiscordRichEmbed();
    embed.setTitle("Decision");
    embed.setColor("#663399");
    embed.addField("Possibilities", `**[**${possibilities.join(', ')}**]**`);
    embed.addField("Result", decision);
    message.channel.send('', { embed })
  }
}
