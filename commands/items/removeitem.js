const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'removeitem',
	description: 'Removes the item with specified ID string.',
    format: "!removeitem <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter an item ID.");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        message.channel.send(formatItem(client, item));
        message.channel.send("Are you sure you want to delete this item? (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //remove item
                        client.deleteItem.run(`${message.guild.id}_${item.id}`);
                        client.deleteItemFromInventory.run(item.id, message.guild.id);
                        message.channel.send(`\`${itemid}\` removed!`);
                    
                    }
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                    console.log(Error);
                })
        });
    }
};