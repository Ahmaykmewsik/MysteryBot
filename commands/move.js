
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'move',
	description: 'Submits a movement action, to move to the area with a given ID.',
	format: "!move <id>",
	dmonly: true,
	execute(client, message, args) {

		const actionLogChannelID = client.data.get("ACTION_LOG");
		const areas = client.data.get("AREA_DATA");
		const players = client.data.get("PLAYER_DATA");
		const items = client.data.get("ITEM_DATA");

		var player = players.find(p => p.name == message.author.username);

		if (player == undefined) {
			return message.channel.send("You don't seem to be on the list of players. If you think this is a mistake, ask your GM.");
		}

		if (actionLogChannelID == undefined) {
			return message.channel.send("The GM needs to set the action log!");
		}

		if (player.area == undefined) {
			return message.channel.send("You're not alive! No movement actions for you.");
		}

		var currentArea = areas.filter(a => player.area.includes(a.id));

		var multiAreamode = true;
		if (currentArea.length == 1) {
			currentArea = currentArea[0];
			multiAreamode = false
		}

		if (args.length === 0) {
			if (!multiAreamode) {
				return message.channel.send("Please specify the ID of the area you wish to move to. Valid options: `"
				+ currentArea.reachable.join('`, `') + '`.');
			} else {
				return message.channel.send("Please specify the ID of the area you wish to move to. Valid options: `" + player.area.join('`, `') + "`");
			}
			
		}

		//Changes "stay" to current location
		if (args[0].toLowerCase() == ("stay")) {
			args[0] = currentArea;
		}

		var ifUpdated;
		var moveid;

		if (!multiAreamode) {
			if (args.length > 1 || !currentArea.reachable.includes(args[0])) {
				return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid movement option. Valid options: `"
					+ currentArea.reachable.join('`, `') + '`.');
			}

			ifUpdated = (player.move == undefined) ? false : true;

			moveid = currentArea.reachable.find(id => id == args[0]);
			if (moveid == undefined) {
				moveid = currentArea.reachable.find(id => id.includes(args[0]));
			}
			player.move = [moveid];


		} else {
			//for multi-area moments
			if (args.length > 1 || !player.area.includes(args[0])) {
				return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid movement option. Your valid options are the places that you're in right now: `"
					+ player.area.join('`, `') + '`.');
			}

			ifUpdated = (player.move == undefined) ? false : true;

			moveid = player.area.find(id => id == args[0]);
			if (moveid == undefined) {
				moveid = player.area.find(id => id.includes(args[0]));
			}
			player.move = [moveid];
		}

		client.data.set("PLAYER_DATA", players);
		client.data.set("AREA_DATA", areas);

		if (!ifUpdated) {
			client.channels.get(actionLogChannelID).send(
				":arrow_right: MOVE " + message.author.username.toUpperCase() + ": **" + player.move + "**"
			);
			message.reply("Movement sent.");
		} else {
			client.channels.get(actionLogChannelID).send(
				":fast_forward: **MOVEMENT UPDATED** " + message.author.username.toUpperCase() + ": **" + player.move + "**"
			);
			message.reply("Movement updated.");
		}

		message.reply(formatPlayer(player, items));
	}
};