const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

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

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        const damageInput = args.shift();
        const damageValue = parseFloat(damageInput);

        if (isNaN(damageValue) || damageValue % 0.25 != 0.0) 
            return message.channel.send("Invalid damage: " + damageInput + ". Please enter a number divisible by 1/4.");
        
        const healthValueOld = player.health;
        player.health -= damageValue;

        if (player.health <= 0) {
            player.alive = 0;
            player.health = 0;
            player.move = null;
        }

        let deltaHealth = healthValueOld - player.health;
        let messageToPlayer = "Nothing happened!";
        if (deltaHealth > 0) messageToPlayer = `You took ${deltaHealth} damage!`;
        if (deltaHealth < 0) messageToPlayer = `You gained ${deltaHealth * -1} health!`;
        messageToPlayer += `\nCurrent Health: ${player.health}\n` + UtilityFunctions.GetHeartEmojis(player.health);

        client.setPlayer.run(player);

        message.channel.send(
            `${player.username} has taken ${damageValue} damage!\nCurrent health: ${player.health}\n` +
            formatPlayer(client, player), { split: true });

        UtilityFunctions.NotifyPlayer(client, message, player, messageToPlayer, settings);

	}
};