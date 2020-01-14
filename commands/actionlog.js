module.exports = {
	name: 'actionlog',
	description: 'Sets the action log channel',
	format: "!actionlog <channelid>",
	guildonly: true,
	adminonly: true,
	execute(client, message, args) {

		const actionLogChannelID = args[0];
		
		client.data.set("ACTION_LOG", actionLogChannelID);

		const actionLogString = client.channels.get(actionLogChannelID).toString();

		client.channels.get(actionLogChannelID).send("What will they do? Where will they go? Find out here!");
		message.channel.send("Action Log set to: " + actionLogString);
	}
};