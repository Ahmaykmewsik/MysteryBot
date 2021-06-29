const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
    name: 'disconnectspy',
    description: 'Disconnects two areas with a spy connection. Only clears the spy connection of the first area. Include [-a] to delete an active connection.',
    format: "!disconnectspy <area1> <area2> [-a]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0)
            return message.channel.send("Disconnect what? Enter 2 areas.");

        let area1 = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area1.guild) return;

        if (args.length == 0)
            return message.channel.send("You need to enter TWO areas. That's only one area buddy.");

        let area2 = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area2.guild) return;

        let active = 0;
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        let returnMessage = "";

        //Visible flag
        if (args.includes("-v")) 
            visible = 1;
        
        //Active flag
        if (args.includes("-a")) {
            //check that a game is running
            if (!settings.phase)
                return message.channel.send("You can't use the \"-a\" tag yet. The game hasn't started!");
            active = 1;
        }

        //Check that this connection actually exists (matched with the inputed active value). If it does, delete it
        let area1SpyConnections = client.getSpyConnections.all(area1.id, message.guild.id);
        let matchedAction = area1SpyConnections.find(c => c.area2 == area2.id && c.active == active);
        if (!matchedAction) {
            returnMessage = (active) ?  `Huh? No active spy connection exists between ${area1.id} and ${area2.id}.\n\n` : 
                                        `Huh? No non-active spy connection exists between ${area1.id} and ${area2.id}.\n\n`;
            return message.channel.send(returnMessage + formatArea(client, area1, true));
        }


        client.deleteSpyConnection.run(matchedAction.area1, matchedAction.area2, matchedAction.guild, matchedAction.active);

        //Notify
        returnMessage = (active) ?  `This active spy action has been deelted:\n` : 
                                  `This non-active spy action has been deleted:\n`;

        returnMessage += `**${UtilityFunctions.FormatSpyConnection(matchedAction)}**\n\n`;

        return message.channel.send(returnMessage + formatArea(client, area1, true));

    }
}