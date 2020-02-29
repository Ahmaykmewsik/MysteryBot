module.exports = {
	name: 'connect',
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

        // connect id1 to id2
        if (areas[index1].reachable.includes(id2)) {
            message.channel.send("Connection already exists from area `" + id1 + "` to area `" + id2 + "`.");
        } else {
            areas[index1].reachable.push(id2);
            message.channel.send("Connection created from area `" + id1 + "` to area `" + id2 + "`.");
        }

        if (!oneWay && id1 != id2) {
            // connect id2 to id1
            if (areas[index2].reachable.includes(id1)) {
                message.channel.send("Connection already exists from area `" + id2 + "` to area `" + id1 + "`.");
            } else {
                areas[index2].reachable.push(id1);
                message.channel.send("Connection created from area `" + id2 + "` to area `" + id1 + "`.");
            }
        }

        client.data.set("AREA_DATA", areas);
    }
};