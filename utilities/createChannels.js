
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const ChannelCreationFunctions = require('./channelCreationFunctions.js');


module.exports = {
    createChannels(client, message, areas, players, locations, settings) {

        const guild = message.guild;

        let spyChannels = client.getSpyChannels.all(guild.id);
        let spyActionsData = client.getSpyActionsAll.all(guild.id);
        let spyCurrentData = client.getSpyCurrentAll.all(guild.id);

        spyCurrentData = spyCurrentData.filter(d => d.pernament);

        var channelsToMake = [];

        spyChannels.forEach(c => c.areaID = null);

        //Manage Spy Channels
        spyActionsData.forEach(spyAction => {

            //create channel if it doesn't already exist
            const freeSpyChannel = spyChannels.find(d => d.username == spyAction.username && d.areaID == null);

            const area = areas.find(a => a.id == spyAction.spyArea);

            if (freeSpyChannel == undefined) {
                //no free spy channel, so make one

                const player = players.find(p => p.username == spyAction.username);

                channelsToMake.push({
                    type: "spy",
                    username: spyAction.username,
                    discordID: player.discordID,
                    area: area,
                    areaID: spyAction.spyArea
                })
                //console.log(`Gonna make a spy channel for ${spyAction.username} in ${spyAction.spyArea}`);
            } else {
                //Update the old Spychannel to the new area
                freeSpyChannel.areaID = spyAction.spyArea;
                freeSpyChannel.area = area;
                //console.log(`Gonna update a spy channel for ${spyAction.username} to ${spyAction.spyArea}`);
            }
            //Put in new Spy Current Data
            spyCurrentData.push(spyAction);
        });

        const inventoryData = client.getItemsAndInventories.all(guild.id);

        //Save Spy Info
        //This isn't the most efficient but ah well doesn't matter
        client.deleteAllSpyActions.run(guild.id);

        client.deleteAllSpyCurrent.run(guild.id);
        spyCurrentData.forEach(spyCurrent => {
            client.addSpyCurrent.run(spyCurrent);
        });

        let activeAreas = areas.filter(a => {
            let areaLocations = locations.filter(l => l.areaID == a.id);
            //This won't work for multiareas
            let livingPlayersPresent = players.filter(p => p.alive && areaLocations.find(l => l.username == p.username))
            if (livingPlayersPresent.length > 0) {
                return true;
            }
            return false;
        });

        //Manage Area Channels
        for (let area of areas) {
            channelsToMake.push(ChannelCreationFunctions.CreateChannelInfoObject(client, area, players, locations, inventoryData, settings, activeAreas));
        };

        function CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, spyCategory, areaChannelObject, areaCategoryID) {
            //Creates spy channels and game channels.
            //Used when spy channels are in the game!
            //All areas stored in spyAreas

            if (spyAreas.length == 0) {
                return;
            }

            const c = spyAreas.pop();

            //if a spyChannel is free, use it
            const freeSpyChannels = spyChannels.filter(d => d.username == c.username && !d.areaID);
            if (freeSpyChannels.length > 0) {
                freeSpyChannels[0].areaID = c.areaID;
                client.setSpyChannel.run(freeSpyChannels[0]);
                if (spyAreas.length == 0) {
                    CreateNewAreaChannel(guild, areaChannelObject, locations, areaCategoryID);
                } else {
                    CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, spyCategory, areaChannelObject, areaCategoryID)
                }
                return;
            }

            //Else make a new channel
            guild.channels.create("spy-" + c.username, {
                type: 'text',
                //parentID: spyCategory.id,
                permissionOverwrites: [{
                    id: guild.id,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: c.discordID,
                    allow: ['VIEW_CHANNEL']
                }]
            }).then(channel => {

                //Create Webhooks
                channel.createWebhook(`SpyWebhook_${c.username}_1`);
                channel.createWebhook(`SpyWebhook_${c.username}_2`)
                    .then(() => {
                        channel.setParent(settings.spyCategoryID)
                            .then(() => {
                                channel.overwritePermissions([{
                                    id: guild.id,
                                    deny: [`VIEW_CHANNEL`]
                                }]);

                                newSpyChannel = {
                                    guild_username: `${guild.id}_${c.username}`,
                                    guild: guild.id,
                                    username: c.username,
                                    areaID: c.areaID,
                                    channelID: channel.id
                                };
                                client.setSpyChannel.run(newSpyChannel);

                                if (spyAreas.length == 0) {
                                    CreateNewAreaChannel(guild, areaChannelObject, locations, areaCategoryID);
                                } else {
                                    CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, spyCategory, areaChannelObject, areaCategoryID)
                                }
                            })
                    })
            })
        };


        function CreateNewAreaChannel(guild, c, locations, categoryID) {

            if (!c.active) {
                //post in spy channels
                const spyChannelsToPost = spyChannels.filter(d => d.areaID == c.area.id);
                spyChannelsToPost.forEach(spyChannel => {
                    const daChannel = guild.channels.cache.get(spyChannel.channelID);
                    SendMessageChannel(c.outputString1, daChannel);
                    if (c.outputString2 != "\n\n") {
                        SendMessageChannel(c.outputString2, daChannel);
                    }
                })
                return;
            }

            //Make da channel

            ChannelCreationFunctions.CreateSingleChannel(client, message, categoryID, guild, c, locations, players, inventoryData);



        }

        //This took so long to figure out holy shit
        for (let area of areas) {
            const spyAreas = channelsToMake.filter(c => area.id == c.area.id && c.type == "spy");
            const areaArea = channelsToMake.filter(c => area.id == c.area.id && c.type == "area");

            //No spy channels, no areas (this would never happen?)
            if (spyAreas.length == 0 && areaArea.length == 0) {
                console.log("Where the fuck are your areas?");
                break;
            }

            //No spy channels, area
            else if (spyAreas.length == 0 && areaArea.length == 1) {
                CreateNewAreaChannel(guild, areaArea[0], locations, settings.categoryID);
            }

            //Spy channel(s), area
            else if (spyAreas.length > 0 && areaArea.length == 1) {
                CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, settings.spyCategoryID, areaArea[0], settings.categoryID);
            }

            else {
                console.error("Something fucky just happened.");
            }

        }
    }
};