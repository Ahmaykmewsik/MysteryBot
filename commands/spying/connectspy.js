const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatArea = require('../../utilities/formatArea').formatArea;
const SpyManagement = require('../../utilities/SpyManagement');

module.exports = {
    name: 'connectspy',
    description:
        'Makes all players in an area spy on another area automatically. This is the recommended way to use the spy functionality. ' +
        '\n\nMust include an accuraccy value \`(0.0 - 1.0)\`. This will control the percentage of words that are copied into the spy channels. ' +
        '\n\nInclude \`-v\` to make the spy visible. ' +
        'This will turn on the area name, area description, area image, and other info posted at the beginning of the phase ' +
        'that would be seen by someone\'s eyes. Otherwise this info is redacted. ' +
        '\n\nInclude `-a` to make the spying active now instead of activated on the phase rollover.',
    format: "!connectspy <area1> <area2> <accuracy> [-v] [-a]",
    aliases: [`spyconnect`],
    guildonly: true,
    gmonly: true,
    async execute(client, message, args) {

        return UtilityFunctions.NotImplemented(message);

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

        if (isNaN(accuracy)|| accuracy < 0 || accuracy > 1.0)
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
        let matchedConnections = UtilityFunctions.FindMatchedConnections(newSpyConnection, spyConnections);
        //delete all matching connections
        for (let connection of matchedConnections) {
            spyConnections = spyConnections.filter(c => !UtilityFunctions.MatchSpyConnection(c, connection));
            client.deleteSpyConnection.run(connection.area1, connection.area2, connection.guild, connection.active);
            returnMessage += `This spy connection has been overwritten:\n**${UtilityFunctions.FormatSpyConnection(connection)}**\n\n`;
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
        spyConnections.push(newSpyConnection);
        client.addSpyConnection.run(newSpyConnection);

        //Notify
        returnMessage += (active) ?
            `The following spy connection will go into effect immediatley:\n` :
            `The following spy connection will go into effect next phase:\n`;

        returnMessage += `**${UtilityFunctions.FormatSpyConnection(newSpyConnection)}**\n\n`;

        //Visible?
        returnMessage += (visible) ?
            `:eye: This connection is a visible spy.\n\n` :
            `:ear: This connection is NOT a visible spy. The area name and description will be redacted in the spy channel. ` +
            `If you don't want this, make the spy a visible spy with \`-v\`\n\n`;

        //Refresh spying, see if we need to do anything fancy like update spy actions or spy channels
        returnMessage += await SpyManagement.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);

        message.channel.send(`\n` + returnMessage + `\n\n` + formatArea(client, area1, true), { split: true });
    }
}