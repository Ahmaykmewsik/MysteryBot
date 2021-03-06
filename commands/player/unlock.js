const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'unlock',
	description: 'Gives players access to update their action or movement (`!forcemove` locks access)',
    format: "!unlock <username>",
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

        let player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (player.forceMoved == 0) {
            return message.channel.send(`${player.username} is already unlocked!`);
        }
        
        player.forceMoved = 0;

        client.setPlayer.run(player);

        message.channel.send(player.username + " has been unlocked! They can now update their action.");
	}
};