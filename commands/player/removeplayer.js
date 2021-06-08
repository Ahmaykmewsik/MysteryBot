const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'removeplayer',
	description: 'Removes a player from the game',
    format: "!kill <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.join(" "));
        if (player.username == undefined) return; 

        
        client.deletePlayer.run(`${message.guild.id}_${player.username}`);
        
        client.deleteLocationsOfPlayer.run(`${message.guild.id}_${player.username}`);


        message.channel.send(player.username + " has been removed.");
	}
};