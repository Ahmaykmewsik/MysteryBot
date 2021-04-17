const Discord = require('discord.js');

const commonTags = require("common-tags");

module.exports = {
    
    formatArea(client, area, full = 0) {

        let connections = client.getConnections.all(area.id, area.guild);
        let connectionsInString = (connections.length == 0) ? "-" : connections.map(c => c.area2).join(", ");

        let allConnections = client.getAllConnections.all(area.guild);
        let connectionsOut = allConnections.filter(c => area.id == c.area2).map(c => c.area1).join(", ");
        let connectionsOutString = (connectionsOut.length == 0) ? "-" : connectionsOut;

        let playersPresent = client.getPlayersOfArea.all(area.id, area.guild);
        let playerPresentString = (playersPresent.length == 0) ? "-" : playersPresent.map(p => p.username).join(", ");

        let instantConnections = client.getInstantConnections.all(area.guild);
        let instantConnectionsOut = instantConnections.filter(c => area.id == c.area1).map(c => c.area2).join(", ");
        let instantConnectionsIn = instantConnections.filter(c => area.id == c.area2).map(c => c.area1).join(", ");
        let instantConnectionsOutString = (instantConnectionsOut.length == 0) ? "-" : instantConnectionsOut;
        let instantConnectionsInString = (instantConnectionsIn.length == 0) ? "-" : instantConnectionsIn;

        let descriptionString = (area.description == null) ? "-" : area.description;
        let imageString = (area.image == null) ? "NO IMAGE" : area.image;
        
        let color = "#5b86a8";
        
        const fullOutput = commonTags.stripIndents
            `:small_blue_diamond: __**${area.name}**__ :small_blue_diamond:
            __id__: ${area.id}

            __Connections Out__: ${connectionsOutString}
            __Connections In__: ${connectionsInString}
            __Instant Connections Out__: ${instantConnectionsOutString}
            __Instant Connections In__: ${instantConnectionsInString}

            __Players Present__: ${playerPresentString}

            __Description__:
            ${area.description}
            
            ${imageString}`;


        const infoStringPartial = 
            `__id__: ${area.id}
            __Connections Out__: ${connectionsOutString}
            __Instant Connections Out__: ${instantConnectionsOutString}
            __Players Present__: ${playerPresentString}\n`;

        if (!full) {

            if (descriptionString.length > (1024)) {
                descriptionString = descriptionString.substring(0, 1024 - 3) + "...";
            }

            return new Discord.RichEmbed()
            .setColor(color)
            .setTitle(`**${area.name}**`)
            .setDescription(infoStringPartial)
            .addField('DESCRIPTION', descriptionString)
            .setImage(area.image)

        } else {

            return fullOutput;
        }
        
    }
};