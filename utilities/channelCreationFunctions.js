const postErrorMessage = require('./errorHandling').postErrorMessage;
const SendMessageChannel = require('./SendMessageChannel_Failsafe').SendMessageChannel_Failsafe;
const getHeartImage = require('./getHeartImage').getHeartImage;
const formatItem = require('./formatItem').formatItem;

module.exports = {

    async CreateSingleChannel(client, message, categoryID, guild, channelInfoObject, locations, players, inventoryData) {


        const channel = await guild.channels.create(channelInfoObject.channelname, {
            type: 'text',
            parentID: categoryID,
            permissionOverwrites: [{
                id: guild.id,
                deny: [`VIEW_CHANNEL`]
            }]
        })

        await channel.setParent(categoryID);
        await channel.overwritePermissions([{
            id: guild.id,
            deny: [`VIEW_CHANNEL`]
        }]);


        const earlogChannel = client.getEarlogChannel.get(`${guild.id}_${channelInfoObject.area.id}`);

        const newGameplayChannel = {
            guild_areaID: `${guild.id}_${channelInfoObject.area.id}`,
            areaID: channelInfoObject.area.id,
            guild: guild.id,
            channelName: channel.name,
            channelID: channel.id,
            earlogChannelID: earlogChannel.channelID,
            active: 1,
            locked: 0
        }

        client.setGameplayChannel.run(newGameplayChannel);

        SendMessageChannel(channelInfoObject.outputString1, channel);
        if (channelInfoObject.outputString2)
            SendMessageChannel(channelInfoObject.outputString2, channel);

        //Figure out who's here
        const locationsHere = locations.filter(l => channelInfoObject.area.id == l.areaID);

        locationsHere.forEach(async location => {
            this.PlacePlayerInChannel(client, message, players, guild, channel, location, inventoryData);
        })

        return channel;
    },


    CreateChannelInfoObject(client, area, players, locations, inventoryData, settings, activeAreas = undefined) {
        let active = true;
        if (activeAreas) {
            //If nobody is there, don't make a channel for it
            active = (activeAreas.find(a => area.id == a.id)) ? true : false;
        }

        //If there's no image then don't try and put one
        if (area.image == undefined) {
            area.image = "";
        }

        let playersPresent = players.filter(p => locations.find(l => l.username == p.username && l.areaID == area.id))

        //Determine who has big items
        //const bigItemsText = this.GetBigItemString(client, playersPresent, inventoryData);

        //Area Description Messages
        const pinIndicator = ">>> *-----Phase ";

        const outputString1 =
            pinIndicator + settings.phase + "-----*\n" +
            "**" + area.name + "**\n\n" + area.description;

        const outputString2 = area.image;

        const channelname = "p" + settings.phase + "-" + area.id;

        return ({
            type: "area",
            area: area,
            channelname: channelname,
            active: active,
            outputString1: outputString1,
            outputString2: outputString2
        })
    },

    PlacePlayerInChannel(client, message, players, guild, channel, location, inventoryData) {
        const playerObject = players.find(p => location.username == p.username);
        const member = guild.members.cache.find(m => m.user.id == playerObject.discordID);
        if (member != null || playerObject.length != 0) {
            this.SendEntranceMessageAndOpenChannel(client, playerObject, member.user, inventoryData, channel);
        } else {
            message.channel.send("Failed to open area " + area.name + " for " + location.username);
        }
    },

    async CreateSingelChannelMidPhase(client, message, guild, area, players, locations, inventoryData, settings) {
        const channelInfoObject = this.CreateChannelInfoObject(client, area, players, locations, inventoryData, settings);
        const channel = await this.CreateSingleChannel(client, message, settings.categoryID, guild, channelInfoObject, locations, players, inventoryData);
        return channel;
    },

    GetBigItemString(client, players, inventoryData) {
        let bigItemsText = "";
        const itemsHereToPost = inventoryData.filter(d => players.find(p => p.username == d.username) && (d.big || d.clothing));
        itemsHereToPost.forEach(item => {
            const player = players.find(p => p.username == item.username);
            bigItemsText += "\n**" + player.character + "** has: " + formatItem(client, item, false);
        });
        return bigItemsText;
    },

    async SendEntranceMessageAndOpenChannel(client, player, user, inventoryData, channel) {
        let bigItemString = this.GetBigItemString(client, [player], inventoryData);

        if (player.alive) {
            await channel.createOverwrite(user, { VIEW_CHANNEL: true });
        } else {
            await channel.createOverwrite(user, { VIEW_CHANNEL: true, SEND_MESSAGES: false });
        }

        return channel.send(`${bigItemString}\n<@${user.id}>  --  HEALTH: ${player.health}`, { files: [getHeartImage(player.health)] });
    }

}