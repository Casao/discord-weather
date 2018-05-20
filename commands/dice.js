"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lodash_times_1 = __importDefault(require("lodash.times"));
const lodash_random_1 = __importDefault(require("lodash.random"));
class DiceCommand {
    shouldRun(message) {
        return message.content.startsWith('.roll') || message.content.startsWith('.dice');
    }
    runCommand(message) {
        const dice = message.content.match(/\d+d\d+/g);
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle("Dice Results");
        embed.setColor("#663399");
        dice.forEach(die => {
            let [quantity, size] = die.split('d');
            let dieResults = [];
            lodash_times_1.default(+quantity, () => {
                dieResults.push(lodash_random_1.default(1, +size));
            });
            let expAvg = expectedAverage(+size);
            embed.addField(die, `**[**${dieResults.join(', ')}**]**\n*Average Result:* ${avg(dieResults).toPrecision(2)}\n*Expected Average:* ${expAvg}`);
        });
        message.channel.send('', { embed });
    }
}
exports.DiceCommand = DiceCommand;
function avg(numbers) {
    return numbers.reduce((prev, curr) => prev + curr, 0) / numbers.length;
}
function expectedAverage(size) {
    const fraction = (1 / size);
    const numbers = [...Array(size).keys()].map(v => v + 1);
    return numbers.reduce((prev, curr) => prev + (curr * fraction), 0);
}
