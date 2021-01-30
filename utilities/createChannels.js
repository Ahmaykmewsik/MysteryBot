const formatItem = require('./formatItem').formatItem;
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const getHeartImage = require('../utilities/getHeartImage').getHeartImage;

module.exports = {
    createChannels(client, guild, areas, players, categoryID, phaseNumber) {

        const items = client.data.get("ITEM_DATA");
        const spyCategory = client.data.get("SPY_CATEGORY");
        var spyChannelData = client.data.get("SPY_CHANNEL_DATA");

        if (spyChannelData == undefined) {
            spyChannelData = [];
        }

        //Create and connect any neccessary spy channels
        spyChannelData.forEach(d => {
            //clear all spy areas from previous phase
            d.area = undefined;
        })

        var channelsToMake = [];

        //Manage Spy Channels
        players.forEach(player => {
            player.spyCurrent = [];
            if (player.spyAction != undefined && player.spyAction.length > 0) {
                player.spyAction.forEach(spyAction => {
                    //create channel if it doesn't already exist
                    const freeSpyChannel = spyChannelData.find(d => d.player == player.name && d.area == undefined);
                    if (freeSpyChannel == undefined) {
                        //no free spy channel, so make one
                        channelsToMake.push({
                            type: "spy",
                            playerName: player.name,
                            playerDiscordid: player.discordid,
                            area: spyAction[0]
                        })
                    } else {
                        //Update the old Spychannel to the new area
                        freeSpyChannel.area = spyAction[0];
                    }
                    player.spyCurrent = player.spyAction;
                });
                player.spyAction = [];
            }
        })

        //Manage Area Channels
        for (let area of areas) {

            //If nobody is there, don't make a channel for it
            var active = true;
            if (area.playersPresent.length == 0) {
                active = false;
            }

            //If nobody ALIVE is there, don't make a channel for it
            var livingPlayersPresent = false;
            for (var i = 0; i < area.playersPresent.length; i++) {
                playerObject = players.find(p => p.name == area.playersPresent[i]);
                if (playerObject != undefined) {
                    if (playerObject.alive) {
                        livingPlayersPresent = true;
                    }
                }
            }
            if (!livingPlayersPresent) {
                active = false;
            }

            //If there's no image then don't try and put one
            if (area.image == undefined) {
                area.image = "";
            }

            //Determine who has big items
            var bigItemsText = "";
            area.playersPresent.forEach(player => {
                playerObject = players.find(p => p.name == player);
                if (playerObject.items != undefined) {
                    playerObject.items.forEach(item => {
                        itemObject = items.find(i => i.name == item);
                        if (itemObject.big || itemObject.clothing) {
                            bigItemsText += "\n**" + playerObject.character + "** has: " + formatItem(itemObject);
                        }
                    })
                }
            })

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

        console.log("Updating DATA");
        client.data.set("PLAYER_DATA", players);
        client.data.set("SPY_CHANNEL_DATA", spyChannelData);

        function CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannelData, spyCategory, areaChannelObject, areaCategoryID) {
            if (spyAreas.length == 0) {
                return;
            }

            const c = spyAreas.pop();

            //if a spyChannel is free, use it
            const freeSpyChannels = spyChannelData.filter(d => d.player == c.player && d.area == undefined);
            if (freeSpyChannels.length > 0) {
                freeSpyChannels[0].area = c.area;
                client.data.set("SPY_CHANNEL_DATA", spyChannelData);
                if (spyAreas.length == 0) {
                    CreateNewAreaChannel(guild, areaChannelObject, areaCategoryID);
                } else {
                    CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannelData, spyCategory, areaChannelObject, areaCategoryID)
                }
                return;
            }

            //Else make a new channel
            guild.createChannel("spy-" + c.playerName, {
                type: 'text',
                //parentID: spyCategory.id,
                permissionOverwrites: [{
                    id: guild.id,
                    deny: ['READ_MESSAGES', 'SEND_MESSAGES']
                },
                {
                    id: c.playerDiscordid,
                    allow: ['VIEW_CHANNEL']
                }]
            }).then(channel => {
                //Add new spychannel to database
                channel.setParent(spyCategory.id);
                spyChannelData.push({
                    player: c.playerName,
                    channelid: channel.id,
                    area: c.area
                });
                client.data.set("SPY_CHANNEL_DATA", spyChannelData);
                if (spyAreas.length == 0) {
                    CreateNewAreaChannel(guild, areaChannelObject, areaCategoryID);
                } else {
                    CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannelData, spyCategory, areaChannelObject, areaCategoryID)
                }
            })
        };


        function CreateNewAreaChannel(guild, c, categoryID) {
            
            if (!c.active) {
                //post in spy channels
                const spyChannelsToPost = spyChannelData.filter(d => d.area == c.area.id);
                spyChannelsToPost.forEach(spyChannel => {
                    const daChannel = guild.channels.get(spyChannel.channelid);
                    SendMessageChannel(c.outputString1, daChannel);
                    if (c.outputString2 != "\n\n") {
                        SendMessageChannel(c.outputString2, daChannel);
                    }
                })
                return;
            }

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

                c.area.playersPresent.forEach(playerName => {

                    const member = guild.members.find(m => m.user.username == playerName);
                    const playerObject = players.find(p => playerName == p.name);

                    if (member != undefined || playerObject != undefined) {

                        //pingMessage += "<@" + member.user.id + ">\n" 

                        if (playerObject.alive) {

                            channel.overwritePermissions(member.user, { READ_MESSAGES: true })
                                .then(channel.send("<@" + member.user.id + ">  --  HEALTH: " + playerObject.health, {files: [getHeartImage(playerObject.health)]}))
                                .catch(console.error);
                        }
                        else {
                            channel.overwritePermissions(member.user, { READ_MESSAGES: true, SEND_MESSAGES: false })
                                .then(channel.send("<@" + member.user.id + ">"))
                                .catch(console.error);
                        }
                    } else {
                        console.log("Failed to open area " + area.name + " for " + playerName);
                    }
                })

                channel.setParent(categoryID)
                    .then(channel => {
                        var channeldata = client.data.get("CHANNEL_DATA");
                        if (channeldata == undefined) {
                            channeldata = {};
                        }
                        channeldata[c.channelname] = channel.id;
                        client.data.set("CHANNEL_DATA", channeldata);
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
                CreateNewAreaChannel(guild, areaArea[0], categoryID);
            }

            //Spy channel(s), area
            else if (spyAreas.length > 0 && areaArea.length == 1) {
                CreateNewSpyChannelsRecursive(guild, spyAreas, spyChannelData, spyCategory, areaArea[0], categoryID);
            }

            else {
                console.error("Something fucky just happened.");
            }

        }
    }
};