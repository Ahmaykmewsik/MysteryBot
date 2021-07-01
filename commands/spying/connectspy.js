const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'connectspy',
    description: 'Makes all players in an area spy on another area automatically. This is the recommended way to use the spy functionality. Includes an accuraccy value \`(0.0 - 1.0)\` limiting the number of words that are copied. Include \`-v\` to make the spy visible. This will turn on the area name, area description, area image, and other info posted at the beginning of the phase that would be seen by someone\'s eyes (This info is hidden by default). Include `-a` to make the spying active now instead of activated on the phase rollover.',
    format: "!connectspy <area1> <area2> <accuracy> [-v] [-a]",
    aliases: [`spyconnect`],
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0)
            return message.channel.send("Spy where? Enter an area.");

        let area1 = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area1.guild) return;

        if (args.length == 0)
            return message.channel.send("You need to enter TWO areas. That's how a connect works, dumbass!");

        let area2 = UtilityFunctions.GetArea(client, message, args.shift().toLowerCase());
        if (!area2.guild) return;

        if (args.length == 0)
            return message.channel.send("You need to enter an accuracy. Please enter a number between 0 and 1.");

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (!(typeof accuracy == "number") || accuracy < 0 || accuracy > 1.0)
            return message.channel.send("Invalid accuracy: " + accuracyInput + ". Please enter a number between 0 and 1.");

        let visible = 0;
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


        //Check if this connection already exists (matched with the inputed active value). If it does, delete it
        let area1SpyConnections = client.getSpyConnections.all(area1.id, message.guild.id);
        let matchedAction = area1SpyConnections.find(c => c.area2 == area2.id && c.active == active);
        if (matchedAction) {
            client.deleteSpyConnection.run(matchedAction.area1, matchedAction.area2, matchedAction.guild, matchedAction.active);
            returnMessage += `**Spy connection of accuracy ${matchedAction.accuracy} has been overridden.**\n`
        }

        //Add the connection
        newSpyConnection = {
            area1: area1.id,
            area2: area2.id,
            guild: message.guild.id,
            accuracy: accuracy,
            visible: visible,
            active: active
        }
        client.addSpyConnection.run(newSpyConnection);

        //Notify
        if (active) {
            returnMessage += `The following spy action will go into effect immediatley:\n`
        } else {
            returnMessage += `The following spy action will go into effect next phase:\n`
        }

        returnMessage += `**${UtilityFunctions.FormatSpyConnection(newSpyConnection)}**\n`;

        //Visible?
        if (visible) {
            returnMessage += `This is a visible spy.`;
        } else {
            returnMessage += `This is NOT a visible spy. The area name and description will NOT be shown. ` + 
                             `If you don't want this, make the spy a visible spy with \`-v\``;  
        }

        return message.channel.send(returnMessage);

    }
}