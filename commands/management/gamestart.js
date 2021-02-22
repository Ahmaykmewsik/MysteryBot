const createChannels = require('../../utilities/createChannels.js').createChannels;

module.exports = {
    name: 'gamestart',
    description: 'Assigns each player a random starting area',
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

        let settings = client.getSettings.get(message.guild.id);
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

        //If you're running !gamestart you probably don't have any earlogs you care about, so delete them
        //(might be a better implementation for this?)
        //client.deleteAllEarlogData.run(message.guild.id);

        //create earlogs and channels
        areas.forEach(area => {
            message.guild.createChannel("earlog-" + area.id, {
                type: 'text',
                permissionOverwrites: [{
                    id: message.guild.id,
                    deny: ['SEND_MESSAGES', 'READ_MESSAGES']
                }]
            }).then(channel => {

                channel.createWebhook(`EarlogWebhook_1`);
                channel.createWebhook(`EarlogWebhook_2`)
                    .then(result => {
                        client.setEarlogChannel.run({ guild_areaID: `${message.guild.id}_${area.id}`, guild: message.channel.id, channelID: channel.id });

                        //Create spy category and store it
                        message.guild.createChannel("SPY CHANNELS", {
                            type: 'category'
                        }).then((categoryObject) => {
        
                            settings.spyCategoryID = categoryObject.id;
                            client.setSettings.run(settings);
        
                            //Make the channels
                            createChannels(client, message.guild, areas, players, locations, settings.categoryID, settings.phase);
                        }).catch(console.error);
                    })
                    .catch(console.error);
            }).catch(console.error())
        });



        client.channels.get(settings.actionLogID).send("----------------------------\n---------**PHASE " + settings.phase + "**---------\n----------------------------");

        message.channel.send("**The game has begun!**\n" + players.map(player => player.username + ": " + player.area).join('\n'));

    }
};