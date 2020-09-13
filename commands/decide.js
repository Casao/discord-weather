"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecideCommand = void 0;
const discord_js_1 = require("discord.js");
const lodash_sample_1 = __importDefault(require("lodash.sample"));
class DecideCommand {
    shouldRun(message) {
        return message.content.toLowerCase().startsWith('.decide');
    }
    runCommand(message) {
        let possibilities = message.content.split(' ');
        possibilities.splice(0, 1);
        const decision = lodash_sample_1.default(possibilities);
        const embed = new discord_js_1.RichEmbed();
        embed.setTitle("Decision");
        embed.setColor("#663399");
        embed.addField("Possibilities", `**[**${possibilities.join(', ')}**]**`);
        embed.addField("Result", decision);
        message.channel.send('', { embed });
    }
}
exports.DecideCommand = DecideCommand;
//# sourceMappingURL=decide.js.map