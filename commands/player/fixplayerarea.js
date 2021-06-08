const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'fixplayerarea',
	description: 'Moves a player out of their current area and into another one. For when a player moves to the wrong area during the phase rollover and you need to fix it.',
    format: "!fixplayerarea <username> <areaid>",
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.join(" "));
        if (player.username == undefined) return;

        message.channel.send(formatPlayer(client, player), {split: true});
    }
};