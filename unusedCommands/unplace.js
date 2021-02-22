const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'unplace',
	description: 'Unplaces/removes an item in an area.',
    format: "!unplaceitem <itemid> <areaid>",
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

        if (!areas[areaIndexToUpdate].items.includes(items[itemIndex].id)) {
            message.channel.send("The area `" + areas[areaIndexToUpdate] + "` has no `" + items[itemIndex] + "  `!");
            message.channel.send(formatArea(areas[areaIndexToUpdate], items));
            return;
        }

        areas[areaIndexToUpdate].items = areas[areaIndexToUpdate].items.filter(i => i != items[itemIndex].id);

        client.data.set("AREA_DATA", areas);
        client.data.set("ITEM_DATA", items);

        message.channel.send("`" + items[itemIndex].id + "` has been unplaced from `" + areas[areaIndexToUpdate].id + "`.");
        message.channel.send(formatArea(areas[areaIndexToUpdate], items));
    }
};