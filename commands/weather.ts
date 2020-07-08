import { createClient } from "then-redis";
import { Message, RichEmbed as DiscordRichEmbed, TextChannel, Channel, DMChannel, GroupDMChannel  } from "discord.js";
import node_geocoder from "node-geocoder";

import { BotCommand } from "./bot_command";

const DarkSky = require('dark-sky');
const openmapquest_key = process.env.OPENMAPQUEST_KEY;

const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const redis = createClient(process.env.REDIS_URL);

const geocoder = node_geocoder({
  provider: "openmapquest",
  apiKey: openmapquest_key
});

export class WeatherCommand implements BotCommand {
  shouldRun(message: Message): Boolean {
    return message.content.startsWith('.wz');
  }

  runCommand(message: Message): void {
    let channel = message.channel;
    let userId = message.author.id;
    retrieveLocation(message.content).then((location) => {
      if (location) {
        if (message.content.match('--save')) {
          storeUserLocation(userId, location);
        }
        return buildAndSendWeather(location, channel);
      }
    }, (reason) => {
      console.log(reason);
      retrieveUserLocation(userId).then(res => {
        return buildAndSendWeather(res, channel);
      }).catch(err => {
        return console.log(err);
      });
    });
  }
}

function buildAndSendWeather({ latitude, longitude, formatted }: Location, channel: TextChannel | DMChannel | GroupDMChannel): void {
  if (latitude && longitude && formatted) {
    darksky.latitude(latitude)
    .longitude(longitude)
    .exclude('minutely')
    .get()
    .then(weather => {
      const url = `https://darksky.net/forecast/${latitude},${longitude}/us12/en`
      const embed = new DiscordRichEmbed();
      embed.setTitle(`Weather for ${formatted}`)
      embed.setURL(url)
      embed.setColor("#663399");
      embed.addField('Temperature', `${weather.currently.temperature}°F`, true)
      embed.addField('Humidity', `${Math.floor(weather.currently.humidity * 100)}%`, true)
      embed.addField('Feels Like', `${weather.currently.apparentTemperature}°F`, true)
      embed.addField('High/Low', `${weather.daily.data[0].temperatureHigh}°F/${weather.daily.data[0].temperatureLow}°F`, false)
      embed.addField('Conditions', weather.currently.summary, false)
      embed.addField('Forecast', weather.hourly.summary, false)
      channel.send('', { embed })
    })
    .catch(console.log)
  }
}

function retrieveLocation(str: string): Promise<void | Location> {

  return new Promise((resolve, reject) => {
    const query = str.slice(4).replace('--save', '');

    return geocoder.geocode(query).then((location) => {
      if (location.length >= 1) {
        const loc = location[0];
        const formatted = `${loc.city}, ${loc.state}, ${loc.zipcode}`;
        resolve({
          latitude: loc.latitude,
          longitude: loc.longitude,
          formatted: formatted
        })
      } else {
        reject('No Geo results');
      };
    }, (err) => {
      console.log(err);
      reject(err);
    });
  })
}

function retrieveUserLocation(userId: string): Promise<Location> {
  return redis.hgetall(userId);
}

function storeUserLocation(userId: string, location: Location): void {
  redis.hmset(userId, location);
}

interface Location {
  latitude: number,
  longitude: number,
  formatted: string
}
