const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'charactername',
	description: 'Changes a player\'s character name. DMs the player when the name is changed.',
    format: "!charactername <player> <charactername>",
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
            return message.channel.send("You need to put a name.");
        }

        const characterName = args.join(" ");

        player.character = characterName;
  
        client.setPlayer.run(player);

        message.channel.send(player.username + "'s character name has been changed to: `" + player.character + "`");
        message.channel.send(formatPlayer(client, player));

        client.users.cache.get(player.discordID).send("**You will now appear as: **\n" + player.character);
        message.channel.send(`:exclamation:${player.username} was notified.`);
	}
};