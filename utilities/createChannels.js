
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const ChannelCreationFunctions = require('./channelCreationFunctions.js');
const postErrorMessage = require('./errorHandling').postErrorMessage;
const UtilityFunctions = require('./UtilityFunctions');


module.exports = {
    //for Rollover ONLY
    async createChannels(client, message, areas, players, locations, settings) {

        let spyChannelData = client.getSpyChannels.all(message.guild.id);
        let spyActionsData = client.getSpyActionsAll.all(message.guild.id);
        let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
        let items = client.getItems.all(message.guild.id);
        let inventoryData = client.getInventories.all(message.guild.id);

        //Remove all non-pernament Spy Actions
        spyActionsData = spyActionsData.filter(a => a.permanent == 1);

        //Make all SpyActions and Connections Active
        spyActionsData.forEach(a => a.active = 1);
        spyConnections.forEach(c => c.active = 1);

        //Update Database
        client.deleteAllSpyActions.run(message.guild.id);
        spyActionsData.forEach(a => client.addSpyAction.run(a));
        client.deleteAllSpyConnections.run(message.guild.id);
        spyConnections.forEach(c => client.addSpyConnection.run(c));

        //Transfer Spy Connections as Actions
        spyActionsData = UtilityFunctions.UpdateSpyActions(client, message, spyActionsData, spyConnections, locations);

        //Make Game Channels
        areas.forEach(async area => {

            //if aint nobody here don't make the channel
            const locationsHere = locations.filter(l => area.id == l.areaID);
            if (locationsHere.length == 0) return;

            //Otherwise, make it!
            await ChannelCreationFunctions.CreateSingleChannel(client, message, area, message.guild, settings, players, locations, inventoryData);
        });

        //Make Spy Channels
        await ChannelCreationFunctions.UpdateSpyChannels(client, message, message.guild, players, areas, spyChannelData, spyActionsData, settings, locations, items, inventoryData) ;
    }
};