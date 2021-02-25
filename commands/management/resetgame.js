const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
    name: 'resetgame',
    description: 'Clears all game data, keeps player and area setup data. Mostly only needed for debugging purposes',
    format: "!resetgame",
    guildonly: true,
    gmonly: true,
    execute(client, message, args) {

        const settings = UtilityFunctions.GetSettings(client, message.guild.id);
        if (settings.phase == null) {
            message.channel.send("The game has not started yet FYI.");
        }

        message.channel.send("Are you sure you want to reset the game? All player, area, and item data will be kept. (y or n)").then(() => {
            const filter = m => message.author.id === m.author.id;
            message.channel.awaitMessages(filter, { time: 60000, maxMatches: 1, errors: ['time'] })
                .then(messages => {
                    if (messages.first().content == 'y') {

                        //CLEAR IT
                        client.deleteAllLocations.run(message.guild.id);
                        client.deleteAllInventories.run(message.guild.id);
                        client.deleteAllSpyActions.run(message.guild.id);
                        client.deleteAllSpyCurrent.run(message.guild.id);
                        client.deleteAllEarlogChannelData.run(message.guild.id);
                        client.deleteAllSpyChannelData.run(message.guild.id);
                        client.deleteAllGameplayChannelData.run(message.guild.id);
                        
                        //Settings is a special case. Only one thing needs to change
                        settings.phase = null;
                        client.setSettings.run(settings);

                        message.channel.send("The game has been reset.");

                    } else if (messages.first().content == 'n') {
                        message.channel.send("Okay, never mind then :)");
                    } else {
                        message.channel.send("...uh, okay.");
                    }
                })
                .catch(console.error);
        });
    }
};

