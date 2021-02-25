const formatItem = require('../../utilities/formatItem').formatItem;

module.exports = {
	name: 'additem',
	description: 'Creates a new item with specified ID string. The item ID cannot contain whitespace. Must include -d tag and a description. Other tags: -b for Big, -c for Clothing. Big and Clothing will appear in the area description.',
    format: "!additem <id> [-c] [-b] -d <description>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No item ID provided. Please specify an ID string for the new item.");
        }

        if (!args.includes('-d')) {
            return message.channel.send("You're missing a description tag. (-d)");
        }

        const id = args[0];

        const isBig = args.includes('-b') ? 1 : 0;
        const isClothing = args.includes('-c') ? 1 : 0; 
        
        const description = args.slice(args.indexOf('-d') + 1).join(' ');
        if (description.length == 0) {
            return message.channel.send("The description is empty.");
        }

        let items = client.getItems.all(message.guild.id);
        if (items.some(item => item.id == id)) {
            return message.channel.send("An item with that ID already exists!");
        }

        const newItem = {
            guild_id: `${message.guild.id}_${id}`,
            id: id,
            guild: message.guild.id,
            description: description, 
            big: isBig,
            clothing: isClothing
        };

        client.setItem.run(newItem);
        
        message.channel.send("Successfully created new item: `" + id + "`.\n" + formatItem(client, newItem));
    }
};