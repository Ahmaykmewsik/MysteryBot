const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'locations',
	description: 'Lists the locations of all players.' ,
    format: "!locations",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let locations = client.getLocations.all(message.guild.id);
        locations = locations.sort();
        let listOfPlayers = locations.map(location => `**${location.areaID}**: ${location.username}`).join(`\n`);
        message.channel.send(`------**LOCATIONS**------\n${listOfPlayers}`, {split: true});

	}
};