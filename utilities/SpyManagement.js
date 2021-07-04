const { Util } = require("discord.js");
const channelCreationFunctions = require("./channelCreationFunctions");
const UtilityFunctions = require("./UtilityFunctions");

module.exports = {
    
    //Command run when we want to make sure that everything regarding spy connections, spy actions, and spy channels add up.
    async RefreshSpying(client, message, guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings) {

        //Update Spy Actions Based on Spy Connections
        // Spy Connections -> Spy Actions
        let updatedSpyActions = await this.UpdateSpyActions(client, message, spyActionsData, spyConnections, locations);
        client.deleteAllSpyActions.run(guild.id);
        updatedSpyActions.forEach(a => client.addSpyAction.run(a));

        //Checkup on Spy Channels based on Spy Actions
        // Spy Actions -> Spy Channels
        let newSpyChannelData = await this.UpdateSpyChannels(client, message, guild, players, areas, spyChannelData, updatedSpyActions, settings);

        let addedActions = UtilityFunctions.DifferenceOfSpyActions(updatedSpyActions, spyActionsData);
        let deletedActions = UtilityFunctions.DifferenceOfSpyActions(spyActionsData, updatedSpyActions);
        let addedSpyChannels = UtilityFunctions.DifferenceOfSpyChannels(newSpyChannelData, spyChannelData);

        let returnMessage = ""

        if (addedActions.length == 0 || deletedActions.length == 0) 
            returnMessage += `No spy actions were added or deleted.`;
        
        if (addedActions.length > 0) {
            returnMessage += `:bangbang: These spy actions were added:\n` +
                addedActions.map(a => `${a.username}: ${UtilityFunctions.FormatSpyAction(a)}`).join("\n") + `\n`;
        }

        if (deletedActions.length > 0) {
            returnMessage += `:bangbang: Theses players' spy actions were deleted:\n` +
                deletedActions.map(a => `${a.username}: ${UtilityFunctions.FormatSpyAction(a)}`).join("\n") + `\n`;
        }

        if (addedSpyChannels.length > 0) 
            returnMessage += addedSpyChannels.map(channel => `:bangbang: A spy channel was created for ${channel.username}`).join('\n');
        
        return returnMessage;
    },

    //Converts all active spy connections into Spy Actions
    //Updates the database and returns the updated spyActions
    async UpdateSpyActions(client, message, spyActionsData, spyConnections, locations) {

        //Add all spy actions that need to be added due to new connections
        for (spyConnection of spyConnections) {
            //If the connection isn't active don't do shit
            if (!spyConnection.active) continue;

            //Get all players in the spyConnection's area
            let playerLocationsInSpyArea = locations.filter(l => l.areaID == spyConnection.area1);

            for (player of playerLocationsInSpyArea) {

                //find if the player has a matching spy action
                //A matching spy Action that's already there takes precidnece
                matchingCurrentSpyAction = spyActionsData.find(spyAction =>
                    spyAction.username == player.username &&
                    spyAction.spyArea == spyConnection.area2
                );
                if (matchingCurrentSpyAction) continue;

                //Otherwise add new spy Action
                newSpyAction = {
                    guild_username: player.guild_username,
                    username: player.username,
                    guild: player.guild,
                    spyArea: spyConnection.area2,
                    accuracy: spyConnection.accuracy,
                    permanent: 0,
                    playerSpy: 0,
                    visible: spyConnection.visible,
                    active: 1
                }
                spyActionsData.push(newSpyAction);
                await client.addSpyAction.run(newSpyAction);
            };
        }

        //Remove spy Actions that are outdated from connections that no longer exist
        for (spyAction of spyActionsData) {
            //If it was put here manually don't mess with it
            if (spyAction.playerSpy) continue;

            let playerLocation = locations.find(l => l.username == spyAction.username);

            matchingSpyConnection = spyConnections.find(spyConnection =>
                spyConnection.area1 == playerLocation.areaID &&
                spyConnection.area2 == spyAction.spyArea &&
                spyConnection.active == spyAction.active
            );
            if (matchingSpyConnection) continue;

            //No matching connection found, so bye bye action
            spyActionsData = spyActionsData.filter(a => !UtilityFunctions.MatchSpyAction(a, spyAction));
            await client.deleteSpyAction.run(spyAction.guild_username, spyAction.spyArea, spyAction.active);
        }
        
        return spyActionsData;
    },

    //This can be run at literally any time and it will put the spy channels in the right place
    async UpdateSpyChannels(client, message, guild, players, areas, spyChannelData, spyActionsData, settings) {
        
        //Iterate through all spy channels and clear out any outdated spy actions in the spy Channels
        for (spyChannel of spyChannelData) {

            let matchedSpyAction = spyActionsData.find(spyAction =>
                spyAction.username == spyChannel.username &&
                spyAction.spyArea == spyChannel.areaID &&
                spyAction.active
            );

            //We found a matching spy action
            if (matchedSpyAction) continue;

            //no active Spy Action, so unassign the spy Channel
            spyChannel.areaID == null;
            await ReplaceSpyChannel(spyChannel);
        }

        //make sure all spy Actions have an appropriate spy channel stored in memory
        for (spyAction of spyActionsData) {

            if (!spyAction.active) continue;

            let matchedSpyChannel = spyChannelData.find(spyChannel =>
                spyAction.username == spyChannel.username &&
                spyAction.spyArea == spyChannel.areaID &&
                spyAction.active
            );

            //If we found a spy channel already assigned for the spy action return
            if (matchedSpyChannel) continue;

            let player = players.find(p => p.username == spyAction.username);
            let area = areas.find(a => a.id == spyAction.spyArea);

            //No spy channel for the action, so update it!
            //If there's a free Spy Channel for that player, use it
            let freeSpyChannel = spyChannelData.find(spyChannel =>
                spyChannel.username == spyAction.username &&
                spyChannel.areaID == null
            );
            if (freeSpyChannel) {
                freeSpyChannel.areaID = spyAction.spyArea;
                ReplaceSpyChannel(freeSpyChannel);
                continue;
            }

            //No free spy Channel, so we need to make one
            let newSpyChannelData = await channelCreationFunctions.CreateSpyChannel(client, message, guild, player, area, settings);
            spyChannelData.push(newSpyChannelData);
        }

        //Check that the GM didn't delete the spy channel or some shit
        await this.MakeSureSpyChannelsExist(client, message, guild, players, areas, spyChannelData);

        return spyChannelData;

        //Function that replaces a spy channel in the database
        async function ReplaceSpyChannel(spyChannel) {
            await client.deleteSpyChannelData.run(spyChannel.guild, spyChannel.username, spyChannel.areaID);
            await client.setSpyChannel.run(spyChannel);
        }
    },


    
    async MakeSureSpyChannelsExist(client, message, guild, players, areas, spyChannelDataAll) {
        for (spyChannelData of spyChannelDataAll) {
            const spyChannel = client.channels.cache.get(spyChannelData.channelID);
            if (spyChannel) continue;

            //We can't find the discord channel, so we gotta make it. 
            let player = players.find(player => player.username == spyChannelData.username);
            let area = areas.find(area => area.id == spyChannelData.areaID);
            let settings = UtilityFunctions.GetSettings(client, player.guild);

            //delete the useless spyChannel data
            client.deleteSpyChannelData.run(player.guild, player.username, spyChannelData.areaID);

            //Find the associated spy action that should go with this. Return if none found.
            let spyActions = client.getSpyActions.all(player.guild_username);
            if (spyActions.length == 0) continue;
            let spyActionForChannel = spyActions.find(spyAction => spyAction.areaID == area.id);
            if (!spyActionForChannel) continue;

            //Make a new channel!
            await this.CreateSpyChannel(client, message, guild, player, area, settings);
            //TODO: Post info that should be there

        }
    }
}