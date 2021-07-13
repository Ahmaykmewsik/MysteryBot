Error.stackTraceLimit = Infinity;

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const { EarlogListener } = require("./EarlogListener");
const postErrorMessage = require('./utilities/errorHandling').postErrorMessage;
const UtilityFunctions = require("./utilities/UtilityFunctions");

const SQLite = require("better-sqlite3");
const sql = new SQLite('./data.sqlite');

const token = process.env.token;
const prefix = process.env.prefix;

const Discord = require("discord.js");
const client = new Discord.Client();
client.commands = new Discord.Collection();


//Commands
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		let command = require(`./commands/${folder}/${file}`);
		command.category = folder;
		client.commands.set(command.name, command);
	}
}

client.on("ready", () => {

	// Check if the tables exists, if not make them.
	const table = sql.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'players';").get();
	if (!table['count(*)']) {

		// Player
		sql.prepare(
			`CREATE TABLE players (
				guild_username TEXT PRIMARY KEY,
				username TEXT,
				guild TEXT,
				character TEXT, 
				discordID TEXT,
				alive BOOL,
				health FLOAT,
				action TEXT,
				roll INTEGER,
				move TEXT,
				moveSpecial TEXT,
				forceMoved BOOL
			);`
		).run();

		sql.prepare("CREATE UNIQUE INDEX idx_players_guild_username ON players (guild_username);").run();

		// Profiles
		sql.prepare(
			`CREATE TABLE profiles (
				guild_username TEXT PRIMARY KEY,
				username TEXT,
				guild TEXT,
				profileText TEXT
			);`
		).run();

		//Areas
		sql.prepare(
			`CREATE TABLE areas (
				guild_id TEXT PRIMARY KEY,
				id TEXT,
				guild TEXT,
				name TEXT,
				description TEXT,
				image TEXT
			);`
		).run();

		//Connections
		sql.prepare(
			`CREATE TABLE connections (				
				area1 TEXT,
				area2 TEXT,
				guild TEXT
			);`
		).run();

		//InstantConnections
		sql.prepare(
			`CREATE TABLE instantConnections (
				area1 TEXT,
				area2 TEXT,
				guild TEXT
			)`
		).run();

		//PlayerLocations
		sql.prepare(
			`CREATE TABLE locations (
				guild_username TEXT PRIMARY KEY,
				username TEXT,
				guild TEXT,
				areaID TEXT
			);`
		).run();

		//Items
		sql.prepare(
			`CREATE TABLE items (
				guild_id TEXT PRIMARY KEY,
				id TEXT,
				guild TEXT,
				description TEXT,
				big BOOL,
				clothing BOOL
			);`
		).run();

		//Inventories
		sql.prepare(
			`CREATE TABLE inventories (
				guild_username TEXT,
				username TEXT,
				guild TEXT,
				itemID TEXT
			);`
		).run();

		//Spy Actions
		sql.prepare(
			`CREATE TABLE spyActions (
				guild_username TEXT,
				username TEXT,
				guild TEXT,
				spyArea TEXT,
				accuracy FLOAT,
				permanent BOOL,
				playerSpy BOOL,
				visible BOOL,
				active BOOL
			);`
		).run();

		//Spy Connections
		sql.prepare(
			`CREATE TABLE spyConnections (
			area1 TEXT,
			area2 TEXT,
			guild TEXT,
			accuracy FLOAT,
			permanent BOOL,
			visible BOOL,
			active BOOL
		);`
		).run();

		//Spy Channels
		sql.prepare(
			`CREATE TABLE spyChannels(
				guild_username TEXT,
				guild TEXT,
				username TEXT,
				areaID TEXT,
				channelID TEXT
			);`
		).run();

		//Earlogs
		sql.prepare(
			`CREATE TABLE earlogChannels (
				guild_areaID TEXT PRIMARY KEY,
				guild TEXT,
				channelID TEXT
			);`
		).run();


		//Gameplay Channels
		sql.prepare(
			`CREATE TABLE gameplayChannels(
				channelID TEXT PRIMARY KEY,
				guild_areaID TEXT,
				areaID TEXT,
				guild TEXT,
				channelName TEXT,
				earlogChannelID TEXT,
				active BOOL,
				locked BOOL
			)`
		).run();

		//Message database
		sql.prepare(
			`CREATE TABLE messageDatabase(
				gameplayID TEXT PRIMARY KEY,
				earlogID TEXT,
				earlogChannelID TEXT,
				guild TEXT,
				phase INTEGER
			)`
		).run();

		sql.prepare("CREATE UNIQUE INDEX idx_gameplayID ON messageDatabase (gameplayID);").run();

		//Settings
		sql.prepare(
			`CREATE TABLE settings (
				guild TEXT PRIMARY KEY,
				categoryName TEXT,
				categoryID TEXT,
				categoryNum INTEGER,
				spyCategoryID TEXT,
				earlogCategoryID TEXT,
				phase INTEGER,
				actionLogID TEXT,
				healthSystemActivated BOOL,
				defaultHealth FLOAT,
				maxHealth FLOAT
			);`
		).run();

		// sql.prepare(
		// 	`CREATE TABLE avatarFilenames ()`

		// ).run()


		sql.pragma("synchronous = 1");
		sql.pragma("journal_mode = wal");

		console.log("Completed First Time SQL Setup");
	}

	// -------Player Functions------

	client.getUserInDatabase = sql.prepare(
		`SELECT * from players WHERE discordID = ?`
	);

	client.setPlayer = sql.prepare(
		`INSERT OR REPLACE INTO players
		(guild_username, username, guild, character, discordID, alive, health, action, roll, move, moveSpecial, forceMoved)
		VALUES
		(@guild_username, @username, @guild, @character, @discordID, @alive, @health, @action, @roll, @move, @moveSpecial, @forceMoved);`
	);

	client.getPlayers = sql.prepare(
		"SELECT * FROM players WHERE guild = ?"
	);

	client.countPlayers = sql.prepare(
		"SELECT count(*) FROM players WHERE guild = ?;"
	);

	client.deletePlayer = sql.prepare(
		`DELETE FROM players WHERE guild_username = ?`
	);

	client.deleteAllPlayers = sql.prepare(
		`DELETE FROM players WHERE guild = ?`
	);

	// -------Profile Functions------

	client.getProfile = sql.prepare(
		`SELECT * FROM profiles
		WHERE username = ? AND guild = ?`
	);

	client.getProfiles = sql.prepare(
		`SELECT * FROM profiles
		WHERE guild = ?`
	)

	client.setProfile = sql.prepare(
		`INSERT OR REPLACE INTO profiles
		(guild_username, username, guild, profileText)
		VALUES
		(@guild_username, @username, @guild, @profileText);`
	);

	client.deleteProfile = sql.prepare(
		`DELETE FROM profiles
		WHERE username = ? AND guild = ?`
	);

	// -------Area Functions------
	client.getAreas = sql.prepare(
		`SELECT * from areas WHERE guild = ?;`
	);

	client.getArea = sql.prepare(
		`SELECT * from areas WHERE guild_id = ?;`
	);

	client.setArea = sql.prepare(
		`INSERT OR REPLACE INTO areas (guild_id, id, guild, name, description, image)
		VALUES (@guild_id, @id, @guild, @name, @description, @image);`
	);

	client.deleteArea = sql.prepare(
		`DELETE FROM areas 
		WHERE guild_id = ?;`
	);

	client.deleteAllAreas = sql.prepare(
		`DELETE FROM areas
		WHERE guild = ?`
	);

	// -------Connection Functions------

	client.getConnections = sql.prepare(
		`SELECT area2 FROM connections WHERE area1 = ? AND guild = ?`
	);

	client.getAllConnections = sql.prepare(
		`SELECT * FROM connections WHERE guild = ?`
	);

	client.setConnection = sql.prepare(
		`INSERT OR REPLACE INTO connections (area1, area2, guild)
		VALUES (@area1, @area2, @guild)`
	);

	client.deleteConnection = sql.prepare(
		`DELETE FROM connections 
		WHERE area1 = ? AND area2 = ? AND guild = ?`
	);

	client.deleteConnectionsOfArea = sql.prepare(
		`DELETE FROM connections
		WHERE (area1 = ? OR area2 = ?) AND guild = ?`
	);

	client.deleteAllConnections = sql.prepare(
		`DELETE FROM connections
		WHERE guild = ?`
	);

	// -------Instant Connection Functions------

	client.getInstantConnections = sql.prepare(
		`SELECT * FROM instantConnections WHERE guild = ?`
	);

	client.deleteInstantConnection = sql.prepare(
		`DELETE FROM instantConnections 
		WHERE area1 = ? AND area2 = ? AND guild = ?`
	);

	client.setInstantConnection = sql.prepare(
		`INSERT OR REPLACE INTO instantConnections (area1, area2, guild)
		VALUES (@area1, @area2, @guild)`
	);

	client.deleteInstantConnectionsOfArea = sql.prepare(
		`DELETE FROM instantConnections
		WHERE (area1 = ? OR area2 = ?) AND guild = ?`
	);

	client.deleteAllInstantConnections = sql.prepare(
		`DELETE FROM instantConnections
		WHERE guild = ?`
	);

	// -------PlayerLocation Functions------

	client.getLocationOfPlayer = sql.prepare(
		`SELECT areaID FROM locations
		WHERE guild_username = ?`
	);

	client.getLocations = sql.prepare(
		`SELECT * FROM locations
		WHERE guild = ?`
	);

	client.getPlayersOfArea = sql.prepare(
		`SELECT * FROM locations
		INNER JOIN players ON locations.guild_username == players.guild_username
		WHERE locations.areaID = ? and locations.guild = ?`
	);

	client.setLocation = sql.prepare(
		`INSERT OR REPLACE INTO locations (guild_username, username, guild, areaID)
		VALUES (@guild_username, @username, @guild, @areaID)`
	);

	client.getPlayersWithoutLocation = sql.prepare(
		`SELECT username FROM players
		WHERE guild = ? AND guild_username NOT IN (SELECT guild_username FROM locations)`
	);

	client.deleteLocationsOfPlayer = sql.prepare(
		`DELETE FROM locations
		WHERE guild_username = ?`
	);

	client.deleteLocationsOfArea = sql.prepare(
		`DELETE FROM locations
		WHERE areaID = ? AND guild = ?`
	);

	client.deleteAllLocations = sql.prepare(
		`DELETE FROM locations
		WHERE guild = ?`
	);

	// -------Item and Inventories Functions------

	client.getItems = sql.prepare(
		`SELECT * FROM items
		WHERE guild = ?
		ORDER BY items.id`
	);

	client.getItem = sql.prepare(
		`SELECT * FROM items
		WHERE guild_id = ?`
	);

	client.setItem = sql.prepare(
		`INSERT OR REPLACE INTO items (guild_id, id, guild, description, big, clothing)
		VALUES (@guild_id, @id, @guild, @description, @big, @clothing)`
	);

	client.getItemsOfPlayer = sql.prepare(
		`SELECT itemID FROM inventories
		WHERE guild_username = ?`
	);

	client.getPlayersOfItem = sql.prepare(
		`SELECT * FROM players
		INNER JOIN inventories ON players.username == inventories.username
		WHERE inventories.itemID = ? AND inventories.guild = ?`
	)

	client.getInventories = sql.prepare(
		`SELECT * FROM inventories
		WHERE guild = ?`
	);

	client.getItemsAndInventories = sql.prepare(
		`SELECT items.id, items.guild, items.description, items.big, items.clothing, inventories.username FROM items
		INNER JOIN inventories ON items.id = inventories.itemID
		WHERE items.guild = ?
		ORDER BY items.id`
	)

	client.givePlayerItem = sql.prepare(
		`INSERT INTO inventories (guild_username, username, guild, itemID)
		VALUES (@guild_username, @username, @guild, @itemID)`
	);

	client.dropPlayerItem = sql.prepare(
		`DELETE FROM inventories 
		WHERE guild_username = ? AND itemID = ?
		LIMIT 1`
	);

	client.deleteItem = sql.prepare(
		`DELETE FROM items
		WHERE guild_id = ?`
	);

	client.deleteItemFromInventory = sql.prepare(
		`DELETE FROM inventories
		WHERE itemID = ? AND guild = ?`
	);

	client.deleteAllItems = sql.prepare(
		`DELETE FROM items WHERE guild = ?`
	);

	client.deleteAllInventories = sql.prepare(
		`DELETE FROM inventories WHERE guild = ?`
	);

	// -------Spy Functions------

	client.getSpyActions = sql.prepare(
		`SELECT * FROM spyActions
		WHERE guild_username = ?`
	);

	client.getSpyActionsAll = sql.prepare(
		`SELECT * FROM spyActions
		WHERE guild = ?`
	)

	client.getSpyConnections = sql.prepare(
		`SELECT * FROM spyConnections
		WHERE area1 = ? AND guild = ?`
	);

	client.getSpyConnectionsAll = sql.prepare(
		`SELECT * FROM spyConnections
		WHERE guild = ?`
	);

	client.addSpyAction = sql.prepare(
		`INSERT INTO spyActions (guild_username, username, guild, spyArea, accuracy, permanent, playerSpy, visible, active)
		VALUES (@guild_username, @username, @guild, @spyArea, @accuracy, @permanent, @playerSpy, @visible, @active)`
	);

	client.addSpyConnection = sql.prepare(
		`INSERT INTO spyConnections (area1, area2, guild, accuracy, permanent, visible, active)
		VALUES (@area1, @area2, @guild, @accuracy, @permanent, @visible, @active)`
	);

	client.deleteSpyAction = sql.prepare(
		`DELETE FROM spyActions
		WHERE guild_username = ? AND spyArea = ? AND active = ?`
	);

	client.deleteSpyActions = sql.prepare(
		`DELETE FROM spyActions
		WHERE guild_username = ?`
	);

	client.deleteAllSpyActions = sql.prepare(
		`DELETE FROM spyActions
		WHERE guild = ?`
	)

	client.deleteSpyConnection = sql.prepare(
		`DELETE FROM spyConnections
		WHERE area1 = ? AND area2 = ? AND guild = ? AND active = ?`
	);

	client.deleteAllSpyConnections = sql.prepare(
		`DELETE FROM spyConnections
		WHERE guild = ?`
	);

	// Special SpyAction Function

	client.deactivateAllSpyActions = sql.prepare(
		`UPDATE spyActions
		SET active = 0`
	);


	// -------Settings Functions------

	client.getSettings = sql.prepare(
		`SELECT * FROM settings
		WHERE guild = ?`
	);

	client.setSettings = sql.prepare(
		`INSERT OR REPLACE INTO settings (guild, categoryName, categoryID, categoryNum, spyCategoryID, earlogCategoryID, phase, actionLogID, healthSystemActivated, defaultHealth, maxHealth)
		VALUES (@guild, @categoryName, @categoryID, @categoryNum, @spyCategoryID, @earlogCategoryID, @phase, @actionLogID, @healthSystemActivated, @defaultHealth, @maxHealth)`
	);

	client.deleteSettings = sql.prepare(
		`DELETE from settings WHERE guild = ?`
	);

	// -------Earlog & Spy Channel Functions------

	client.getSpyChannels = sql.prepare(
		`SELECT * FROM spyChannels
		WHERE guild = ?`
	);

	client.countEarlogChannels = sql.prepare(
		`SELECT count(*) FROM earlogChannels
		WHERE guild = ?`
	);

	client.getEarlogChannel = sql.prepare(
		`SELECT * FROM earlogChannels
		WHERE guild_areaID = ?`
	);

	client.getEarlogChannels = sql.prepare(
		`SELECT * FROM earlogChannels
		WHERE guild = ?`
	);

	client.getGameplayChannel = sql.prepare(
		`SELECT * FROM gameplayChannels
		WHERE channelID = ?`
	);

	client.getGameplayChannels = sql.prepare(
		`SELECT * FROM gameplayChannels
		WHERE guild = ?`
	);

	client.setEarlogChannel = sql.prepare(
		`INSERT OR REPLACE INTO earlogChannels (guild_areaID, guild, channelID)
		VALUES (@guild_areaID, @guild, @channelID)`
	);

	client.setSpyChannel = sql.prepare(
		`INSERT INTO spyChannels (guild_username, guild, username, areaID, channelID)
		VALUES (@guild_username, @guild, @username, @areaID, @channelID)`
	);

	client.setGameplayChannel = sql.prepare(
		`INSERT OR REPLACE INTO gameplayChannels (guild_areaID, areaID, guild, channelName, channelID, earlogChannelID, active, locked)
		VALUES (@guild_areaID, @areaID, @guild, @channelName, @channelID, @earlogChannelID, @active, @locked)`
	);

	client.deleteAllEarlogChannelData = sql.prepare(
		`DELETE FROM earlogChannels 
		WHERE guild = ?`
	);

	client.deleteSpyChannelData = sql.prepare(
		`DELETE FROM spyChannels
		WHERE guild = ? AND username = ? AND areaID = ?`
	);

	client.deleteSpyChannelDataOfPlayer = sql.prepare(
		`DELETE FROM spyChannels 
		WHERE guild = ? AND username = ?`
	);

	client.deleteAllSpyChannelData = sql.prepare(
		`DELETE FROM spyChannels 
		WHERE guild = ?`
	);

	client.deleteAllGameplayChannelData = sql.prepare(
		`DELETE FROM gameplayChannels 
		WHERE guild = ?`
	);

	// -------Message Database Functions------

	client.setMessage = sql.prepare(
		`INSERT OR REPLACE INTO messageDatabase (gameplayID, earlogID, earlogChannelID, guild, phase)
		VALUES (@gameplayID, @earlogID, @earlogChannelID, @guild, @phase)`
	);

	client.getMessage = sql.prepare(
		`SELECT * FROM messageDatabase
		WHERE gameplayID = ?`
	);

	client.deleteMessegesOfPhase = sql.prepare(
		`DELETE FROM messageDatabase
		WHERE guild = ? AND phase = ?`
	);

	client.deleteAllMessages = sql.prepare(
		`DELETE FROM messageDatabase
		WHERE guild = ?`
	)

	//Boot message
	console.log("It's time to get mysterious!");
});

