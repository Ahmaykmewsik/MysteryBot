const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'forcemove',
	description: 'Moves a player manually on the map.',
    format: "!forcemove <player> <area>",
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

        if (args.length == 0) {
            return message.channel.send("You need to put an area.");
        }

        const area = client.getArea.get(`${message.guild.id}_${args[0]}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        player.move = area.id;
        player.forceMoved = 0; 

        client.setPlayer.run(player);

        message.channel.send(player.username + " will move to: `" + area.id + "`");
        message.channel.send(formatPlayer(client, player));
	}
};