
const Enmap = require("enmap");
const prefix = process.env.prefix;

module.exports = {
	name: 'action',
	description: 'Sends an action to the GM',
	format: "!action <what you wanna do>",
	dmonly: true,
	execute(client, message, args) {
		
        actionLogChannelID = client.data.get("ACTION_LOG");
        
        const action = message.content.split(prefix + "action ")[1];

        client.channels.get(actionLogChannelID).send("ACTION by " + message.author.username + "```" + action + "```");
        
        message.reply("Action sent.");
	}
};