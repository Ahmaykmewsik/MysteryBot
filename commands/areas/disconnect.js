module.exports = {
	name: 'disconnect',
	description: 'Removes a connection between two areas.',
    format: "!disconnect <id1> <id2>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length < 2) {
            return message.channel.send("Too few arguments. Please specify two area IDs to disconnect.");
        }
        if (args.length > 2) {
            return message.channel.send("Too many arguments. Please specify two area IDs to disconnect.");
        }
        const id1 = args[0];
        const id2 = args[1];

        const area1 = client.getArea.get(`${message.guild.id}_${id1}`);
        const area2 = client.getArea.get(`${message.guild.id}_${id2}`);
        const area1Connections = client.getConnections.all(id1, message.guild.id);
        const area2Connections = client.getConnections.all(id2, message.guild.id);

        if (!area1) {
            return message.channel.send("No area exists with ID `" + id1 + "`. Use !areas to view all areas.");
        }

        if (!area2) {
            return message.channel.send("No area exists with ID `" + id2 + "`. Use !areas to view all areas.");
        }

        // disconnect id1 from id2
        if (area1Connections.some(c => c.area2 == id2)) {
            client.deleteConnection.run(id1, id2, message.guild.id);
            message.channel.send("Connection removed from area `" + id1 + "` to area `" + id2 + "`.");
        } else {
            message.channel.send("No connection exists from area `" + id1 + "` to area `" + id2 + "`.");
        }

        if (id1 != id2) {
            // disconnect id2 from id1
            if (area2Connections.some(c => c.area2 == id1)) {
                client.deleteConnection.run(id2, id1, message.guild.id);
                message.channel.send("Connection removed from area `" + id2 + "` to area `" + id1 + "`.");
            } else {
                message.channel.send("No connection exists from area `" + id2 + "` to area `" + id1 + "`.");
            }
        }
    }
};