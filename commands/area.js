const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'area',
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
        const id = args[0];

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var areaToDisplay = areas.find(area => area.id == id);
        if (areaToDisplay == undefined) {
            return message.channel.send("No area exists with ID `" + id
                + "`. Use !areas to view all areas, or !addarea <id> to create a new area.");
        }

        message.channel.send(formatArea(areaToDisplay));
    }
};