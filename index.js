const fs = require("fs");
const request = require(`request`);
const https = require("https");
const Discord = require("discord.js");
require("dotenv").config();

const token = process.env.token;
const prefix = process.env.prefix;

//const cooldowns = new Discord.Collection();

const client = new Discord.Client();
client.commands = new Discord.Collection();

//Enmap
const Enmap = require("enmap");
const sharp = require("sharp");
const { updateAvatars } = require("./utilities/updateAvatarsUtil");
const updateAvatarsUtil = require("./utilities/updateAvatarsUtil");

//const EnmapLevel = require("enmap-level");
//const EnmapRethink = require('enmap-rethink');

client.data = new Enmap({
	name: "data",
	autoFetch: true,
	fetchAll: false,
	cloneLevel: "deep",
});
//const votes = new Enmap({provider: provider});

//Commands
const commandFiles = fs
	.readdirSync("./commands")
	.filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.on("ready", () => {
	console.log("It's time to get mysterious!");
});

client.on("message", async (message) => {
	// ///EARLOG---------------------------------------------------------
	if (message.channel.type != "dm" && message.channel.name[0] == "p") {
		const earlog_data = client.data.get("EARLOG_DATA");
		var avatar_data = client.data.get("AVATAR_DATA");
		var earlog_history = client.data.get("EARLOG_HISTORY");

		const areaid = message.channel.name.split("-").pop();

		const earlogChannel = earlog_data.find((c) => {
			return c.areaid == areaid;
		});

		if (earlog_data != undefined && earlogChannel != undefined) {
			//find channel

			if (avatar_data == undefined) {
				avatar_data = {}; //dictionary of username - filename
				updateAvatars(client);
			}
			if (earlog_history == undefined) {
				earlog_history = {}; //dictionary of username - filename
			}

			var postName = true;

			if (earlogChannel.channelid in earlog_history) {
				const lastTalker = earlog_history[earlogChannel.channelid];
				if (lastTalker == message.author.username) {
					postName = false;
				}
			}

			earlog_history[earlogChannel.channelid] = message.author.username;
			client.data.set("EARLOG_HISTORY", earlog_history);

			if (postName) {
				if (message.member.nickname != undefined) {
					var messageContent =
						"**" +
						message.member.nickname +
						":** `[" +
						message.author.username.toUpperCase() +
						"]` \n" +
						message.content;
				} else {
					var messageContent =
						"**" + message.author.username + ":** " + message.content;
				}
			} else {
				var messageContent = message.content;
			}

			var filenameCurrent = "./avatars/" + message.author.username + "_" + message.author.avatar + ".png";
			var filenameStored = avatar_data[message.author.username];
			var filename;
			const defaultFile = "./avatars/questionMark.png";

			if (filenameCurrent != filenameStored) {
				filename = defaultFile;
				//update all avatars
				updateAvatars(client);
			} else {
				filename = filenameStored;
			}

			//Copy to Ear Log
			if (!postName || message.author.bot) {
				//Message Only
				await client.channels.get(earlogChannel.channelid).send(messageContent);
			} else {
				//Avatar
				await client.channels
					.get(earlogChannel.channelid)
					.send({ files: [filename] })
					.then(async () => {
						//Message
						client.channels.get(earlogChannel.channelid).send(messageContent);
					});
			}

			//Attachments
			if (message.attachments.array().length != 0) {
				client.channels
					.get(earlogChannel.channelid)
					.send(message.attachments.array()[0].url);
			}
			return;
		}
	}

	///COMMANDS ---------------------------------------------------------------------------
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command =
		client.commands.get(commandName) ||
		client.commands.find(
			(cmd) => cmd.aliases && cmd.aliases.includes(commandName)
		);

	if (!command) return;

	if (command.args && !args.length) {
		let reply = "Where are the arguments???";

		if (command.format) {
			reply += "\nProper usage: '${command.format}'";
		}
	}

	//Notify if this can only be used by the GM
	if (command.gmonly) {
		if (message.channel.type === "dm") {
			message.reply(
				"GM-only commands cannot be sent via DM. Send it in the server instead."
			);
			return;
		}
		if (!message.member.hasPermission("ADMINISTRATOR")) {
			message.reply("This command is for GM use only.");
			return;
		}
	}

	//Notify if this can only be sent in guild
	if (command.guildonly && message.channel.type === "dm") {
		message.reply(
			"This command cannot be sent as a DM. Send it in the server instead."
		);
		return;
	}

	//Notify if this can only be sent in dm
	if (command.dmonly && message.channel.type === "text") {
		message.reply(
			"This command cannot be sent in the server. Send it as a DM instead."
		);
		return;
	}

	//Do the command
	try {
		command.execute(client, message, args);
	} catch (error) {
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);
