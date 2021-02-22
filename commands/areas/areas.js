const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
	name: 'areas',
    category:  `area`,
	description: 'Lists all created areas.',
    format: "!areas",
    gmonly: true,
	execute(client, message, args) {
        
        const areas = client.getAreas.all(message.guild.id);

        if (!areas) {
            message.channel.send("You haven't defined any areas yet.");
        }

        var outputMessage = `-----AREAS-----\n`;
        
        

        areas.forEach(area=>{
            const connections = client.getConnections.all(area.id, message.guild.id);
            const connectionsString = (connections.length == 0) ? "None" : connections;
            const descriptionString = (area.description == undefined) ? "-" : area.description;
            const imageString = (area.image == undefined) ? "-" : area.image;
            outputMessage += 
                `__**${area.name}**__
                __ID__: ${area.id}
                __Connections__: *${JSON.stringify(connectionsString)}*
                __Players Present__: UNIMPLEMENTED
                __Description__:
                ${descriptionString}
                ${imageString}\n`
        })

        message.channel.send(outputMessage, {"split": true})

            
    }
};