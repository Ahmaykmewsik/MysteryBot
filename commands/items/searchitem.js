const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'searchitem',
	description: 'Lists all items that include the provided input in their id.',
    format: "!searchitem",
    alias: "itemsearch",
    gmonly: true,
	execute(client, message, args) {

        const items = client.getItems.all(message.guild.id);

        if (args.length == 0) {
            return message.channel.send("Please input an item to search");
        }
        if (args.length > 1) {
            return message.channel.send("Please only input 1 query.");
        }

        const input = args[0];

        var itemstring = `Items that include: \`${input}\`\n`;

        let noItemsFound = true;
        
        if (items.length > 0) {
            for (let i in items) {
                if (items[i].id.includes(input) || items[i].description.includes(input)) {
                    noItemsFound = false;
                    itemstring += formatItem(client, items[i]) + "\n\n";
                }
            }
        } else {
            return message.channel.send("You haven't defined any items yet.");
        }   

        if (noItemsFound) {
            itemstring += "`No Items found.`"
        }

        message.channel.send(itemstring, {split: true});     
    }
};