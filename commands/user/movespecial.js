const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'movespecial',
	description: 'Move in a non-standard way. Sent to the GM for processing.',
	format: "!movespecial <id>",
	dmonly: true,
	execute(client, message, args) {
		
		let player = UtilityFunctions.GetPlayerFromDM(client, message);
		if (!player.username) return;

		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (settings.phase == null) {
			return message.channel.send("No game is currently in progress.")
		}

		if (player.forceMoved) {
			return message.channel.send("The GM has already processed your movement manually. If you wish to change it, please consult your GM.");
		}

		let returnMessage = "";

		const action = args.join(" ");

		if (player.moveSpecial) {
			returnMessage += `Your previous \`!movespecial\` command: \`${player.moveSpecial}\` has been overwritten.\n`
			player.move = null;
		}

		player.moveSpecial = action;
		if (player.move) {
			returnMessage += `Your previous \`!move\` command: \`${player.move}\` has been overwritten.\n`
			player.move = null;
		}

		client.setPlayer.run(player);

		const displayName = `${player.character.toUpperCase()} [${player.username.toUpperCase()}]`;
		client.channels.get(settings.actionLogID).send(":bangbang: :arrow_forward: MOVESPECIAL " + displayName + ": `" + action + "`");
		returnMessage += "Movespecial sent. The GM will process this action manually."
		message.channel.send(returnMessage);
		message.reply(formatPlayer(client, player));
	}
};