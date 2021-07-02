const { Webhook } = require("discord.js");
const { updateAvatars } = require("./unusedCommands/updateAvatarsUtil");
const ChannelCreationFunctions = require('./utilities/channelCreationFunctions');
const UtilityFunctions = require("./utilities/UtilityFunctions");

module.exports = {
	async EarlogListener(client, message) {

		const gameplayChannel = client.getGameplayChannel.get(message.channel.id);

		if (message.content == undefined || message.system || !gameplayChannel) 
			return;
		
		if (!gameplayChannel.earlogChannelID) 
			return;
		
		const earlogChannel = client.channels.cache.get(gameplayChannel.earlogChannelID);

		const webhooks = await earlogChannel.fetchWebhooks();

		//Post in Earlog
		UtilityFunctions.PostMessage(message, message.content, earlogChannel, webhooks);

		let spyChannels = client.getSpyChannels.all(message.guild.id);
        if (spyChannels.length == 0) return;

        spyChannels = spyChannels.filter(c => c.areaID == gameplayChannel.areaID);
        if (spyChannels.length == 0) return;

        let spyActions = client.getSpyActionsAll.all(message.guild.id);
        if (spyActions.length == 0) return;

        let activeSpyActions = spyActions.filter(a => a.active);
        if (activeSpyActions.length == 0) return;

		//Post in Spy Channels
		for (spyAction of spyActions) {
			UtilityFunctions.PostSpyMessage(client, message, message.content, spyAction, spyChannels);
		}
	}
};



