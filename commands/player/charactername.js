const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'charactername',
	description: 'Changes a player\'s character name. DMs the player when the name is changed.',
    format: "!charactername <player> <charactername>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;
        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        const characterName = args.join(" ");

        player.character = characterName;
  
        client.setPlayer.run(player);

        message.channel.send(player.username + "'s character name has been changed to: `" + player.character + "`");
        message.channel.send(formatPlayer(client, player));

        let messageToPlayer = `**You will now appear as: **\n${player.character}`;
        UtilityFunctions.NotifyPlayer(client, message, player, messageToPlayer, settings);
	}
};