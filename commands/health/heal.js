const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const getHeartImage = require('../../utilities/getHeartImage').getHeartImage;

module.exports = {
    name: 'heal',
    description: 'Raise player\'s health.',
    format: "!damage <player> <heal_amount>",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        if (args.length == 0) return message.channel.send("You need to put a value.");
        
        const healInput = args.shift();
        const healValue = parseFloat(healInput);
        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        if (isNaN(healValue) || healValue % 0.25 != 0.0) 
            return message.channel.send("Invalid damage: " + healInput + ". Please enter a number divisible by 1/4.");
        
        const healthValueOld = player.health;
        player.health += healValue;

        if (player.health > 0) player.alive = 1;
        if (player.health > settings.maxHealth) player.health = settings.maxHealth;
        
        let deltaHealth = healthValueOld - player.health;
        let messageToPlayer = "Nothing happened!";
        if (deltaHealth > 0) messageToPlayer = `You took ${deltaHealth} damage!`;
        if (deltaHealth < 0) messageToPlayer = `You gained ${deltaHealth * -1}  health!`;
        messageToPlayer += `\nCurrent Health: " + ${player.health}\n` + UtilityFunctions.GetHeartEmojis(player.health);

        client.setPlayer.run(player);

        message.channel.send(
            `${player.username} has gained ${healValue} health!\nCurrent health: ${player.health}\n` +
            formatPlayer(client, player), { split: true });

        UtilityFunctions.NotifyPlayer(client, message, player, messageToPlayer, settings);
    }
};