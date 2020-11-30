const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'itemdesc',
	description: 'Update an item\'s description.',
    format: "!item <item id> <description>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var items = client.data.get("ITEM_DATA");

        if (args.length == 0) {
            return message.channel.send("You need to enter an item ID.");
        }

        if (args.length == 1) {
            return message.channel.send("There's no description!");
        }

        if (items == undefined){
            return message.channel.send("You have no items! Add some items first with !additem")
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const itemToGive = items.find(i => i.id == itemid);
        if (itemToGive == undefined) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        const description = args.join(' ');
        itemToGive.description = description;

        client.data.set("ITEM_DATA", items);
       
        //Post it
        message.channel.send(itemToGive.id + " updated.\n" + formatItem(itemToGive));

	}
};