client.on("message", message => {

	//TESTING
	if (message.content == "test") {
		let numChannels = message.guild.channels.cache.size;
		console.log(numChannels);
	}

	///EARLOG---------------------------------------------------------
	if (message.channel.type != "dm" && message.channel.name[0] == "p") {
		try {
			if ((message.content.toLowerCase() == "lock") && (message.member.hasPermission('ADMINISTRATOR'))) {
				message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: false });

				let gameplayChannel = client.getGameplayChannel.get(message.channel.id);

				gameplayChannel.locked = 1;
				client.setGameplayChannel.run(gameplayChannel);
			}
			if ((message.content.toLowerCase() == "unlock") && (message.member.hasPermission('ADMINISTRATOR'))) {
				message.channel.updateOverwrite(message.channel.guild.roles.everyone, { SEND_MESSAGES: true });

				let gameplayChannel = client.getGameplayChannel.get(message.channel.id);
				gameplayChannel.locked = 0;
				client.setGameplayChannel.run(gameplayChannel);
			}
		} catch (error) {
			console.error("LOCK error!" + error);
		}

		try {
			EarlogListener(client, message);
		} catch (error) {
			console.log("Earlog Error!");
			console.error(error);
			postErrorMessage(message.channel);
		}
		return;
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
	if (command.dmonly && message.channel.type === "text" && command.name) {
		message.reply(
			"This command cannot be sent in the server. Send it as a DM instead."
		);
		return;
	}

	//Do the command
	try {
		command.execute(client, message, args);
	} catch (error) {
		postErrorMessage(error, message.channel);
	}
});

