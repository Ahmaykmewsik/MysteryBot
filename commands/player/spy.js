const UtilityFunctions = require('../../utilities/UtilityFunctions');
const formatPlayer = require('../../utilities/formatPlayer').formatPlayer;

module.exports = {
    name: 'spy',
    description: 'Gives a player the ability to discretley view another channel. Includes an accuraccy value, limiting the number of words that are copied. Include -p to make the spy action permanent.',
    format: "!spy <player> <area> <accuracy> [-c] [-p]",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        if (args.length == 0) {
            return message.channel.send("You need to enter a player.");
        }

        const inputusername = args.shift().toLowerCase();

        const player = UtilityFunctions.GetPlayerFronInput(client, message.guild.id, inputusername);

        if (player == undefined) {
            return message.channel.send("Invalid username: " + inputusername);
        }

        if (args.length == 0) {
            return message.channel.send("But spy where? Enter an area.");
        }

        const areainput = args.shift().toLowerCase();

        const area = client.getArea.get(`${message.guild.id}_${areainput}`);
        if (!area) {
            return message.channel.send("No area exists with ID `" + areainput + "`. Use !areas to view all areas.");
        }

        if (args.length == 0) {
            return message.channel.send("Please include a number between 0.0 and 1.0 for the accuracy.");
        }

        const accuracyInput = args.shift();
        const accuracy = parseFloat(accuracyInput);

        if (!(typeof accuracy == "number") || accuracy < 0 || accuracy > 1.0) {
            return message.channel.send("Invalid accuracy: " + accuracyInput + ". Please enter a number between 0 and 1.");
        }

        var permanent = 0;
        if (args.length > 1) {
            if (args[0] == "-c") {
                return message.channel.send("UNIMPLEMENTED");
            }
            else if (args[0] == "-p") {
                permanent = 1;
            } else {
                return message.channel.send("Invalid final tolken.");
            }
        }

        const spyAction = {
            guild_username: `${message.guild.id}_${player.username}`,
            username: player.username,
            guild: message.guild.id,
            spyArea: area.id,
            accuracy: accuracy,
            permanent: permanent
        };

        console.log(spyAction);

        client.addSpyAction.run(spyAction);

        message.channel.send(player.username + " next phase will spy: `" + area.id + "` with `" + accuracy + "` accuracy.");
        message.channel.send(formatPlayer(client, player));

        //TODO: IMPLEMENT

        // if (args[0] == "current") {
        //     const spyCategory = client.data.get("SPY_CATEGORY");
        //     const spyChannelData = client.data.get("SPY_CHANNEL_DATA");

        //     const spyArea = {
        //         type: "spy",
        //         playerName: playerObject.name,
        //         playerDiscordid: playerObject.discordid,
        //         area: areaid
        //     }

        //     CreateNewSpyChannelsRecursive(message.guild, spyArea, spyChannelData, spyCategory);
        //     playerObject.spyCurrent.push([areaid, accuracy]);

        //     message.channel.send("Current spy replaced.");
        // }
        // else {
        //     message.channel.send("Invalid final tolken.");
        // }

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