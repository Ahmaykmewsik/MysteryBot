
const Enmap = require("enmap");
const prefix = process.env.prefix;

module.exports = {
	name: 'move',
	description: 'Sends an move message to the GM',
	format: "!move <where you wanna go>",
	dmonly: true,
	execute(client, message, args) {
		
        actionLogChannelID = client.data.get("ACTION_LOG");
        
        const action = message.content.split(prefix + "move ")[1];

        client.channels.get(actionLogChannelID).send("MOVE " + message.author.username + ": `" + action + "`");
        
        message.reply("Movement sent.");
	}
};