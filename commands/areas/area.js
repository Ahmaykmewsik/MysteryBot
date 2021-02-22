const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
    name: 'area',
    category: `area`,
    description: 'Displays details of the area with a given ID.',
    format: "!area <id>",
    gmonly: true,
    execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID given. Please specify the ID of the area you wish to display.");
        }
        if (args.length > 1) {
            return message.channel.send("Area ID cannot contain whitespace.");
        }

        const area = client.getArea.get(`${message.guild.id}_${args[0]}`);

        if (area == undefined) {
            return message.channel.send("No area exists with that ID. Use !areas to view all areas, or !addarea <id> to create a new area.");
        }

        message.channel.send(formatArea(area));
    }
};