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

        let warningMessage = "Are you sure you want to reset the game? All player, area, and item data will be kept. (y or n)";
        return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, ResetGame);

        function ResetGame() {
            //CLEAR IT
            client.deleteAllLocations.run(message.guild.id);
            client.deleteAllInventories.run(message.guild.id);
            client.deleteAllSpyActions.run(message.guild.id);
            client.deleteAllSpyCurrent.run(message.guild.id);
            client.deleteAllEarlogChannelData.run(message.guild.id);
            client.deleteAllSpyChannelData.run(message.guild.id);
            client.deleteAllGameplayChannelData.run(message.guild.id);
            client.deleteAllMessages.run(message.guild.id);

            //Settings is a special case. Only one thing needs to change
            settings.phase = null;
            client.setSettings.run(settings);

            return message.channel.send("The game has been reset.");
        }
    }
};

