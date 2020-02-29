const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'items',
	description: 'Lists all of the game\'s items.',
    format: "!items",
    gmonly: true,
	execute(client, message, args) {

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }
        
        if (items.length > 0) {
            items.forEach(item => message.channel.send(formatItem(item)));
        } else {
            message.channel.send("You haven't defined any items yet.");
        }        
    }
};