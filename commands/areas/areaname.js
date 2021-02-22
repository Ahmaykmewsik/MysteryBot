const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'areaname',
    category:  `area`,
	description: 'Updates the name (not the ID) of a specified area.',
    format: "!areaname <id> <name>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify area ID and desired area name.");
        }
        if (args.length === 1) {
            return message.channel.send("No area name given. Please specify the name you wish to assign this area.");
        }
        const id = args[0];
        const name = args.slice(1).join(' ').toUpperCase();

        const area = client.getArea.get(`${message.guild.id}_${id}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + id + "`. Use !areas to view all areas.");
        }

        area.name = name;
        client.setArea.run(area);

        message.channel.send("Area name updated!");
        message.channel.send(formatArea(area));
    }
};