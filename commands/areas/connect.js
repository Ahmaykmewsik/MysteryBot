module.exports = {
	name: 'connect',
    category:  `area`,
	description: 'Creates a connection between two areas. Use "!connect -o" to make the connection one-way.',
    format: "!connect [-o] <id1> <id2>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length < 2) {
            return message.channel.send("Too few arguments. Please specify two area IDs to connect.");
        }
        const oneWay = (args[0] == '-o'); 
        if (oneWay) {
            args = args.slice(1);
        }
        if (args.length > 2) {
            return message.channel.send("Too many arguments. Please specify two area IDs to connect.");
        }

        const id1 = args[0];
        const id2 = args[1];

        const area1 = client.getArea.get(`${message.guild.id}_${id1}`);
        const area2 = client.getArea.get(`${message.guild.id}_${id2}`);
        const area1Connections = client.getConnections.all(id1, message.guild.id);
        const area2Connections = client.getConnections.all(id2, message.guild.id);

        if (!area1) {
            return message.channel.send("No area exists with ID `" + id1+ "`. Use !areas to view all areas.");
        }

        if (!area2) {
            return message.channel.send("No area exists with ID `" + id2 + "`. Use !areas to view all areas.");
        }

        // connect id1 to id2
        if (area1Connections.includes(id2)) {
            message.channel.send("Connection already exists from area `" + id1 + "` to area `" + id2 + "`.");
        } else {
            client.setConnection.run({area1: id1, area2: id2, guild: message.guild.id});
            message.channel.send("Connection created from area `" + id1 + "` to area `" + id2 + "`.");
        }

        if (!oneWay && id1 != id2) {
            // connect id2 to id1
            if (area2Connections.includes(id1)) {
                message.channel.send("Connection already exists from area `" + id2 + "` to area `" + id1 + "`.");
            } else {
                client.setConnection.run({area1: id2, area2: id1, guild: message.guild.id});
                message.channel.send("Connection created from area `" + id2 + "` to area `" + id1 + "`.");
            }
        }
    }
};