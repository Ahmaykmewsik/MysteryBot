const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;
const d20roll = require('../utilities/d20roll').d20roll;



module.exports = {
	name: 'do',
	description: 'Sends an action to the GM',
	format: "!do <what you wanna do>",
	dmonly: true,
	execute(client, message, args) {
		
		actionLogChannelID = client.data.get("ACTION_LOG");
		
		if (actionLogChannelID == undefined) {
			return message.channel.send("The GM needs to set the action log!");
		}

		const players = client.data.get("PLAYER_DATA");
		const items = client.data.get("ITEM_DATA");

		var player = players.find(p => p.name == message.author.username);

		if (player == undefined ) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}

		//console.log(player);

		//player = player[0];

		if (player.area == undefined) {
			return message.channel.send("You're not alive! No action for you.");
		}

		if (args.length === 0) {
			return message.channel.send("Do what now? You need to say what you're doing.");
		}

		const action = message.content.split(prefix + "do ")[1];
		
		const ifUpdated = (player.action == undefined) ? false : true;

		player.action = action;
		player.roll = d20roll();
		client.data.set("PLAYER_DATA", players);
		//CHANGE THIS!

		if (ifUpdated){
			client.channels.get(actionLogChannelID).send(
				"----------------------------------------" +
				"\n**ACTION UPDATED** by `" + message.author.username + "` ```" + action + "```" +
				"ROLL: " + player.roll //d20 roll ftw
				);
			message.reply("Action updated.");
		} else {
			client.channels.get(actionLogChannelID).send(
				"----------------------------------------" +
				"\nACTION by `" + message.author.username + "` ```" + action + "```" +
				"ROLL: " + player.roll //d20 roll ftw
				);
			message.reply("Action sent.");
		}
		
		message.reply(formatPlayer(player, items));
	}
};