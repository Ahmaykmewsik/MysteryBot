const prefix = process.env.prefix;
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const d20roll = require('../../utilities/d20roll').d20roll;

module.exports = {
	name: 'do',
	description: 'Sends an action to the GM. DM use only.',
	format: "!do <what you wanna do>",
	dmonly: true,
	execute(client, message, args) {
		
		let player = UtilityFunctions.GetPlayerFromDM(client, message);
		if (!player.username) return;

		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (!settings.phase) {
			return message.channel.send("No game is currently in progress.")
		}

		if (player.forceMoved) {
			return message.channel.send("The GM has already processed your movement manually. If you wish to change your action, please consult your GM.");
		}

		if (args.length === 0) {
			return message.channel.send("Do what now? You need to say what you're doing.");
		}

		const action = message.content.split(prefix + "do ")[1];
		
		const ifUpdated = (player.action == undefined) ? false : true;

		player.action = action;
		player.roll = d20roll();
		client.setPlayer.run(player);

		const displayName = `${player.character} [${player.username}]`;

		if (ifUpdated){
			client.channels.get(settings.actionLogID).send(
				"----------------------------------------" +
				"\n**ACTION UPDATED** by `" + displayName + "` ```" + action + "```" +
				"ROLL: " + player.roll //d20 roll ftw
				);
			message.reply("Action updated.");
		} else {
			client.channels.get(settings.actionLogID).send(
				"----------------------------------------" +
				"\nACTION by `" + displayName + "` ```" + action + "```" +
				"ROLL: " + player.roll //d20 roll ftw
				);
			message.reply("Action sent.");
		}
		
		message.reply(formatPlayer(client, player));
	}
};