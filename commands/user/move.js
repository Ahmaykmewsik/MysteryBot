const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'move',
	description: 'Submits a movement action, to move to the area with a given ID.',
	format: "!move <id>",
	dmonly: true,
	execute(client, message, args) {

		let player = UtilityFunctions.GetPlayerFromDM(client, message);

		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (settings.phase == null) {
			return message.channel.send("No game is currently in progress.")
		}

		let location = client.getLocationOfPlayer.get(`${player.guild}_${player.username}`);

		if (!location) {
			return message.channel.send("The bot can't find where you are! Ask your GM for assistance.");
		}

		let currentAreaConnections = client.getConnections.all(location.areaID, player.guild);
		if (currentAreaConnections.length == 0) {
			return message.channel.send("Sorry, you can't go anywhere!");
		}

		if (args.length === 0) {
			return message.channel.send("Please specify the ID of the area you wish to move to. Valid options: `"
					+ currentAreaConnections.join('`, `') + '`.');
		}

		let areaInput = currentAreaConnections.find(c => c.area2 == args.join(" "));
		if (areaInput == undefined) {
			areaInput = currentAreaConnections.find(c => c.area2.includes(args.join(" ")));
		}

		console.log(currentAreaConnections);

		if (args.length > 1 || !areaInput) {
			return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid movement option. Valid options: "
				+ currentAreaConnections.map(c => c.area2).join(`, `));
		}
		areaInput = areaInput.area2;
		
		player.move = areaInput;
		client.setPlayer.run(player);

		let actionLogMessage = "";
		let returnMessage = "";
		const displayName = `${player.character.toUpperCase()} [${player.username.toUpperCase()}]`;
		const ifUpdated = (player.move == undefined) ? false : true;
		if (!ifUpdated) {
			actionLogMessage = ":arrow_right: MOVE " + displayName + ": **" + player.move + "**"
			returnMessage = "Movement sent.";
		} else {
			actionLogMessage = ":fast_forward: :fast_forward:**MOVEMENT UPDATED** " + displayName + ": **" + player.move + "**"
			returnMessage = "Movement updated.";
		}

		client.channels.get(settings.actionLogID).send(actionLogMessage);
		message.reply(returnMessage);
		message.reply(formatPlayer(client, player));
	}
};