//Getting reactions of all messages ever
//https://github.com/AnIdiotsGuide/discordjs-bot-guide/blob/master/coding-guides/raw-events.md
client.on('raw', packet => {
	console.log(client.ws);
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = client.channels.cache.get(packet.d.channel_id);
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    if (channel.messages.cache.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.messages.fetch(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        const reaction = message.reactions.cache.get(emoji);
        // Adds the currently reacting user to the reaction's users collection.
        if (reaction) reaction.users.cache.set(packet.d.user_id, client.users.cache.get(packet.d.user_id));
        // Check which type of event it is before emitting
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            client.emit('messageReactionAdd', reaction, client.users.cache.get(packet.d.user_id));
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            client.emit('messageReactionRemove', reaction, client.users.cache.get(packet.d.user_id));
        }
    });
});

client.on('raw', console.dir);

client.on('debug', console.log);

client.on("messageUpdate", async updatedMessage => {
	//Only do anything if we're obviously in a gameplay channel
	if (updatedMessage.channel.type == "dm" || updatedMessage.channel.name[0] != "p") return;

	let earlogMessage = await UtilityFunctions.GetMessageFromDatabase(client, updatedMessage);
	if (!earlogMessage) return;

	try {
		earlogMessage.react(`📝`);
	} catch (error) {
		console.error(`messageUpdate Error: ${error}`);
	}
})


