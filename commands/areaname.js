const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'areaname',
	description: 'Updates the name (not the ID) of a specified area.',
    format: "!areaname <id> <name>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area name.");
        }
        if (args.length === 1) {
            return message.channel.send("No area name given. Please specify the name you wish to assign this area.");
        }
        const id = args[0];
        const name = args.slice(1).join(' ').toUpperCase();

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

        areas[areaIndexToUpdate].name = name;
        client.data.set("AREA_DATA", areas);

        message.channel.send("Area name updated!");
        message.channel.send(formatArea(areas[areaIndexToUpdate], items));
    }
};