const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const getHeartImage = require('../../utilities/getHeartImage').getHeartImage;

module.exports = {
	name: 'sethealth',
	description: 'Sets a player\'s health.',
    format: "!sethealth <player> <number>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        var table = client.countPlayers.get(message.guild.id);
        if (table['count(*)'] == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("You need to put a value.");
        }

        const healthInput = args.shift();
        const healthValue = parseFloat(healthInput);

        if (!(typeof healthValue == "number") || healthValue % 0.25 != 0.0) {
            return message.channel.send("Invalid health: " + healthInput + ". Please enter a number divisible by 1/4.");
        }

        const healthValueOld = player.health;
        player.health = healthValue;

        if (player.health <= 0) {
            player.alive = 0;
            player.move = null;
        }
        else {
            player.alive = 1;
        }

        var deltaHealth = healthValueOld - player.health;
        var messageToPlayer = "";
        if (deltaHealth > 0) {
            messageToPlayer = "You took " + deltaHealth + " damage!\nCurrent Health: " + player.health;
        } else if (deltaHealth < 0) {
            deltaHealth *= -1;
            messageToPlayer = "You gained " + deltaHealth + " health!\nCurrent Health: " + player.health;
        }

        if (messageToPlayer != ""){
            client.users.cache.get(player.discordID).send(messageToPlayer, {files: [getHeartImage(player.health)]});
        }
        
        client.setPlayer.run(player);

        message.channel.send("Health of " + player.username + " set to `" + healthValue + "`");
        message.channel.send(formatPlayer(client, player));

        if (messageToPlayer != ""){
            client.users.cache.get(player.discordID).send(messageToPlayer, {files: [getHeartImage(player.health)]});
            message.channel.send(`:exclamation:${player.username} was notified.`);
        }
	}
};