const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  bot.user.setActivity(`on ${bot.guilds.size} servers`);
});

bot.on("guildCreate", guild => {
  // This event triggers when the bot joins a guild.
  console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
  bot.user.setActivity(`on ${bot.guilds.size} servers`);
});

bot.on("guildDelete", guild => {
  // this event triggers when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setActivity(`on ${bot.guilds.size} servers`);
});


function displayMessage(pmessage, pdescription) {
      pmessage.channel.send({embed: {
			color: 3447003,
			title: "Bitcoin Lightning price",
			url: "https://coinmarketcap.com/currencies/bitcoin-lightning/",
			thumbnail: {
			  "url": bot.user.avatarURL
			},
			description: pdescription ,
			
			timestamp: new Date(),
			footer: {
			  icon_url: bot.user.avatarURL,
			  text: "developed by pascalMiner"
			}
		   }
		  });              
}


bot.on('message', message => {
    if (message.content === 'ping') {
    	message.reply('pong');
  	}
});

// THIS  MUST  BE  THIS  WAY
bot.login(process.env.BOT_TOKEN);
