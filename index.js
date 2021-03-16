Error.stackTraceLimit = Infinity;

const fs = require("fs");
const path = require("path");

require("dotenv").config();

const { EarlogListener } = require("./EarlogListener");

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
				permanent BOOL 
			);`
		).run();

		//Spy Current
		sql.prepare(
			`CREATE TABLE spyCurrent (
				guild_username TEXT,
				username TEXT,
				guild TEXT,
				spyArea TEXT,
				accuracy FLOAT,
				permanent BOOL 
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
				guild_areaID TEXT,
				areaID TEXT,
				guild TEXT,
				channelName TEXT,
				channelID TEXT,
				earlogChannelID TEXT
			)`
		).run();

		//Settings
		sql.prepare(
			`CREATE TABLE settings (
				guild TEXT PRIMARY KEY,
				categoryName TEXT,
				categoryID TEXT,
				categoryNum INTEGER,
				spyCategoryID TEXT,
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
		`SELECT * from players WHERE username = ?`
	)

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
		WHERE guild = ?`
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
		WHERE items.guild = ?`
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

	client.getSpyCurrent = sql.prepare(
		`SELECT * FROM spyCurrent
		WHERE guild_username = ?`
	);

	client.getSpyCurrentAll = sql.prepare(
		`SELECT * FROM spyCurrent
		WHERE guild = ?`
	);

	client.addSpyAction = sql.prepare(
		`INSERT INTO spyActions (guild_username, username, guild, spyArea, accuracy, permanent)
		VALUES (@guild_username, @username, @guild, @spyArea, @accuracy, @permanent)`
	);

	client.addSpyCurrent = sql.prepare(
		`INSERT INTO spyCurrent (guild_username, username, guild, spyArea, accuracy, permanent)
		VALUES (@guild_username, @username, @guild, @spyArea, @accuracy, @permanent)`
	);

	client.deleteSpyActions = sql.prepare(
		`DELETE FROM spyActions
		WHERE guild_username = ?`
	);

	client.deleteAllSpyActions = sql.prepare(
		`DELETE FROM spyActions
		WHERE guild = ?`
	)

	client.deleteSpyCurrent = sql.prepare(
		`DELETE FROM spyCurrent
		WHERE guild_username = ?`
	);

	client.deleteAllSpyCurrent = sql.prepare(
		`DELETE FROM spyCurrent
		WHERE guild = ?`
	);


	// -------Settings Functions------

	client.getSettings = sql.prepare(
		`SELECT * FROM settings
		WHERE guild = ?`
	);

	client.setSettings = sql.prepare(
		`INSERT OR REPLACE INTO settings (guild, categoryName, categoryID, categoryNum, spyCategoryID, phase, actionLogID, healthSystemActivated, defaultHealth, maxHealth)
		VALUES (@guild, @categoryName, @categoryID, @categoryNum, @spyCategoryID, @phase, @actionLogID, @healthSystemActivated, @defaultHealth, @maxHealth)`
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
		`INSERT INTO gameplayChannels (guild_areaID, areaID, guild, channelName, channelID, earlogChannelID)
		VALUES (@guild_areaID, @areaID, @guild, @channelName, @channelID, @earlogChannelID)`
	);

	client.deleteAllEarlogChannelData = sql.prepare(
		`DELETE FROM earlogChannels 
		WHERE guild = ?`
	);

	client.deleteAllSpyChannelData = sql.prepare(
		`DELETE FROM spyChannels 
		WHERE guild = ?`
	);

	client.deleteAllGameplayChannelData = sql.prepare(
		`DELETE FROM gameplayChannels 
		WHERE guild = ?`
	);

	//Boot message
	console.log("It's time to get mysterious!");
});

client.on("message", message => {

	///EARLOG---------------------------------------------------------
	if (message.channel.type != "dm" && message.channel.name[0] == "p") {
		try {
			if ((message.content.toLowerCase() == "lock") && (message.member.hasPermission('ADMINISTRATOR'))) {
				message.channel.overwritePermissions(message.channel.guild.defaultRole, { SEND_MESSAGES: false });
			}
		} catch (error) {
			console.error("LOCK error!" + error);
		}
		
		try {
			EarlogListener(client, message);
		} catch (error) {
			console.log("Earlog Error!");
			console.error(error);
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
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
});

client.login(token);
