const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'removeitem',
	description: 'Removes the item with specified ID string.',
    format: "!removeitem <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No item ID provided. Please specify an item ID to delete.");
        }
        if (args.length > 1) {
            return message.channel.send("item ID cannot contain whitespace.");
        }

        const id = args[0];
        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }
        
        var itemToRemove = items.find(item => item.id == id);
        if (itemToRemove == undefined) {
            return message.channel.send("No item found with that ID. Use !items to view the list of existing items.");
        }

        message.channel.send(formatItem(itemToRemove));
        message.channel.send("Are you sure you want to delete this item? (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //remove item
                        items = items.filter(item => item.id != id);

                        message.channel.send("Item `" + id + "` removed.");
                        } else if (messages.first().content == 'n') {
                            message.channel.send("Okay, never mind then :)");
                        } else {
                            message.channel.send("...uh, okay.");
                        }
                        client.data.set("ITEM_DATA", items);
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                    console.log(Error);
                })
        });
    }
};