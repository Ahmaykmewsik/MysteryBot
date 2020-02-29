const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'areadesc',
	description: 'Updates the description of a specified area.',
    format: "!areadesc <id> <description>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }
        if (args.length === 1) {
            return message.channel.send("No area description given. Please specify the description you wish to assign this area.");
        }
        const id = args[0];
        const description = args.slice(1).join(' ');

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }

        var areaIndexToUpdate = areas.findIndex(area => area.id == id);
        if (areaIndexToUpdate === -1) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        areas[areaIndexToUpdate].description = description;
        client.data.set("AREA_DATA", areas);

        message.channel.send("Area description updated!");
        message.channel.send(formatArea(areas[areaIndexToUpdate], items));
    }
};