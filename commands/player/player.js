const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'player',
	description: 'Lists a participating players.',
    format: "!player <username>",
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.join(" "));
        if (player.username == undefined) return;

        message.channel.send(formatPlayer(client, player), {split: true});
    }
};