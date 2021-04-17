const formatArea = require('../../utilities/formatArea').formatArea;

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

        const areaToRemove = client.getArea.get(`${message.guild.id}_${id}`)
        
        if (areaToRemove == undefined) {
            return message.channel.send("No area found with that ID. Use !areas to view the list of existing areas.");
        }

        message.channel.send(formatArea(client, areaToRemove));
        message.channel.send("Are you sure you want to delete this area? (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //remove area
                        client.deleteArea.run(`${message.guild.id}_${id}`);

                        //remove connections to other areas
                        client.deleteConnectionsOfArea.run(id, id, message.guild.id);

                        //remove locations
                        client.deleteLocationsOfArea.run(id, message.guild.id);

                        message.channel.send("Area `" + id + "` removed. All connection and location data has also been deleted.");
                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(() => {
                    message.channel.send("Something went wrong with that.");
                    console.log(Error);
                })
        });
    }
};