const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions.js');
const SpyManagement = require('../../utilities/SpyManagement');

module.exports = {
    name: 'fixplayerarea',
    description: 'Moves a player out of their current area/discord channel and into another one. For when a player moves to the wrong area during the phase rollover and you need to fix it. Will notify players of the move and repost that player\'s info in the new area.',
    format: "!fixplayerarea <username> <areaid>",
    gmonly: true,
    execute(client, message, args) {


        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        if (!settings.phase)
            return message.channel.send("You need to start the game first with !gamestart. (Aborting)");

        let player = UtilityFunctions.GetPlayer(client, message, message.guild.id, args.shift());
        if (player.username == undefined) return;

        let area = UtilityFunctions.GetArea(client, message, args.shift());
        if (!area.guild) return;

        //Find where the player is
        let locations = client.getLocations.all(message.guild.id);
        let currentLocation = locations.find(l => l.username == player.username);
        let warningMessage;
        try {
            if (area.id == currentLocation.areaID)
                warningMessage = `Huh? But ${player.username} is already in ${area.id}! Do you want me to run this command anyway? (I'll do my best to move them to \`${area.id}\`!) (y/n)`;
            else
                warningMessage = `${player.username} is currently in \`${currentLocation.areaID}\`. Move them out of that discord channel and into \`${area.id}\`?`;
        } catch {
            warningMessage = `${player.username} currently has no location. Move them into \`${area.id}\`?`;
        }
        
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, FixPlayerArea);

        async function FixPlayerArea() {
            try {
                let spyActionsData = client.getSpyActionsAll.all(message.guild.id);
                let spyConnections = client.getSpyConnectionsAll.all(message.guild.id);
                let areas = client.getAreas.all(message.guild.id);
                let players = client.getPlayers.all(message.guild.id);
                let spyChannelData = client.getSpyChannels.all(message.guild.id);
                let gameplayChannels = client.getGameplayChannels.all(message.guild.id);
                let inventoryData = client.getItemsAndInventories.all(player.discordID);
                const items = client.getItems.all(player.guild);
                const member = message.guild.members.cache.find(m => m.user.id == player.discordID);

                playerAreaID = null;
                if (currentLocation) playerAreaID = currentLocation.areaID;

                //Find channels
                let wrongChannelInfo = gameplayChannels.find(c => (c.areaID == playerAreaID) && c.active);
                let rightChannelInfo = gameplayChannels.find(c => (c.areaID == area.id) && c.active);
                let wrongChannelID;
                let rightChannelID;
                if (wrongChannelInfo)
                    wrongChannelID = wrongChannelInfo.channelID;
                if (rightChannelInfo)
                    rightChannelID = rightChannelInfo.channelID;
                if (wrongChannelID != rightChannelID) {
                    let wrongChannel = client.channels.cache.get(wrongChannelID);
                    if (!wrongChannel && playerAreaID) {
                        await message.channel.send(`I couldn't find ${playerAreaID}, so I won't be doing anything with it.`);
                    }
                    else if (!wrongChannel) {
                        //Don't post anything, we already notified that they have no location.    
                    }
                    else {
                        await wrongChannel.createOverwrite(member.user, { VIEW_CHANNEL: false });
                        await wrongChannel.send(`The GM has manually moved **${player.character}** to another area.`);
                    }
                }

                //Get channel to move to, or create it if it doesn't exist
                let rightChannel;
                if (!rightChannelInfo) {
                    let players = client.getPlayers.all(message.guild.id);
                    let guild = client.guilds.cache.find(g => g.id == settings.guild);
                    rightChannel = await ChannelCreationFunctions.CreateSingleChannel(client, message, area, guild, settings, players, locations, inventoryData);
                } else {
                    rightChannel = client.channels.cache.get(rightChannelID);
                }

                //Change discord channel permissions
                await rightChannel.send(`The GM has manually moved **${player.character}** into this area!`);
                await ChannelCreationFunctions.SendSingleEntranceMessageAndOpenChannel(client, message, player, items, inventoryData, rightChannel);

                //Set new location
                client.deleteLocationsOfPlayer.run(player.guild_username);
                const newLocation = {
                    guild_username: player.guild_username,
                    username: player.username,
                    guild: player.guild,
                    areaID: area.id
                };
                client.setLocation.run(newLocation);
                locations = client.getLocations.all(message.guild.id);

                message.channel.send(`Moved ${player.username} to ${area.id}!`);

                //Refresh spying, see if we need to do anything fancy like update spy actions or spy channels

                let returnMessage = await SpyManagement.RefreshSpying(client, message, message.guild, spyActionsData, spyConnections, spyChannelData, players, areas, locations, settings);
                message.channel.send(returnMessage);

            }
            catch (error) {
                console.error(error);
                return message.channel.send(`...sorry, I tired, but for whatever reason I can't move ${player.username} to ${area.id}. You'll need to do it some other way! (Maybe with !createareachannel and !setarea?)\n\`\`\`${error}\`\`\``);
            }
        }

    }
};