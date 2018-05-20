"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_sample_1 = __importDefault(require("lodash.sample"));
class DecideCommand {
    shouldRun(message) {
        return message.content.startsWith('.decide');
    }
    runCommand(message) {
        let possibilities = message.content.split(' ');
        possibilities.splice(0, 1);
        const decision = lodash_sample_1.default(possibilities);
        message.channel.send(`**Decision:** ${decision}`);
    }
}
exports.DecideCommand = DecideCommand;
