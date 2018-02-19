import { Client as DiscordClient, RichEmbed as DiscordRichEmbed } from "discord.js";
import { lookup as lookupByZip, lookupByCoords, lookupByName } from "zipcodes";

const DarkSky = require('dark-sky');

const token = process.env['DISCORD_KEY'];

const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const client = new DiscordClient();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content.match('.wz')) {
    let location = retrieveLocation(message.content);
    if (!location) { return; }
    let { latitude, longitude, city, state } = location;
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
          message.channel.send('', { embed })
        })
        .catch(console.log)
    }
  }
})

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
    let cityStateMatch = str.match(/\.wz\b(\w+),\s*(\w+)\b/);
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

interface Location {
  latitude: number,
  longitude: number,
  city: string,
  state: string
}

// Log our bot in
client.login(token);
