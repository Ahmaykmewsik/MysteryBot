const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'kill',
	description: 'Kills a player. Leaves their body in their current location. Clears their movement action.',
    format: "!kill <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var table = client.countPlayers.get(message.guild.id);
        if (table['count(*)'] == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }
        
        player.health = 0;
        player.alive = 0;
        player.move = null;

        client.setPlayer.run(player);

        message.channel.send(player.username + " is dead!\n");
        message.channel.send(formatPlayer(client, player));
	}
};