const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'areadesc',
    category:  `area`,
	description: 'Updates the description of a specified area.',
    format: "!areadesc <id> <description>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area description.");
        }
        if (args.length === 1) {
            return message.channel.send("No area description given. Please specify the description you wish to assign this area.");
        }
        const id = args[0];
        const description = args.slice(1).join(' ');

        const area = client.getArea.get(`${message.guild.id}_${id}`);

        if (area == undefined) {
            return message.channel.send("No area exists with that ID. Use !areas to view all areas, or !addarea <id> to create a new area.");
        }

        area.description = description;

        client.setArea.run(area);

        message.channel.send("Area description updated!");
        message.channel.send(formatArea(client, area));
    }
};