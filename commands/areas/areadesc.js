const formatArea = require('../../utilities/formatArea').formatArea;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'areadesc',
	description: 'Updates the description of a specified area.',
    format: "!areadesc <id> <description>",
    gmonly: true,
	execute(client, message, args) {

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;
        
        if (args.length === 0) 
            return message.channel.send("No area description given. Please specify the description you wish to assign this area.");
        
        area.description = args.join(' ');
        client.setArea.run(area);
        message.channel.send("Area description updated!");
        message.channel.send(formatArea(client, area));
    }
};