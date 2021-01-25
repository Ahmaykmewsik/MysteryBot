

module.exports = {
	name: 'movespecial',
	description: 'Move in a non-standard way. Sent to the GM for processing.',
	format: "!movespecial <id>",
	dmonly: true,
	execute(client, message, args) {
		
		const actionLogChannelID = client.data.get("ACTION_LOG");
		const players = client.data.get("PLAYER_DATA");

		var player = players.filter(p => p.name == message.author.username);

		if (player == undefined) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}

		player = player[0];

		if (player.area == undefined) {
			return message.channel.send("You're not alive! No movement actions for you.");
		}

        client.channels.get(actionLogChannelID).send(":bangbang: :arrow_forward: MOVE SPECIAL" + message.author.username + ": `" + args.join(" ") + "`");
		
		message.channel.send("Movement to " + player.move + " sent. The GM will process this action manually.");

	}
};