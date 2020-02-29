const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'areaimage',
	description: 'Updates the image of a specified area.',
    format: "!areaimage <id> <imageURL>",
    gmonly: true,
	execute(client, message, args) {

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            return message.channel.send("You have no areas yet! Add an area first.");
        }

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and imageURL.");
        }
        if (args.length === 1) {
            return message.channel.send("No image URL given. Please specify the image you wish to assign this area.");
        }

        const id = args[0];
        const imageURL = args[1];

        var areaIndexToUpdate = areas.findIndex(area => area.id == id);
        if (areaIndexToUpdate === -1) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        if (!imageURL[3] == ("http")) {
            return message.channel.send("That's not an URL. Please input an image URL.");
        }

        areas[areaIndexToUpdate].image = imageURL;
        client.data.set("AREA_DATA", areas);

        message.channel.send("Area image updated!");
        message.channel.send(formatArea(areas[areaIndexToUpdate], items));
    }
};