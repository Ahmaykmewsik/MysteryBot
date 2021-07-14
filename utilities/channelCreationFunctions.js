const postErrorMessage = require('./errorHandling').postErrorMessage;
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const formatItem = require('./formatItem').formatItem;

//UtilityFunctions Cause we have to
const UtilityFunctions = require("./UtilityFunctions");

module.exports = {

    async CreateSingleChannel(client, message, area, guild, settings, players, locations, inventoryData) {
        try {
            let channelName = "p" + settings.phase + "-" + area.id;
            let areaDescription = this.CreateAreaDescription(area, settings);
            let items = client.getItems.all(guild.id);

            let channel = await guild.channels.create(channelName, {
                type: 'text',
                parent: settings.categoryID,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [`VIEW_CHANNEL`, `SEND_MESSAGES`]
                    }
                ]
            })

            await UtilityFunctions.sleep(100);

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

            for (location of locationsHere) {
                let player = players.find(p => p.username == location.username);
                characterDescriptions += this.GetPlayerIntroString(client, player, items, inventoryData) + "\n";
                await this.PlacePlayerInChannel(player, message, channel);
            }

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

    GetBigItemString(client, player, items, inventoryData) {

        let bigItemsText = "";
        const itemsHereToPost = inventoryData.filter(d => (player.username == d.username));
        itemsHereToPost.forEach(inventory => {

            let item = items.find(i => i.id == inventory.itemID);
            //Only show big and clothing items
            if (!(item.big || item.clothing)) return;

            bigItemsText += `:small_blue_diamond:${formatItem(client, item, false)}\n`;
        });
        return bigItemsText;

    },

    GetPlayerIntroString(client, player, items, inventoryData) {
        let bigItemString = this.GetBigItemString(client, player, items, inventoryData);
        let heartEmojis = UtilityFunctions.GetHeartEmojis(player.health);

        //Toggle this if you want pings
        let pingsOn = true;
        let playerPing = (pingsOn) ? `<@${player.discordID}>` : player.username;

        return `${playerPing}\n**${player.character}** --  HEALTH: ${player.health}  ${heartEmojis}\n${bigItemString}`;
    },

    async SendSingleEntranceMessageAndOpenChannel(client, message, player, items, inventoryData, channel) {
        await this.PlacePlayerInChannel(player, message, channel);
        await channel.send(this.GetPlayerIntroString(client, player, items, inventoryData), { split: true });
        await this.UnlockChannel(message, channel);
    },

    //
    async PlacePlayerInChannel(player, message, channel) {
        try {
            const member = channel.guild.members.cache.find(m => m.id == player.discordID);
            (player.alive) ?
                await channel.createOverwrite(member, { VIEW_CHANNEL: true }) :
                await channel.createOverwrite(member, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
        } catch (error) {
            message.channel.send(`:warning: Failed to place ${player.username} in ${channel.name}`);
            postErrorMessage(error, message.channel);
        }
    },

    async UnlockChannel(message, channel) {
        try {
            await channel.updateOverwrite(channel.guild.id, { SEND_MESSAGES: true });
        } catch (error) {
            let channelName = (channel) ? channel.name : "??? channel"
            message.channel.send(`:warning: Failed to open ${channelName}. It may require being UNLOCKed manually.`);
            postErrorMessage(error, message.channel);
        }
    },

    UnlockAllChannels(message, channels) {
        for (channel of channels)
            this.UnlockChannel(message, channel);
    },

    async CreateEarlog(client, message, area, settings) {
        try {

                
            settings = await this.CreateEarlogCategoryIfNeeded(client, message.guild, settings);

            let channel = await message.guild.channels.create("earlog-" + area.id, {
                type: 'text',
                parent: settings.earlogCategoryID,
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                }]
            })

            await UtilityFunctions.sleep(200);
            await channel.createWebhook(`EarlogWebhook_${area.id}_1`);
            await UtilityFunctions.sleep(200);
            await channel.createWebhook(`EarlogWebhook_${area.id}_2`);
            await UtilityFunctions.sleep(200);

            let earlogChannel = {
                guild_areaID: `${message.guild.id}_${area.id}`,
                guild: message.guild.id,
                channelID: channel.id
            }
            client.setEarlogChannel.run(earlogChannel);
            return settings;

        } catch (error) {
            postErrorMessage(error, message.channel);
        }

    },

    async CreateEarlogCategoryIfNeeded(client, guild, settings) {
        //only make it if earlog category doesn't already exist
        if (settings.earlogCategoryID) return settings;
        let earlogCategory = await guild.channels.create("EARLOG", { type: 'category' });
        settings.earlogCategoryID = earlogCategory.id;
        await client.setSettings.run(settings);
        return settings
    },

    async CreateSpyChannel(client, message, guild, player, area, settings) {
        try {
            let channel = await guild.channels.create("spy-" + player.username, {
                type: 'text',
                parent: settings.spyCategoryID,
                permissionOverwrites: [{
                    id: player.guild,
                    deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
                },
                {
                    id: player.discordID,
                    allow: ['VIEW_CHANNEL']
                }]
            })

            //await channel.setParent(settings.spyCategoryID);
            // await channel.overwritePermissions([
            //     {
            //         id: player.guild,
            //         deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            //     },
            //     {
            //         id: player.discordID,
            //         allow: ['VIEW_CHANNEL']
            //     }
            // ]);

            //Create Webhooks
            await channel.createWebhook(`SpyWebhook_${player.username}_1`);
            await UtilityFunctions.sleep(1000);
            await channel.createWebhook(`SpyWebhook_${player.username}_2`);
            await UtilityFunctions.sleep(1000);

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
            //Don't post error if this is in a game channel (that'd be kind of bad)
            if (!message) return;
            postErrorMessage(error, message.channel);
        }
    },

    async PostAllStartSpyMessages(message, spyActions, spyChannelData, players, settings, locations, areas, items, inventoryData) {
        for (spyAction of spyActions)
            await this.PostStartSpyMessages(message, spyAction, spyChannelData, players, settings, locations, areas, items, inventoryData);
    },

    async PostStartSpyMessages(message, spyAction, spyChannelData, players, settings, locations, areas, items, inventoryData) {
        //Generate message
        let area = areas.find(area => area.id == spyAction.spyArea);
        let spyMessageArray = this.GetStartSpyMessage(message, spyAction, players, settings, locations, area, items, inventoryData);

        //if it's not visible don't mess with the accuracy because we don't want to encrypt the redacted message
        let accuracy = spyAction.accuracy;
        if (!spyAction.visible) accuracy = 1.0;

        //Post in it
        await UtilityFunctions.PostSpyMessage(message.client, message, spyMessageArray[0], spyAction, spyChannelData, 1.0, false);
        await UtilityFunctions.PostSpyMessage(message.client, message, spyMessageArray[1], spyAction, spyChannelData, accuracy, false);
        //Sleep a bit, because if we don't discord will complain
        await UtilityFunctions.sleep(200);
    },

    //Post identical message for spy channel (with a few adjustements)
    GetStartSpyMessage(message, spyActionForChannel, players, settings, locations, area, items, inventoryData) {

        let areaname = (spyActionForChannel.visible) ? area.name : "???";

        let spyMessage = `:detective: :detective: :detective: **NOW SPYING: ${areaname}** :detective: :detective: :detective:\n\n`;

        if (!spyActionForChannel.visible) {
            let pinIndicator = ">>> *-----Phase ";
            spyMessage += `${pinIndicator}${settings.phase}-----*\n\n[NON-VISIBLE SPY]\n[AREA DESCRIPTION REDACTED]\n`;
            return [spyMessage, ""];
        }

        let areaDescription = this.CreateAreaDescription(area, settings);

        const locationsHere = locations.filter(l => area.id == l.areaID);
        locationsHere.forEach(async location => {
            let player = players.find(p => p.username == location.username);
            areaDescription += "\n" + this.GetPlayerIntroString(message.client, player, items, inventoryData) + "\n";
        });

        return [spyMessage, areaDescription];
    },

    //Checks the number of channels in the category and makes a new category if we're about to go over the limit (50)
    async CheckCategorySize(client, message, settings, areas, locations, channelsToMake = undefined) {
        const categoryObject = message.guild.channels.cache.get(settings.categoryID);
        const numOfChannels = categoryObject.children.size;

        if (!channelsToMake) {
            channelsToMake = 0;
            for (area of areas) {
                if (locations.some(l => area.id == l.areaID)) channelsToMake++;
            }
        }

        if (numOfChannels + channelsToMake > 50) {
            return this.CreateNewGameplayCategory(client, message, settings);
        }
        return settings;
    },

    //Make new category
    async CreateNewGameplayCategory(client, message, settings, gameName = undefined) {
        try {
            if (!gameName) gameName = settings.categoryName;
            if (!gameName) gameName = "GAME";
            let channelname = gameName;
            settings.categoryNum++;
            if (settings.categoryNum != 1) channelname += ` (${settings.categoryNum})`;

            let categoryObject = await message.guild.channels.create(channelname, {
                type: 'category',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: [`VIEW_CHANNEL`]
                }]
            })

            settings.categoryName = gameName;
            settings.categoryID = categoryObject.id;
            client.setSettings.run(settings);
            return settings;
        } catch (error) {
            postErrorMessage(error, message.channel);
        }

    }

}