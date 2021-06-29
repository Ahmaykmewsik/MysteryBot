const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'areas',
	description: 'Lists all created areas. Does not post area images.',
    format: "!areas",
    gmonly: true,
	execute(client, message, args) {
        
        const areas = client.getAreas.all(message.guild.id);

        if (!areas) {
            message.channel.send("You haven't defined any areas yet.");
        }

        let returnMessage = `-----AREAS-----\n`;

        areas.forEach(area => {
            returnMessage += `${formatArea(client, area, true, false)}\n`;
        })

        message.channel.send(returnMessage, {split: true});
    }
};