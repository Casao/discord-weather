const Discord = require('discord.js');
const DarkSky = require('dark-sky');
const zipcodes = require('zipcodes');

const token = process.env.DISCORD_KEY;

const darksky = new DarkSky(process.env.DARK_SKY_KEY);
const client = new Discord.Client();

client.on('ready', () => {
  console.log('I am ready!');
});

client.on('message', message => {
  if (message.content.match('.wz')) {
    const zip = message.content.match(/\b\d{5}\b/)[0]
    if (zip) {
      let {latitude, longitude, city, state} = zipcodes.lookup(zip)
      darksky.latitude(latitude)
        .longitude(longitude)
        .exclude('minutely')
        .get()
        .then(weather => {
          const url = `https://darksky.net/forecast/${latitude},${longitude}/us12/en`
          const embed = new Discord.RichEmbed();
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

// Log our bot in
client.login(token);