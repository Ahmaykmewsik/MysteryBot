const postErrorMessage = require('./errorHandling').postErrorMessage;
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const formatItem = require('./formatItem').formatItem;
const UtilityFunctions = require('./UtilityFunctions');

module.exports = {

    async CreateSingleChannel(client, message, area, guild, settings, players, locations, inventoryData) {
        try {
            let categoryID = settings.categoryID;
            let channelName = "p" + settings.phase + "-" + area.id;
            let areaDescription = this.CreateAreaDescription(area, settings);
            let items = client.getItems.all(guild.id);

            let channel = await guild.channels.create(channelName, {
                type: 'text',
                parentID: categoryID,
                permissionOverwrites: [{
                    id: guild.id,
                    deny: [`VIEW_CHANNEL`]
                }]
            })

            await channel.setParent(categoryID);
            await channel.updateOverwrite(channel.guild.id, { VIEW_CHANNEL: false });

            const earlogChannel = client.getEarlogChannel.get(`${guild.id}_${area.id}`);

            const newGameplayChannel = {
                guild_areaID: `${guild.id}_${area.id}`,
                areaID: area.id,
                guild: guild.id,
                channelName: channel.name,
                channelID: channel.id,
                earlogChannelID: earlogChannel.channelID,
                active: 1,
                locked: 0
            }

            client.setGameplayChannel.run(newGameplayChannel);

            await SendMessageChannel(areaDescription, channel);

            //Figure out who's here
            const locationsHere = locations.filter(l => area.id == l.areaID);

            let characterDescriptions = "";

            locationsHere.forEach(async location => {
                let player = players.find(p => p.username == location.username);
                characterDescriptions += this.GetPlayerIntroString(client, player, items, inventoryData) + "\n\n";
                await this.OpenChannelForPlayer(player, message, channel);
            })

            await SendMessageChannel(characterDescriptions, channel);

            return channel;
        } catch (error) {
            postErrorMessage(error, message.channel);
        }

    },

    CreateAreaDescription(area, settings) {
        let pinIndicator = ">>> *-----Phase ";
        let areaImage = (area.image) ? area.image : "";
        return `${pinIndicator}${settings.phase}-----*\n**${area.name}**\n\n${area.description}\n\n${areaImage}`;
    },


    async CreateSingelChannelMidPhase(client, message, guild, area, players, locations, inventoryData, settings) {
        const channel = await this.CreateSingleChannel(client, message, area, guild, settings, players, locations, inventoryData);
        return channel;
    },

    GetBigItemString(client, player, items, inventoryData) {

        let bigItemsText = "";
        const itemsHereToPost = inventoryData.filter(d => (player.username == d.username));
        itemsHereToPost.forEach(inventory => {

            let item = items.find(i => i.id == inventory.itemID);
            //Only show big and clothing items
            if (!(item.big || item.clothing)) return;

            bigItemsText += "\n**" + player.character + "** has: " + formatItem(client, item, false);
        });
        return bigItemsText;

    },

    GetPlayerIntroString(client, player, items, inventoryData) {
        let bigItemString = this.GetBigItemString(client, player, items, inventoryData);
        let heartEmojis = UtilityFunctions.GetHeartEmojis(player.health);
        return `<@${player.discordID}>  --  HEALTH: ${player.health}  ${heartEmojis}\n${bigItemString}`;
    },

    async SendSingleEntranceMessageAndOpenChannel(client, player, user, items, inventoryData, channel) {
        await OpenChannelForPlayer(player, message, user, channel);
        await channel.send(this.GetPlayerIntroString(client, player, items, inventoryData), { split: true });
    },

    async OpenChannelForPlayer(player, message, channel) {
        try {
            const member = channel.guild.members.cache.find(m => m.id == player.discordID);
            (player.alive) ? await channel.createOverwrite(member, { VIEW_CHANNEL: true }) :
                             await channel.createOverwrite(member, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
        } catch (error) {
            message.channel.send(":warning: Failed to open channel " + channel.name + " for " + player.username);
            postErrorMessage(error, message.channel);
        }
    },

    async CreateEarlog(client, message, area) {
        try {
            let channel = await message.guild.channels.create("earlog-" + area.id, {
                type: 'text',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                }]
            })

            await channel.createWebhook(`EarlogWebhook_${area.id}_1`)
            await channel.createWebhook(`EarlogWebhook_${area.id}_2`)

            return client.setEarlogChannel.run({
                guild_areaID: `${message.guild.id}_${area.id}`,
                guild: message.guild.id,
                channelID: channel.id
            });
        } catch (error) {
            postErrorMessage(error, message.channel);
        }

    },

    //This can be run at literally any time and it will put the spy channels in the right place
    async UpdateSpyChannels(client, message, guild, players, areas, spyChannelData, spyActionsData, settings, locations, items, inventoryData) {
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

            if (!spyAction.active) break;

            let matchedSpyChannel = spyChannelData.find(spyChannel =>
                spyAction.username == spyChannel.username &&
                spyAction.spyArea == spyChannel.areaID &&
                spyAction.active
            );

            //If we found a spy channel already assigned for the spy action return
            if (matchedSpyChannel) break;

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
                break;
            }

            //No free spy Channel, so we need to make one
            let newSpyChannelData = await this.CreateSpyChannel(client, message, guild, players, player, area, settings, spyAction, locations, items, inventoryData);
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

    async MakeSureSpyChannelsExist(client, message, guild, players, areas, spyChannelData) {
        await spyChannelData.forEach(async spyChannelData => {
            const spyChannel = client.channels.cache.get(spyChannelData.channelID);
            if (spyChannel) return;

            //We can't find the discord channel, so we gotta make it. 
            let player = players.find(player => player.username == spyChannelData.username);
            let area = areas.find(area => area.id == spyChannelData.areaID);
            let settings = UtilityFunctions.GetSettings(client, player.guild);
            let locations = client.getLocations.all(message.guild.id);
            let items = client.getItems.all(message.guild.id);
            const inventoryData = client.getItemsAndInventories.all(message.guild.id);

            //delete the useless spyChannel data
            client.deleteSpyChannelData.run(player.guild, player.username, spyChannelData.areaID);

            //Find the associated spy action that should go with this. Return if none found.
            let spyActions = client.getSpyActions.all(player.guild_username);
            if (spyActions.length == 0) return;
            let spyActionForChannel = spyActions.find(spyAction => spyAction.areaID == area.id);
            if (!spyActionForChannel) return;

            //Make a new channel!
            await this.CreateSpyChannel(client, message, message.guild, players, player, area, settings, 
                                        spyActionForChannel, locations, items, inventoryData) ;

        });
    },

    async CreateSpyChannel(client, message, guild, players, player, area, settings, spyActionForChannel, locations, items, inventoryData) {
        try {
            let channel = await guild.channels.create("spy-" + player.username, {
                type: 'text',
                permissionOverwrites: [{
                    id: player.guild,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: player.discordID,
                    allow: ['VIEW_CHANNEL']
                }]
            })

            //Create Webhooks
            await channel.overwritePermissions([{
                id: player.guild,
                deny: [`VIEW_CHANNEL`]
            }]);

            await channel.createWebhook(`SpyWebhook_${player.username}_1`);
            await channel.createWebhook(`SpyWebhook_${player.username}_2`)

            await channel.setParent(settings.spyCategoryID)

            newSpyChannel = {
                guild_username: `${player.guild_username}`,
                guild: player.guild,
                username: player.username,
                areaID: area.id,
                channelID: channel.id
            };

            await client.setSpyChannel.run(newSpyChannel);
            return newSpyChannel;

        } catch (error) {
            if (!message) return;
            postErrorMessage(error, message.channel);
        }
    },

    async PostAllStartSpyMessages(message, spyActions, spyChannelData, players, settings, locations, areas, items, inventoryData)  {
        for (spyAction of spyActions) {
            
            //Generate message
            let area = areas.find(area => area.id == spyAction.spyArea);
            let spyMessageArray = await this.GetStartSpyMessage(message, spyAction, players, settings, locations, area, items, inventoryData);
            
            //if it's not visible don't mess with the accuracy because we don't want to encrypt the 
            let accuracy = spyAction.accuracy;
            if (!spyAction.visible) accuracy = 1.0;

            //Post in it
            UtilityFunctions.PostSpyMessage(message.client, message, spyMessageArray[0],  spyAction, spyChannelData, 1.0, false);
            UtilityFunctions.PostSpyMessage(message.client, message, spyMessageArray[1], spyAction, spyChannelData, accuracy, false);
        };

    },

    //Post identical message for spy channel (with a few adjustements)
    async GetStartSpyMessage(message, spyActionForChannel, players, settings, locations, area, items, inventoryData) {

        let areaname = (spyActionForChannel.visible) ? area.name : "???";
        
        let spyMessage = `:detective: :detective: :detective: **NOW SPYING: ${areaname}** :detective: :detective: :detective:\n\n`;

        if (!spyActionForChannel.visible) {
            let pinIndicator = ">>> *-----Phase ";
            let disclaimer = `${pinIndicator}${settings.phase}-----*\n\n[NON-VISIBLE SPY]\n[AREA DESCRIPTION REDACTED]\n`;
            return [spyMessage, disclaimer];
        }

        let areaDescription = spyMessage + this.CreateAreaDescription(area, settings);

        const locationsHere = locations.filter(l => area.id == l.areaID);
        let characterDescriptions = "";
        locationsHere.forEach(async location => {
            let player = players.find(p => p.username == location.username);
            characterDescriptions += this.GetPlayerIntroString(message.client, player, items, inventoryData) + "\n\n";
        });

        return [ areaDescription, characterDescriptions ];
    }
}