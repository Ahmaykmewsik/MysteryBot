const prefix = process.env.prefix;

module.exports = {
	name: 'move',
	description: 'Submits a movement action, to move to the area with a given ID.',
	format: "!move <id>",
	dmonly: true,
	execute(client, message, args) {
		
		const actionLogChannelID = client.data.get("ACTION_LOG");
		const areas = client.data.get("AREA_DATA");
		const players = client.data.get("PLAYER_DATA");

		const player = players.find(p => p.name == message.author.username);
		if (player == undefined) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}
		if (player.area == undefined) {
			return message.channel.send("You're not alive! No movement actions for you.");
		}

		const currentArea = areas.find(a => a.id == player.area);
		
		if (args.length === 0) {
			return message.channel.send("Please specify the ID of the area you wish to move to. Valid options: `"
				+ currentArea.reachable.join('`, `') + '`.');
		}
		if (args.length > 1 || !currentArea.reachable.includes(args[0])) {
			return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid movement option. Valid options: `"
				+ currentArea.reachable.join('`, `') + '`.');
		}
		// TODO: consider supporting hidden movement options
        
		player.move = args[0];
		client.data.set("PLAYER_DATA", players);
        client.channels.get(actionLogChannelID).send("MOVE " + message.author.username + ": `" + action + "`");
        
        message.channel.send("Movement sent.");
	}
};