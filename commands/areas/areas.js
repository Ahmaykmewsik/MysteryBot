
module.exports = {
	name: 'areas',
	description: 'Lists all created areas.',
    format: "!areas",
    gmonly: true,
	execute(client, message, args) {
        
        const areas = client.getAreas.all(message.guild.id);

        if (!areas) {
            message.channel.send("You haven't defined any areas yet.");
        }

        let outputMessage = `-----AREAS-----\n`;
        let imageMessageHeader = `-----IMAGES-----\n`;
        let imageMessage = imageMessageHeader;
        
        areas.forEach(area=>{
            const connections = client.getConnections.all(area.id, message.guild.id);
            const connectionsString = (connections.length == 0) ? "None" : connections.map(c => c.area2).join(", ");

            const playersPresent = client.getPlayersOfArea.all(area.id, message.guild.id);
            const playerPresentString = (playersPresent.length == 0) ? "None": playersPresent.map(p => p.username).join(", "); 

            const descriptionString = (area.description == null) ? "-" : area.description;
            const imageString = (area.image == null) ? "NO IMAGE" : "IMAGE INCLUDED";
            outputMessage += `:small_blue_diamond: __**${area.name}**__ :small_blue_diamond:\n__ID__: ${area.id}\n__Connections__: *${connectionsString}*\n__Players Present__: *${playerPresentString}*\n__Image__: ${imageString}\n\n__Description__:\n${descriptionString}\n\n`;
            if (area.image != null) {
                imageMessage += `\n${area.image}`
            }
        })

        message.channel.send(outputMessage, {split: true})
            .then(r => {
                if (imageMessage != imageMessageHeader) {
                    message.channel.send(imageMessage, {split: true});
                }
            })
    }
};