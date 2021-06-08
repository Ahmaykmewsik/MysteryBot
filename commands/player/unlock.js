const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'unlock',
	description: 'Gives players access to update their action or movement (`!forcemove` locks access)',
    format: "!unlock <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (player.forceMoved == 0) {
            return message.channel.send(`No need. ${player.username} is already unlocked!`);
        }

        player.forceMoved = 0;

        client.setPlayer.run(player);

        message.channel.send(player.username + " has been unlocked! They can now update their action.");
	}
};