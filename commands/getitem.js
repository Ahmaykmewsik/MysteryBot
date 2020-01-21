const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'getitem',
	description: 'Gives an item to a player.',
    format: "!getitem <player> <item id> <item description>",
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

        if (args.length == 1) {
            return message.channel.send("Give what now? You need to put something.");
        }

        if (args.length == 2) {
            return message.channel.send("You need to put a description.");
        }

        //Give Item
        const itemid = args.shift().toLowerCase();
        
        const itemdescription = args.join(" ");

        playerToGive.items.push({
            id: itemid, 
            description: itemdescription
        });
  
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToGive.name + " got the `" + itemid + "`");
        
        message.playerToGive.send("**Got item!**\n" + itemdescription);

        message.channel.send(formatPlayer(playerToGive));
	}
};