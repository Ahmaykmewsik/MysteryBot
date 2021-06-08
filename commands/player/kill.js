const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'kill',
	description: 'Kills a player. Leaves their body in their current location. Clears their movement action.',
    format: "!kill <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;
        
        player.health = 0;
        player.alive = 0;
        player.move = null;

        client.setPlayer.run(player);

        message.channel.send(player.username + " is dead!\n");
        message.channel.send(formatPlayer(client, player));
	}
};