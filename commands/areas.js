const formatArea = require('../utilities/formatArea').formatArea;

module.exports = {
	name: 'areas',
	description: 'Lists all created areas.',
    format: "!areas",
    gmonly: true,
	execute(client, message, args) {

        var areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            areas = [];
        }
        
        if (areas.length > 0) {
            areas.forEach(area => message.channel.send(formatArea(area)));
        } else {
            message.channel.send("You haven't defined any areas yet.");
        }        
    }
};