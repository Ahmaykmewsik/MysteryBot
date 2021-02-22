const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'unkill',
	description: 'Resurrects a player and makes them alive. Does not change their health, only their living status.',
    format: "!unkill <username>",
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

        if (player.alive == 1) {
            return message.channel.send(`Huh? But ${player.username} is already alive!`);
        }
        
        player.alive = 1;

        client.setPlayer.run(player);

        message.channel.send(player.username + " has risen from the dead!\n If they should have health other than 0 change it with `!sethealth` or `!heal`");
        message.channel.send(formatPlayer(client, player));
	}
};