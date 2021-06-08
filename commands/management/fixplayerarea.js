const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;
const UtilityFunctions = require('../../utilities/UtilityFunctions');
const ChannelCreationFunctions = require('../../utilities/ChannelCreationFunctions.js');

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

        let locations = client.getLocations.all(message.guild.id);
        let currentLocation = locations.find(l => l.username == player.username);

        let warningMessage;
        if (area.id == currentLocation.areaID)
            warningMessage = `Huh? But ${player.username} is already in ${area.id}! Do you want me to run this command anyway? (I'll do my best to move them to \`${area.id}\`!)`;
        else
            warningMessage = `${player.username} is currently in \`${currentLocation.areaID}\`. Move them out of that discord channel and into \`${area.id}\`?`;

        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, FixPlayerArea);

        async function FixPlayerArea() {
            let gameplayChannels = client.getGameplayChannels.all(message.guild.id);
            let inventoryData = client.getItemsAndInventories.all(player.discordID);
            const member = message.guild.members.cache.find(m => m.user.id == player.discordID);

            let wrongChannelInfo = gameplayChannels.find(c => (c.areaID == currentLocation.areaID) && c.active);
            let rightChannelInfo = gameplayChannels.find(c => (c.areaID == area.id) && c.active);
            let wrongChannelID;
            let rightChannelID;

            if (wrongChannelInfo)
                wrongChannelID = wrongChannelInfo.channelID;
            if (rightChannelInfo)
                rightChannelID = rightChannelInfo.channelID;

            if (wrongChannelID != rightChannelID) {
                let wrongChannel = client.channels.cache.get(wrongChannelID);
                if (!wrongChannel) {
                    await message.channel.send(`I couldn't find ${currentLocation.areaID}, so I won't be doing anything with it.`);
                }
                else {
                    await wrongChannel.createOverwrite(member.user, { VIEW_CHANNEL: false });
                    await wrongChannel.send(`The GM has manually moved ${player.character} to another area.`);
                }
            }

            let rightChannel;
            if (!rightChannelInfo) {
                let players = client.getPlayers.all(message.guild.id);
                rightChannel = await ChannelCreationFunctions.CreateSingelChannelMidPhase(client, message, message.guild, area, players, locations, inventoryData, settings);
            } else {
                rightChannel = client.channels.cache.get(rightChannelID);
            }

            await rightChannel.send(`The GM has manually moved ${player.character} into this area!`);
            await ChannelCreationFunctions.SendEntranceMessageAndOpenChannel(client, player, member.user, inventoryData, rightChannel);

            client.deleteLocationsOfPlayer.run(player.guild_username);
            const newLocation = {
                guild_username: player.guild_username,
                username: player.username,
                guild: player.guild,
                areaID: area.id
            };
            client.setLocation.run(newLocation);

            return message.channel.send(`Moved ${player.username} to ${area.id}!`);


            //return message.channel.send(`...sorry, I tired, but for whatever reason I can't move ${player.username} to ${area.id}. You'll need to do it some other way! (Maybe with !createareachannel and !setarea?)`);
        }

    }
};