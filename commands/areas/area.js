const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
    name: 'area',
    description: 'Displays details of the area with a given ID. Include "-e" after the areaID for an embeded post (this is what a player sees).',
    format: "!area <id> [-e]",
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

        if (!args.includes("-e")) {
            message.channel.send(formatArea(client, area, true), {split: true});
        } else {
            message.channel.send(formatArea(client, area));
        }
    }
};