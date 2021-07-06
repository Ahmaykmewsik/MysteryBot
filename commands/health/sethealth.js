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

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) {
            return message.channel.send("You need to put a value.");
        }

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        const healthInput = args.shift();
        const healthValue = parseFloat(healthInput);

        if (isNaN(healthValue)|| healthValue % 0.25 != 0.0) 
            return message.channel.send("Invalid health: " + healthInput + ". Please enter a number divisible by 1/4.");
        
        const healthValueOld = player.health;
        player.health = healthValue;

        if (player.health <= 0) {
            player.alive = 0;
            player.move = null;
        }
        else {
            player.alive = 1;
        }

        let deltaHealth = healthValueOld - player.health;
        let messageToPlayer = "Nothing happened!";
        if (deltaHealth > 0) messageToPlayer = `You took ${deltaHealth} damage!`;
        if (deltaHealth < 0) messageToPlayer = `You gained ${deltaHealth * -1} health!`;
        messageToPlayer += `\nCurrent Health: ${player.health}\n` + UtilityFunctions.GetHeartEmojis(player.health);
        
        client.setPlayer.run(player);

        message.channel.send("Health of " + player.username + " set to `" + healthValue + "`");
        message.channel.send(formatPlayer(client, player));

        UtilityFunctions.NotifyPlayer(client, message, player, messageToPlayer, settings);
	}
};