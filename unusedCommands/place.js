const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'place',
	description: 'Places an item in an area.',
    format: "!placeitem <itemid> <areaid>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify the area and item IDs.");
        }
        if (args.length === 1) {
            return message.channel.send("No area ID given.");
        }
        const itemid = args[0];
        const areaid = args[1];

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }

        const areaIndexToUpdate = areas.findIndex(area => area.id == areaid);
        if (areaIndexToUpdate === -1) {
            return message.channel.send("No area exists with ID `" + areaid + "`. Use !areas to view all areas.");
        }

        const itemIndex = items.findIndex(i => i.id == itemid);
        if (itemIndex === -1) {
            return message.channel.send("No item exists with ID `" + itemid + "`. Use !items to view all items.");
        }

        areas[areaIndexToUpdate].items.push(items[itemIndex].id);

        client.data.set("AREA_DATA", areas);
        client.data.set("ITEM_DATA", items);

        message.channel.send("The `" + items[itemIndex] + "` has been placed!");
        message.channel.send(formatArea(areas[areaIndexToUpdate], items));
    }
};