const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'connectinstant',
	description: 'Creates a instant connection between two areas. All connections are 1 direction.',
    format: "!connectinstant <area1> <area2>",
    gmonly: true,
	execute(client, message, args) {

        if (args.length === 0) {
            return message.channel.send("No arguments given. Please specify an area ID and a parent area.");
        }
        if (args.length === 1) {
            return message.channel.send("You need to put in two areas buddy ol pal.");
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

        if (instantConnections.some(c => (c.area1 == area1.id) && (c.area2 == area2.id))) {
            return message.channel.send(`Aborting. An instant connection already exists from \`${area1.id}\` to \`${area2.id}\`!`);
        }
 
        const instantConnection = {
            area1: area1.id,
            area2: area2.id,
            guild: message.guild.id
        };

        client.setInstantConnection.run(instantConnection);

        message.channel.send(`Created instant connection from \`${area1.id}\` to \`${area2.id}\`.`);
        message.channel.send(formatArea(client, area1, 1));
    }
};