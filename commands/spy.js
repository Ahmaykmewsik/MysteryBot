
const formatPlayer = require('../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spy',
    description: 'Gives a player the ability to discretley view another channel. Includes an accuraccy value, limiting the number of words that are copied.',
    format: "!spy <player> <area> <accuracy> [current]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        var players = client.data.get("PLAYER_DATA");
        if (players == undefined) {
            return message.channel.send("You don't have any players!");
        }

        const items = client.data.get("ITEM_DATA");

        const areas = client.data.get("AREA_DATA");
        if (areas == undefined) {
            return message.channel.send("You don't have any areas! Setup the game first bumbo.");
        }

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        //find player based on input
        const playerObject = players.find(p => p.name.toLowerCase().includes(inputusername));

        //Notify if invalid input for user
        if (playerObject == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("But spy where? Enter an area.");
        }

        const areaid = args.shift().toLowerCase();

        //Check that input for area is valid
        const area = areas.find(a => a.id == areaid);
        if (area == undefined) {
            return message.channel.send("Invalid area ID.");
        }

        if (args.length == 0) {
            return message.channel.send("Please enter a number between 0 and 1 for the accuracy.");
        }

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (!(typeof accuracy == "number") || accuracy <= 0 || accuracy > 1.0) {
            return message.channel.send("Invalid accuracy: " + accuracyInput + ". Please enter a number between 0 and 1.");
        }

        if (args.length == 0) {
            playerObject.spyAction.push([areaid, accuracy]);
            message.channel.send(playerObject.name + " next phase will spy: `" + areaid + "` with `" + accuracy + "` accuracy.");
        } else if (args.length == 1) {
            if (args[0] == "current") {
                const spyCategory = client.data.get("SPY_CATEGORY");
                const spyChannelData = client.data.get("SPY_CHANNEL_DATA");

                const spyArea = {
                    type: "spy",
                    playerName: playerObject.name,
                    playerDiscordid: playerObject.discordid,
                    area: areaid
                }

                CreateNewSpyChannelsRecursive(message.guild, spyArea, spyChannelData, spyCategory);
                playerObject.spyCurrent.push([areaid, accuracy]);

                message.channel.send("Current spy replaced.");
            }
            else {
                message.channel.send("Invalid final tolken.");
            }
        }

        client.data.set("PLAYER_DATA", players);
        message.channel.send(formatPlayer(playerObject, items));

        function CreateNewSpyChannelsRecursive(guild, spyArea, spyChannelData, spyCategory) {
            
            const c = spyArea;

            //if a spyChannel is free, use it
            const freeSpyChannels = spyChannelData.filter(d => d.player == c.player && d.area == undefined);
            if (freeSpyChannels.length > 0) {
                freeSpyChannels[0].area = c.area;
                client.data.set("SPY_CHANNEL_DATA", spyChannelData);
            }

            //Else make a new channel
            guild.createChannel("spy-" + c.playerName, {
                type: 'text',
                parentID: spyCategory.id,
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
            })
        };
    }


};