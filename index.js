"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const zipcodes_1 = require("zipcodes");
const DarkSky = require('dark-sky');
const token = process.env['DISCORD_KEY'];
const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const client = new discord_js_1.Client();
client.on('ready', () => {
    console.log('I am ready!');
});
client.on('message', message => {
    if (message.content.match('.wz')) {
        let location = retrieveLocation(message.content);
        if (!location) {
            return;
        }
        let { latitude, longitude, city, state } = location;
        if (latitude && longitude && city && state) {
            darksky.latitude(latitude)
                .longitude(longitude)
                .exclude('minutely')
                .get()
                .then(weather => {
                const url = `https://darksky.net/forecast/${latitude},${longitude}/us12/en`;
                const embed = new discord_js_1.RichEmbed();
                embed.setTitle(`Weather for ${city}, ${state}`);
                embed.setURL(url);
                embed.addField('Temperature', `${weather.currently.temperature}°F`, true);
                embed.addField('Humidity', `${weather.currently.humidity * 100}%`, true);
                embed.addField('Conditions', weather.currently.summary, false);
                embed.addField('Forecast', weather.hourly.summary, false);
                message.channel.send('', { embed });
            })
                .catch(console.log);
        }
    }
});
function retrieveLocation(str) {
    try {
        const zipMatch = str.match(/\b\d{5}\b/);
        if (zipMatch) {
            const zip = zipMatch[0];
            let { latitude, longitude, city, state } = zipcodes_1.lookup(zip);
            return { latitude, longitude, city, state };
        }
        let latlongMatch = str.match(/\b(\-?\d+\.\d+?),\s*(\-?\d+\.\d+?)\b/);
        if (latlongMatch) {
            let [_, latitude, longitude] = latlongMatch;
            let { city, state } = zipcodes_1.lookupByCoords(Number(latitude), Number(longitude));
            return { latitude: Number(latitude), longitude: Number(longitude), city, state };
        }
        let cityStateMatch = str.match(/\.wz\b([\w\s]+),\s*(\w+)\b/);
        if (cityStateMatch) {
            let [_, city, state] = cityStateMatch;
            console.log(city);
            console.log(state);
            let { latitude, longitude } = zipcodes_1.lookupByName(city, state)[0];
            return { latitude, longitude, city, state };
        }
        return undefined;
    }
    catch (ex) {
        return undefined;
    }
}
// Log our bot in
client.login(token);
