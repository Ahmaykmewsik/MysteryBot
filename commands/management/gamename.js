const UtilityFunctions = require("../../utilities/UtilityFunctions");
const ChannelCreationFunctions = require('../../utilities/channelCreationFunctions');

module.exports = {
    name: 'gamename',
    description: 'The name of the game/category. This will be the title of the category.',
    format: "!gamename <name>",
    gmonly: true,
    async execute(client, message, args) {

        const gameName = args.join(" ");
        let settings = UtilityFunctions.GetSettings(client, message.guild.id);

        await ChannelCreationFunctions.CreateNewGameplayCategory(client, message, settings, gameName);

        let numChannels = message.guild.channels.cache.size;
        let countMessage = `Your server currently has **${numChannels}** channels. The max is 500.`;

        message.channel.send(`New category \`${gameName}\` created.\n${countMessage}`);
    }
};