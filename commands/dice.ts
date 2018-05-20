import { Message, TextChannel, Channel, DMChannel, GroupDMChannel, RichEmbed as DiscordRichEmbed } from "discord.js";
import times from "lodash.times";
import random from "lodash.random";

import { BotCommand } from "./bot_command";

export class DiceCommand implements BotCommand {
    shouldRun(message: Message): Boolean {
        return message.content.startsWith('.roll') || message.content.startsWith('.dice')
    }
    
    runCommand(message: Message): void {
        const dice = message.content.match(/\d+d\d+/g);
        const embed = new DiscordRichEmbed();
        embed.setTitle("Dice Results");
        embed.setColor("#663399");
        dice.forEach(die => {
            let [quantity, size] = die.split('d');
            let dieResults = []
            times(+quantity, () => {
                dieResults.push(random(1, +size));
            })
            let expAvg = expectedAverage(+size);
            embed.addField(die, `**[**${ dieResults.join(', ') }**]**\n*Average Result:* ${ avg(dieResults).toPrecision(2) }\n*Expected Average:* ${ expAvg }`);
        })
        message.channel.send('', { embed });
    }
}

function avg(numbers: number[]): number {
    return numbers.reduce((prev, curr) => prev + curr, 0) / numbers.length;
}

function expectedAverage(size: number): number {
    const fraction = (1/size);
    const numbers = [...Array(size).keys()].map(v => v + 1);
    return numbers.reduce((prev, curr): number => prev + (curr * fraction), 0);
} 