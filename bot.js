const Discord = require('discord.js');
const bot = new Discord.Client();
const fetch = require('node-fetch');
const config = require('./config.json');
const coins = require('./coins.json');

bot.on("ready", () => {
  // This event will run if the bot starts, and logs in, successfully.
  console.log(`Bot has started, with ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} guilds.`); 
  // Example of changing the bot's playing game to something useful. `client.user` is what the
  // docs refer to as the "ClientUser".
  bot.user.setActivity(`on ${bot.guilds.size} servers`);
  console.log('Coins loaded: ' + coins.length);
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


function displayMessage(pmessage, pdescription, titleText, titleUrl) {
	pmessage.channel.send({embed: {
		color: 3447003,
		title: titleText,
		url: titleUrl,
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

function displayHelp(pmessage) {
    pmessage.channel.send({embed: {
	  color: 3447003,
	  description: "Supported commands are:",
	  "fields": [
      {
        "name": "Show the help text",
        "value": "```!help```"
      },
      {
        "name": "Get a coin price in USD",
        "value": "```!coin [btc|eth|ltc|xrp etc...]```"
      },
	  {
        "name": "Get a coin price in EUR",
        "value": "```!coin [btc|eth|ltc|xrp etc...] eur```"
      }
	  ]
	}})            
}

function displayErrorMessage(pmessage, pdescription) {
    pmessage.channel.send({embed: {
	  color: 3447003,
	  description: pdescription
	}})            
}


bot.on('message', message => {
   
	// It's good practice to ignore other bots. This also makes your bot ignore itself
  // and not get into a spam loop (we call that "botception").
  if(message.author.bot) return;
  
  // Also good practice to ignore any message that does not start with our prefix, 
  // which is set in the configuration file.
  if (!message.content.startsWith(config.prefix)) return;
  
  // Here we separate our "command" name, and our "arguments" for the command. 
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  console.log('Bot received: [' + message + ']');
  const args = message.content.toLowerCase().slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift();
 
  if (command === "help") {
	 displayHelp(message);
  }
  
  if (command === "coin") {
	  
	if (typeof args[0] === 'undefined' ) {
		console.log('Command coin without arg');
		displayHelp(message);
		return;
	}	
	
	var param = args[0];
	
	function checkSymbol(coin) {
		return coin.symbol.toLowerCase() === this.toString().toLowerCase();
	}

	function checkCoin(coin) {
		return coin.id.toLowerCase() === this.toString().toLowerCase() || coin.name.toLowerCase() === this.toString().toLowerCase();
	}

	var coin = coins.find(checkSymbol,param);
	if (typeof coin !== 'undefined'){
		console.log("Found : " + coin.name);
	} else {
		coin = coins.find(checkCoin,param);
		if (typeof coin !== 'undefined'){
			console.log("Found : " + coin.name);
		} else {
			var errorMessage = "Coin not found : " + param;
			console.log(errorMessage);
			displayErrorMessage(message, errorMessage);
			return;
		}
	}
	  
	var url = config.urlCoinMarketCap + coin.id + '/';
	var titleUrl = config.urlCoin + coin.id + '/';
	console.log('titleUrl: [' + titleUrl + ']');
	var titleText = coin.name + ' price';
	console.log('titleText: [' + titleText + ']');
	//title: "Bitcoin Lightning price",
	//url: "https://coinmarketcap.com/currencies/bitcoin-lightning/",
	
	console.log('Fetch with url: [' + url + ']');
	  
	if ( args[1] === 'eur' ) {
		url = url + config.urlSuffixEUR;
	}
	
	console.log('Fetch with url: [' + url + ']');
	
	fetch(url)
	.then(response => {
		response.json().then(json => {
			
			if (typeof json.error !== 'undefined') {
				// the variable is defined
				console.log('Error from coinmarketcap.com: ' + json.error);
				return;
			}
			
			if (typeof json[0] === 'undefined') {
				// the variable is defined
				console.log('Error from coinmarketcap.com: badly formated answer.');
				return;
			}
			
			//Values
			var rank = json[0].rank;
			var price_usd = json[0].price_usd;
			var price_btc = json[0].price_btc;
			var volume_usd = json[0]["24h_volume_usd"];
			var market_cap_usd = json[0].market_cap_usd;
			var available_supply = json[0].available_supply;
			var percent_change_1h = json[0].percent_change_1h;
			var percent_change_24h = json[0].percent_change_24h;
			var percent_change_7d = json[0].percent_change_7d;
			
			var price_eur = '';
			if (typeof json[0].price_eur !== 'undefined') {
				price_eur = json[0].price_eur;
			}
			var volume_eur = '';
			if (typeof json[0]["24h_volume_eur"] !== 'undefined') {
				volume_eur = json[0]["24h_volume_eur"];
			}
			var market_cap_eur = '';
			if (typeof json[0].market_cap_eur !== 'undefined') {
				market_cap_eur = json[0].market_cap_eur;
			}

			//Labels
			var lrank = "Rank: " + rank + "\n";
			var lprice_btc = "Price BTC: " + price_btc + " BTC" + "\n";
			var lavailable_supply = "";
			if (available_supply !== null){
				lavailable_supply = "Supply: " + available_supply + "\n";
			}
			lpercent_change_1h = "Change 1h: " + percent_change_1h + "%" + "\n";
			lpercent_change_24h = "Change 24h: " + percent_change_24h + "%" + "\n";
			lpercent_change_7d = "Change 7d: " + percent_change_7d + "%" + "\n";
			
			//Labels for usd
			var lprice_usd = "Price USD: $" + price_usd + "\n";
			var lvolume_usd = "24h Volume: $" + volume_usd + "\n";
			var lmarket_cap_usd = "";
			if (market_cap_usd !== null){
				lmarket_cap_usd = "Market cap: $" + market_cap_usd + "\n";
			}
			
			//Labels for eur
			var lprice_eur = "Price EUR: €" + price_eur + "\n";
			var lvolume_eur = "24h Volume: €" + volume_eur + "\n";
			var lmarket_cap_eur = "";
			if (market_cap_eur !== null && market_cap_eur !== ''){
				lmarket_cap_eur = "Market cap: €" + market_cap_eur + "\n";
			}

			var lprice = lprice_usd;
			var lvolume = lvolume_usd;
			var lmarket = lmarket_cap_usd;
			
			if ( args[1] === 'eur' ) {
				var lprice = lprice_eur;
				var lvolume = lvolume_eur;
				var lmarket = lmarket_cap_eur;
			}
			
			const description = lrank + "\n" + lprice  + lprice_btc + "\n" + lvolume + lmarket + lavailable_supply + "\n" + lpercent_change_1h + lpercent_change_24h + lpercent_change_7d;
			displayMessage(message, description, titleText, titleUrl);
		  
		});
	  })
    .catch(error => {
	  console.log(error);
    });
  } //End command === "coin"
	
});

// THIS  MUST  BE  THIS  WAY
bot.login(process.env.BOT_TOKEN);
