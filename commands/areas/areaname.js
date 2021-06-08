const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'areaname',
	description: 'Updates the name (not the ID) of a specified area.',
    format: "!areaname <id> <name>",
    gmonly: true,
	execute(client, message, args) {

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        const name = args.join(' ').toUpperCase();
        area.name = name;
        client.setArea.run(area);

        message.channel.send("Area name updated!");
        message.channel.send(formatArea(client, area));
    }
};