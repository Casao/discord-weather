"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const then_redis_1 = require("then-redis");
const discord_js_1 = require("discord.js");
const node_geocoder_1 = __importDefault(require("node-geocoder"));
const DarkSky = require("dark-sky");
const openmapquest_key = process.env.OPENMAPQUEST_KEY;
const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const redis = then_redis_1.createClient(process.env.REDIS_URL);
const geocoder = node_geocoder_1.default({
    provider: "openmapquest",
    apiKey: openmapquest_key,
});
const iconMap = new Map([
    ["clear", ":sunny:"],
    ["clear-day", ":sunny:"],
    ["clear-night", ":crescent_moon:"],
    ["rain", ":cloud_rain:"],
    ["snow", ":cloud_snow:"],
    ["sleet", ":cloud_snow:"],
    ["wind", ":dash:"],
    ["fog", ":fog:"],
    ["cloudy", ":cloud:"],
    ["partly-cloudy", ":partly_sunny:"],
    ["partly-cloudy-day", ":partly_sunny:"],
    ["partly-cloudy-night", ":partly_sunny:"],
]);
class WeatherCommand {
    shouldRun(message) {
        return message.content.startsWith(".wz");
    }
    runCommand(message) {
        let channel = message.channel;
        let userId = message.author.id;
        retrieveLocation(message.content).then((location) => {
            if (location) {
                if (message.content.match("--save")) {
                    storeUserLocation(userId, location);
                }
                return buildAndSendWeather(location, channel);
            }
        }, (reason) => {
            console.log(reason);
            retrieveUserLocation(userId)
                .then((res) => {
                return buildAndSendWeather(res, channel);
            })
                .catch((err) => {
                return console.log(err);
            });
        });
    }
}
exports.WeatherCommand = WeatherCommand;
function buildAndSendWeather({ latitude, longitude, formatted }, channel) {
    if (latitude && longitude && formatted) {
        darksky
            .latitude(latitude)
            .longitude(longitude)
            .exclude("minutely")
            .get()
            .then((weather) => {
            const url = `https://darksky.net/forecast/${latitude},${longitude}/us12/en`;
            const embed = new discord_js_1.RichEmbed();
            embed.setTitle(`Weather for ${formatted}`);
            embed.setURL(url);
            embed.setColor("#663399");
            embed.addField("Temperature", `${weather.currently.temperature}°F`, true);
            embed.addField("Humidity", `${Math.floor(weather.currently.humidity * 100)}%`, true);
            embed.addField("Feels Like", `${weather.currently.apparentTemperature}°F`, true);
            embed.addField("High/Low", `${weather.daily.data[0].temperatureHigh}°F/${weather.daily.data[0].temperatureLow}°F`, false);
            embed.addField("Conditions", `${iconMap.get(weather.currently.icon)} ${weather.currently.summary}`, true);
            embed.addField("Forecast", weather.hourly.summary, false);
            channel.send("", { embed });
        })
            .catch(console.log);
    }
}
function retrieveLocation(str) {
    return new Promise((resolve, reject) => {
        const query = str.slice(4).replace("--save", "");
        return geocoder.geocode(query).then((location) => {
            if (location.length >= 1) {
                const loc = location[0];
                const formatted = `${loc.city}, ${loc.state}, ${loc.zipcode}`;
                resolve({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                    formatted: formatted,
                });
            }
            else {
                reject("No Geo results");
            }
        }, (err) => {
            console.log(err);
            reject(err);
        });
    });
}
function retrieveUserLocation(userId) {
    return redis.hgetall(userId);
}
function storeUserLocation(userId, location) {
    redis.hmset(userId, location);
}
//# sourceMappingURL=weather.js.map