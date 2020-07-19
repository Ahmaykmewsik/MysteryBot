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

        var itemstring = "";
        
        if (items.length > 0) {
            items.forEach(i => {
                if (itemstring.length + formatItem(i).length >= 2000) {
                    message.channel.send(itemstring);  
                    itemstring = ""; 
                }
                itemstring += formatItem(i) + "\n\n";
            });
            
        } else {
            message.channel.send("You haven't defined any items yet.");
        }   

        message.channel.send(itemstring);     
    }
};