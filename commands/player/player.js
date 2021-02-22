const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'player',
	description: 'Lists a participating players.',
    format: "!player <username>",
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

        message.channel.send(formatPlayer(client, player));
    }
};