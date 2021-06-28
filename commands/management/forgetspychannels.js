const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'forgetspychannels',
	description: 'Forces the bot to forget about any discord channels it made for a player for spying. (You can thank Dirty Spaceman for this command!)',
    format: "!forgetspychannel <player>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;
        
        client.deleteSpyChannelDataOfPlayer.run(player.guild, player.username);

        message.channel.send(`All spy channels created for ${player.username} have been forgotten. I hope you know what you're doing!`);
	}
};