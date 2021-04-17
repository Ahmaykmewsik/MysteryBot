const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'setarea',
	description: 'Manually sets the area for a player.',
    format: "!setarea <username> <areaid>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);   

        //Notify if invalid input for user
        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        //Find area
        const area = client.getArea.get(`${message.guild.id}_${args[0].toLowerCase()}`);

        if (area == undefined) {
            return message.channel.send("No area exists with that ID.");
        }

        //Remove all locations of player
        client.deleteLocationsOfPlayer.run(`${message.guild.id}_${player.username}`);

        //Insert new location info
        client.setLocation.run({
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            areaID: area.id
        });

        message.channel.send(player.username + "'s area has been manually set.\n");

        message.channel.send(formatPlayer(client, player));

	}
};