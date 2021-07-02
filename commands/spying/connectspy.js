const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatArea = require('../../utilities/formatArea').formatArea;

module.exports = {
    name: 'connectspy',
    description: 'Makes all players in an area spy on another area automatically. This is the recommended way to use the spy functionality. Includes an accuraccy value \`(0.0 - 1.0)\` limiting the number of words that are copied. Include \`-v\` to make the spy visible. This will turn on the area name, area description, area image, and other info posted at the beginning of the phase that would be seen by someone\'s eyes (This info is hidden by default). Include `-a` to make the spying active now instead of activated on the phase rollover.',
    format: "!connectspy <area1> <area2> <accuracy> [-v] [-a]",
    aliases: [`spyconnect`],
    guildonly: true,
    gmonly: true,
    async execute(client, message, args) {

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



        let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        let spyActionsData = client.getSpyActionsAll.all(message.guild.id);
        let locations = client.getLocations.all(message.guild.id);
        let players = client.getPlayers.all(message.guild.id);
        let areas = client.getAreas.all(message.guild.id);
        let spyChannelData = client.getSpyChannels.all(message.guild.id);

        let newSpyConnection = {
            area1: area1.id,
            area2: area2.id,
            guild: message.guild.id,
            accuracy: accuracy,
            permanent: 1,
            visible: visible,
            active: active
        }

        //Check if this connection already exists.
        let matchedConnection = UtilityFunctions.FindMatchedConnection(newSpyConnection, spyConnections);

        if (matchedConnection) {
            client.deleteSpyConnection.run(newSpyConnection.area1, newSpyConnection.area2, newSpyConnection.guild, newSpyConnection.active);
            returnMessage += `This spy connection has been overwritten:\n**${UtilityFunctions.FormatSpyConnection(matchedConnection)}**\n\n`;
        }

        //If we're updating the values of a spy connection that is currently active, mark the active one as not perminent so it gets deleted on rollover
        let activeConnectionToUpdate = spyConnections.find(c =>
            c.area1 == area1.id &&
            c.area2 == area2.id &&
            c.active &&
            active
        );
        if (activeConnectionToUpdate) {
            activeConnectionToUpdate.permanent = 0;
            client.deleteSpyConnection.run(activeConnectionToUpdate.area1, activeConnectionToUpdate.area2, activeConnectionToUpdate.guild, activeConnectionToUpdate.active);
            client.addSpyConnection.run(activeConnectionToUpdate);
            returnMessage += `**An active spy connection will be overwritten during rollover.**\n\n`
        }

        //Add the connection
        client.addSpyConnection.run(newSpyConnection);

        //Notify
        returnMessage += (active) ?
            `The following spy action will go into effect immediatley:\n` :
            `The following spy action will go into effect next phase:\n`;

        returnMessage += `**${UtilityFunctions.FormatSpyConnection(newSpyConnection)}**\n\n`;

        //Visible?
        returnMessage += (visible) ?
            `:white_check_mark::eye: This is a visible spy.\n\n` :
            `:x::eye: This is NOT a visible spy. The area name and description will be hidden in the spy channel. ` +
            `If you don't want this, make the spy a visible spy with \`-v\`\n\n`;

        //Refresh spying, see if we need to do anything fancy like update spy actions or spy channels
        returnMessage += await UtilityFunctions.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);

        message.channel.send(`\n` + returnMessage + `\n\n` + formatArea(client, area1, true), { split: true });
    }
}