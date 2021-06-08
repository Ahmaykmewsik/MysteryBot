const formatItem = require('../../utilities/formatItem').formatItem;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'removeitem',
    description: 'Removes the item with specified ID string.',
    format: "!removeitem <id>",
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter an item ID.");
        }

        //Find Item
        const itemid = args.shift().toLowerCase();
        const item = client.getItem.get(`${message.guild.id}_${itemid}`);

        if (!item) {
            return message.channel.send("Invalid item ID: " + itemid);
        }

        let warningPrompt = formatItem(client, item) + "\n\nAre you sure you want to delete this item? (y or n)";
        return UtilityFunctions.WarnUserWithPrompt(message, warningPrompt, RemoveItem);

        function RemoveItem() {
            //remove item
            client.deleteItem.run(`${message.guild.id}_${item.id}`);
            client.deleteItemFromInventory.run(item.id, message.guild.id);
            message.channel.send(`\`${itemid}\` removed!`);
        }
    }
};