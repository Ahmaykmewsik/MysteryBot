const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions.js');
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
            message.channel.send(`There's nobody in ${area.id}! But I love you, so I'll make it anyway. Just for you :)`);
        }

        const players = client.getPlayers.all(message.guild.id);
        const locations = client.getLocations.all(message.guild.id);
        const inventoryData = client.getItemsAndInventories.all(message.guild.id);

        try {
            
            ChannelCreationFunctions.CreateSingleChannel(client, message, area, message.guild, settings, players, locations, inventoryData);
            return message.channel.send("Channel for `" + area.id + "` created.");
   
        } catch (error) {
            console.error(error);
            message.channel.send("WARNING: Something went wrong in the bot during that command. You may need to try again. Give this info to Ahmayk: \n\n" + error, { split: true });
        }
        
        

        
    }
}