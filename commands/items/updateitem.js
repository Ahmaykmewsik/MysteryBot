const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'updateitem',
	description: 'Updates a current item\'s information with specified ID string. The item ID cannot contain whitespace. Can optionally include -d tag that will update the description. Other tags: -b for Big, -c for Clothing. --b for NOT Big, --c for NOT Clothing. Big and Clothing will appear in the area description.',
    format: "!updateitem <oldid> <newid> [-c] [--c] [-b] [--b] [-d <description>]",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No item IDs provided.");
        }

        if (args.length === 1) {
            return message.channel.send("New ID not provided");
        }

        const oldID = args[0];
        const newID = args[1];

        const item = client.getItem.get(`${message.guild.id}_${oldID}`);

        if (item == undefined) {
            return message.channel.send(`No item with the ID \`${oldID}\` exists.`);
        }

        let players = client.getPlayersOfItem.all(item.id, item.guild);
        if (players.length > 1) {
            let warningMessage = "There is more than one player with this item! Are you sure you want to do this? (y/n)\n" + formatItem(client, item);

            message.channel.send(warningMessage).then(() => {

                const filter = m => message.author.id === m.author.id;
                message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                    .then(messages => {
                        if (messages.first().content == 'y' || messages.first().content == 'yes') {

                            UpdateItem();

                        } else if (messages.first().content == 'n' || message.first().content == `no`) {
                            message.channel.send("Okay, never mind then :)");
                        } else {
                            message.channel.send("...uh, okay.");
                        }
                    });
            });
            return;
        }

        UpdateItem();

        function UpdateItem() {

            let isBigNew = + ((item.big || args.includes('-b')) && !args.includes(`--b`));
            let isClothingNew = + ((item.clothing || args.includes(`-c`)) && !args.includes(`--c`));

            let description = item.description;
            if (args.includes('-d')) {
                description = args.slice(args.indexOf('-d') + 1).join(' ');
                if (description.length == 0) {
                    return message.channel.send("The description cannot be empty.");
                }
            }
            
            let items = client.getItems.all(message.guild.id);
            if (items.some(item => item.id == newID) && !(oldID == newID)) {
                return message.channel.send(`An item with the ID \`${newID}\` already exists!`);
            }
    
            const updatedItem = {
                guild_id: `${message.guild.id}_${newID}`,
                id: newID,
                guild: message.guild.id,
                description: description, 
                big: isBigNew,
                clothing: isClothingNew
            };
            
            client.deleteItemFromInventory.run(oldID, message.guild.id);

            players.forEach(player => {
                
                const newInventory = {
                    guild_username: `${message.guild.id}_${player.username}`,
                    username: player.username,
                    guild: message.guild.id,
                    itemID: newID
                };

                client.givePlayerItem.run(newInventory);
            })
            
            client.deleteItem.run(item.guild_id);
            client.setItem.run(updatedItem);
            
            message.channel.send("Successfully updated item: `" + newID + "`.\n" + formatItem(client, updatedItem));

            players.forEach(player => {
                client.users.get(player.discordID).send("**An item of yours changed!**\n" + formatItem(client, updatedItem, false));
                message.channel.send(`:exclamation:${player.username} was notified.`);
            });
        }

        
    }
};