const createChannels = require('../utilities/createChannels.js').createChannels;

module.exports = {
	name: 'createareachannel',
	description: 'Create a channel for an area manually. You should only need this command if the area does not spawn automatically.',
    format: "!createareachannel <areaid>",
    gmonly: true,
    guildonly: true,
	execute(client, message, args) {
        
        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }
        
        const category = client.data.get("CATEGORY_DATA");
        const phaseNumber = client.data.get("PHASE_COUNT");

        if (phaseNumber < 0 || phaseNumber == undefined){
            return message.channel.send("Aborting. The game hasn't started yet. Please use !gamestart first to begin the game.")
        }

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }

        const areaID = args[0];
        var areaIndexToUpdate = areas.findIndex(area => area.id == areaID);
        if (areaIndexToUpdate === -1) {
            return message.channel.send("No area exists with ID `" + areaID + "`. Use !areas to view all areas.");
        }

        if (areas[areaIndexToUpdate].playersPresent.length == 0) {
            return message.channel.send("Aborting. There's nobody here! Put someone here first with `!setarea`.");
        }

        createChannels(client, message.guild, [areas[areaIndexToUpdate]], category.id, phaseNumber);

        return message.channel.send("Channel for `" + areas[areaIndexToUpdate].name + "` created.")
    }
}