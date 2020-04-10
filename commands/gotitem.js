const formatPlayer = require('../utilities/formatPlayer').formatPlayer;
const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'gotitem',
	description: 'Gives an item to a player.',
    format: "!gotitem <player> <item id> <item description>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var items = client.data.get("ITEM_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players!");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerToGive = players.find(p => p.name.toLowerCase().includes(inputusername));  

        //Notify if invalid input for user
        if (playerToGive == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("Give what now? You need to put an item ID.");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const itemToGive = items.find(i => i.id == itemid);
        if (itemToGive == undefined) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        //Give item
        playerToGive.items.push(itemid);
  
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToGive.name + " got the `" + itemid + "`");
        
        playerobject = message.guild.members.find(m => m.user.username == playerToGive.name);
        
        playerobject.send("**Got item!**\n" + formatItem(itemToGive));

        message.channel.send(formatPlayer(playerToGive, items));
	}
};