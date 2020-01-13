
const Enmap = require("enmap");

module.exports = {
	name: 'actionlog',
	description: 'Sets the action log channel',
	format: "!actionlog <channelid>",
	guildonly: true,
	execute(client, message, args) {

		if (!message.member.hasPermission('ADMINISTRATOR')) {
			message.channel.send("Hey you no do that.");
			return;
		}

		const actionLogChannelID = args[0];
		client.votes.set("ACTION_LOG", actionLogChannelID);

		const actionLogString = client.channels.get(actionLogChannelID).toString();

		client.channels.get(actionLogChannelID).send("What will they do? Where will they go? Find out here!");
		message.channel.send("Action Log set to: " + actionLogString);
	}
};