const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'dropitem',
	description: 'Drops an item of a player.',
    format: "!dropitem <player> <item id>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to remove!");
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
            return message.channel.send("Drop what now? You need to put something.");
        }

        //drop Item
        const itemid = args.shift().toLowerCase();
        
        playerToGive.itemsNew = playerToGive.items.filter(i => i.id != itemid);

        if (!playerToGive.items == playerToGive.itemsNew) {
            return message.channel.send(playerToGive.name + " wasn't ever holding a " + itemid);
        }
  
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToGive.name + " dropped the `" + itemid + "`");
        message.channel.send(formatPlayer(playerToGive));
	}
};