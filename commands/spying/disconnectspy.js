const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatArea = require('../../utilities/formatArea').formatArea;
const SpyManagement = require('../../utilities/SpyManagement');

module.exports = {
    name: 'disconnectspy',
    description: 'Disconnects two areas with a spy connection. Only clears the spy connection of the first area. Include [-a] to delete an active connection.',
    format: "!disconnectspy <area1> <area2> [-a]",
    guildonly: true,
    gmonly: true,
    async execute(client, message, args) {

        //return UtilityFunctions.NotImplemented(message);

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

        let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        let spyActionsData = client.getSpyActionsAll.all(message.guild.id);
        let locations = client.getLocations.all(message.guild.id);
        let players = client.getPlayers.all(message.guild.id);
        let areas = client.getAreas.all(message.guild.id);
        let spyChannelData = client.getSpyChannels.all(message.guild.id);

        //Check that this connection actually exists (matched with the inputed active value). If it does, delete it
        let matchedConnection = spyConnections.find(c =>
            c.area1 == area1.id &&
            c.area2 == area2.id &&
            c.active == active
        );

        if (!matchedConnection) {
            returnMessage = (active) ?
                `Huh? No active spy connection exists between \`${area1.id}\` and \`${area2.id}.\`` :
                `Huh? No non-active spy connection exists between \`${area1.id}\` and \`${area2.id}\` (Did you forget an \`-a\` tag?).`;
            return message.channel.send(`${returnMessage}\n\n${formatArea(client, area1, true)}`, { split: true });
        }

        //Delete it
        spyConnections = spyConnections.filter(a => !(
            a.area1 == matchedConnection.area1 &&
            a.area2 == matchedConnection.area2 &&
            a.active == matchedConnection.active
        ));
        client.deleteSpyConnection.run(
            matchedConnection.area1,
            matchedConnection.area2,
            matchedConnection.guild,
            matchedConnection.active
        );

        //Notify
        returnMessage = (active) ?
            `This active spy connection has been deleted:\n` :
            `This non-active spy connection has been deleted:\n`;
        returnMessage += `**${UtilityFunctions.FormatSpyConnection(matchedConnection)}**\n\n`;

        returnMessage += await SpyManagement.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);

        return message.channel.send(returnMessage + "\n\n" + formatArea(client, area1, true), { split: true });

    }
}