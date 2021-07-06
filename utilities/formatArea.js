const Discord = require('discord.js');
const UtilityFunctions = require('./UtilityFunctions');

module.exports = {

    formatArea(client, area, full = 0, images = 1) {

        let connections = client.getConnections.all(area.id, area.guild);
        let connectionsInString = (connections.length == 0) ? "" : connections.map(c => c.area2).join(", ");

        let allConnections = client.getAllConnections.all(area.guild);
        let connectionsOutString = allConnections.filter(c => area.id == c.area2).map(c => c.area1).join(", ");

        let playersPresent = client.getPlayersOfArea.all(area.id, area.guild);
        let playerPresentString = (playersPresent.length == 0) ? "-" : playersPresent.map(p => p.username).join(", ");
        let charactersPresent   = (playersPresent.length == 0) ? "-" : playersPresent.map(p => p.character).join(", ");

        let instantConnections = client.getInstantConnections.all(area.guild);
        let instantConnectionsOutString = instantConnections.filter(c => area.id == c.area1).map(c => UtilityFunctions.FormatInstantConnection(c)).join(", ");
        let instantConnectionsInString  = instantConnections.filter(c => area.id == c.area2).map(c => UtilityFunctions.FormatInstantConnection(c)).join(", ");
        let instantConnectionsOutStirngPlayer = (instantConnectionsOutString.length == 0) ? "---" : instantConnectionsOutString;

        let spyConnections = client.getSpyConnectionsAll.all(area.guild);
        let spyConnectionsOutString = spyConnections.filter(c => area.id == c.area1).map(c => UtilityFunctions.FormatSpyConnection(c)).join("  -  "); 
        let spyConnectionsInString  = spyConnections.filter(c => area.id == c.area2).map(c => UtilityFunctions.FormatSpyConnection(c)).join("  -  "); 

        let descriptionString = (area.description == null) ? "-" : area.description;
        let imageString = (area.image == null) ? "NO IMAGE" : area.image;
        let hasImage = (area.image == null) ? ":x:" : ":ballot_box_with_check:";

        let color = "#5b86a8";

        //Full output (What a GM usually sees)
        if (full) {
            let fullOutput = `:small_blue_diamond: __**${area.name}**__ :small_blue_diamond:\n:page_facing_up: __id__: ${area.id}\n`

            if (connectionsOutString.length > 0)
                fullOutput += `:arrow_up: __Connections Out__: ${connectionsOutString}\n`;
            if (connectionsInString.length > 0)
                fullOutput += `:arrow_down: __Connections In__: ${connectionsInString}\n`;
            if (instantConnectionsOutString.length > 0)
                fullOutput += `:small_red_triangle: __Instant Connections Out__: ${instantConnectionsOutString}\n`;
            if (instantConnectionsInString.length > 0)
                fullOutput += `:small_red_triangle_down: __Instant Connections In__: ${instantConnectionsInString}\n`;
            if (spyConnectionsOutString.length > 0)
                fullOutput += `:detective: __Spy Connections Out (Spying)__: ${spyConnectionsOutString}\n`;
            if (spyConnectionsInString.length > 0)
                fullOutput += `:shushing_face: __Spy Connections In (Being Spied)__: ${spyConnectionsInString}\n`;

            fullOutput += `:frame_photo: __Has Image__: ${hasImage}\n`
            fullOutput += `:family_man_girl_boy: __Players Present__: **${playerPresentString}**\n\n__Description__:\n${area.description}\n`;

            if (images)
                fullOutput += `\n${imageString}`;

            return fullOutput;
        }

        //Partial output (This is what players will see)
        const infoStringPartial =
            `__id__: ${area.id}
            __Connections Out__: **${connectionsOutString}**
            __Instant Connections Out__: ${instantConnectionsOutStirngPlayer}
            __Characters Present__: **${charactersPresent}**\n`;

        if (descriptionString.length > (1024)) {
            descriptionString = descriptionString.substring(0, 1024 - 3) + "...";
        }

        return new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(`**${area.name}**`)
            .setDescription(infoStringPartial)
            .addField('DESCRIPTION', descriptionString)
            .setImage(area.image)
    }
};