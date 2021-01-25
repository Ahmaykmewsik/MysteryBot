
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;
const getHeartImage = require('../utilities/getHeartImage').getHeartImage;

module.exports = {
	name: 'heal',
	description: 'Raise player\'s health.',
    format: "!damage <player> <heal_amount>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined) {
            return message.channel.send("You don't have any players. There's no one to damage!");
        }

        const items = client.data.get("ITEM_DATA");

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

        const healInput = args.shift();
        const healValue = parseFloat(healInput);

        if (!(typeof healValue == "number") || healValue % 0.25 != 0.0) {
            return message.channel.send("Invalid damage: " + healInput + ". Please enter a number divisible by 1/4.");
        }

        const healthValueOld = playerToMove.health;
        playerToMove.health += healValue;

        if (playerToMove.health > 0) {
            playerToMove.alive = true;
        }
        if (playerToMove.health > 3) {
            playerToMove.health = 3;
        }

        var deltaHealth = healthValueOld - playerToMove.health;
        var messageToPlayer = "";
        if (deltaHealth > 0) {
            messageToPlayer = "You took " + deltaHealth + " damage!\nCurrent Health: " + playerToMove.health;
        } else if (deltaHealth < 0) {
            deltaHealth *= -1;
            messageToPlayer = "You gained " + deltaHealth + " health!\nCurrent Health: " + playerToMove.health;
        }

        if (messageToPlayer != ""){
            playerobject = message.guild.members.find(m => m.user.username == playerToMove.name);
            playerobject.send(messageToPlayer, {files: [getHeartImage(playerToMove.health)]});
        }

        client.data.set("PLAYER_DATA", players);

        message.channel.send(playerToMove.name + " has gained `" + healValue + "` health!\nCurrent health: " + playerToMove.health);

        message.channel.send(formatPlayer(playerToMove, items));
	}
};