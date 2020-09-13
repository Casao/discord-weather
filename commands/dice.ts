import { Message, TextChannel, Channel, DMChannel, GroupDMChannel, RichEmbed as DiscordRichEmbed } from "discord.js";
import times from "lodash.times";
import random from "lodash.random";

import { BotCommand } from "./bot_command";

export class DiceCommand implements BotCommand {
  shouldRun(message: Message): Boolean {
    return message.content.toLowerCase().startsWith('.roll') || message.content.toLowerCase().startsWith('.dice')
  }

  runCommand(message: Message): void {
    const dice = message.content.match(/(?:\d+)?d(?:\d+)(?:\+\d+)?/gi);
    const embed = new DiscordRichEmbed();
    embed.setTitle("Dice Results");
    embed.setColor("#663399");
    dice.forEach(die => {
      const split = die.match(/(\d+)?d(\d+)(\+\d+)?/i);
      const quantity = Number(split[1]) || 1;
      const size = Number(split[2]);
      const plus = Number(split[3]) || 0;
      let dieResults = []
      times(quantity, () => {
        dieResults.push(random(1, size));
      })
      let expAvg = expectedAverage(size);
      embed.addField(sum(dieResults) + plus, `**[**${ dieResults.join(', ') }**]**
      *Formula:* ${ die }
      *Average Result:* ${ avg(dieResults).toPrecision(2) }
      *Expected Average:* ${ expAvg }`);
    })
    message.channel.send('', { embed });
  }
}

function sum(numbers: number[]): number {
  return numbers.reduce((prev, curr) => prev + curr, 0)
}

function avg(numbers: number[]): number {
  return sum(numbers) / numbers.length;
}

function expectedAverage(size: number): number {
  const fraction = (1/size);
  const numbers = [...Array(size).keys()].map(v => v + 1);
  return numbers.reduce((prev, curr): number => prev + (curr * fraction), 0);
}
