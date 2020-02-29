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

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }

        var index1 = areas.findIndex(area => area.id == id1);
        if (index1 === -1) {
            return message.channel.send("No area exists with ID `" + id1 + "`. Use !areas to view all areas.");
        }

        var index2 = areas.findIndex(area => area.id == id2);
        if (index2 === -1) {
            return message.channel.send("No area exists with ID `" + id2 + "`. Use !areas to view all areas.");
        }

        // disconnect id1 from id2
        if (areas[index1].reachable.includes(id2)) {
            areas[index1].reachable = areas[index1].reachable.filter(id => id != id2);
            message.channel.send("Connection removed from area `" + id1 + "` to area `" + id2 + "`.");
        } else {
            message.channel.send("No connection exists from area `" + id1 + "` to area `" + id2 + "`.");
        }

        if (id1 != id2) {
            // disconnect id2 from id1
            if (areas[index2].reachable.includes(id1)) {
                areas[index2].reachable = areas[index2].reachable.filter(id => id != id1);
                message.channel.send("Connection removed from area `" + id2 + "` to area `" + id1 + "`.");
            } else {
                message.channel.send("No connection exists from area `" + id2 + "` to area `" + id1 + "`.");
            }
        }

        client.data.set("AREA_DATA", areas);
    }
};