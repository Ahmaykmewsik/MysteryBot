const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'item',
	description: 'Lookup item info',
    format: "!item <item id>",
    guildonly: true,
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

        //Post it
        message.channel.send(formatItem(client, item));

	}
};