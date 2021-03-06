const createChannels = require('../../utilities/createChannels.js').createChannels;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'createareachannel',
	description: 'Create a channel for an area manually. You should only need this command if the area does not spawn automatically.',
    format: "!createareachannel <areaid>",
    gmonly: true,
    guildonly: true,
	execute(client, message, args) {
        
        const settings = UtilityFunctions.GetSettings(client, message.guild.id);
		if (settings.phase == null) {
			return message.channel.send("Aborting. The game hasn't started yet. Please use !gamestart first to begin the game.");
		}

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }

        const id = args.join(" ");

        const area = client.getArea.get(`${message.guild.id}_${id}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        const location = client.getPlayersOfArea.all(area.id, area.guild);

        if (location.length == 0) {
            return message.channel.send(`Aborting. There's nobody in ${area.id}! Put someone here first with \`!setarea\`.`);
        }

        const players = client.getPlayers.all(message.guild.id);
        const locations = client.getLocations.all(message.guild.id);

        createChannels(client, message.guild, [area], players, locations, settings);

        return message.channel.send("Channel for `" + area.id + "` created.");
    }
}