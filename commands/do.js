const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;


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

		var player = players.filter(p => p.name == message.author.username);

		if (player == undefined) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}

		player = player[0];

		if (player.area == undefined) {
			return message.channel.send("You're not alive! No action for you.");
		}

		if (args.length === 0) {
			return message.channel.send("Do what now? You need to say what you're doing.");
		}

		const action = message.content.split(prefix + "do ")[1];

		console.log(action);
		
		const ifUpdated = (player.action == undefined) ? false : true;

		player.action = action;
		client.data.set("PLAYER_DATA", players);

		if (ifUpdated){
			client.channels.get(actionLogChannelID).send(
				"----------------------------------------" +
				"\n**ACTION UPDATED** by `" + message.author.username + "` ```" + action + "```" +
				"ROLL: " + (Math.floor(Math.random() * 20 ) + 1 ) //d20 roll ftw
				);
			message.reply("Action updated.");
		} else {
			client.channels.get(actionLogChannelID).send(
				"----------------------------------------" +
				"\nACTION by `" + message.author.username + "` ```" + action + "```" +
				"ROLL: " + (Math.floor(Math.random() * 20 ) + 1 ) //d20 roll ftw
				);
			message.reply("Action sent.");
		}
		
		message.reply(formatPlayer(player));
	}
};