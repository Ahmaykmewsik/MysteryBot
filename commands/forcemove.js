const prefix = process.env.prefix;
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'forcemove',
	description: 'Moves a player manually on the map.',
    format: "!forcemove <player> <area>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to remove!");
        }

        const items = client.data.get("ITEM_DATA");

        const areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
			return message.channel.send("You don't have any areas! Setup the game first bumbo.");
		}

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerToMove = players.find(p => p.name.toLowerCase().includes(inputusername));  

        //Notify if invalid input for user
        if (playerToMove == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("But where do they go? Enter the area too.");
        }

        //drop Item
        const areaid = args.shift().toLowerCase();

        //Check that input for area is valid
        const area = areas.find(a => a.id == areaid);
        if (area == undefined) {
            return message.channel.send("Invalid area ID.");
        }

        playerToMove.move = areaid;

        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToMove.name + " will move to: `" + areaid + "`");

        message.channel.send(formatPlayer(playerToMove, items));
	}
};