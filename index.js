const fs = require('fs');
const Discord = require('discord.js');
const Attachment = require('discord.js');
require('dotenv').config();

//const { prefix, token } = require('./config.json');

const token = process.env.token;
const prefix = process.env.prefix;

//const cooldowns = new Discord.Collection();


const client = new Discord.Client();
client.commands = new Discord.Collection();

//Enmap
const Enmap = require("enmap");
//const EnmapLevel = require("enmap-level");
//const EnmapRethink = require('enmap-rethink');

client.data = new Enmap({
	name: "data",
	autoFetch: true,
	fetchAll: false,
	cloneLevel: 'deep'
});
//const votes = new Enmap({provider: provider});

//Commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}


client.on('ready', () => {
	console.log('It\'s time to get mysterious!');
});

client.on('message', message => {

	if (message.author.bot) return; // Ignore bots.
	
	///COMMANDS ---------------------------------------------------------------------------
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.args && !args.length) {
		let reply = 'Where are the arguments???';

		if (command.format) {
			reply += '\nProper usage: \'${command.format}\'';

		}
	}

	//Notify if this can only be used by the GM
	if (command.gmonly) {
		if (message.channel.type === "dm") {
			message.reply('GM-only commands cannot be sent via DM. Send it in the server instead.');
			return;
		}
		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.reply('This command is for GM use only.');
			return;
		}
	}

	//Notify if this can only be sent in guild
	if (command.guildonly && message.channel.type === "dm") {
		message.reply('This command cannot be sent as a DM. Send it in the server instead.');
		return;
	}

	//Notify if this can only be sent in dm
	if (command.dmonly && message.channel.type === "text") {
		message.reply('This command cannot be sent in the server. Send it as a DM instead.');
		return;
	}

	//Do the command
	try {
	    command.execute(client, message, args);
	}
	catch (error) {
	    console.error(error);
	    message.reply('There was an error trying to execute that command!');
	}
});

client.login(token);