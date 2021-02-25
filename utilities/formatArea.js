const Discord = require('discord.js');

module.exports = {
    formatArea(client, area, full = 0) {

        let connections = client.getConnections.all(area.id, area.guild);
        let connectionsString = (connections.length == 0) ? "None" : connections.map(c => c.area2).join(", ");

        let playersPresent = client.getPlayersOfArea.all(area.id, area.guild);
        let playerPresentString = (playersPresent.length == 0) ? "None" : playersPresent.map(p => p.username).join(", ");

        let descriptionString = (area.description == null) ? "-" : area.description;
        let imageString = (area.image == null) ? "NO IMAGE" : "IMAGE INCLUDED";
        
        let color = "#5b86a8";

        if (!full) {

            if (descriptionString.length > (1024)) {
                descriptionString = descriptionString.substring(0, 1024 - 3) + "...";
            }

            return new Discord.RichEmbed()
            .setColor(color)
            .setTitle(`**${area.name}**`)
            .setDescription(
                `__id__: ${area.id}
                __Connections__: ${connectionsString}
                __Players Present__: ${playerPresentString}\n`
            )
            .addField('DESCRIPTION', descriptionString)
            .setImage(area.image)

        } else {

            return `:small_blue_diamond: __**${area.name}**__ :small_blue_diamond:\n__ID__: ${area.id}\n__Connections__: *${connectionsString}*\n__Players Present__: *${playerPresentString}*\n__Image__: ${imageString}\n\n__Description__:\n${descriptionString}\n\n\n${area.image}`;

        }
        
    }
};