const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'gotitem',
	description: 'Gives an item to a player.',
    format: "!gotitem <player> <item id> <item description>",
    aliases: ['giveitem'],
    guildonly: true,
    gmonly: true,
	execute(client, message, args) {

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;
        
        if (args.length == 0) {
            return message.channel.send("Give what now? You need to put an item ID.");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        //Give item
        const newInventory = {
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            itemID: item.id
        };
        client.givePlayerItem.run(newInventory);
  
        message.channel.send(player.username + " got the `" + itemid + "`");
        
        message.channel.send(formatPlayer(client, player));

        client.users.cache.get(player.discordID).send("**Got item!**\n" + formatItem(client, item, false));
        message.channel.send(`:exclamation:${player.username} was notified.`);

	}
};