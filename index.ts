import { Client as DiscordClient, RichEmbed as DiscordRichEmbed, TextChannel, Channel, DMChannel, GroupDMChannel } from "discord.js";
import { lookup as lookupByZip, lookupByCoords, lookupByName } from "zipcodes";
import { createClient } from "then-redis";

const DarkSky = require('dark-sky');

const token = process.env['DISCORD_KEY'];

const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const client = new DiscordClient();

const redis = createClient(process.env['REDIS_URL'])

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content.match('.wz')) {
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
})

function buildAndSendWeather({ latitude, longitude, city, state }: Location, channel: TextChannel | DMChannel | GroupDMChannel): void {
  if (latitude && longitude && city && state) {
    darksky.latitude(latitude)
      .longitude(longitude)
      .exclude('minutely')
      .get()
      .then(weather => {
        const url = `https://darksky.net/forecast/${latitude},${longitude}/us12/en`
        const embed = new DiscordRichEmbed();
        embed.setTitle(`Weather for ${city}, ${state}`)
        embed.setURL(url)
        embed.addField('Temperature', `${weather.currently.temperature}°F`, true)
        embed.addField('Humidity', `${weather.currently.humidity * 100}%`, true)
        embed.addField('Conditions', weather.currently.summary, false)
        embed.addField('Forecast', weather.hourly.summary, false)
        channel.send('', { embed })
      })
      .catch(console.log)
  }
}

function retrieveLocation(str: string): Location | undefined {
  try {
    const zipMatch = str.match(/\b\d{5}\b/)
    if (zipMatch) {
      const zip = zipMatch[0]
      let { latitude, longitude, city, state } = lookupByZip(zip)
      return { latitude, longitude, city, state }
    }
    let latlongMatch = str.match(/\b(\-?\d+\.\d+?),\s*(\-?\d+\.\d+?)\b/)
    if (latlongMatch) {
      let [_, latitude, longitude] = latlongMatch
      let { city, state } = lookupByCoords(Number(latitude), Number(longitude))
      return { latitude: Number(latitude), longitude: Number(longitude), city, state }
    }
    let cityStateMatch = str.match(/\.wz\s([\w\s]+),\s*(\w+)\b/);
    if (cityStateMatch) {
      let [_, city, state] = cityStateMatch;
      let { latitude, longitude } = lookupByName(city, state)[0];
      return { latitude, longitude, city, state }
    }
    return undefined
  } catch (ex) {
    return undefined
  }
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
  city: string,
  state: string
}

// Log our bot in
client.login(token);
