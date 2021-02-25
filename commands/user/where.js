const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'where',
	description: 'For players. Lists your current location.',
    format: "!where",
    gmonly: false,
    dmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayerFromDM(client, message);
        if (!player.username) return;

		const settings = UtilityFunctions.GetSettings(client, player.guild);
		if (settings.phase == null) {
			return message.channel.send("No game is currently in progress.");
		}

        const location = client.getLocationOfPlayer.get(player.guild_username);
        if (!location) {
            return message.channel.send("The bot can't find where you are! Ask your GM for assistance. (Location not found)");
        }
        const currentArea = client.getArea.get(`${player.guild}_${location.areaID}`);
        if (!currentArea) {
            return message.channel.send("The bot can't find where you are! Ask your GM for assistance. (Area not found)");
        }
        
        message.channel.send(formatArea(client, currentArea));
    }
};