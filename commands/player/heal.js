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

        var table = client.countPlayers.get(message.guild.id);
        if (table['count(*)'] == 0) {
            return message.channel.send("You haven't added any players yet. Use !addplayer <person> <character> to add players.");
        }
        
        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("You need to put a value.");
        }

        const healInput = args.shift();
        const healValue = parseFloat(healInput);

        if (!(typeof healValue == "number") || healValue % 0.25 != 0.0) {
            return message.channel.send("Invalid damage: " + healInput + ". Please enter a number divisible by 1/4.");
        }

        const healthValueOld = player.health;
        player.health += healValue;

        if (player.health > 0) {
            player.alive = 1;
        }
        if (player.health > settings.maxHealth) {
            player.health = settings.maxHealth;
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

        message.channel.send(player.username + " has gained `" + healValue + "` health!\nCurrent health: " + player.health);

        message.channel.send(formatPlayer(client, player));

        message.channel.send(`:exclamation:${player.username} was notified.`);
	}
};