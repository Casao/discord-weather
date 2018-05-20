"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zipcodes_1 = require("zipcodes");
const then_redis_1 = require("then-redis");
const discord_js_1 = require("discord.js");
const DarkSky = require('dark-sky');
const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const redis = then_redis_1.createClient(process.env['REDIS_URL']);
class WeatherCommand {
    shouldRun(message) {
        return message.content.startsWith('.wz');
    }
    runCommand(message) {
        let location = retrieveLocation(message.content);
        let channel = message.channel;
        let userId = message.author.id;
        if (location) {
            if (message.content.match('--save')) {
                storeUserLocation(userId, location);
            }
            return buildAndSendWeather(location, channel);
        }
        else {
            retrieveUserLocation(userId).then(res => {
                return buildAndSendWeather(res, channel);
            }).catch(err => {
                return console.log(err);
            });
        }
    }
}
exports.WeatherCommand = WeatherCommand;
function buildAndSendWeather({ latitude, longitude, city, state }, channel) {
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
            embed.setColor("#663399");
            embed.addField('Temperature', `${weather.currently.temperature}°F`, true);
            embed.addField('Humidity', `${weather.currently.humidity * 100}%`, true);
            embed.addField('Conditions', weather.currently.summary, false);
            embed.addField('Forecast', weather.hourly.summary, false);
            channel.send('', { embed });
        })
            .catch(console.log);
    }
}
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
        let cityStateMatch = str.match(/\.wz\s([\w\s]+),\s*(\w+)\b/);
        if (cityStateMatch) {
            let [_, city, state] = cityStateMatch;
            let { latitude, longitude } = zipcodes_1.lookupByName(city, state)[0];
            return { latitude, longitude, city, state };
        }
        return undefined;
    }
    catch (ex) {
        return undefined;
    }
}
function retrieveUserLocation(userId) {
    return redis.hgetall(userId);
}
function storeUserLocation(userId, location) {
    redis.hmset(userId, location);
}
