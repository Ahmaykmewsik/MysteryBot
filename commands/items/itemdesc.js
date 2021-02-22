const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'itemdesc',
	description: 'Update an item\'s description.',
    format: "!item <item id> <description>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter an item ID.");
        }

        if (args.length == 1) {
            return message.channel.send("There's no description!");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        const description = args.join(' ');
        item.description = description;

        client.setItem.run(item);
       
        //Post it
        message.channel.send(`\`${item.id}\` updated.\n\n${formatItem(client, item)}`);

	}
};