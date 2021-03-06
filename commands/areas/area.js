const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
    name: 'area',
    category: `area`,
    description: 'Displays details of the area with a given ID. Include "full" after the areaID for a full unembeded post.',
    format: "!area <id> [full]",
    gmonly: true,
    execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID given. Please specify the ID of the area you wish to display.");
        }

        const id = args.shift();
        
        const area = client.getArea.get(`${message.guild.id}_${id}`);

        if (area == undefined) {
            return message.channel.send("No area exists with that ID. Use !areas to view all areas, or !addarea <id> to create a new area.");
        }

        const full = args.shift();

        if (full) {
            message.channel.send(formatArea(client, area, true), {split: true});
        } else {
            message.channel.send(formatArea(client, area));
        }
    }
};