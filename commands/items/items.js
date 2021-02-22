const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'items',
	description: 'Lists all of the game\'s items.',
    format: "!items",
    gmonly: true,
	execute(client, message, args) {

        const items = client.getItems.all(message.guild.id);

        var itemstring = "";
        
        if (items.length > 0) {
            for (let i in items) {
                itemstring += formatItem(client, items[i]) + "\n\n";
            }
        } else {
            return message.channel.send("You haven't defined any items yet.");
        }   

        message.channel.send(itemstring, {split: true});     
    }
};