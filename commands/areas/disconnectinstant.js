const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'disconnectinstant',
	description: 'Disconnects all instant connections between two areas.',
    format: "!disconnectinstant <area1> <area2>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify 2 area IDs.");
        }
        if (args.length > 2) {
            return message.channel.send("I don't know what you're trying to do but this ain't it chief. (Too many inputs)");
        }

        const area1Input = args.shift();
        const area2Input = args.shift();
        
        const area1 = client.getArea.get(`${message.guild.id}_${area1Input}`);
        const area2 = client.getArea.get(`${message.guild.id}_${area2Input}`);
        if (!area1) {
            return message.channel.send("No area exists with ID `" + area1Input + "`. Use !areas to view all areas.");
        }
        if (!area2) {
            return message.channel.send("No area exists with ID `" + area2Input + "`. Use !areas to view all areas.");
        }
        
        const instantConnections = client.getInstantConnections.all(message.guild.id);

        const instantConnectionsToDelete = instantConnections.filter(c => ( (c.area1 == area1.id) && (c.area2 == area2.id) ) || ( (c.area1 == area2.id) && (c.area2 == area1.id) ) )

        if (instantConnectionsToDelete.length == 0) {
            return message.channel.send(`No instant connection exists between \`${area1.id}\` to \`${area2.id}\`!`);
        }

        instantConnectionsToDelete.forEach(c => {
            client.deleteInstantConnection.run(c.area1, c.area2, c.guild);
        })
        
        message.channel.send(`All instant connections between \`${area1.id}\` and \`${area2.id}\` have been deleted.`);
    }
};