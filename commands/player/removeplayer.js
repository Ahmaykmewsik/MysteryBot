const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'removeplayer',
	description: 'Removes a player from the game',
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

        
        client.deletePlayer.run(`${message.guild.id}_${player.username}`);
        
        client.deleteLocationsOfPlayer.run(`${message.guild.id}_${player.username}`);


        message.channel.send(player.username + " has been removed.");
	}
};