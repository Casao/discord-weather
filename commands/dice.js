"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_times_1 = __importDefault(require("lodash.times"));
const lodash_random_1 = __importDefault(require("lodash.random"));
class DiceCommand {
    shouldRun(message) {
        return message.content.startsWith('.roll') || message.content.startsWith('.dice');
    }
    runCommand(message) {
        const dice = message.content.match(/(?:\d+)?d(?:\d+)(?:\+\d+)?/g);
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle("Dice Results");
        embed.setColor("#663399");
        dice.forEach(die => {
            const split = die.match(/(\d+)?d(\d+)(\+\d+)?/);
            const quantity = Number(split[1]) || 1;
            const size = Number(split[2]);
            const plus = Number(split[3]) || 0;
            let dieResults = [];
            lodash_times_1.default(quantity, () => {
                dieResults.push(lodash_random_1.default(1, size));
            });
            let expAvg = expectedAverage(size);
            embed.addField(die, `**[**${dieResults.join(', ')}**]**
      *Sum:* ${sum(dieResults) + plus}
      *Average Result:* ${avg(dieResults).toPrecision(2)}
      *Expected Average:* ${expAvg}`);
        });
        message.channel.send('', { embed });
    }
}
exports.DiceCommand = DiceCommand;
function sum(numbers) {
    return numbers.reduce((prev, curr) => prev + curr, 0);
}
function avg(numbers) {
    return sum(numbers) / numbers.length;
}
function expectedAverage(size) {
    const fraction = (1 / size);
    const numbers = [...Array(size).keys()].map(v => v + 1);
    return numbers.reduce((prev, curr) => prev + (curr * fraction), 0);
}
