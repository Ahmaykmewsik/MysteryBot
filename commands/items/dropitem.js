const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
	name: 'dropitem',
	description: 'Drops an item of a player.',
    format: "!dropitem <player> <item id>",
    aliases: ['takeitem'],
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("Give what now? You need to put an item ID.");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        const playerInventory = client.getItemsOfPlayer.all(`${message.guild.id}_${player.username}`);
        if (Object.values(playerInventory).includes(itemid)) {
            return message.channel.send(playerToGive.name + " doesn't have a " + itemid + " to drop.");
        }

        //DROP IT
        client.dropPlayerItem.run(`${message.guild.id}_${player.username}`, itemid);

        message.channel.send(player.username + " dropped the `" + itemid + "`");
        message.channel.send(formatPlayer(client, player));

        client.users.cache.get(player.discordID).send("You no longer have the `" + itemid + "`");
        message.channel.send(`:exclamation:${player.username} was notified.`);
	}
};