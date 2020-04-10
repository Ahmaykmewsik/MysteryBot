const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'charactername',
	description: 'Changes a player\'s character name.',
    format: "!charactername <player> <charactername>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        var items = client.data.get("ITEM_DATA");

        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to remove!");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerToName = players.find(p => p.name.toLowerCase().includes(inputusername));  

        //Notify if invalid input for user
        if (playerToName == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("You need to put a name.");
        }

        const characterName = args.join(" ");

        playerToName.character = characterName;
  
        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToName.name + "'s character name has been changed to: `" + playerToName.character + "`");
        
        playerobject = message.guild.members.find(m => m.user.username == playerToName.name);
        playerobject.send("**You will now appear as: **\n" + playerToName.character);

        message.channel.send(formatPlayer(playerToName, items));
	}
};