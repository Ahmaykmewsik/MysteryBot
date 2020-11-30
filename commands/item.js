const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'item',
	description: 'Lookup item info',
    format: "!item <item id>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var items = client.data.get("ITEM_DATA");
        var players = client.data.get("PLAYER_DATA");

        if (args.length == 0) {
            return message.channel.send("You need to enter an item ID.");
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
        var outputString = formatItem(itemToGive)

        //Find players with the item
        var playersWithItem = [];
        if (players != undefined) {
            players.forEach(p => {
                if (p.items.includes(itemid)){
                    playersWithItem.push(p.name);
                }
            })
        }
        if (playersWithItem.length > 0){
            outputString += "\n__Equiped by:__ " + playersWithItem.join(", ");
        } else {
            outputString += "\n__Equiped by:__ Nobody";
        }

        //Post it
        message.channel.send(outputString);

	}
};