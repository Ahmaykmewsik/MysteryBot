

const postErrorMessage = require('./errorHandling').postErrorMessage;
const ChannelCreationFunctions = require('./channelCreationFunctions');
const SpyManagement = require('./SpyManagement');

module.exports = {
    //for Rollover ONLY
    async createChannels(client, message, areas, players, locations, settings) {

        let spyChannelData = client.getSpyChannels.all(message.guild.id);
        let spyActionsData = client.getSpyActionsAll.all(message.guild.id);
        let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        let items = client.getItems.all(message.guild.id);
        let inventoryData = client.getInventories.all(message.guild.id);

        //Make Game Channels
        for (area of areas) {

            //if aint nobody here don't make the channel
            const locationsHere = locations.filter(l => area.id == l.areaID);
            if (locationsHere.length == 0) return;

            //Otherwise, make it!
            await ChannelCreationFunctions.CreateSingleChannel(client, message, area, message.guild, settings, players, locations, inventoryData);
        }

        //Remove all non-pernament Spy Actions
        spyActionsData = spyActionsData.filter(a => a.permanent);
        spyConnections = spyConnections.filter(c => c.permanent);

        //Make all SpyActions and Connections Active
        spyActionsData.forEach(a => a.active = 1);
        spyConnections.forEach(c => c.active = 1);


        //Update Database
        client.deleteAllSpyActions.run(message.guild.id);
        spyActionsData.forEach(a => client.addSpyAction.run(a));
        client.deleteAllSpyConnections.run(message.guild.id);
        spyConnections.forEach(c => client.addSpyConnection.run(c));

        await SpyManagement.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);

        spyChannelData = client.getSpyChannels.all(message.guild.id);
        spyActionsData = client.getSpyActionsAll.all(message.guild.id);

        await ChannelCreationFunctions.PostAllStartSpyMessages(message, spyActionsData, spyChannelData, players, settings, locations, areas, items, inventoryData);
    }
};