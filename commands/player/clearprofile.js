const UtilityFunctions = require('../../utilities/UtilityFunctions');
module.exports = {
	name: 'clearprofile',
	description: 'Clears a player\'s profile.',
    format: "!clearprofile <username>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var table = client.countPlayers.get(message.guild.id);
        if (table['count(*)'] == 0) 
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        
        if (args.length == 0) 
            return message.channel.send("You need to enter a player.");
        
        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) 
            return message.channel.send("Invalid username: " + inputusername);
        
        const profileText = client.getProfile.get(player.username, player.guild);
        if (!profileText)
            return message.channel.send(`Aborted. ${player.username} has no profile to clear!`);

        client.deleteProfile.run(player.username, player.guild);

        let outputMessage = `Profile for ${player.username} cleared!`;
        
        message.channel.send(outputMessage);
	}
};