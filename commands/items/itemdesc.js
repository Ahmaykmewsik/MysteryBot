const formatItem = require('../../utilities/formatItem').formatItem;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'itemdesc',
    description: 'Update an item\'s description.',
    format: "!item <item id> <description>",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0)
            return message.channel.send("You need to enter an item ID.");

        if (args.length == 1)
            return message.channel.send("There's no description!");

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item)
            return message.channel.send("Invalid item ID: " + itemid);

        let players = client.getPlayersOfItem.all(item.id, item.guild);

        if (players.length > 1) {
            let warningMessage = "There is more than one player with this item! Are you sure you want to do this? (y/n)\n" + formatItem(client, item);
            return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, ChangeDescription);
        }

        return ChangeDescription();

        function ChangeDescription() {
            const description = args.join(' ');
            item.description = description;

            client.setItem.run(item);

            //Post it
            message.channel.send(`\`${item.id}\` updated.\n\n${formatItem(client, item)}`);

            players.forEach(player => {
                client.users.cache.get(player.discordID).send("**An item of yours changed!**\n" + formatItem(client, item, false));
                message.channel.send(`:exclamation:${player.username} was notified.`);
            })
        }
    }
};