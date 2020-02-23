const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'removearea',
	description: 'Removes the area with specified ID string.',
    format: "!removearea <id>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No area ID provided. Please specify an area ID to delete.");
        }
        if (args.length > 1) {
            return message.channel.send("Area ID cannot contain whitespace.");
        }

        const id = args[0];
        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }
        
        var areaToRemove = areas.find(area => area.id == id);
        if (areaToRemove == undefined) {
            return message.channel.send("No area found with that ID. Use !areas to view the list of existing areas.");
        }

        message.channel.send(formatArea(areaToRemove));
        message.channel.send("Are you sure you want to delete this area? (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //remove area
                        areas = areas.filter(area => area.id != id);

                        //remove connections to other areas
                        areas.forEach(a => {
                            a.reachable = a.reachable.filter(c => c != id);
                        });

                        message.channel.send("Area `" + id + "` removed.");
                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                    client.data.set("AREA_DATA", areas);
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                    console.log(Error);
                })
        });

        client.data.set("AREA_DATA", areas);
    }
};