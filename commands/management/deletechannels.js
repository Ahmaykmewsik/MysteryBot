const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'deletechannels',
	description: 'Will only work in Ahmayk\'s secret development server. For development purposes only. Deletes every discord channel the bot created. Because Ahmayk is fucking tired of manually deleting huge test games. Also runs !resetall',
	format: "!deletegame",
	guildonly: true,
	gmonly: true,
	execute(client, message, args) {

		let devGuildId = 859208746127589396;

		if (message.guild.id != devGuildId)
			return message.channel.send("No. Fuck off. I'm not deleting my own game! \
										Do it yourself if you really need to.")

		let settings = UtilityFunctions.GetSettings(client, message.guild.id);
		if (!settings.phase)
			return message.channel.send("You need to start the game first with !gamestart. (Aborting)");

		let warningMessage = "Delete all gameplay channles and earlogs? You can't undo this! (y/n)";
		return UtilityFunctions.WarnUserWithPrompt(message, warningMessage, DeleteChannels);


		async function DeleteChannels() {
			message.channel.send("Deleting everything...");

			let gameplayChannels = client.getGameplayChannels.all(message.guild.id);
			let spyChannels = client.getSpyChannels.all(message.guild.id);
			let earlogChannels = client.getEarlogChannels.all(message.guild.id);

			await DeleteChannelsInList(gameplayChannels);
			await DeleteChannelsInList(spyChannels);
			await DeleteChannelsInList(earlogChannels);

			await DeleteChannelOrCategory(settings.categoryID);
			await DeleteChannelOrCategory(settings.spyCategoryID);
			await DeleteChannelOrCategory(settings.earlogCategoryID);

			UtilityFunctions.RunCommand(client, message, "resetall", ['y']);

			return message.channel.send("Everything is gone.");

		}

		async function DeleteChannelsInList(channelList) {
			for (channel of channelList) {
				await DeleteChannelOrCategory(channel.channelID);
			}
			
		}

		async function DeleteChannelOrCategory(channelID) {
			let discordChannel = client.channels.cache.get(channelID);
			try {
				await discordChannel.delete();
			} catch (error) {
				message.channel.send(`Failed to delete: <#${channelID}> - ${error}`);
			}
		}

	}

};