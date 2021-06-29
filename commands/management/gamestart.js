const createChannels = require('../../utilities/createChannels.js').createChannels;
const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'gamestart',
    description: 'Starts the game! In order to use, you need to have:\nPlayers\nAreas\nRun `!gamename`\nrRun `!actionlog`\nPut all players in a starting location (use `!setarea` or `!setarearandom`).',
    format: "!gamestart",
    gmonly: true,
    execute(client, message, args) {

        let players = client.getPlayers.all(message.guild.id);
        if (players == undefined || players.length === 0) {
            return message.channel.send("No players found. Use !addplayers <role> to set up a game with players in a given role.");
        }

        let areas = client.getAreas.all(message.guild.id);
        if (areas == undefined || areas.length === 0) {
            return message.channel.send("No areas found. Use !addarea to create an area.");
        }

        let locations = client.getLocations.all(message.guild.id);

        let settings = UtilityFunctions.GetSettings(client, message.guild.id);
        if (!settings.categoryName) {
            return message.channel.send("You need to name the game! Use `!gamename` to name the game. (This will set the catagory name)");
        }
        if (!settings.actionLogID) {
            return message.channel.send("You need to set the action log! Use `!actionlog` to set the action log.");
        }

        const lonelyPlayers = client.getPlayersWithoutLocation.all(message.guild.id);
        if (lonelyPlayers.length > 0) {
            return message.channel.send("The following players do not have an area set:\n"
                + "`" + lonelyPlayers.map(p => p.username).join('\n') + "`"
                + "\nAborting game start.");
        }

        message.channel.send("*Setting up game...*");
        console.log("Game Start!");

        settings.phase = 1;

        //If you're running !gamestart you probably don't have any earlogs you care about, so delete them.
        client.deleteAllEarlogChannelData.run(message.guild.id);

        //create earlogs and channels
        areas.forEach(area => {
            message.guild.channels.create("earlog-" + area.id, {
                type: 'text',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'VIEW_CHANNEL']
                }]
            }).then(channel => {

                channel.createWebhook(`EarlogWebhook_${area.id}_1`);
                channel.createWebhook(`EarlogWebhook_${area.id}_2`)
                    .then(() => {
                        client.setEarlogChannel.run({ guild_areaID: `${message.guild.id}_${area.id}`, guild: message.guild.id, channelID: channel.id });
                    })
                    .catch(console.error);
            }).catch(console.error())
        })

        //Create spy category and store it
        message.guild.channels.create("SPY CHANNELS", {
            type: 'category'
        }).then((categoryObject) => {

            settings.spyCategoryID = categoryObject.id;
            client.setSettings.run(settings);

            //set position underneath game category
            let position = message.guild.channels.cache.get(settings.categoryID).position;

            if (position) {
                categoryObject.setPosition(position + 1);
            }

            createChannels(client, message, areas, players, locations, settings);
            client.channels.cache.get(settings.actionLogID).send("----------------------------\n---------**PHASE " + settings.phase + "**---------\n----------------------------");

        }).catch(console.error);


        //Make the channels
        
        message.channel.send("**The game has begun!**\n" + locations.map(l => l.username + ": " + l.areaID).join('\n'));

    }
};