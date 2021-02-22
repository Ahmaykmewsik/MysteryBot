const formatItem = require('./formatItem').formatItem;
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const getHeartImage = require('./getHeartImage').getHeartImage;

module.exports = {
    createChannels(client, guild, areas, players, locations, categoryID, phaseNumber) {

        let spyChannels = client.getSpyChannels.all(guild.id);
        let spyActionsData = client.getSpyActions.all(guild.id);
        let spyCurrentData = client.getSpyCurrent.all(guild.id);

        spyCurrentData = spyCurrentData.filter(d => d.pernament);

        var channelsToMake = [];

        //Manage Spy Channels
        spyActionsData.forEach(spyAction => {

            //create channel if it doesn't already exist
            const freeSpyChannel = spyChannels.find(d => d.username == spyAction.username && d.areaID == null);

            if (freeSpyChannel == undefined) {
                //no free spy channel, so make one

                const player = players.find(p=> p.username == spyAction.username);



                channelsToMake.push({
                    type: "spy",
                    username: spyAction.username,
                    discordID: player.discordID,
                    areaID: spyAction.areaID
                })
            } else {
                //Update the old Spychannel to the new area
                freeSpyChannel.areaID = spyAction;
            }
            //Put in new Spy Current Data
            spyCurrentData.push(spyAction);
        });

        const inventoryData = client.getItemsAndInventories.all(guild.id);

        //Save Spy Info
        //This isn't the most efficient but ah well doesn't matter
        client.deleteAllSpyActions.run(guild.id);
        spyActionsData.forEach(spyAction => {
            client.addSpyAction.run(spyAction);
        });

        client.deleteAllSpyCurrent.run(guild.id);
        spyCurrentData.forEach(spyCurrent => {
            client.addSpyCurrent.run(spyCurrent);
        });

        //Manage Area Channels
        for (let area of areas) {

            //If nobody is there, don't make a channel for it
            var active = true;
            const livingPlayersPresent = players.filter(p => locations.find(l => (l.username == p.username) && p.alive).areaID == area.areaID);
            //const livingPlayersPresent = playersPresent.filter(p => p.alive);

            if (!livingPlayersPresent) {
                active = false;
            }

            //If there's no image then don't try and put one
            if (area.image == undefined) {
                area.image = "";
            }

            //Determine who has big items
            var bigItemsText = "";
            const itemsHereToPost = inventoryData.filter(d => d.username == username && (d.big || d.clothing));
            itemsHereToPost.forEach(item => {
                const player = players.find(p => p.username == item.username);
                bigItemsText += "\n**" + player.character + "** has: " + formatItem(item);
            });

            //Area Description Messages
            const pinIndicator = ">>> *-----Phase ";

            const outputString1 =
                pinIndicator + phaseNumber + "-----*\n" +
                "**" + area.name + "**\n\n" + area.description;

            const outputString2 = bigItemsText + "\n\n" + area.image;

            const channelname = "p" + phaseNumber + "-" + area.id;

            channelsToMake.push({
                type: "area",
                area: area,
                channelname: channelname,
                active: active,
                outputString1: outputString1,
                outputString2: outputString2
            })
        };

        function CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, spyCategory, areaChannelObject, areaCategoryID) {
            if (spyAreas.length == 0) {
                return;
            }

            const c = spyAreas.pop();

            //if a spyChannel is free, use it
            const freeSpyChannels = spyChannels.filter(d => d.player == c.player && d.area == undefined);
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
            guild.createChannel("spy-" + c.location, {
                type: 'text',
                //parentID: spyCategory.id,
                permissionOverwrites: [{
                    id: guild.id,
                    deny: ['READ_MESSAGES', 'SEND_MESSAGES']
                },
                {
                    id: c.discordID,
                    allow: ['VIEW_CHANNEL']
                }]
            }).then(channel => {
                //Add new spychannel to database
                channel.setParent(spyCategory.id);
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
        };

        
        function CreateNewAreaChannel(guild, c, locations, categoryID) {

            if (!c.active) {
                //post in spy channels
                const spyChannelsToPost = spyChannels.filter(d => d.area == c.area.id);
                spyChannelsToPost.forEach(spyChannel => {
                    const daChannel = guild.channels.get(spyChannel.channelid);
                    SendMessageChannel(c.outputString1, daChannel);
                    if (c.outputString2 != "\n\n") {
                        SendMessageChannel(c.outputString2, daChannel);
                    }
                })
                return;
            }

            

            //Make da channel
            guild.createChannel(c.channelname, {
                type: 'text',
                parentID: categoryID,
                permissionOverwrites: [{
                    id: guild.id,
                    deny: ['READ_MESSAGES']
                }]
            }).then(channel => {
                SendMessageChannel(c.outputString1, channel);
                if (c.outputString2 != "\n\n") {
                    SendMessageChannel(c.outputString2, channel);
                }

                //Figure out who's here
                const locationsHere = locations.filter(l => c.areaID == l.areaID);

                locationsHere.forEach(location => {

                    const member = guild.members.find(m => m.user.username == location.username);
                    const playerObject = players.find(p => location.username == p.name);

                    if (member != undefined || playerObject != undefined) {

                        //pingMessage += "<@" + member.user.id + ">\n" 

                        if (playerObject.alive) {

                            channel.overwritePermissions(member.user, { READ_MESSAGES: true })
                                .then(channel.send("<@" + member.user.id + ">  --  HEALTH: " + playerObject.health, { files: [getHeartImage(playerObject.health)] }))
                                .catch(console.error);
                        }
                        else {
                            channel.overwritePermissions(member.user, { READ_MESSAGES: true, SEND_MESSAGES: false })
                                .then(channel.send("<@" + member.user.id + ">"))
                                .catch(console.error);
                        }
                    } else {
                        console.log("Failed to open area " + area.name + " for " + location.username);
                    }
                })

                channel.setParent(categoryID)
                    .then(channel => {

                        

                        const earlogChannel = client.getEarlogChannel.get(`${guild.id}_${c.area.id}`); 

                        const newGameplayChannel = {
                            guild_areaID: `${guild.id}_${c.area.id}`,
                            areaID: c.area.id,
                            guild: guild.id,
                            channelName: channel.name,
                            channelID: channel.id,
                            earlogChannelID: earlogChannel.channelID
                        }

                        client.setGameplayChannel.run(newGameplayChannel);

                    })
                    .catch(console.error);
            })

        }

        //This took so long to figure out holy shit
        for (let area of areas) {
            const spyAreas = channelsToMake.filter(c => area.id == c.area && c.type == "spy");
            const areaArea = channelsToMake.filter(c => area.id == c.area.id && c.type == "area");

            //No spy channels, no areas (this would never happen?)
            if (spyAreas.length == 0 && areaArea.length == 0) {
                console.log("Where the fuck are your areas?");
                break;
            }

            //No spy channels, area
            else if (spyAreas.length == 0 && areaArea.length == 1) {
                CreateNewAreaChannel(guild, areaArea[0], locations, categoryID);
            }

            //Spy channel(s), area
            else if (spyAreas.length > 0 && areaArea.length == 1) {
                CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannels, spyCategory, areaArea[0], categoryID);
            }

            else {
                console.error("Something fucky just happened.");
            }

        }
    }
};