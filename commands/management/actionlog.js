const UtilityFunctions = require('../../utilities/UtilityFunctions');

module.exports = {
	name: 'actionlog',
	description: 'Sets the action log channel. If no channel ID is given, sets the channel where the command was sent as the action log.',
	format: "!actionlog [channelid]",
	guildonly: true,
	adminonly: true,
	execute(client, message, args) {

		let channel = message.channel;
		let guildID = message.guild.id;
		let actionLogChannelID;
		let idGiven = false;
		if (args.length > 0) {
			actionLogChannelID = args[0];
			const channel = client.channels.get(actionLogChannelID)
			if (!channel){
				message.channel.send("Invalid channel id.");
				return;
			}
			idGiven = true;
		} else {
			actionLogChannelID = message.channel.id;
			message.delete();
		}

		let actionLogChannel = client.channels.get(actionLogChannelID);
		actionLogChannel.send("What will they do? Where will they go? Find out here!")
			.then(m => {
				m.pin();
			});
		
		let settings = UtilityFunctions.GetSettings(client, guildID);
		settings.actionLogID = actionLogChannelID;
		client.setSettings.run(settings);
		
		if (idGiven) {
			channel.send("Action Log set to: " + actionLogChannel.toString());
		}
		
	}
};