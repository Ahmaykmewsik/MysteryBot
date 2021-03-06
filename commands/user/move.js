const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'move',
	description: 'Submits a movement action, to move to the area with a given ID.',
	format: "!move <id>",
	dmonly: true,
	execute(client, message, args) {

		let player = UtilityFunctions.GetPlayerFromDM(client, message);
		if (!player.username) return;
		
		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (settings.phase == null) 
			return message.channel.send("No game is currently in progress.");

		if (player.forceMoved) 
			return message.channel.send("The GM has already processed your movement manually. If you wish to change it, please consult your GM.");
		
		let location = client.getLocationOfPlayer.get(`${player.guild}_${player.username}`);

		if (!location) 
			return message.channel.send("The bot can't find where you are! Ask your GM for assistance.");
		
		let currentAreaConnections = client.getConnections.all(location.areaID, player.guild);
		if (currentAreaConnections.length == 0) 
			return message.channel.send("Sorry, you can't go anywhere!");
		
		if (args.length === 0) {
			return message.channel.send("Please specify the ID of the area you wish to move to. Valid options: `"
					+ currentAreaConnections.map(c => c.area2).join('`, `') + '`.');
		}

		let areaInput = currentAreaConnections.find(c => c.area2 == args.join(" "));
		if (areaInput == undefined) 
			areaInput = currentAreaConnections.find(c => c.area2.includes(args.join(" ")));
		
		if (args.length > 1 || !areaInput) {
			return message.channel.send("Sorry, `" + args.join(' ') + "` is not a valid movement option. Valid options: "
				+ currentAreaConnections.map(c => c.area2).join(`, `));
		}
		areaInput = areaInput.area2;
		
		let actionLogMessage = "";
		let returnMessage = "";

		if (player.move) 
			returnMessage += `Your previous \`!move\` command: \`${player.move}\` has been overwritten.\n`

		player.move = areaInput;
		if (player.moveSpecial) {
			returnMessage += `Your previous \`!movespecial\` command: \`${player.moveSpecial}\` has been overwritten.\n`
			player.moveSpecial = null;
		}
		client.setPlayer.run(player);
		
		const displayName = `${player.character.toUpperCase()} [${player.username.toUpperCase()}]`;
		const ifUpdated = (player.move == undefined) ? false : true;
		if (!ifUpdated) {
			actionLogMessage = ":arrow_right: MOVE " + displayName + ": **" + player.move + "**"
			returnMessage += "Movement sent.";
		} else {
			actionLogMessage = ":fast_forward: :fast_forward:**MOVEMENT UPDATED** " + displayName + ": **" + player.move + "**"
			returnMessage += "Movement updated.";
		}

		client.channels.cache.get(settings.actionLogID).send(actionLogMessage);
		message.reply(returnMessage);
		message.reply(formatPlayer(client, player));
	}
};