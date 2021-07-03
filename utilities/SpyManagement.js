const channelCreationFunctions = require("./channelCreationFunctions");
const UtilityFunctions = require("./UtilityFunctions");

module.exports = {
    
    //Command run when we want to make sure that everything regarding spy connections, spy actions, and spy channels add up.
    async RefreshSpying(client, message, guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings) {

        //Update Spy Actions Based on Spy Connections
        // Spy Connections -> Spy Actions
        let updatedSpyActions = this.UpdateSpyActions(client, message, spyActionsData, spyConnections, locations);
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
    UpdateSpyActions(client, message, spyActionsData, spyConnections, locations) {

        //Add all spy actions that need to be added due to new connections
        spyConnections.forEach(spyConnection => {
            //If the connection isn't active don't do shit
            if (!spyConnection.active) return;

            //Get all players in the spyConnection's area
            let playerLocationsInSpyArea = locations.filter(l => l.areaID == spyConnection.area1);

            playerLocationsInSpyArea.forEach(async player => {

                //find if the player has a matching spy action
                //A matching spy Action that's already there takes precidnece
                matchingCurrentSpyAction = spyActionsData.find(spyAction =>
                    spyAction.username == player.username &&
                    spyAction.spyArea == spyConnection.area2
                );
                if (matchingCurrentSpyAction) return;

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
                client.addSpyAction.run(newSpyAction);
            })

        });


        //Remove spy Actions that are outdated from connections that no longer exist
        spyActionsData.forEach(spyAction => {
            //If it was put here manually don't mess with it
            if (spyAction.playerSpy) return;

            let playerLocation = locations.find(l => l.username == spyAction.username);

            matchingSpyConnection = spyConnections.find(spyConnection =>
                spyConnection.area1 == playerLocation.areaID &&
                spyConnection.area2 == spyAction.spyArea &&
                spyConnection.active == spyAction.active
            );
            if (matchingSpyConnection) return;

            //No matching connection found, so bye bye
            client.deleteSpyAction.run(spyAction.guild_username, spyAction.spyArea, spyAction.active);
        })

        // let guildID;
        // try {
        //     guildID = message.guild.id;
        // } catch {
        //     guildID = locations[0].guild;
        // }
        // spyActionsData = client.getSpyActionsAll.all(guildID);

        return spyActionsData;
    },

    //This can be run at literally any time and it will put the spy channels in the right place
    async UpdateSpyChannels(client, message, guild, players, areas, spyChannelData, spyActionsData, settings) {
        //Iterate through all spy channels and clear out any outdated spy actions
        spyChannelData.forEach(spyChannel => {

            let matchedSpyAction = spyActionsData.find(spyAction =>
                spyAction.username == spyChannel.username &&
                spyAction.spyArea == spyChannel.areaID &&
                spyAction.active
            );

            //We found a matching spy action
            if (matchedSpyAction) return;

            //no active Spy Action, so unassign the spy Channel
            spyChannel.areaID == null;
            return ReplaceSpyChannel(spyChannel);
        });

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

        return spyChannelData;

        //Check that the GM didn't delete the spy channel or some shit
        //Commenting this out cause the spyChannelData is sadly outdated sometimes
        //return await this.MakeSureSpyChannelsExist(client, message, players, areas, spyChannelData);

        //Function that replaces a spy channel in the database
        function ReplaceSpyChannel(spyChannel) {
            client.deleteSpyChannelData.run(spyChannel.guild, spyChannel.username, spyChannel.areaID);
            client.setSpyChannel.run(spyChannel);
        }
    },
}