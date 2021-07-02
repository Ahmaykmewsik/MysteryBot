const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'setarea',
	description: 'Manually sets the area for a player. This command only changes where the bot thinks the player is, NOT what discord channel they are in! (use `!fixplayerarea` to move a player inbetween discord channels)',
    format: "!setarea <username> <areaid>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        //Remove all locations of player
        client.deleteLocationsOfPlayer.run(`${message.guild.id}_${player.username}`);

        //Insert new location info
        client.setLocation.run({
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            areaID: area.id
        });

        message.channel.send(player.username + "'s area has been manually set.\n" + formatPlayer(client, player), {split: true});

	}
};