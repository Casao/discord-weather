"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const weather_1 = require("./commands/weather");
const decide_1 = require("./commands/decide");
const dice_1 = require("./commands/dice");
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const token = process.env['DISCORD_KEY'];
const client = new discord_js_1.Client();
client.on('ready', () => {
    console.log('I am ready!');
});
const commands = [new weather_1.WeatherCommand, new decide_1.DecideCommand, new dice_1.DiceCommand];
client.on('message', message => {
    commands.forEach(((command) => {
        if (command.shouldRun(message)) {
            command.runCommand(message);
        }
    }));
});
// Log our bot in
client.login(token);
