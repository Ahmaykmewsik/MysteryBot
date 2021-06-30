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

            await channel.overwritePermissions([{
                id: guild.id,
                deny: [`VIEW_CHANNEL`]
            }]);
            await channel.setParent(categoryID);

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

            SendMessageChannel(areaDescription, channel);

            //Figure out who's here
            const locationsHere = locations.filter(l => area.id == l.areaID);

            let characterDescriptions = "";

            locationsHere.forEach(async location => {
                let player = players.find(p => p.username == location.username);
                characterDescriptions += this.GetPlayerIntroString(client, player, items, inventoryData) + "\n\n";
                await this.OpenChannelForPlayer(player, message, channel);
            })

            SendMessageChannel(characterDescriptions, channel);

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
        console.log(inventoryData);
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
            const member = channel.guild.members.cache.find(m => m.user.id == player.discordID);
            (player.alive) ? await channel.createOverwrite(member.user, { VIEW_CHANNEL: true }) :
                             await channel.createOverwrite(member.user, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
        } catch (error) {
            message.channel.send("Failed to open channel " + channel.name + " for " + player.username);
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
    async UpdateSpyChannels(client, message, players, areas, spyChannelData, spyActionsData, settings) {

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
        await spyActionsData.forEach(async spyAction => {

            if (!spyAction.active) return;

            let matchedSpyChannel = spyChannelData.find(spyChannel =>
                spyAction.username == spyChannel.username &&
                spyAction.spyArea == spyChannel.areaID &&
                spyAction.active
            );

            if (matchedSpyChannel) return;

            //No spy channel for the action, so update it!
            //If there's a free Spy Channel for that player, use it
            let freeSpyChannel = spyChannelData.find(spyChannel =>
                spyChannel.username == spyAction.username &&
                spyChannel.areaID == null
            );

            //If there's a free spy channel use that
            if (freeSpyChannel) {
                freeSpyChannel.areaID = spyAction.spyArea;
                return ReplaceSpyChannel(spyChannel);
            }

            //No free spy Channel, so we need to make one
            let player = players.find(p => p.username == spyAction.username);
            let area = areas.find(a => a.id == spyAction.spyArea);
            return await this.CreateSpyChannel(client, message, message.guild, player, area, settings);
        })

        //Check that the GM didn't delete the spy channel or some shit
        return await this.MakeSureSpyChannelsExist(client, message, players, areas, spyChannelData);

        function ReplaceSpyChannel(spyChannel) {
            client.deleteSpyChannelData.run(spyChannel.guild, spyChannel.username, spyChannel.areaID);
            client.setSpyChannel.run(spyChannel);
        }
    },

    async MakeSureSpyChannelsExist(client, message, players, areas, spyChannelData) {
        await spyChannelData.forEach(async spyChannelData => {
            const spyChannel = client.channels.cache.get(spyChannelData.channelID);
            if (spyChannel) return;

            //We can't find it, so gotta make it. 
            let player = players.find(player => player.username == spyChannelData.username);
            let area = areas.find(area => area.id == spyChannelData.areaID);
            let settings = UtilityFunctions.GetSettings(client, player.guild);
            //delete the useless one
            client.deleteSpyChannelData.run(player.guild, player.username, spyChannelData.areaID);
            //Make a new one!
            await this.CreateSpyChannel(client, message, player, area, settings);

        });
    },

    async CreateSpyChannel(client, message, guild, player, area, settings) {
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

            return await client.setSpyChannel.run(newSpyChannel);

        } catch (error) {
            if (!message) return;
            postErrorMessage(error, message.channel);
        }
    }
}