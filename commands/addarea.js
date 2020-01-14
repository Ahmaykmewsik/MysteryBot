const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'addarea',
	description: 'Creates a new area with specified ID string. The area ID cannot contain whitespace.',
    format: "!addarea <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID provided. Please specify an ID string for the new area.");
        }
        if (args.length > 1) { 
            return message.channel.send("Area ID cannot contain whitespace.");
        }
        const id = args[0];

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        if (areas.some(area => area.id == id)) {
            return message.channel.send("An area with that ID already exists!");
        }

        const newArea = {id, name: id, description: undefined, reachable: [id]};
        areas.push(newArea);
        client.data.set("AREA_DATA", areas);
        message.channel.send("Successfully created new area: `" + id + "`.");
        message.channel.send(formatArea(newArea));
        message.channel.send("Use !areaname, !areadesc, and !connect to edit this area's properties.");
    }
};