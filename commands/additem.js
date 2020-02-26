const formatItem = require('../utilities/formatItem').formatItem;

module.exports = {
	name: 'additem',
	description: 'Creates a new item with specified ID string. The item ID cannot contain whitespace.',
    format: "!additem <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No item ID provided. Please specify an ID string for the new item.");
        }

        if (!args.includes('-d')) {
            return message.channel.send("You're missing a description tag. (-d)");
        }

        var items = client.data.get("ITEM_DATA");
        if (items == undefined) {
            items = [];
        }

        const id = args[0];

        const isBig = (args.includes('-b')); 
        const isPrimary = (args.includes('-p')); 

        var uses = -1;
        if (args.includes('-u')) {
            uses = args[args.indexOf('-u') + 1];
            uses = parseInt(uses);
        }

        console.log(uses);
        
        const description = args.slice(args.indexOf('-d') + 1).join(' ');

        if (items.some(item => item.id == id)) {
            return message.channel.send("An item with that ID already exists!");
        }

        if (!Number.isInteger(uses)) {
            return message.channel.send("The number of uses needs to be an number.");
        }

        if (description.length == 0) {
            return message.channel.send("The description is empty.");
        }

        const newItem = {
            id,
            name: id,
            description: description, 
            use_count: uses, 
            use_capacity: uses,
            primary: isPrimary,
            big: isBig
        };

        items.push(newItem);
        client.data.set("ITEM_DATA", items);
        message.channel.send("Successfully created new item: `" + id + "`.");
        message.channel.send(formatItem(newItem));
    }
};