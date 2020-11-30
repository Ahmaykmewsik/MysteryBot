const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'dropitem',
	description: 'Drops an item of a player.',
    format: "!dropitem <player> <item id>",
    aliases: ['takeitem'],
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        const items = client.data.get("ITEM_DATA");

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
        if (!playerToGive.items.includes(itemid)) {
            return message.channel.send(playerToGive.name + " doesn't have a " + itemid + " to drop.");
        }
        //DROP IT
        playerToGive.items = playerToGive.items.filter(i => i != itemid);

        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToGive.name + " dropped the `" + itemid + "`");

        playerobject = message.guild.members.find(m => m.user.username == playerToGive.name);
        playerobject.send("You no longer have the `" + itemid + "`");

        message.channel.send(formatPlayer(playerToGive, items));
	}
};