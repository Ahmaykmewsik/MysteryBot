module.exports = {
	name: 'actionlog',
	description: 'Sets the action log channel',
	format: "!actionlog <channelid>",
	guildonly: true,
	adminonly: true,
	execute(client, message, args) {

		const actionLogChannelID = args[0];
		const channel = client.channels.get(actionLogChannelID)
		if (!channel){
			message.channel.send("Invalid channel id.");
			return;
		}
		
		client.channels.get(actionLogChannelID).send("What will they do? Where will they go? Find out here!");
		client.data.set("ACTION_LOG", actionLogChannelID);
		message.channel.send("Action Log set to: " + channel.toString());
	}
};