client.on("messageReactionAdd", async (reaction, user) => {
	//Only do anything if we're obviously in a gameplay channel
	if (reaction.message.channel.type == "dm" || reaction.message.channel.name[0] != "p") return;

	let earlogMessage = await UtilityFunctions.GetMessageFromDatabase(client, reaction.message);
	if (!earlogMessage) return;

	try {
		earlogMessage.react(reaction.emoji);
	} catch (error) {
		console.error(`messageReactionAdd Error: ${error}`);
	}
})

client.on("messageReactionRemove", async (reaction, user) => {
	//Only do anything if we're obviously in a gameplay channel
	if (reaction.message.channel.type == "dm" || reaction.message.channel.name[0] != "p") return;
	
	if (reaction.message.reactions.cache.filter(r => r.emoji == reaction.emoji).size != 0) return;

	let earlogMessage = await UtilityFunctions.GetMessageFromDatabase(client, reaction.message);
	if (!earlogMessage) return;
	
	try {
		earlogMessage.reactions.cache.get(reaction.emoji.name).remove();
	} catch (error) {
		console.error(`messageReactionRemove Error: ${error}`);
	}
})




client.on('rateLimit', (info) => {
	console.log(`Rate limit hit!`);
	console.dir(info);
})

client.on("error", error => {
	console.error(error);
})



client.login(token);
