const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const getHeartImage = require('../../utilities/getHeartImage').getHeartImage;

module.exports = {
	name: 'damage',
	description: 'Lower player\'s health.',
    format: "!damage <player> <damage_amount>",
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            return message.channel.send("You need to put a value.");
        }

        const damageInput = args.shift();
        const damageValue = parseFloat(damageInput);

        if (isNaN(damageValue) || damageValue % 0.25 != 0.0) {
            return message.channel.send("Invalid damage: " + damageInput + ". Please enter a number divisible by 1/4.");
        }

        const healthValueOld = player.health;
        player.health -= damageValue;

        if (player.health <= 0) {
            player.alive = 0;
            player.health = 0;
            player.move = null;
        }

        var deltaHealth = healthValueOld - player.health;
        var messageToPlayer = "";
        if (deltaHealth > 0) {
            messageToPlayer = "You took " + deltaHealth + " damage!\nCurrent Health: " + player.health;
        } else if (deltaHealth < 0) {
            deltaHealth *= -1;
            messageToPlayer = "You gained " + deltaHealth + " health!\nCurrent Health: " + player.health;
        }

        client.setPlayer.run(player);

        if (messageToPlayer != ""){
            client.users.cache.get(player.discordID).send(messageToPlayer, {files: [getHeartImage(player.health)]});
        }

        message.channel.send(player.username + " has taken `" + damageValue + "` damage!\nCurrent health: " + player.health);
        message.channel.send(formatPlayer(client, player));
        message.channel.send(`:exclamation:${player.username} was notified.`);
	}
};